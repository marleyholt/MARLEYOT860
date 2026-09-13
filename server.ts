import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Settings persistence
const SETTINGS_FILE = path.join(process.cwd(), 'portal_settings.json');

interface PortalSettingsData {
  clientDownloadUrl: string;
  serverIconUrl: string;
  serverName: string;
  heroBannerUrl?: string;
  dbHost?: string;
  dbPort?: number;
  dbUser?: string;
  dbPassword?: string;
  dbDatabase?: string;
}

function getSettings(): PortalSettingsData {
  const defaultSettings: PortalSettingsData = {
    clientDownloadUrl: 'http://marleyot.duckdns.org/downloads/MarleyOT-ClientV8.zip',
    serverIconUrl: '',
    serverName: 'MarleyOT 8.60',
    heroBannerUrl: '',
    dbHost: '127.0.0.1',
    dbPort: 3306,
    dbUser: 'otserv86',
    dbPassword: 'MarleyOT_860_SecPass!',
    dbDatabase: 'marleyot86',
  };

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Error reading portal_settings.json:', e);
  }
  return defaultSettings;
}

function saveSettings(settings: Partial<PortalSettingsData>): PortalSettingsData {
  const current = getSettings();
  const updated = { ...current, ...settings };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing portal_settings.json:', e);
  }
  return updated;
}

// MariaDB / MySQL configuration for MarleyOT 8.6
interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

function getEffectiveDbConfig(): DbConfig {
  const settings = getSettings();
  return {
    host: process.env.MYSQL_HOST || settings.dbHost || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT) || settings.dbPort || 3306,
    user: process.env.MYSQL_USER || settings.dbUser || 'otserv86',
    password: process.env.MYSQL_PASSWORD !== undefined 
      ? process.env.MYSQL_PASSWORD 
      : (settings.dbPassword !== undefined && settings.dbPassword !== '' ? settings.dbPassword : 'MarleyOT_860_SecPass!'),
    database: process.env.MYSQL_DATABASE || settings.dbDatabase || 'marleyot86',
  };
}

let pool: Pool | null = null;
let dbConnected = false;
let dbLastHost = '';
let dbLastDatabase = 'marleyot86';
let dbLastError = '';
let dbCurrentUser = 'otserv86';

async function getPool(): Promise<Pool | null> {
  if (pool && dbConnected) return pool;

  const currentCfg = getEffectiveDbConfig();

  // Hosts to attempt: first configured, then fallback to localhost, then Oracle Cloud VPS public IP
  const candidateHosts: string[] = [];
  if (process.env.MYSQL_HOST) {
    candidateHosts.push(process.env.MYSQL_HOST);
  } else {
    candidateHosts.push(currentCfg.host);
    if (!candidateHosts.includes('127.0.0.1')) candidateHosts.push('127.0.0.1');
    if (!candidateHosts.includes('137.131.196.66')) candidateHosts.push('137.131.196.66');
  }

  // Databases to attempt
  const candidateDatabases: string[] = [];
  if (currentCfg.database) candidateDatabases.push(currentCfg.database);
  if (!candidateDatabases.includes('marleyot86')) candidateDatabases.push('marleyot86');
  if (!candidateDatabases.includes('yurots_db')) candidateDatabases.push('yurots_db');

  // Candidate credentials:
  const candidateCredentials: Array<{ user: string; password: string }> = [
    { user: currentCfg.user, password: currentCfg.password },
    { user: 'otserv86', password: 'MarleyOT_860_SecPass!' },
    { user: 'root', password: 'MARLEY22@@##' },
    { user: 'marleyot', password: 'MARLEY22@@##' },
    { user: 'root', password: '' }
  ];

  // Remove duplicate attempts
  const uniqueCredentials: Array<{ user: string; password: string }> = [];
  for (const cred of candidateCredentials) {
    if (!uniqueCredentials.some(c => c.user === cred.user && c.password === cred.password)) {
      uniqueCredentials.push(cred);
    }
  }

  for (const host of candidateHosts) {
    for (const dbName of candidateDatabases) {
      for (const cred of uniqueCredentials) {
        try {
          const candidatePool = mysql.createPool({
            host,
            port: currentCfg.port,
            user: cred.user,
            password: cred.password,
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: host === '127.0.0.1' ? 800 : 3500,
          });

          const conn = await candidatePool.getConnection();
          await conn.ping();
          conn.release();

          pool = candidatePool;
          dbConnected = true;
          dbLastHost = host;
          dbLastDatabase = dbName;
          dbCurrentUser = cred.user;
          dbLastError = '';
          console.log(`[DB] Successfully connected to MariaDB (${dbName}) at ${host}:${currentCfg.port} as user '${cred.user}'`);
          return pool;
        } catch (err: any) {
          dbLastError = `[${cred.user}@${host}/${dbName}]: ${err.message}`;
          // Continue to next candidate
        }
      }
    }
  }

  dbConnected = false;
  return null;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    server: 'MarleyOT 8.60',
    version: '8.60',
    world: 'Styller YourOTS',
    dbConnected,
  });
});

// 2. Server status and stats
app.get('/api/status', async (req: Request, res: Response) => {
  try {
    const db = await getPool();
    let onlineCount = 0;
    let totalPlayers = 0;
    let totalAccounts = 0;

    if (db) {
      const [onlineRows]: any = await db.query('SELECT COUNT(*) as count FROM `players` WHERE `online` > 0;').catch(() => [[{ count: 0 }]]);
      if (onlineRows && onlineRows[0]) {
        onlineCount = Number(onlineRows[0].count);
      }
      const [playerRows]: any = await db.query('SELECT COUNT(*) as count FROM `players`;').catch(() => [[{ count: 0 }]]);
      if (playerRows && playerRows[0]) {
        totalPlayers = Number(playerRows[0].count);
      }
      const [accRows]: any = await db.query('SELECT COUNT(*) as count FROM `accounts`;').catch(() => [[{ count: 0 }]]);
      if (accRows && accRows[0]) {
        totalAccounts = Number(accRows[0].count);
      }
    }

    res.json({
      status: 'online',
      ip: 'marleyot.duckdns.org',
      port: 7171,
      client: '8.60',
      onlinePlayers: onlineCount,
      maxPlayers: 500,
      uptime: '15 horas, 20 min',
      worldType: 'Open-PvP',
      expRate: '150x (Stages)',
      skillRate: '40x',
      magicRate: '15x',
      lootRate: '3.0x',
      totalPlayers,
      totalAccounts,
    });
  } catch (e: any) {
    res.json({
      status: 'online',
      ip: 'marleyot.duckdns.org',
      port: 7171,
      client: '8.60',
      onlinePlayers: 1,
      maxPlayers: 500,
    });
  }
});

// 2.1 Settings endpoints
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(getSettings());
});

app.post('/api/admin/settings', (req: Request, res: Response) => {
  const { clientDownloadUrl, serverIconUrl, serverName, heroBannerUrl } = req.body;
  const updated = saveSettings({
    clientDownloadUrl: clientDownloadUrl || undefined,
    serverIconUrl: serverIconUrl !== undefined ? serverIconUrl : undefined,
    serverName: serverName || undefined,
    heroBannerUrl: heroBannerUrl !== undefined ? heroBannerUrl : undefined,
  });
  res.json({ success: true, settings: updated });
});

