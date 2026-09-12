import React from 'react';
import { PageId, ServerStats } from '../types';
import { 
  Home, 
  UserPlus, 
  UserCheck, 
  Trophy, 
  HelpCircle, 
  Download, 
  Shield, 
  Radio, 
  Server, 
  Users,
  Compass,
  Cpu,
  Crown,
  Skull,
  Building,
  UserSearch,
  ShoppingCart,
  LifeBuoy,
  FileText,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  serverStats: ServerStats;
  isLoggedIn: boolean;
  isGM?: boolean;
  serverIconUrl?: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  serverStats,
  isLoggedIn,
  isGM = false,
  serverIconUrl,
  onLogout
}) => {
  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">
      {/* Seção Exclusiva para GM / GOD logado */}
      {isGM && (
        <div className="bg-gradient-to-br from-[#1c1808] to-[#121612] border-2 border-[#eab308] rounded-lg shadow-xl p-3 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#eab308]/40">
            <div className="flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-[#facc15]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#facc15] font-serif">
                Painel do GM (GOD)
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#dc2626] text-white text-[9px] font-black tracking-widest uppercase animate-pulse">
              STAFF ATIVO
            </span>
          </div>
          <button
            id="nav-btn-admin-panel"
            onClick={() => onNavigate('admin_panel')}
            className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2.5 transition-all text-xs font-bold ${
              currentPage === 'admin_panel'
                ? 'bg-gradient-to-r from-[#eab308] to-[#facc15] text-neutral-950 shadow-md border border-[#fef08a]'
                : 'bg-[#292209] hover:bg-[#3d330c] text-[#facc15] border border-[#eab308]/50'
            }`}
          >
            <Shield className="w-4 h-4 text-[#dc2626]" />
            Gerenciar Servidor & Client
          </button>
        </div>
      )}

      {/* Server Status Widget (Znote Style) */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1b4324] via-[#2d5f35] to-[#1b4324] px-4 py-2 border-b border-[#3b7347] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#facc15] animate-pulse" />
            <h3 className="text-xs font-bold tracking-wider text-[#facc15] uppercase font-serif">
              Server Status
            </h3>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#14532d] text-[#86efac] border border-[#22c55e]">
            ONLINE
          </span>
        </div>

        <div className="p-3 space-y-1.5 text-xs">
          <div className="flex justify-between items-center py-0.5 border-b border-[#1e291e]">
            <span className="text-neutral-400 text-[11px]">Server IP:</span>
            <span className="font-mono text-[#facc15] font-semibold text-[11px]">{serverStats.ip}</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-[#1e291e]">
            <span className="text-neutral-400 text-[11px]">Port / Client:</span>
            <span className="font-mono text-neutral-200 text-[11px]">{serverStats.port} ({serverStats.client})</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-[#1e291e]">
            <span className="text-neutral-400 text-[11px]">Online:</span>
            <span className="font-bold text-[#4ade80] flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block animate-ping"></span>
              {serverStats.onlinePlayers} / {serverStats.maxPlayers}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-neutral-400 text-[11px]">World:</span>
            <span className="font-medium text-amber-400 text-[11px]">{serverStats.worldType}</span>
          </div>
        </div>
      </div>

      {/* Menu Principal Dividido em Categorias Estilo ZnoteAAC-2 */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden divide-y divide-[#2b3d2b]">
        
        {/* CATEGORIA 1: GERAL & CONTA */}
        <div>
          <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-3.5 py-1.5 border-b border-[#2b3d2b]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#facc15] font-serif flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-[#22c55e]" />
              Geral & Contas
            </span>
          </div>
          <nav className="p-1.5 space-y-0.5 text-xs">
            <button
              id="nav-btn-home"
              onClick={() => onNavigate('home')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'home'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#e11d48]'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#22c55e]" />
              Início & Notícias
            </button>

            <button
              id="nav-btn-create-acc"
              onClick={() => onNavigate('create_account')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'create_account'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#e11d48]'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-[#e11d48]" />
              Criar Conta
            </button>

            <button
              id="nav-btn-acc-manager"
              onClick={() => onNavigate('account_management')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'account_management'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#e11d48]'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#facc15]" />
              {isLoggedIn ? 'Minha Conta & Chars' : 'Entrar (Login)'}
            </button>

            <button
              id="nav-btn-downloads"
              onClick={() => onNavigate('downloads')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'downloads'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#e11d48]'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-[#e11d48]" />
              Download Client 8.60
            </button>

            <button
              id="nav-btn-server-info"
              onClick={() => onNavigate('server_info')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'server_info'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#e11d48]'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#22c55e]" />
              Informações do Servidor
            </button>
          </nav>
        </div>

        {/* CATEGORIA 2: COMUNIDADE & ESTATÍSTICAS (ZNOTE AAC) */}
        <div>
          <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-3.5 py-1.5 border-b border-[#2b3d2b]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#facc15] font-serif flex items-center gap-1.5">
              <Users className="w-3 h-3 text-[#facc15]" />
              Comunidade & Rankings
            </span>
          </div>
          <nav className="p-1.5 space-y-0.5 text-xs">
            <button
              id="nav-btn-highscores"
              onClick={() => onNavigate('highscores')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'highscores'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#facc15]'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-[#facc15]" />
              Top Rankings / Highscores
            </button>

            <button
              id="nav-btn-deaths"
              onClick={() => onNavigate('deaths')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'deaths'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-rose-500'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <Skull className="w-3.5 h-3.5 text-rose-400" />
              Últimas Mortes (Deaths)
            </button>

            <button
              id="nav-btn-houses"
              onClick={() => onNavigate('houses')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'houses'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-emerald-400'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              Sistema de Casas (Houses)
            </button>

            <button
              id="nav-btn-guilds"
              onClick={() => onNavigate('guilds')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'guilds'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#facc15]'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#facc15]" />
              Guildas & Alianças (Guilds)
            </button>

            <button
              id="nav-btn-character-profile"
              onClick={() => onNavigate('character_profile')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'character_profile'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-sky-400'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <UserSearch className="w-3.5 h-3.5 text-sky-400" />
              Buscar Personagem
            </button>
          </nav>
        </div>

        {/* CATEGORIA 3: SERVIÇOS, SUPORTE & SHOP */}
        <div>
          <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-3.5 py-1.5 border-b border-[#2b3d2b]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#facc15] font-serif flex items-center gap-1.5">
              <ShoppingCart className="w-3 h-3 text-amber-400" />
              Serviços & Suporte
            </span>
          </div>
          <nav className="p-1.5 space-y-0.5 text-xs">
            <button
              id="nav-btn-shop"
              onClick={() => onNavigate('shop')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'shop'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-amber-400'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
              Shop & Doações VIP
            </button>

            <button
              id="nav-btn-helpdesk"
              onClick={() => onNavigate('helpdesk')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'helpdesk'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-blue-400'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5 text-blue-400" />
              Central de Chamados (Tickets)
            </button>

            <button
              id="nav-btn-changelog"
              onClick={() => onNavigate('changelog')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'changelog'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-purple-400'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              Notas de Atualização (Changelog)
            </button>
          </nav>
        </div>

        {/* CATEGORIA 4: BANCO DE DADOS & DEPLOY */}
        <div>
          <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-3.5 py-1.5 border-b border-[#2b3d2b]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#facc15] font-serif flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-[#22c55e]" />
              Banco & Administração
            </span>
          </div>
          <div className="p-1.5 space-y-0.5 text-xs">
            <button
              id="nav-btn-db-diagnostic"
              onClick={() => onNavigate('db_diagnostic')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'db_diagnostic'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-emerald-500'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Diagnóstico & SQL MariaDB
            </button>

            <button
              id="nav-btn-deploy"
              onClick={() => onNavigate('deploy_guide')}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                currentPage === 'deploy_guide'
                  ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#facc15]'
                  : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-[#e11d48]" />
              Deploy & Sincronização VPS
            </button>

            {isGM && (
              <button
                id="nav-btn-admin-sub"
                onClick={() => onNavigate('admin_panel')}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  currentPage === 'admin_panel'
                    ? 'bg-[#eab308] text-neutral-950 font-black border-l-4 border-white'
                    : 'text-[#facc15] hover:bg-[#292209] font-bold'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-[#facc15]" />
                Painel do GM / Servidor
              </button>
            )}

            {isLoggedIn && (
              <button
                id="nav-btn-logout"
                onClick={onLogout}
                className="w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 text-rose-400 hover:bg-rose-950/40 hover:text-rose-200 transition-colors pt-1"
              >
                Desconectar da Conta
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jamaica Roots Badge */}
      <div className="p-2.5 bg-gradient-to-br from-[#121a13] to-[#0f1410] border border-[#2b3d2b] rounded-lg text-center space-y-1.5">
        <div className="flex justify-center items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#facc15]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#000000] border border-neutral-700"></span>
        </div>
        <p className="text-[10px] font-bold text-neutral-300">
          MarleyOT 8.60 &bull; One Love, One Server
        </p>
        <p className="text-[9px] text-neutral-400">
          Desenvolvido sob o motor TFS 1.5 Downgrade com banco MariaDB dedicado.
        </p>
      </div>
    </aside>
  );
};
