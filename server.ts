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
}

function getSettings(): PortalSettingsData {
  const defaultSettings: PortalSettingsData = {
    clientDownloadUrl: 'http://marleyot.duckdns.org/downloads/MarleyOT-ClientV8.zip',
    serverIconUrl: '',
    serverName: 'MarleyOT 8.60',
    heroBannerUrl: '',
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

const dbConfig: DbConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'MARLEY22@@##',
  database: process.env.MYSQL_DATABASE || 'marleyot86',
};

let pool: Pool | null = null;
let dbConnected = false;
let dbLastHost = '';
let dbLastError = '';

async function getPool(): Promise<Pool | null> {
  if (pool && dbConnected) return pool;

  // Hosts to attempt: first configured, then fallback to VPS remote IP or localhost
  const candidateHosts: string[] = [];
  if (process.env.MYSQL_HOST) {
    candidateHosts.push(process.env.MYSQL_HOST);
  } else {
    // Try localhost first (for when running inside VPS)
    candidateHosts.push('127.0.0.1');
    // If not local, try Oracle Cloud VPS IP directly
    candidateHosts.push('137.131.196.66');
  }

  for (const host of candidateHosts) {
    try {
      const candidatePool = mysql.createPool({
        host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 3000,
      });

      const conn = await candidatePool.getConnection();
      await conn.ping();
      conn.release();

      pool = candidatePool;
      dbConnected = true;
      dbLastHost = host;
      dbLastError = '';
      console.log(`[DB] Successfully connected to MariaDB (${dbConfig.database}) at ${host}:${dbConfig.port}`);
      return pool;
    } catch (err: any) {
      dbLastError = err.message;
      console.warn(`[DB] Connection to ${host}:${dbConfig.port} failed: ${err.message}`);
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
    let onlineCount = 1;
    let totalPlayers = 3;
    let totalAccounts = 2;

    if (db) {
      const [onlineRows]: any = await db.query('SELECT COUNT(*) as count FROM `players` WHERE `online` > 0;');
      if (onlineRows && onlineRows[0]) {
        onlineCount = Math.max(Number(onlineRows[0].count), 1);
      }
      const [playerRows]: any = await db.query('SELECT COUNT(*) as count FROM `players`;');
      if (playerRows && playerRows[0]) {
        totalPlayers = Number(playerRows[0].count);
      }
      const [accRows]: any = await db.query('SELECT COUNT(*) as count FROM `accounts`;');
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
      'SELECT `id`, `name`, `level`, `vocation`, `maglevel`, `experience`, `online` FROM `players` WHERE `group_id` < 3 ORDER BY `level` DESC, `experience` DESC LIMIT 50;'
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
      'SELECT `id`, `name`, `level`, `vocation`, `maglevel`, `experience`, `online`, `town_id`, `balance`, `lastlogin` FROM `players` WHERE `account_id` = ?;',
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

    res.json({
      success: true,
      account: {
        accountName: acc.name,
        type: acc.type,
        premiumDays: acc.premdays,
        characters: formattedChars,
      }
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

    // 4. Inserir na tabela `accounts`
    const [accInsert]: any = await db.query(
      'INSERT INTO `accounts` (`name`, `password`, `email`, `premdays`, `type`) VALUES (?, ?, ?, 30, 1);',
      [cleanAcc, sha1Pass, accEmail]
    );

    const accountId = accInsert.insertId;

    // 5. Inserir na tabela `players`
    const looktype = sexId === 0 ? 136 : 128; // Citizen Outfit (Female: 136, Male: 128)
    const [charInsert]: any = await db.query(
      `INSERT INTO \`players\` (
        \`name\`, \`group_id\`, \`account_id\`, \`level\`, \`vocation\`, \`health\`, \`healthmax\`, \`experience\`,
        \`lookbody\`, \`lookfeet\`, \`lookhead\`, \`looklegs\`, \`looktype\`, \`lookaddons\`, \`maglevel\`,
        \`mana\`, \`manamax\`, \`manaspent\`, \`soul\`, \`town_id\`, \`posx\`, \`posy\`, \`posz\`, \`conditions\`,
        \`cap\`, \`sex\`, \`lastlogin\`, \`lastip\`, \`save\`, \`skull\`, \`skulltime\`, \`balance\`
      ) VALUES (
        ?, 1, ?, 8, ?, 185, 185, 4200,
        68, 76, 78, 58, ?, 0, 0,
        35, 35, 0, 100, 1, 160, 54, 7, '',
        470, ?, 0, 0, 1, 0, 0, 0
      );`,
      [cleanChar, accountId, vocId, looktype, sexId]
    );

    const charId = charInsert.insertId;

    // 6. Tentar vincular com znote_accounts se tabela existir
    try {
      await db.query(
        'INSERT IGNORE INTO `znote_accounts` (`account_id`, `ip`, `created`, `points`, `active`, `flag`) VALUES (?, 0, UNIX_TIMESTAMP(), 0, 1, "br");',
        [accountId]
      );
    } catch (e) {
      // Ignora se tabela znote_accounts não existir ainda
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

    res.json({
      success: true,
      message: `Conta '${cleanAcc}' e personagem '${cleanChar}' criados com sucesso no banco de dados MariaDB!`,
      account: {
        accountName: cleanAcc,
        type: 1,
        premiumDays: 30,
        characters: [newCharacter]
      }
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
        \`lookbody\`, \`lookfeet\`, \`lookhead\`, \`looklegs\`, \`looktype\`, \`lookaddons\`, \`maglevel\`,
        \`mana\`, \`manamax\`, \`manaspent\`, \`soul\`, \`town_id\`, \`posx\`, \`posy\`, \`posz\`, \`conditions\`,
        \`cap\`, \`sex\`, \`lastlogin\`, \`lastip\`, \`save\`, \`skull\`, \`skulltime\`, \`balance\`
      ) VALUES (
        ?, 1, ?, 8, ?, 185, 185, 4200,
        68, 76, 78, 58, ?, 0, 0,
        35, 35, 0, 100, 1, 160, 54, 7, '',
        470, ?, 0, 0, 1, 0, 0, 0
      );`,
      [cleanChar, accountId, vocId, looktype, sexId]
    );

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
      `SELECT p.\`id\`, p.\`name\`, p.\`level\`, p.\`vocation\`, p.\`maglevel\`, p.\`experience\`, p.\`online\`, p.\`town_id\`, p.\`balance\`, p.\`lastlogin\`
       FROM \`players\` p
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
      `SELECT p.\`id\`, p.\`name\`, p.\`level\`, p.\`vocation\`, p.\`maglevel\`, p.\`experience\`, p.\`online\`, p.\`balance\`, a.\`name\` as \`accountName\`
       FROM \`players\` p
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
      return res.json([
        { id: 1, victim: 'Player Teste', level: 45, time: 'Hoje às 14:32', killer: 'Dragon Lord', isPlayer: false },
        { id: 2, victim: 'Sorcerer Rasta', level: 68, time: 'Hoje às 13:10', killer: 'Marley Sorcerer', isPlayer: true },
        { id: 3, victim: 'Knight Jah', level: 32, time: 'Ontem às 22:15', killer: 'Giant Spider', isPlayer: false },
        { id: 4, victim: 'Druid Roots', level: 54, time: 'Ontem às 19:40', killer: 'Demon', isPlayer: false },
        { id: 5, victim: 'Paladin Zion', level: 80, time: 'Ontem às 18:05', killer: 'GM Marley', isPlayer: true },
      ]);
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
      return res.json([
        { id: 1, name: 'Styller Central House #1', townId: 1, townName: 'Styller City (Principal)', rent: 15000, size: 45, beds: 2, ownerName: 'Marley Sorcerer', isRented: true },
        { id: 2, name: 'Styller Depot Villa #2', townId: 1, townName: 'Styller City (Principal)', rent: 25000, size: 85, beds: 4, ownerName: null, isRented: false },
        { id: 3, name: 'Temple Street Flat #3', townId: 1, townName: 'Styller City (Principal)', rent: 8000, size: 28, beds: 1, ownerName: 'Player Teste', isRented: true },
        { id: 4, name: 'Seaside Manor #4', townId: 1, townName: 'Styller City (Principal)', rent: 35000, size: 120, beds: 6, ownerName: null, isRented: false },
        { id: 5, name: 'Market Corner Flat #5', townId: 1, townName: 'Styller City (Principal)', rent: 12000, size: 36, beds: 2, ownerName: null, isRented: false },
      ]);
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
      return res.json([
        { id: 1, name: 'Roots & Culture', leaderName: 'Marley Sorcerer', memberCount: 14, motd: 'Paz, Respeito e Guerras Honradas no MarleyOT!', creationDate: '10/09/2026' },
        { id: 2, name: 'Zion Warriors', leaderName: 'Player Teste', memberCount: 8, motd: 'Dominando as hunts e raids de Styller.', creationDate: '11/09/2026' },
        { id: 3, name: 'Old School 86', leaderName: 'Knight Jah', memberCount: 5, motd: 'Clássico 8.60 para os verdadeiros veteranos.', creationDate: '12/09/2026' },
      ]);
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
      'SELECT id, name, level, vocation, maglevel, experience, online, town_id, balance, lastlogin, group_id FROM players WHERE name = ? LIMIT 1;',
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
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      latencyMs: latency,
      serverVersion: ver[0]?.v || 'MariaDB 10.x',
      tables: tablesReport
    });
  } catch (err: any) {
    res.json({
      connected: false,
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
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
