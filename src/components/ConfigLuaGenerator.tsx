import React, { useState, useMemo } from 'react';
import { 
  Settings, 
  Sliders, 
  Download, 
  Copy, 
  Check, 
  Flame, 
  ShieldCheck, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ServerConfigState } from '../types';
import { CodeBlock } from './CodeBlock';

const DEFAULT_CONFIG: ServerConfigState = {
  serverName: 'Styller 7.72 Retro',
  ownerName: 'Admin',
  ip: '127.0.0.1',
  loginPort: 7171,
  gamePort: 7172,
  adminPort: 7171,
  sqlHost: '127.0.0.1',
  sqlUser: 'styller',
  sqlPass: 'styller_pass_772',
  sqlDatabase: 'styller772',
  sqlPort: 3306,
  rateExp: 1,
  rateSkill: 1,
  rateMagic: 1,
  rateLoot: 1,
  rateSpawn: 1,
  pzLocked: 60,
  huntingDuration: 60,
  whiteSkullTime: 15,
  redSkullLength: 30,
  fragsToRedSkull: 3,
  fragsToBlackSkull: 6,
  exhaustAttack: 1000,
  exhaustSpells: 1000,
  exhaustItems: 1000,
  maxPlayers: 500,
  motd: 'Bem-vindo ao Styller Yourots 7.72 Old School!',
  worldType: 'pvp',
  preset: 'classic-1x',
};

