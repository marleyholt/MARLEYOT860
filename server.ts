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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Settings persistence
const SETTINGS_FILE = path.join(process.cwd(), 'portal_settings.json');

interface PortalSettingsData {
  clientDownloadUrl: string;
  serverIconUrl: string;
  serverName: string;
}

function getSettings(): PortalSettingsData {
  const defaultSettings: PortalSettingsData = {
    clientDownloadUrl: 'http://marleyot.duckdns.org/downloads/MarleyOT-ClientV8.zip',
    serverIconUrl: '',
    serverName: 'MarleyOT 8.60',
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

async function getPool(): Promise<Pool | null> {
  if (pool && dbConnected) return pool;

  try {
    const newPool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000,
    });

    const conn = await newPool.getConnection();
    await conn.ping();
    conn.release();

    pool = newPool;
    dbConnected = true;
    console.log(`[DB] Connected to MariaDB (${dbConfig.database}) at ${dbConfig.host}:${dbConfig.port}`);
    return pool;
  } catch (err: any) {
    dbConnected = false;
    console.warn(`[DB] Database connection error: ${err.message}. Running in fallback state.`);
    return null;
  }
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
  const { clientDownloadUrl, serverIconUrl, serverName } = req.body;
  const updated = saveSettings({
    clientDownloadUrl: clientDownloadUrl || undefined,
    serverIconUrl: serverIconUrl !== undefined ? serverIconUrl : undefined,
    serverName: serverName || undefined,
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
      return res.status(401).json({ error: 'Conta ou senha inválidos' });
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
      'SELECT `id`, `name`, `level`, `vocation`, `maglevel`, `experience`, `online` FROM `players` WHERE `account_id` = ?;',
      [acc.id]
    );

    res.json({
      success: true,
      account: {
        accountName: acc.name,
        type: acc.type,
        premiumDays: acc.premdays,
        characters: charRows,
      }
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