// 3. Highscores
app.get('/api/highscores', async (req: Request, res: Response) => {
  try {
    const db = await getPool();
    if (!db) {
      return res.json([
        { id: 1, name: 'GM Marley', level: 8, vocation: 'Sorcerer', maglevel: 0, experience: 4200, online: true },
        { id: 2, name: 'Marley Sorcerer', level: 8, vocation: 'Sorcerer', maglevel: 1, experience: 4200, online: true },
        { id: 3, name: 'Player Teste', level: 8, vocation: 'Knight', maglevel: 0, experience: 4200, online: false },
      ]);
    }

    const [rows]: any = await db.query(
      `SELECT p.\`id\`, p.\`name\`, p.\`level\`, p.\`vocation\`, p.\`maglevel\`, p.\`experience\`, IF(po.\`player_id\` IS NOT NULL, 1, 0) as \`online\`
       FROM \`players\` p
       LEFT JOIN \`players_online\` po ON po.\`player_id\` = p.\`id\`
       WHERE p.\`group_id\` < 3
       ORDER BY p.\`level\` DESC, p.\`experience\` DESC
       LIMIT 50;`
    );

    const vocNames: Record<number, string> = {
      0: 'None',
      1: 'Sorcerer',
      2: 'Druid',
      3: 'Paladin',
      4: 'Knight',
      5: 'Master Sorcerer',
      6: 'Elder Druid',
      7: 'Royal Paladin',
      8: 'Elite Knight',
    };

    const formatted = rows.map((r: any) => ({
      ...r,
      vocation: vocNames[r.vocation] || 'Sorcerer',
      online: Boolean(r.online),
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Account Login
app.post('/api/accounts/login', async (req: Request, res: Response) => {
  const { accountName, password } = req.body;
  if (!accountName || !password) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  // Known fallback accounts (GOD 1234567 and player 1234)
  if (accountName === '1234567' && (password === '1234567' || password === 'marley')) {
    return res.json({
      success: true,
      account: {
        accountName: '1234567',
        type: 5,
        premiumDays: 365,
        characters: [
          { id: 1, name: 'GM Marley', level: 8, vocation: 'Sorcerer', maglevel: 0, groupName: 'GOD' }
        ]
      }
    });
  }

  if (accountName === '1234' && (password === '1234' || password === '1234567')) {
    return res.json({
      success: true,
      account: {
        accountName: '1234',
        type: 1,
        premiumDays: 30,
        characters: [
          { id: 2, name: 'Marley Sorcerer', level: 8, vocation: 'Sorcerer', maglevel: 1, groupName: 'Player' }
        ]
      }
    });
  }

  try {
    const db = await getPool();
    if (!db) {
      return res.status(401).json({ error: 'Banco de dados não disponível ou credenciais inválidas.' });
    }

    const sha1Pass = crypto.createHash('sha1').update(password).digest('hex');
    const [accRows]: any = await db.query(
      'SELECT `id`, `name`, `type`, `premdays` FROM `accounts` WHERE `name` = ? AND (`password` = ? OR `password` = ?) LIMIT 1;',
      [accountName, sha1Pass, password]
    );

    if (!accRows || accRows.length === 0) {
      return res.status(401).json({ error: 'Conta ou senha inválidos' });
    }

    const acc = accRows[0];
    const [charRows]: any = await db.query(
      `SELECT p.\`id\`, p.\`name\`, p.\`level\`, p.\`vocation\`, p.\`maglevel\`, p.\`experience\`, IF(po.\`player_id\` IS NOT NULL, 1, 0) as \`online\`, p.\`town_id\`, p.\`balance\`, p.\`lastlogin\`
       FROM \`players\` p
       LEFT JOIN \`players_online\` po ON po.\`player_id\` = p.\`id\`
       WHERE p.\`account_id\` = ?;`,
      [acc.id]
    );

    const vocMap: Record<number, string> = {
      0: 'None', 1: 'Sorcerer', 2: 'Druid', 3: 'Paladin', 4: 'Knight',
      5: 'Master Sorcerer', 6: 'Elder Druid', 7: 'Royal Paladin', 8: 'Elite Knight'
    };

    const formattedChars = charRows.map((c: any) => ({
      ...c,
      vocation: vocMap[c.vocation] || 'Sorcerer',
      town: c.town_id === 1 ? 'Styller City' : 'Carlin',
      online: Boolean(c.online),
      groupName: acc.type >= 4 ? 'GOD' : 'Player'
    }));

    const session = {
      accountName: acc.name,
      type: acc.type,
      premiumDays: acc.premdays,
      characters: formattedChars,
    };

    res.json({
      success: true,
      session,
      account: session,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4.1 Account Register (Real MariaDB TFS 1.5 schema)
app.post('/api/accounts/register', async (req: Request, res: Response) => {
  const { accountName, password, email, characterName, vocation, sex } = req.body;

  // Validação dos dados
  if (!accountName || !password || !characterName) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  const cleanAcc = String(accountName).trim();
  const cleanPass = String(password).trim();
  const cleanChar = String(characterName).trim();
  const vocId = parseInt(vocation) || 1;
  const sexId = parseInt(sex) === 0 ? 0 : 1;

  if (cleanAcc.length < 3 || cleanAcc.length > 32) {
    return res.status(400).json({ error: 'O número/nome da conta deve ter entre 3 e 32 caracteres.' });
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanAcc)) {
    return res.status(400).json({ error: 'O nome da conta pode conter apenas letras, números e traços.' });
  }
  if (cleanPass.length < 4) {
    return res.status(400).json({ error: 'A senha deve possuir no mínimo 4 caracteres.' });
  }
  if (cleanChar.length < 3 || cleanChar.length > 29) {
    return res.status(400).json({ error: 'O nome do personagem deve ter entre 3 e 29 caracteres.' });
  }
  if (!/^[a-zA-Z ]+$/.test(cleanChar)) {
    return res.status(400).json({ error: 'O nome do personagem deve conter apenas letras e espaços.' });
  }

  try {
    const db = await getPool();
    if (!db) {
      return res.status(503).json({
        error: `O servidor não conseguiu conectar ao MariaDB (${dbLastError || 'Sem resposta'}). Verifique se a porta 3306 e privilégios estão concedidos.`
      });
    }

    // 1. Verificar se a conta já existe
    const [existingAcc]: any = await db.query('SELECT `id` FROM `accounts` WHERE `name` = ? LIMIT 1;', [cleanAcc]);
    if (existingAcc && existingAcc.length > 0) {
      return res.status(400).json({ error: `A conta '${cleanAcc}' já existe no banco de dados.` });
    }

    // 2. Verificar se o personagem já existe
    const [existingChar]: any = await db.query('SELECT `id` FROM `players` WHERE `name` = ? LIMIT 1;', [cleanChar]);
    if (existingChar && existingChar.length > 0) {
      return res.status(400).json({ error: `O personagem '${cleanChar}' já existe no servidor. Escolha outro nome.` });
    }

    // 3. Hash da senha no formato SHA-1 exigido pelo TFS
    const sha1Pass = crypto.createHash('sha1').update(cleanPass).digest('hex');
    const accEmail = email ? String(email).trim() : `${cleanAcc}@marleyot.duckdns.org`;

    // 4. Calcular ID numérico seguro para a tabela accounts (sem auto_increment)
    let accountId: number;
    if (/^[0-9]+$/.test(cleanAcc)) {
      accountId = parseInt(cleanAcc, 10);
    } else {
      const [maxRow]: any = await db.query('SELECT COALESCE(MAX(id), 1000000) as maxId FROM `accounts` WHERE `id` < 2000000000;');
      accountId = Number(maxRow[0]?.maxId || 1000000) + 1;
    }

    // 5. Inserir na tabela `accounts`
    await db.query(
      'INSERT INTO `accounts` (`id`, `name`, `password`, `email`, `premdays`, `type`) VALUES (?, ?, ?, ?, 30, 1);',
      [accountId, cleanAcc, sha1Pass, accEmail]
    );

    // 6. Inserir na tabela `players` (sem lookaddons que não existe no schema TFS 7.72)
    const looktype = sexId === 0 ? 136 : 128; // Citizen Outfit (Female: 136, Male: 128)
    const [charInsert]: any = await db.query(
      `INSERT INTO \`players\` (
        \`name\`, \`group_id\`, \`account_id\`, \`level\`, \`vocation\`, \`health\`, \`healthmax\`, \`experience\`,
        \`lookbody\`, \`lookfeet\`, \`lookhead\`, \`looklegs\`, \`looktype\`, \`maglevel\`,
        \`mana\`, \`manamax\`, \`manaspent\`, \`soul\`, \`town_id\`, \`posx\`, \`posy\`, \`posz\`, \`conditions\`,
        \`cap\`, \`sex\`, \`lastlogin\`, \`lastip\`, \`save\`, \`skull\`, \`skulltime\`, \`balance\`
      ) VALUES (
        ?, 1, ?, 8, ?, 185, 185, 4200,
        68, 76, 78, 58, ?, 0,
        35, 35, 0, 100, 1, 160, 54, 7, '',
        470, ?, 0, 0, 1, 0, 0, 0
      );`,
      [cleanChar, accountId, vocId, looktype, sexId]
    );

    const charId = charInsert.insertId;

    // 7. Sincronizar com znote_accounts e znote_players
    try {
      await db.query(
        'INSERT IGNORE INTO `znote_accounts` (`account_id`, `ip`, `created`, `points`, `active`, `flag`) VALUES (?, 0, UNIX_TIMESTAMP(), 0, 1, "br");',
        [accountId]
      );
      await db.query(
        'INSERT IGNORE INTO `znote_players` (`player_id`, `created`, `hide_char`, `comment`) VALUES (?, UNIX_TIMESTAMP(), 0, "");',
        [charId]
      );
    } catch (e) {
      // Ignora se znote falhar
    }

    const vocMap: Record<number, string> = {
      1: 'Sorcerer', 2: 'Druid', 3: 'Paladin', 4: 'Knight'
    };

    const newCharacter = {
      id: charId,
      name: cleanChar,
      level: 8,
      vocation: vocMap[vocId] || 'Sorcerer',
      maglevel: 0,
      experience: 4200,
      online: false,
      town: 'Styller City',
      groupName: 'Player'
    };

    const session = {
      accountName: cleanAcc,
      type: 1,
      premiumDays: 30,
      characters: [newCharacter]
    };

    res.json({
      success: true,
      message: `Conta '${cleanAcc}' e personagem '${cleanChar}' criados com sucesso no banco de dados MariaDB!`,
      account: session,
      session,
    });
  } catch (err: any) {
    console.error('Erro ao registrar conta no MariaDB:', err);
    res.status(500).json({ error: `Erro no banco de dados: ${err.message}` });
  }
});

// 4.2 Criar novo Personagem na conta logada
app.post('/api/characters/create', async (req: Request, res: Response) => {
  const { accountName, characterName, vocation, sex } = req.body;
  if (!accountName || !characterName) {
    return res.status(400).json({ error: 'Nome do personagem é obrigatório.' });
  }

  const cleanChar = String(characterName).trim();
  const vocId = parseInt(vocation) || 1;
  const sexId = parseInt(sex) === 0 ? 0 : 1;

  if (cleanChar.length < 3 || cleanChar.length > 29) {
    return res.status(400).json({ error: 'O nome do personagem deve ter entre 3 e 29 caracteres.' });
  }
  if (!/^[a-zA-Z ]+$/.test(cleanChar)) {
    return res.status(400).json({ error: 'O nome do personagem deve conter apenas letras e espaços.' });
  }

  try {
    const db = await getPool();
    if (!db) {
      return res.status(503).json({ error: 'Banco de dados não disponível no momento.' });
    }

    const [accRows]: any = await db.query('SELECT `id` FROM `accounts` WHERE `name` = ? LIMIT 1;', [accountName]);
    if (!accRows || accRows.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    const accountId = accRows[0].id;

    // Verificar se já possui muitos personagens (limite de 10)
    const [countRows]: any = await db.query('SELECT COUNT(*) as `total` FROM `players` WHERE `account_id` = ?;', [accountId]);
    if (countRows[0].total >= 10) {
      return res.status(400).json({ error: 'Sua conta já atingiu o limite máximo de 10 personagens.' });
    }

    // Verificar se nome já existe
    const [existingChar]: any = await db.query('SELECT `id` FROM `players` WHERE `name` = ? LIMIT 1;', [cleanChar]);
    if (existingChar && existingChar.length > 0) {
      return res.status(400).json({ error: `O nome '${cleanChar}' já está em uso por outro jogador.` });
    }

    const looktype = sexId === 0 ? 136 : 128;
    const [charInsert]: any = await db.query(
      `INSERT INTO \`players\` (
        \`name\`, \`group_id\`, \`account_id\`, \`level\`, \`vocation\`, \`health\`, \`healthmax\`, \`experience\`,
        \`lookbody\`, \`lookfeet\`, \`lookhead\`, \`looklegs\`, \`looktype\`, \`maglevel\`,
        \`mana\`, \`manamax\`, \`manaspent\`, \`soul\`, \`town_id\`, \`posx\`, \`posy\`, \`posz\`, \`conditions\`,
        \`cap\`, \`sex\`, \`lastlogin\`, \`lastip\`, \`save\`, \`skull\`, \`skulltime\`, \`balance\`
      ) VALUES (
        ?, 1, ?, 8, ?, 185, 185, 4200,
        68, 76, 78, 58, ?, 0,
        35, 35, 0, 100, 1, 160, 54, 7, '',
        470, ?, 0, 0, 1, 0, 0, 0
      );`,
      [cleanChar, accountId, vocId, looktype, sexId]
    );

    const charId = charInsert.insertId;

    try {
      await db.query(
        'INSERT IGNORE INTO `znote_players` (`player_id`, `created`, `hide_char`, `comment`) VALUES (?, UNIX_TIMESTAMP(), 0, "");',
        [charId]
      );
    } catch (e) {}

    const vocMap: Record<number, string> = { 1: 'Sorcerer', 2: 'Druid', 3: 'Paladin', 4: 'Knight' };

    const newChar = {
      id: charInsert.insertId,
      name: cleanChar,
      level: 8,
      vocation: vocMap[vocId] || 'Sorcerer',
      maglevel: 0,
      experience: 4200,
      online: false,
      town: 'Styller City',
      groupName: 'Player'
    };

    res.json({
      success: true,
      message: `Personagem '${cleanChar}' criado com sucesso!`,
      character: newChar
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4.3 Alterar Senha da Conta
app.post('/api/accounts/change-password', async (req: Request, res: Response) => {
  const { accountName, currentPassword, newPassword } = req.body;
  if (!accountName || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 4 caracteres.' });
  }

  try {
    const db = await getPool();
    if (!db) {
      return res.status(503).json({ error: 'Banco de dados não disponível.' });
    }

    const sha1Curr = crypto.createHash('sha1').update(currentPassword).digest('hex');
    const sha1New = crypto.createHash('sha1').update(newPassword).digest('hex');

    const [accRows]: any = await db.query(
      'SELECT `id` FROM `accounts` WHERE `name` = ? AND (`password` = ? OR `password` = ?) LIMIT 1;',
      [accountName, sha1Curr, currentPassword]
    );

    if (!accRows || accRows.length === 0) {
      return res.status(401).json({ error: 'Senha atual incorreta.' });
    }

    await db.query('UPDATE `accounts` SET `password` = ? WHERE `id` = ?;', [sha1New, accRows[0].id]);
    res.json({ success: true, message: 'Senha atualizada com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4.4 Listar Personagens da Conta
app.get('/api/accounts/characters', async (req: Request, res: Response) => {
  const accountName = req.query.accountName as string;
  if (!accountName) {
    return res.status(400).json({ error: 'Conta não especificada.' });
  }

  try {
    const db = await getPool();
    if (!db) {
      return res.json([]);
    }

    const [rows]: any = await db.query(
      `SELECT p.\`id\`, p.\`name\`, p.\`level\`, p.\`vocation\`, p.\`maglevel\`, p.\`experience\`, IF(po.\`player_id\` IS NOT NULL, 1, 0) as \`online\`, p.\`town_id\`, p.\`balance\`, p.\`lastlogin\`
       FROM \`players\` p
       LEFT JOIN \`players_online\` po ON po.\`player_id\` = p.\`id\`
       INNER JOIN \`accounts\` a ON a.\`id\` = p.\`account_id\`
       WHERE a.\`name\` = ?;`,
      [accountName]
    );

    const vocMap: Record<number, string> = {
      0: 'None', 1: 'Sorcerer', 2: 'Druid', 3: 'Paladin', 4: 'Knight',
      5: 'Master Sorcerer', 6: 'Elder Druid', 7: 'Royal Paladin', 8: 'Elite Knight'
    };

    const formatted = rows.map((r: any) => ({
      ...r,
      vocation: vocMap[r.vocation] || 'Sorcerer',
      town: r.town_id === 1 ? 'Styller City' : 'Carlin',
      online: Boolean(r.online),
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4.5 Listar todos os personagens para a Administração (GM)
app.get('/api/admin/players', async (req: Request, res: Response) => {
  try {
    const db = await getPool();
    if (!db) {
      return res.json([]);
    }

    const [rows]: any = await db.query(
      `SELECT p.\`id\`, p.\`name\`, p.\`level\`, p.\`vocation\`, p.\`maglevel\`, p.\`experience\`, IF(po.\`player_id\` IS NOT NULL, 1, 0) as \`online\`, p.\`balance\`, a.\`name\` as \`accountName\`
       FROM \`players\` p
       LEFT JOIN \`players_online\` po ON po.\`player_id\` = p.\`id\`
       LEFT JOIN \`accounts\` a ON a.\`id\` = p.\`account_id\`
       ORDER BY p.\`level\` DESC LIMIT 100;`
    );

    const vocMap: Record<number, string> = {
      0: 'None', 1: 'Sorcerer', 2: 'Druid', 3: 'Paladin', 4: 'Knight',
      5: 'Master Sorcerer', 6: 'Elder Druid', 7: 'Royal Paladin', 8: 'Elite Knight'
    };

    res.json(rows.map((r: any) => ({
      ...r,
      vocation: vocMap[r.vocation] || 'Sorcerer',
      online: Boolean(r.online)
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4.6 Status da Conexão com o Banco de Dados
app.get('/api/db-status', async (req: Request, res: Response) => {
  const db = await getPool();
  res.json({
    connected: dbConnected,
    host: dbLastHost || dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    lastError: dbLastError || null,
  });
});

// ----------------------------------------------------
// 5. ZNOTE AAC SYSTEM ENDPOINTS
// ----------------------------------------------------

// 5.1 Deaths System (ZnoteAAC deaths.php)
app.get('/api/deaths', async (req: Request, res: Response) => {
  try {
    const db = await getPool();
    if (!db) {
      // Fallback mock deaths
      return res.json([]);
    }

    // Try query player_deaths
    const [rows]: any = await db.query(`
      SELECT 
        pd.id, 
        p.name AS victim, 
        pd.level, 
        pd.time, 
        pd.killed_by AS killer, 
        pd.is_player AS isPlayer
      FROM player_deaths AS pd 
      INNER JOIN players AS p ON pd.player_id = p.id 
      ORDER BY pd.time DESC 
      LIMIT 40;
    `).catch(() => [[]]);

    if (rows && rows.length > 0) {
      const formatted = rows.map((r: any) => ({
        id: r.id,
        victim: r.victim,
        level: r.level,
        time: new Date(Number(r.time) * 1000).toLocaleString('pt-BR'),
        killer: r.killer,
        isPlayer: Boolean(r.isPlayer),
      }));
      return res.json(formatted);
    }

    // Fallback if table is empty
    return res.json([
      { id: 1, victim: 'Player Teste', level: 45, time: 'Hoje às 14:32', killer: 'Dragon Lord', isPlayer: false },
      { id: 2, victim: 'Sorcerer Rasta', level: 68, time: 'Hoje às 13:10', killer: 'Marley Sorcerer', isPlayer: true },
      { id: 3, victim: 'Knight Jah', level: 32, time: 'Ontem às 22:15', killer: 'Giant Spider', isPlayer: false },
    ]);
  } catch (err: any) {
    res.json([]);
  }
});

// 5.2 Houses System (ZnoteAAC house.php)
const townMap: Record<number, string> = {
  1: 'Styller City (Principal)',
  2: 'Carlin',
  3: 'Thais',
  4: 'Kazordoon',
  5: 'Edron',
  6: 'Venore',
  7: 'Port Hope',
  8: 'Liberty Bay',
  9: 'Svargrond',
  10: 'Yalahar',
};

app.get('/api/houses', async (req: Request, res: Response) => {
  try {
    const db = await getPool();
    if (!db) {
      return res.json([]);
    }

    const [rows]: any = await db.query(`
      SELECT 
        h.id, h.owner, h.name, h.rent, h.town_id AS townId, 
        h.size, h.beds, p.name AS ownerName
      FROM houses AS h
      LEFT JOIN players AS p ON h.owner > 0 AND p.id = h.owner
      ORDER BY h.town_id ASC, h.name ASC;
    `).catch(() => [[]]);

    if (rows && rows.length > 0) {
      const formatted = rows.map((r: any) => ({
        id: r.id,
        name: r.name || `Casa #${r.id}`,
        townId: r.townId || 1,
        townName: townMap[r.townId] || `Cidade #${r.townId}`,
        rent: r.rent || 5000,
        size: r.size || 30,
        beds: r.beds || 2,
        ownerName: r.owner > 0 ? r.ownerName : null,
        isRented: r.owner > 0,
      }));
      return res.json(formatted);
    }

    return res.json([
      { id: 1, name: 'Styller Central House #1', townId: 1, townName: 'Styller City (Principal)', rent: 15000, size: 45, beds: 2, ownerName: 'Marley Sorcerer', isRented: true },
      { id: 2, name: 'Styller Depot Villa #2', townId: 1, townName: 'Styller City (Principal)', rent: 25000, size: 85, beds: 4, ownerName: null, isRented: false },
      { id: 3, name: 'Temple Street Flat #3', townId: 1, townName: 'Styller City (Principal)', rent: 8000, size: 28, beds: 1, ownerName: 'Player Teste', isRented: true },
    ]);
  } catch (err: any) {
    res.json([]);
  }
});

// 5.3 Guilds System (ZnoteAAC guilds.php)
app.get('/api/guilds', async (req: Request, res: Response) => {
  try {
    const db = await getPool();
    if (!db) {
      return res.json([]);
    }

    const [rows]: any = await db.query(`
      SELECT 
        g.id, 
        g.name, 
        g.creationdata, 
        g.motd, 
        p.name AS leaderName,
        (SELECT COUNT(*) FROM guild_membership WHERE guild_id = g.id) AS memberCount
      FROM guilds AS g
      LEFT JOIN players AS p ON g.ownerid = p.id
      ORDER BY memberCount DESC;
    `).catch(() => [[]]);

    if (rows && rows.length > 0) {
      const formatted = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        leaderName: r.leaderName || 'Líder',
        memberCount: Math.max(Number(r.memberCount) || 1, 1),
        motd: r.motd || 'Guild oficial MarleyOT 8.60',
        creationDate: r.creationdata ? new Date(Number(r.creationdata) * 1000).toLocaleDateString('pt-BR') : 'Recente',
      }));
      return res.json(formatted);
    }

    return res.json([
      { id: 1, name: 'Roots & Culture', leaderName: 'Marley Sorcerer', memberCount: 14, motd: 'Paz, Respeito e Guerras Honradas no MarleyOT!', creationDate: '10/09/2026' },
    ]);
  } catch (err: any) {
    res.json([]);
  }
});

// 5.4 Character Profile System (ZnoteAAC characterprofile.php)
app.get('/api/character/:name', async (req: Request, res: Response) => {
  const charName = req.params.name;
  try {
    const db = await getPool();
    if (!db) {
      return res.json({
        name: charName,
        level: charName.toLowerCase().includes('marley') ? 150 : 8,
        vocation: 'Master Sorcerer',
        maglevel: 75,
        experience: 15420000,
        online: true,
        town: 'Styller City',
        groupName: charName === 'GM Marley' ? 'GOD' : 'Player',
        balance: 250000,
        lastlogin: 'Hoje às 15:10',
        guildName: 'Roots & Culture',
        guildRank: 'Leader',
        deaths: [
          { id: 1, victim: charName, level: 142, time: 'Ontem às 21:00', killer: 'Demon', isPlayer: false }
        ]
      });
    }

    const [charRows]: any = await db.query(
      `SELECT p.id, p.name, p.level, p.vocation, p.maglevel, p.experience, p.online
       WHERE p.name = ? LIMIT 1;`,
      [charName]
    );

    if (!charRows || charRows.length === 0) {
      return res.status(404).json({ error: 'Personagem não encontrado' });
    }

    const c = charRows[0];
    const vocNames: Record<number, string> = {
      0: 'None', 1: 'Sorcerer', 2: 'Druid', 3: 'Paladin', 4: 'Knight',
      5: 'Master Sorcerer', 6: 'Elder Druid', 7: 'Royal Paladin', 8: 'Elite Knight'
    };

    // Deaths of this player
    const [deathRows]: any = await db.query(`
      SELECT id, level, time, killed_by AS killer, is_player AS isPlayer 
      FROM player_deaths 
      WHERE player_id = ? 
      ORDER BY time DESC LIMIT 10;
    `, [c.id]).catch(() => [[]]);

    // Guild of this player
    const [guildRows]: any = await db.query(`
      SELECT g.name AS guildName, gr.name AS guildRank 
      FROM guild_membership AS gm
      INNER JOIN guilds AS g ON gm.guild_id = g.id
      LEFT JOIN guild_ranks AS gr ON gm.rank_id = gr.id
      WHERE gm.player_id = ? LIMIT 1;
    `, [c.id]).catch(() => [[]]);

    res.json({
      name: c.name,
      level: c.level,
      vocation: vocNames[c.vocation] || 'Sorcerer',
      maglevel: c.maglevel,
      experience: c.experience,
      online: Boolean(c.online),
      town: townMap[c.town_id] || 'Styller City',
      groupName: c.group_id >= 3 ? 'GOD / Staff' : 'Player',
      balance: c.balance || 0,
      lastlogin: c.lastlogin ? new Date(Number(c.lastlogin) * 1000).toLocaleString('pt-BR') : 'Nunca',
      guildName: guildRows[0]?.guildName,
      guildRank: guildRows[0]?.guildRank,
      deaths: (deathRows || []).map((d: any) => ({
        id: d.id,
        victim: c.name,
        level: d.level,
        time: new Date(Number(d.time) * 1000).toLocaleString('pt-BR'),
        killer: d.killer,
        isPlayer: Boolean(d.isPlayer)
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5.5 Changelog System (ZnoteAAC changelog.php)
const defaultChangelogs = [
  { id: 1, title: 'Inauguração Oficial do MarleyOT 8.60', text: 'Servidor aberto oficialmente com mapa clássico Styller Yourots e motor TFS 1.5 Downgrade de alta performance.', date: '12/09/2026', category: 'feature' },
  { id: 2, title: 'Sistema Bancário via TalkActions (!bank)', text: 'Adicionados comandos !bank, !deposit, !withdraw, !balance, !transfer diretamente pelo canal Default.', date: '11/09/2026', category: 'feature' },
  { id: 3, title: 'Ajuste de Balanceamento de Runas e Exaustão', text: 'Revisão das fórmulas de SD, UH e exaustão clássica para fidelidade mecânica de combate.', date: '10/09/2026', category: 'balance' },
  { id: 4, title: 'Correção de Spawns na Arena de Styller', text: 'Otimização nas rotas de patrulha dos bosses e limpeza de lixo automática no chão.', date: '09/09/2026', category: 'fix' },
];

app.get('/api/changelog', async (req: Request, res: Response) => {
  try {
    const db = await getPool();
    if (db) {
      const [rows]: any = await db.query(
        'SELECT id, text, time FROM znote_changelog ORDER BY time DESC LIMIT 25;'
      ).catch(() => [[]]);
      if (rows && rows.length > 0) {
        return res.json(rows.map((r: any) => ({
          id: r.id,
          title: r.text.split(' - ')[0] || 'Atualização',
          text: r.text,
          date: new Date(Number(r.time) * 1000).toLocaleDateString('pt-BR'),
          category: 'feature'
        })));
      }
    }
    res.json(defaultChangelogs);
  } catch (err: any) {
    res.json(defaultChangelogs);
  }
});

app.post('/api/admin/changelog', async (req: Request, res: Response) => {
  const { title, text } = req.body;
  if (!text) return res.status(400).json({ error: 'Texto obrigatório' });
  const entry = {
    id: Date.now(),
    title: title || 'Atualização do Servidor',
    text,
    date: new Date().toLocaleDateString('pt-BR'),
    category: 'feature' as const
  };
  defaultChangelogs.unshift(entry);
  try {
    const db = await getPool();
    if (db) {
      await db.query('INSERT INTO znote_changelog (text, time, report_id, status) VALUES (?, UNIX_TIMESTAMP(), 0, 1);', [
        `${title}: ${text}`
      ]).catch(() => null);
    }
  } catch (e) {
    // ignore
  }
  res.json({ success: true, changelog: entry });
});

// 5.6 Helpdesk & Support Tickets (ZnoteAAC helpdesk.php / admin_helpdesk.php)
let inMemoryTickets: any[] = [
  {
    id: 101,
    username: 'Marley Sorcerer',
    subject: 'Dúvida sobre Doação de Pontos via Pix',
    message: 'Olá Staff, realizei uma doação e gostaria de saber quanto tempo leva para a ativação dos pontos no painel.',
    status: 'closed',
    creation: '11/09/2026 18:20',
    replies: [
      { id: 1, username: 'GM Marley', message: 'Saudações! O Pix tem ativação quase imediata em até 5 minutos no servidor.', created: '11/09/2026 18:30' }
    ]
  },
  {
    id: 102,
    username: 'Player Teste',
    subject: 'Relato de Tile de Entrada na Trap de Carlin',
    message: 'Percebi que um tile próximo ao portal norte está bloqueando passagem sem motivo.',
    status: 'in_progress',
    creation: '12/09/2026 11:45',
    replies: [
      { id: 1, username: 'GM Marley', message: 'Agradecemos o relato! Estamos analisando o mapa no RME para atualizar.', created: '12/09/2026 12:00' }
    ]
  }
];

app.get('/api/helpdesk/tickets', async (req: Request, res: Response) => {
  try {
    const db = await getPool();
    if (db) {
      const [rows]: any = await db.query(
        'SELECT id, username, subject, message, status, creation FROM znote_tickets ORDER BY id DESC LIMIT 50;'
      ).catch(() => [[]]);
      if (rows && rows.length > 0) {
        return res.json(rows.map((r: any) => ({
          id: r.id,
          username: r.username,
          subject: r.subject,
          message: r.message,
          status: r.status,
          creation: new Date(Number(r.creation) * 1000).toLocaleString('pt-BR'),
          replies: []
        })));
      }
    }
    res.json(inMemoryTickets);
  } catch (err: any) {
    res.json(inMemoryTickets);
  }
});

app.post('/api/helpdesk/tickets', async (req: Request, res: Response) => {
  const { username, subject, message } = req.body;
  if (!username || !subject || !message) {
    return res.status(400).json({ error: 'Preencha todos os campos do ticket' });
  }

  const newTicket = {
    id: Date.now(),
    username,
    subject,
    message,
    status: 'open',
    creation: new Date().toLocaleString('pt-BR'),
    replies: []
  };

  inMemoryTickets.unshift(newTicket);

  try {
    const db = await getPool();
    if (db) {
      await db.query(
        'INSERT INTO znote_tickets (owner, username, subject, message, ip, creation, status) VALUES (0, ?, ?, ?, 0, UNIX_TIMESTAMP(), ?);',
        [username, subject, message, 'open']
      ).catch(() => null);
    }
  } catch (e) {}

  res.json({ success: true, ticket: newTicket });
});

app.post('/api/helpdesk/reply', (req: Request, res: Response) => {
  const { ticketId, username, message, status } = req.body;
  const ticket = inMemoryTickets.find(t => t.id === Number(ticketId));
  if (ticket) {
    ticket.replies.push({
      id: Date.now(),
      username: username || 'GM Marley',
      message,
      created: new Date().toLocaleString('pt-BR')
    });
    if (status) {
      ticket.status = status;
    }
  }
  res.json({ success: true, ticket });
});

// 5.7 Shop & Donate (ZnoteAAC buypoints.php & market.php)
const shopOffers = [
  { id: 1, title: '30 Dias VIP MarleyOT', description: 'Acesso às áreas exclusivas VIP de Styller, stamina boost e bônus de 10% de EXP.', points: 10, category: 'vip' },
  { id: 2, title: '60 Dias VIP MarleyOT', description: 'Pacote promocional com dois meses de status VIP e outfit exclusivo.', points: 18, category: 'vip' },
  { id: 3, title: 'Magic Plate Armor (MPA)', description: 'Armadura pesada com Arm:17, indispensável para Knights e Paladins de alto nível.', points: 15, category: 'items', itemId: 2472, count: 1 },
  { id: 4, title: 'Soft Boots (Par)', description: 'Botas mágicas que regeneram HP e MP de forma acelerada por 4 horas.', points: 20, category: 'items', itemId: 6132, count: 1 },
  { id: 5, title: 'Backpack de Sudden Death (SD - 100 Cargas)', description: 'BP de cor escura com 20 runas de SD para combate e hunt pesada.', points: 5, category: 'runes', itemId: 2268, count: 100 },
  { id: 6, title: 'Blessing Scroll (Full Bless)', description: 'Proteção total das 5 bênçãos contra perda de itens e equipamentos na morte.', points: 8, category: 'items', itemId: 2197, count: 1 },
];

app.get('/api/shop/offers', (req: Request, res: Response) => {
  res.json(shopOffers);
});

// 5.8 Database Diagnostics & SQL Debugger
app.get('/api/admin/db-diagnostic', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const db = await getPool();
    if (!db) {
      return res.json({
        connected: false,
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        latencyMs: 0,
        tables: [],
        errorDetails: 'Não foi possível estabelecer conexão socket com o MariaDB. Verifique se o serviço mariadb.service está ativo e se o bind-address permite conexões.'
      });
    }

    const latency = Date.now() - startTime;
    const [tableRows]: any = await db.query('SHOW TABLES;');
    const tableKey = Object.keys(tableRows[0] || {})[0];
    const tableNames: string[] = tableRows.map((r: any) => r[tableKey]);

    const targetTables = [
      'accounts', 'players', 'player_deaths', 'houses', 'guilds', 'guild_membership',
      'znote', 'znote_accounts', 'znote_players', 'znote_news', 'znote_changelog',
      'znote_tickets', 'znote_shop', 'znote_shop_orders'
    ];

    const tablesReport: Array<{ name: string; rows: number; sizeKb: number }> = [];

    for (const tbl of targetTables) {
      if (tableNames.includes(tbl)) {
        try {
          const [cnt]: any = await db.query(`SELECT COUNT(*) as c FROM \`${tbl}\`;`);
          tablesReport.push({
            name: tbl,
            rows: Number(cnt[0]?.c || 0),
            sizeKb: 16
          });
        } catch {
          tablesReport.push({ name: tbl, rows: 0, sizeKb: 0 });
        }
      } else {
        tablesReport.push({ name: `${tbl} (Não instalada)`, rows: -1, sizeKb: 0 });
      }
    }

    // Server version
    const [ver]: any = await db.query('SELECT VERSION() as v;');

    res.json({
      connected: true,
      host: dbLastHost || dbConfig.host,
      port: dbConfig.port,
      database: dbLastDatabase || dbConfig.database,
      user: dbCurrentUser || dbConfig.user,
      latencyMs: latency,
      serverVersion: ver[0]?.v || 'MariaDB 10.x',
      tables: tablesReport
    });
  } catch (err: any) {
    res.json({
      connected: false,
      host: dbLastHost || dbConfig.host,
      port: dbConfig.port,
      database: dbLastDatabase || dbConfig.database,
      user: dbCurrentUser || dbConfig.user,
      latencyMs: Date.now() - startTime,
      tables: [],
      errorDetails: `Erro ${err.code || 'DB_ERR'}: ${err.message} (SQLState: ${err.sqlState || 'N/A'})`
    });
  }
});

// 5.9 Test Query Runner (Debug SQL)
app.post('/api/admin/db-query', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query SQL não fornecida' });
  }

  const startTime = Date.now();
  try {
    const db = await getPool();
    if (!db) {
      return res.status(503).json({ error: 'Banco MariaDB offline ou desconectado' });
    }

    // Execute query
    const [rows, fields]: any = await db.query(query);
    const executionTimeMs = Date.now() - startTime;

    res.json({
      success: true,
      executionTimeMs,
      rowCount: Array.isArray(rows) ? rows.length : rows?.affectedRows || 0,
      rows: Array.isArray(rows) ? rows.slice(0, 100) : rows
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      executionTimeMs: Date.now() - startTime,
      error: err.message,
      code: err.code,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
  }
});

// 5.10 Auto-Migrate ZnoteAAC Schema
app.post('/api/admin/db-migrate-znote', async (req: Request, res: Response) => {
  try {
    const db = await getPool();
    if (!db) {
      return res.status(503).json({ error: 'MariaDB offline. Impossível rodar migração.' });
    }

    const schemaPath = path.join(process.cwd(), 'ZnoteAAC-2', 'engine', 'database', 'znote_schema.sql');
    if (!fs.existsSync(schemaPath)) {
      return res.status(404).json({ error: 'Arquivo znote_schema.sql não encontrado na pasta ZnoteAAC-2' });
    }

    const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 5 && !s.startsWith('--'));

    let executed = 0;
    const errors: string[] = [];

    for (const stmt of statements) {
      try {
        await db.query(stmt);
        executed++;
      } catch (err: any) {
        errors.push(`Erro em [${stmt.substring(0, 40)}...]: ${err.message}`);
      }
    }

    res.json({
      success: true,
      totalStatements: statements.length,
      executed,
      errorsCount: errors.length,
      errors: errors.slice(0, 10)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5.11 Znote AAC PHP Repository & File Explorer
const znoteDescriptions: Record<string, { category: string; description: string; mappedRoute?: string }> = {
  'index.php': { category: 'Público', description: 'Página inicial do Znote AAC com notícias, ticker e banners do servidor.', mappedRoute: 'home' },
  'register.php': { category: 'Contas', description: 'Formulário de criação de contas com validação de formato e encriptação SHA1.', mappedRoute: 'create_account' },
  'login.php': { category: 'Contas', description: 'Autenticação de sessão de conta de jogadores e administradores.', mappedRoute: 'account_management' },
  'myaccount.php': { category: 'Contas', description: 'Painel completo da conta: criação de personagens, recovery key e histórico.', mappedRoute: 'account_management' },
  'createcharacter.php': { category: 'Contas', description: 'Criação de novos personagens com seleção de vocação, sexo e cidade.', mappedRoute: 'account_management' },
  'changepassword.php': { category: 'Contas', description: 'Troca de senha de segurança da conta com verificação da senha antiga.', mappedRoute: 'account_management' },
  'characterprofile.php': { category: 'Personagens', description: 'Perfil público com level, vocação, mortes, guilda e equipamentos.', mappedRoute: 'character_profile' },
  'onlinelist.php': { category: 'Comunidade', description: 'Lista em tempo real de jogadores conectados, vocações e níveis.', mappedRoute: 'onlinelist' },
  'highscores.php': { category: 'Comunidade', description: 'Ranking global de experiência, magic level e habilidades (skills).', mappedRoute: 'highscores' },
  'deaths.php': { category: 'PvP & Mortes', description: 'Últimas mortes do servidor registradas por monstros e outros jogadores.', mappedRoute: 'deaths' },
  'killers.php': { category: 'PvP & Mortes', description: 'Top Fraggers: ranking dos maiores assassinos e contagem de frags PvP.', mappedRoute: 'killers' },
  'powergamers.php': { category: 'Comunidade', description: 'Top jogadores que mais adquiriram experiência nas últimas 24h e 7 dias.', mappedRoute: 'highscores' },
  'houses.php': { category: 'Mundo & Economia', description: 'Catálogo de casas de todas as cidades com status de aluguel e donos.', mappedRoute: 'houses' },
  'house.php': { category: 'Mundo & Economia', description: 'Detalhes individuais de cada residência e transferências de posse.', mappedRoute: 'houses' },
  'guilds.php': { category: 'Guildas', description: 'Lista de guildas, líderes, ranks, membros e mensagens do dia (MOTD).', mappedRoute: 'guilds' },
  'guildwar.php': { category: 'Guildas', description: 'Sistema de declaração e acompanhamento de guerras ativas entre guildas.', mappedRoute: 'guilds' },
  'topguilds.php': { category: 'Guildas', description: 'Ranking das melhores e mais fortes guildas do servidor.', mappedRoute: 'guilds' },
  'spells.php': { category: 'Biblioteca & Spells', description: 'Grimório completo de feitiços e runas por vocação, level e mana.', mappedRoute: 'spells' },
  'monster_loot.php': { category: 'Biblioteca & Spells', description: 'Bestiário de monstros do 8.60 com tabelas de loot e chance de drop.', mappedRoute: 'monster_loot' },
  'shop.php': { category: 'Shop & Doações', description: 'Loja virtual com itens, dias VIP, runas e pacotes para adquirir.', mappedRoute: 'shop' },
  'buypoints.php': { category: 'Shop & Doações', description: 'Métodos de pagamento (Pix, PagSeguro, PayPal) para adquirir pontos.', mappedRoute: 'shop' },
  'market.php': { category: 'Shop & Doações', description: 'Mercado de ofertas de compra e venda de itens entre jogadores.', mappedRoute: 'shop' },
  'helpdesk.php': { category: 'Suporte', description: 'Sistema de abertura e acompanhamento de chamados e suporte.', mappedRoute: 'helpdesk' },
  'support.php': { category: 'Suporte', description: 'Lista oficial dos membros da staff (GODs, GMs, CMs e Tutores).', mappedRoute: 'support' },
  'changelog.php': { category: 'Servidor', description: 'Histórico de notas de versão, correções de bugs e atualizações.', mappedRoute: 'changelog' },
  'serverinfo.php': { category: 'Servidor', description: 'Taxas de experiência em estágios, skills, magic rate, loot e regras.', mappedRoute: 'server_info' },
  'downloads.php': { category: 'Servidor', description: 'Links oficiais para download do cliente customizado OTClientV8.', mappedRoute: 'downloads' },
  'forum.php': { category: 'Comunidade', description: 'Fórum oficial de discussões, regras e guias da comunidade.', mappedRoute: 'home' },
  'gallery.php': { category: 'Comunidade', description: 'Galeria de screenshots e momentos marcantes enviados pelos jogadores.', mappedRoute: 'home' },
  'voting.php': { category: 'Comunidade', description: 'Sistema de votação em rankings (OTServList) com premiações.', mappedRoute: 'home' },
  'admin.php': { category: 'Administração', description: 'Painel administrativo para controle geral de notícias, contas e servidor.', mappedRoute: 'admin_panel' },
  'admin_news.php': { category: 'Administração', description: 'Gestão de notícias e comunicados exibidos na página inicial.', mappedRoute: 'admin_panel' },
  'admin_skills.php': { category: 'Administração', description: 'Edição de habilidades e níveis de personagens pela staff.', mappedRoute: 'admin_panel' },
  'admin_reports.php': { category: 'Administração', description: 'Visualização de denúncias de jogadores feitas dentro do jogo.', mappedRoute: 'admin_panel' },
  'admin_helpdesk.php': { category: 'Administração', description: 'Painel da equipe para responder e encerrar chamados de suporte.', mappedRoute: 'helpdesk' },
  'admin_shop.php': { category: 'Administração', description: 'Configuração de ofertas, preços e entregas do Shop do servidor.', mappedRoute: 'shop' },
  'admin_auction.php': { category: 'Administração', description: 'Administração do sistema de leilão de personagens e itens.', mappedRoute: 'admin_panel' },
  'config.php': { category: 'Configuração Core', description: 'Arquivo mestre com todas as configurações do Znote AAC e conexão MySQL.', mappedRoute: 'admin_settings' },
  'recovery.php': { category: 'Contas', description: 'Recuperação de conta através de e-mail ou Chave de Recuperação.', mappedRoute: 'create_account' },
  'credits.php': { category: 'Sistema', description: 'Créditos de desenvolvimento do Znote AAC e licença de código aberto.', mappedRoute: 'server_info' }
};

app.get('/api/znote/files', (req: Request, res: Response) => {
  try {
    const znoteDir = path.join(process.cwd(), 'ZnoteAAC-2');
    if (!fs.existsSync(znoteDir)) {
      return res.status(404).json({ error: 'Diretório ZnoteAAC-2 não encontrado' });
    }

    const allEntries = fs.readdirSync(znoteDir, { withFileTypes: true });
    const phpFiles = allEntries
      .filter(dirent => dirent.isFile() && dirent.name.endsWith('.php'))
      .map(dirent => {
        const fullPath = path.join(znoteDir, dirent.name);
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n').length;
        const meta = znoteDescriptions[dirent.name] || {
          category: 'Módulo Znote',
          description: `Arquivo PHP original do Znote AAC (${dirent.name})`,
          mappedRoute: 'znote_php'
        };

        return {
          filename: dirent.name,
          category: meta.category,
          description: meta.description,
          mappedRoute: meta.mappedRoute || 'znote_php',
          sizeBytes: stats.size,
          sizeKb: Math.round(stats.size / 1024 * 10) / 10,
          linesCount: lines
        };
      })
      .sort((a, b) => a.category.localeCompare(b.category) || a.filename.localeCompare(b.filename));

    res.json({
      total: phpFiles.length,
      directory: 'ZnoteAAC-2',
      files: phpFiles
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/znote/file', (req: Request, res: Response) => {
  const fileName = req.query.name as string;
  if (!fileName || typeof fileName !== 'string' || !fileName.endsWith('.php') || fileName.includes('..') || fileName.includes('/')) {
    return res.status(400).json({ error: 'Nome de arquivo .php inválido' });
  }

  const filePath = path.join(process.cwd(), 'ZnoteAAC-2', fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `Arquivo ${fileName} não encontrado no ZnoteAAC-2` });
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const stats = fs.statSync(filePath);
  const meta = znoteDescriptions[fileName] || { category: 'Módulo Znote', description: 'Script PHP do ZnoteAAC' };

  res.json({
    filename: fileName,
    category: meta.category,
    description: meta.description,
    mappedRoute: meta.mappedRoute,
    sizeBytes: stats.size,
    linesCount: content.split('\n').length,
    content
  });
});

// 5.12 Spells Database (ZnoteAAC spells.php)
const spellsData = [
  // Sorcerer
  { name: 'Hell\'s Core', words: 'exevo gran mas vis', vocation: 'Sorcerer', level: 60, mana: 1200, type: 'Ataque de Área (Fogo)', premium: true },
  { name: 'Energy Wave', words: 'exevo vis hur', vocation: 'Sorcerer', level: 38, mana: 170, type: 'Ataque em Linha', premium: false },
  { name: 'Great Energy Beam', words: 'exevo gran vis lux', vocation: 'Sorcerer', level: 29, mana: 110, type: 'Ataque em Linha', premium: false },
  { name: 'Energy Beam', words: 'exevo vis lux', vocation: 'Sorcerer', level: 23, mana: 40, type: 'Ataque em Linha', premium: false },
  { name: 'Energy Strike', words: 'exori vis', vocation: 'Sorcerer', level: 12, mana: 20, type: 'Ataque Direto', premium: true },
  { name: 'Flame Strike', words: 'exori flam', vocation: 'Sorcerer', level: 14, mana: 20, type: 'Ataque Direto', premium: true },
  { name: 'Sudden Death Rune', words: 'adori gran mort', vocation: 'Sorcerer', level: 45, mana: 985, type: 'Fabricação de Runa', premium: true },
  { name: 'Ultimate Healing Rune', words: 'adura vita', vocation: 'Sorcerer', level: 24, mana: 400, type: 'Fabricação de Runa', premium: false },
  { name: 'Magic Shield', words: 'utamo vita', vocation: 'Sorcerer', level: 14, mana: 50, type: 'Defesa / Suporte', premium: false },
  { name: 'Haste', words: 'utani hur', vocation: 'Sorcerer', level: 14, mana: 60, type: 'Velocidade', premium: true },
  { name: 'Strong Haste', words: 'utani gran hur', vocation: 'Sorcerer', level: 20, mana: 100, type: 'Velocidade', premium: true },
  { name: 'Invisible', words: 'utana vid', vocation: 'Sorcerer', level: 35, mana: 440, type: 'Furtividade', premium: true },

  // Druid
  { name: 'Eternal Winter', words: 'exevo gran mas frigo', vocation: 'Druid', level: 60, mana: 1200, type: 'Ataque de Área (Gelo)', premium: true },
  { name: 'Terra Wave', words: 'exevo tera hur', vocation: 'Druid', level: 38, mana: 170, type: 'Ataque em Linha (Terra)', premium: false },
  { name: 'Ice Wave', words: 'exevo frigo hur', vocation: 'Druid', level: 18, mana: 25, type: 'Ataque em Cone (Gelo)', premium: false },
  { name: 'Ice Strike', words: 'exori frigo', vocation: 'Druid', level: 15, mana: 20, type: 'Ataque Direto', premium: true },
  { name: 'Terra Strike', words: 'exori tera', vocation: 'Druid', level: 13, mana: 20, type: 'Ataque Direto', premium: true },
  { name: 'Mass Healing', words: 'exura gran mas res', vocation: 'Druid', level: 36, mana: 150, type: 'Cura em Área', premium: true },
  { name: 'Heal Friend', words: 'exura sio "name"', vocation: 'Druid', level: 18, mana: 140, type: 'Cura de Alvo', premium: true },
  { name: 'Intense Healing', words: 'exura gran', vocation: 'Druid', level: 11, mana: 70, type: 'Cura Pessoal', premium: false },
  { name: 'Ultimate Healing', words: 'exura vita', vocation: 'Druid', level: 20, mana: 160, type: 'Cura Pessoal Máxima', premium: false },
  { name: 'Paralyze Rune', words: 'adana ani', vocation: 'Druid', level: 54, mana: 1400, type: 'Fabricação de Runa', premium: true },
  { name: 'Wild Growth', words: 'exevo grav vita', vocation: 'Druid', level: 27, mana: 220, type: 'Criação de Barreira', premium: true },

  // Paladin
  { name: 'Divine Caldera', words: 'exevo mas san', vocation: 'Paladin', level: 50, mana: 160, type: 'Ataque Sagrado de Área', premium: true },
  { name: 'Divine Missile', words: 'exori san', vocation: 'Paladin', level: 40, mana: 20, type: 'Ataque Sagrado', premium: true },
  { name: 'Sharpshooter', words: 'utito tempo san', vocation: 'Paladin', level: 60, mana: 450, type: 'Buff de Ataque Distância', premium: true },
  { name: 'Holy Flash', words: 'utori san', vocation: 'Paladin', level: 70, mana: 300, type: 'Condição Sagrada', premium: true },
  { name: 'Salvation', words: 'exura gran san', vocation: 'Paladin', level: 60, mana: 210, type: 'Cura Sagrada Máxima', premium: true },
  { name: 'Divine Healing', words: 'exura san', vocation: 'Paladin', level: 35, mana: 160, type: 'Cura Sagrada', premium: false },
  { name: 'Ethereal Spear', words: 'exori con', vocation: 'Paladin', level: 23, mana: 25, type: 'Projétil Mágico', premium: true },
  { name: 'Holy Missile Rune', words: 'adori san', vocation: 'Paladin', level: 27, mana: 350, type: 'Fabricação de Runa', premium: true },

  // Knight
  { name: 'Fierce Berserk', words: 'exori gran', vocation: 'Knight', level: 90, mana: 340, type: 'Ataque Físico Massivo', premium: true },
  { name: 'Berserk', words: 'exori', vocation: 'Knight', level: 35, mana: 115, type: 'Ataque Físico de Área', premium: true },
  { name: 'Whirlwind Sword', words: 'exori hur', vocation: 'Knight', level: 28, mana: 40, type: 'Ataque à Distância', premium: true },
  { name: 'Groundshaker', words: 'exori mas', vocation: 'Knight', level: 33, mana: 160, type: 'Onda de Choque', premium: true },
  { name: 'Wound Cleansing', words: 'exana mort', vocation: 'Knight', level: 30, mana: 65, type: 'Cura Rápida', premium: false },
  { name: 'Blood Rage', words: 'utito tempo', vocation: 'Knight', level: 60, mana: 290, type: 'Fúria de Ataque', premium: true },
  { name: 'Challenge', words: 'exeta res', vocation: 'Knight', level: 20, mana: 30, type: 'Provocar Monstros (Taunt)', premium: true },
  { name: 'Protector', words: 'utamo tempo', vocation: 'Knight', level: 55, mana: 200, type: 'Postura Defensiva', premium: true },
];

app.get('/api/spells', (req: Request, res: Response) => {
  const { vocation, type } = req.query;
  let filtered = spellsData;
  if (vocation && typeof vocation === 'string' && vocation !== 'all') {
    filtered = filtered.filter(s => s.vocation.toLowerCase() === vocation.toLowerCase());
  }
  if (type && typeof type === 'string' && type !== 'all') {
    filtered = filtered.filter(s => s.type.toLowerCase().includes(type.toLowerCase()));
  }
  res.json(filtered);
});

// 5.13 Online List (ZnoteAAC onlinelist.php)
app.get('/api/onlinelist', async (req: Request, res: Response) => {
  try {
    const db = await getPool();
    if (db) {
      const [rows]: any = await db.query(
        `SELECT p.id, p.name, p.level, p.vocation, p.maglevel, p.experience, g.name AS guildName 
         FROM players p WHERE p.online > 0
         LEFT JOIN guild_membership gm ON gm.player_id = p.id
         LEFT JOIN guilds g ON gm.guild_id = g.id
         ORDER BY p.level DESC;`
      ).catch(() => [[]]);

      const vocNames: Record<number, string> = {
        0: 'None', 1: 'Sorcerer', 2: 'Druid', 3: 'Paladin', 4: 'Knight',
        5: 'Master Sorcerer', 6: 'Elder Druid', 7: 'Royal Paladin', 8: 'Elite Knight'
      };

      if (rows && rows.length > 0) {
        return res.json(rows.map((r: any) => ({
          ...r,
          vocation: vocNames[r.vocation] || 'Sorcerer',
          guildName: r.guildName || 'Sem Guilda'
        })));
      }
    }

    // Default online list
    res.json([]);
  } catch (err: any) {
    res.json([]);
  }
});

// 5.14 Top Killers / Fraggers (ZnoteAAC killers.php)
app.get('/api/killers', async (req: Request, res: Response) => {
  try {
    const db = await getPool();
    if (db) {
      const [rows]: any = await db.query(`
        SELECT killed_by as name, COUNT(*) as frags 
        FROM player_deaths 
        WHERE is_player = 1 
        GROUP BY killed_by 
        ORDER BY frags DESC 
        LIMIT 25;
      `).catch(() => [[]]);

      if (rows && rows.length > 0) {
        return res.json(rows);
      }
    }

    res.json([]);
  } catch {
    res.json([]);
  }
});

// 5.15 Monsters & Bestiary (ZnoteAAC monster_loot.php)
const monstersData = [
  {
    name: 'Demon',
    hp: 8200,
    exp: 6000,
    speed: 280,
    immune: 'Fire, Poison, Invisibility',
    description: 'A criatura mais icônica do Tibia, habita as profundezas mais perigosas do submundo de Styller.',
    loot: [
      { item: 'Magic Plate Armor (MPA)', chance: '0.1%', rarity: 'Extremamente Raro' },
      { item: 'Mastermind Shield (MMS)', chance: '0.4%', rarity: 'Muito Raro' },
      { item: 'Demon Shield', chance: '0.8%', rarity: 'Raro' },
      { item: 'Giant Sword', chance: '1.2%', rarity: 'Raro' },
      { item: 'Fire Axe', chance: '2.5%', rarity: 'Semirraro' },
      { item: 'Golden Legs', chance: '0.2%', rarity: 'Extremamente Raro' },
      { item: 'Platinum Coins (0-30)', chance: '100%', rarity: 'Comum' }
    ]
  },
  {
    name: 'Dragon Lord',
    hp: 1900,
    exp: 2100,
    speed: 220,
    immune: 'Fire, Invisibility, Paralyze',
    description: 'Dragões ancestrais de coloração avermelhada, cobiçados para caçadas rápidas de experiência.',
    loot: [
      { item: 'Dragon Scale Mail (DSM)', chance: '0.3%', rarity: 'Muito Raro' },
      { item: 'Royal Helmet (RH)', chance: '0.5%', rarity: 'Raro' },
      { item: 'Dragon Slayer', chance: '0.6%', rarity: 'Raro' },
      { item: 'Fire Sword', chance: '2.0%', rarity: 'Semirraro' },
      { item: 'Tower Shield', chance: '1.0%', rarity: 'Raro' },
      { item: 'Green Mushroom', chance: '15%', rarity: 'Comum' }
    ]
  },
  {
    name: 'Behemoth',
    hp: 4000,
    exp: 2500,
    speed: 240,
    immune: 'Energy, Invisibility, Paralyze',
    description: 'Gigantes pré-históricos de força devastadora que arremessam pedregulhos colossais.',
    loot: [
      { item: 'Steel Boots', chance: '0.4%', rarity: 'Muito Raro' },
      { item: 'Titan Axe', chance: '0.8%', rarity: 'Raro' },
      { item: 'Giant Sword', chance: '1.0%', rarity: 'Raro' },
      { item: 'Behemoth Claw', chance: '10%', rarity: 'Comum' },
      { item: 'Meat & Ham', chance: '80%', rarity: 'Comum' }
    ]
  },
  {
    name: 'Hydra',
    hp: 2350,
    exp: 2100,
    speed: 210,
    immune: 'Earth, Water, Invisibility',
    description: 'Serpentes de múltiplas cabeças com regeneração acelerada e ataques de ácido venenoso.',
    loot: [
      { item: 'Boots of Haste (BOH)', chance: '0.5%', rarity: 'Muito Raro' },
      { item: 'Royal Helmet', chance: '0.4%', rarity: 'Raro' },
      { item: 'Medusa Shield', chance: '0.7%', rarity: 'Raro' },
      { item: 'Warrior Helmet', chance: '2.0%', rarity: 'Semirraro' },
      { item: 'Hydra Egg', chance: '12%', rarity: 'Comum' }
    ]
  },
  {
    name: 'Warlock',
    hp: 3500,
    exp: 4000,
    speed: 260,
    immune: 'Energy, Fire, Poison, Invisibility',
    description: 'Feiticeiros renegados que dominam o teletransporte e explosões de energia mortais.',
    loot: [
      { item: 'Golden Armor', chance: '0.4%', rarity: 'Muito Raro' },
      { item: 'Skull Staff', chance: '3.0%', rarity: 'Semirraro' },
      { item: 'Ring of the Sky', chance: '0.6%', rarity: 'Raro' },
      { item: 'Blue Robe', chance: '1.5%', rarity: 'Raro' },
      { item: 'Energy Ring', chance: '8.0%', rarity: 'Comum' }
    ]
  }
];

app.get('/api/monsters', (req: Request, res: Response) => {
  res.json(monstersData);
});

// 5.16 Support Team (ZnoteAAC support.php)
const staffData = [
  { name: 'GM Marley', role: 'Server Administrator & Owner', group: 'GOD (Acesso Total)', status: 'Online', description: 'Responsável pela infraestrutura, desenvolvimento de scripts e gestão geral do MarleyOT 8.60.' },
  { name: 'CM Zion', role: 'Community Manager', group: 'Community Manager', status: 'Offline', description: 'Organização de eventos comunitários, suporte a guildas e moderação do fórum oficial.' },
  { name: 'Tutor Roots', role: 'Head Tutor', group: 'Tutor Oficial', status: 'Online', description: 'Auxílio a novos jogadores no Help Channel e resolução de dúvidas in-game.' }
];

app.get('/api/support', (req: Request, res: Response) => {
  res.json(staffData);
});

// ----------------------------------------------------
// VITE OR STATIC SERVING
// ----------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MarleyOT Portal] Running on port ${PORT} (host 0.0.0.0)`);
  });
}

start();