export const ConfigLuaGenerator: React.FC = () => {
  const [config, setConfig] = useState<ServerConfigState>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState(false);

  const applyPreset = (presetType: ServerConfigState['preset']) => {
    if (presetType === 'classic-1x') {
      setConfig((prev) => ({
        ...prev,
        preset: 'classic-1x',
        rateExp: 1,
        rateSkill: 1,
        rateMagic: 1,
        rateLoot: 1,
        rateSpawn: 1,
        whiteSkullTime: 15,
        fragsToRedSkull: 3,
        exhaustAttack: 1000,
        exhaustSpells: 1000,
        exhaustItems: 1000,
      }));
    } else if (presetType === 'mid-rate-10x') {
      setConfig((prev) => ({
        ...prev,
        preset: 'mid-rate-10x',
        rateExp: 10,
        rateSkill: 5,
        rateMagic: 3,
        rateLoot: 2,
        rateSpawn: 2,
        whiteSkullTime: 15,
        fragsToRedSkull: 5,
        exhaustAttack: 1000,
        exhaustSpells: 1000,
        exhaustItems: 1000,
      }));
    } else if (presetType === 'high-rate-50x') {
      setConfig((prev) => ({
        ...prev,
        preset: 'high-rate-50x',
        rateExp: 50,
        rateSkill: 20,
        rateMagic: 10,
        rateLoot: 4,
        rateSpawn: 3,
        whiteSkullTime: 10,
        fragsToRedSkull: 8,
        exhaustAttack: 900,
        exhaustSpells: 900,
        exhaustItems: 900,
      }));
    } else {
      setConfig((prev) => ({ ...prev, preset: 'custom' }));
    }
  };

  const generatedLua = useMemo(() => {
    return `-- config.lua - Gerado para Styller Yourots 7.72 / TFS 1.5 Downgrade
-- Protocolo: 7.72 Clássico
-- Repositório Base: https://github.com/luanluciano93/styller

-- Informações do Servidor
serverName = "${config.serverName}"
ownerName = "${config.ownerName}"
ownerEmail = "contato@styller772.com"
url = "http://${config.ip}/"
location = "Brazil"
ip = "${config.ip}"
bindOnlyConfiguredIpAddress = false
loginProtocolPort = ${config.loginPort}
gameProtocolPort = ${config.gamePort}
statusProtocolPort = ${config.loginPort}
maxPlayers = ${config.maxPlayers}
motd = "${config.motd}"
onePlayerOnlinePerAccount = true
allowClones = false
serverSaveNotifyMessage = true
serverSaveNotifyDuration = 5

-- Tipo de Mundo
worldType = "${config.worldType}" -- Opções: "pvp", "no-pvp", "pvp-enforced"
hotkeyAimbotEnabled = false -- 7.72 Old School: Sem mira de cruz em hotkey!

-- Conexão com a Base de Dados (MariaDB/MySQL InnoDB)
sqlType = "mysql"
sqlHost = "${config.sqlHost}"
sqlPort = ${config.sqlPort}
sqlUser = "${config.sqlUser}"
sqlPass = "${config.sqlPass}"
sqlDatabase = "${config.sqlDatabase}"
sqlFile = "schema.sql"
sqlKeepAlive = 0
mysqlReadTimeout = 10
mysqlWriteTimeout = 10
encryptionType = "sha1"

-- Taxas de Evolução (Rates)
rateExp = ${config.rateExp}
rateSkill = ${config.rateSkill}
rateMagic = ${config.rateMagic}
rateLoot = ${config.rateLoot}
rateSpawn = ${config.rateSpawn}

-- Regras de Combate e PvP Clássico 7.72
pzLocked = ${config.pzLocked * 1000} -- Tempo travado fora da PZ após combate (${config.pzLocked}s)
huntingDuration = ${config.huntingDuration * 1000}
criticalHitChance = 0
displayCriticalHitNotify = false

-- Skull System 7.72
whiteSkullTime = ${config.whiteSkullTime * 60 * 1000} -- Duração do White Skull (${config.whiteSkullTime} minutos)
redSkullLength = ${config.redSkullLength * 24 * 60 * 60} -- Duração do Red Skull (${config.redSkullLength} dias)
dailyFragsToRedSkull = ${config.fragsToRedSkull}
weeklyFragsToRedSkull = ${config.fragsToRedSkull * 3}
monthlyFragsToRedSkull = ${config.fragsToRedSkull * 8}
dailyFragsToBlackSkull = ${config.fragsToBlackSkull}
blackSkulledDeathHealth = 40
blackSkulledDeathMana = 0

-- Timers de Exaustão Mecânica 7.72 (Em Milissegundos)
exhaustionInSeconds = false
actionsDelayInterval = ${config.exhaustItems} -- Exaustão de uso de itens (Runas, Poções)
exActionsDelayInterval = ${config.exhaustSpells} -- Exaustão de magias de ataque
minSkillLevel = 10
cleanProtectionZones = true

-- Proteção de Casas e Economia
housePriceEachSQM = 100
houseRentPeriod = "never"
buyableHouses = true
guildHalls = true
`;
  }, [config]);

  const handleDownload = () => {
    const blob = new Blob([generatedLua], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'config.lua';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLua);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>PAINEL DE CONFIGURAÇÃO DO SERVIDOR</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">
            Gerador Inteligente de config.lua (Styller 7.72)
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Gere o arquivo de configuração perfeitamente formatado para o motor C++ com validação de tipos e parâmetros retro.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Baixar config.lua</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="p-4 rounded-xl border border-neutral-800 bg-[#0d1117] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-neutral-200">Presets de Balanceamento:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset('classic-1x')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              config.preset === 'classic-1x'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            🛡️ Old School (1x Classic)
          </button>
          <button
            onClick={() => applyPreset('mid-rate-10x')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              config.preset === 'mid-rate-10x'
                ? 'bg-cyan-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            ⚡ Mid Rate (10x Exp)
          </button>
          <button
            onClick={() => applyPreset('high-rate-50x')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              config.preset === 'high-rate-50x'
                ? 'bg-purple-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            🔥 High Rate War (50x Exp)
          </button>
        </div>
      </div>

      {/* Configuration Inputs & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Section: Server Identity */}
          <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono text-amber-400">
              1. Identidade &amp; Rede
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Nome do Servidor</label>
                <input
                  type="text"
                  value={config.serverName}
                  onChange={(e) => setConfig({ ...config, serverName: e.target.value, preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">IP Público ou Domínio (DDNS)</label>
                <input
                  type="text"
                  value={config.ip}
                  onChange={(e) => setConfig({ ...config, ip: e.target.value, preset: 'custom' })}
                  placeholder="ex: meuot772.com"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Porta de Login</label>
                <input
                  type="number"
                  value={config.loginPort}
                  onChange={(e) => setConfig({ ...config, loginPort: Number(e.target.value), preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Porta do Jogo (Game Server)</label>
                <input
                  type="number"
                  value={config.gamePort}
                  onChange={(e) => setConfig({ ...config, gamePort: Number(e.target.value), preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Rates */}
          <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono text-cyan-400">
              2. Taxas do Jogo (Rates)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Exp Rate</label>
                <input
                  type="number"
                  min="1"
                  value={config.rateExp}
                  onChange={(e) => setConfig({ ...config, rateExp: Number(e.target.value), preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Skill Rate</label>
                <input
                  type="number"
                  min="1"
                  value={config.rateSkill}
                  onChange={(e) => setConfig({ ...config, rateSkill: Number(e.target.value), preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Magic Rate</label>
                <input
                  type="number"
                  min="1"
                  value={config.rateMagic}
                  onChange={(e) => setConfig({ ...config, rateMagic: Number(e.target.value), preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-purple-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Loot Rate</label>
                <input
                  type="number"
                  min="1"
                  value={config.rateLoot}
                  onChange={(e) => setConfig({ ...config, rateLoot: Number(e.target.value), preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Spawn Rate</label>
                <input
                  type="number"
                  min="1"
                  value={config.rateSpawn}
                  onChange={(e) => setConfig({ ...config, rateSpawn: Number(e.target.value), preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section: MariaDB Connection */}
          <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono text-emerald-400">
              3. Conexão MariaDB / MySQL
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Host do Banco</label>
                <input
                  type="text"
                  value={config.sqlHost}
                  onChange={(e) => setConfig({ ...config, sqlHost: e.target.value, preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Nome da Base de Dados</label>
                <input
                  type="text"
                  value={config.sqlDatabase}
                  onChange={(e) => setConfig({ ...config, sqlDatabase: e.target.value, preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Usuário SQL</label>
                <input
                  type="text"
                  value={config.sqlUser}
                  onChange={(e) => setConfig({ ...config, sqlUser: e.target.value, preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Senha do Usuário</label>
                <input
                  type="text"
                  value={config.sqlPass}
                  onChange={(e) => setConfig({ ...config, sqlPass: e.target.value, preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Retro 7.72 Combat Timers */}
          <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider font-mono text-red-400">
              4. Mecânica Retro 7.72 &amp; Timers de Exaustão
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Exaustão de Itens (ms)</label>
                <input
                  type="number"
                  value={config.exhaustItems}
                  onChange={(e) => setConfig({ ...config, exhaustItems: Number(e.target.value), preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-neutral-500">Padrão: 1000ms (1 segundo)</span>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Exaustão de Magias (ms)</label>
                <input
                  type="number"
                  value={config.exhaustSpells}
                  onChange={(e) => setConfig({ ...config, exhaustSpells: Number(e.target.value), preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-neutral-500">Padrão: 1000ms</span>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">White Skull (Minutos)</label>
                <input
                  type="number"
                  value={config.whiteSkullTime}
                  onChange={(e) => setConfig({ ...config, whiteSkullTime: Number(e.target.value), preset: 'custom' })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-neutral-500">Padrão 7.72: 15 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Realtime Code Preview (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Visualização ao Vivo: <code className="text-amber-300 font-mono">config.lua</code>
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              {generatedLua.split('\n').length} linhas
            </span>
          </div>

          <div className="flex-1">
            <CodeBlock 
              code={generatedLua} 
              language="lua" 
              filename="config.lua" 
              downloadable 
              maxHeight="max-h-[600px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
