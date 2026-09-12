export type PageId = 
  | 'home' 
  | 'create_account' 
  | 'account_management' 
  | 'highscores' 
  | 'deaths'
  | 'houses'
  | 'guilds'
  | 'character_profile'
  | 'character_search'
  | 'shop'
  | 'shop_points'
  | 'helpdesk'
  | 'changelog'
  | 'server_info' 
  | 'downloads' 
  | 'deploy_guide'
  | 'admin_panel'
  | 'db_diagnostic'
  | 'database_debug';

export interface PortalSettings {
  clientDownloadUrl: string;
  serverIconUrl: string;
  serverName: string;
  heroBannerUrl?: string;
}

export interface PlayerCharacter {
  id: number;
  name: string;
  level: number;
  vocation: string;
  maglevel: number;
  experience: number;
  online: boolean;
  town: string;
  groupName?: string;
  balance?: number;
  lastlogin?: number;
}

export interface AccountSession {
  accountName: string;
  type: number;
  premiumDays: number;
  characters: PlayerCharacter[];
  points?: number;
}

export interface ServerStats {
  status: 'online' | 'offline';
  ip: string;
  port: number;
  client: string;
  onlinePlayers: number;
  maxPlayers: number;
  uptime: string;
  worldType: string;
  expRate: string;
  skillRate: string;
  magicRate: string;
  lootRate: string;
}

export interface DeathRecord {
  id: number;
  victim: string;
  level: number;
  time: string;
  killer: string;
  isPlayer: boolean;
}

export interface HouseRecord {
  id: number;
  name: string;
  townId: number;
  townName: string;
  rent: number;
  size: number;
  beds: number;
  ownerName: string | null;
  isRented: boolean;
}

export interface GuildRecord {
  id: number;
  name: string;
  leaderName: string;
  memberCount: number;
  motd: string;
  creationDate: string;
}

export interface CharacterProfileData {
  name: string;
  level: number;
  vocation: string;
  maglevel: number;
  experience: number;
  online: boolean;
  town: string;
  groupName: string;
  balance: number;
  lastlogin: string;
  guildName?: string;
  guildRank?: string;
  deaths: DeathRecord[];
}

export interface HelpdeskTicket {
  id: number;
  username: string;
  subject: string;
  message: string;
  status: 'open' | 'closed' | 'in_progress';
  creation: string;
  replies: Array<{
    id: number;
    username: string;
    message: string;
    created: string;
  }>;
}

export interface ChangelogRecord {
  id: number;
  title: string;
  text: string;
  date: string;
  category: 'feature' | 'fix' | 'balance' | 'event';
}

export interface ShopOffer {
  id: number;
  title: string;
  description: string;
  points: number;
  category: 'vip' | 'items' | 'runes' | 'addons';
  itemId?: number;
  count?: number;
}

export interface DatabaseDiagnostic {
  connected: boolean;
  host: string;
  port: number;
  database: string;
  user: string;
  latencyMs: number;
  tables: Array<{ name: string; rows: number; sizeKb: number }>;
  serverVersion?: string;
  errorDetails?: string;
}

export type CharacterDetail = CharacterProfileData;
export type SupportTicket = HelpdeskTicket;
export type ChangelogEntry = ChangelogRecord;
