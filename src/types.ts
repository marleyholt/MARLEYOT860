export type PageId = 
  | 'home' 
  | 'create_account' 
  | 'account_management' 
  | 'highscores' 
  | 'server_info' 
  | 'downloads' 
  | 'guilds'
  | 'deploy_guide'
  | 'admin_panel';

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
}

export interface AccountSession {
  accountName: string;
  type: number;
  premiumDays: number;
  characters: PlayerCharacter[];
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
