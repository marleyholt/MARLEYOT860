export type TabId = 
  | 'overview'
  | 'compilation'
  | 'config-lua'
  | 'client-packaging'
  | 'vbot-scripts'
  | 'database'
  | 'cicd-oci'
  | 'troubleshooting';

export interface ServerConfigState {
  serverName: string;
  ownerName: string;
  ip: string;
  loginPort: number;
  gamePort: number;
  adminPort: number;
  sqlHost: string;
  sqlUser: string;
  sqlPass: string;
  sqlDatabase: string;
  sqlPort: number;
  rateExp: number;
  rateSkill: number;
  rateMagic: number;
  rateLoot: number;
  rateSpawn: number;
  pzLocked: number; // in seconds
  huntingDuration: number;
  whiteSkullTime: number; // in minutes
  redSkullLength: number; // in days
  fragsToRedSkull: number;
  fragsToBlackSkull: number;
  exhaustAttack: number; // in ms
  exhaustSpells: number; // in ms
  exhaustItems: number; // in ms
  maxPlayers: number;
  motd: string;
  worldType: 'pvp' | 'no-pvp' | 'pvp-enforced';
  preset: 'classic-1x' | 'mid-rate-10x' | 'high-rate-50x' | 'custom';
}

export interface ClientFileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  description: string;
  required: boolean;
  notes?: string;
  children?: ClientFileNode[];
}

export interface BotScriptPreset {
  id: string;
  name: string;
  category: 'Healing' | 'Support' | 'Targeting' | 'Utilities';
  description: string;
  code: string;
  parameters: {
    name: string;
    key: string;
    type: 'number' | 'string' | 'boolean';
    defaultVal: string | number | boolean;
    description: string;
  }[];
}

export interface TroubleIssue {
  id: string;
  category: 'Cliente/Sprites' | 'Compilação C++' | 'Rede/Firewall' | 'Banco MariaDB' | 'Crash/Memória';
  title: string;
  symptom: string;
  rootCause: string;
  solution: string;
  codeSnippet?: string;
}
