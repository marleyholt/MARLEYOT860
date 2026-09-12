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
  Cpu
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  serverStats: ServerStats;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  serverStats,
  isLoggedIn,
  onLogout
}) => {
  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-5">
      {/* Server Status Widget (Znote Style) */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1b4324] via-[#2d5f35] to-[#1b4324] px-4 py-2.5 border-b border-[#3b7347] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#facc15] animate-pulse" />
            <h3 className="text-sm font-bold tracking-wider text-[#facc15] uppercase font-serif">
              Server Status
            </h3>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#14532d] text-[#86efac] border border-[#22c55e]">
            ONLINE
          </span>
        </div>

        <div className="p-3.5 space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-[#1e291e]">
            <span className="text-neutral-400">Server IP:</span>
            <span className="font-mono text-[#facc15] font-semibold">{serverStats.ip}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#1e291e]">
            <span className="text-neutral-400">Port / Client:</span>
            <span className="font-mono text-neutral-200">{serverStats.port} ({serverStats.client})</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#1e291e]">
            <span className="text-neutral-400">Online:</span>
            <span className="font-bold text-[#4ade80] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block animate-ping"></span>
              {serverStats.onlinePlayers} / {serverStats.maxPlayers}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#1e291e]">
            <span className="text-neutral-400">World:</span>
            <span className="font-medium text-amber-400">{serverStats.worldType}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-neutral-400">Map / Base:</span>
            <span className="font-medium text-neutral-300">Styller 8.60 (TFS 1.5)</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu (Classic ZnoteAAC-2 Style) */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        {/* Menu Category: Community */}
        <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-4 py-2 border-b border-[#2b3d2b]">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#facc15] font-serif flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#e11d48]" />
            Navegação Principal
          </span>
        </div>
        <nav className="p-2 space-y-1 text-xs font-medium">
          <button
            id="nav-btn-home"
            onClick={() => onNavigate('home')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-colors ${
              currentPage === 'home'
                ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#e11d48]'
                : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
            }`}
          >
            <Home className="w-4 h-4 text-[#22c55e]" />
            Início & Notícias
          </button>

          <button
            id="nav-btn-create-acc"
            onClick={() => onNavigate('create_account')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-colors ${
              currentPage === 'create_account'
                ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#e11d48]'
                : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#e11d48]" />
            Criar Conta (Register)
          </button>

          <button
            id="nav-btn-acc-manager"
            onClick={() => onNavigate('account_management')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-colors ${
              currentPage === 'account_management'
                ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#e11d48]'
                : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#facc15]" />
            {isLoggedIn ? 'Minha Conta & Chars' : 'Entrar (Login)'}
          </button>

          <button
            id="nav-btn-highscores"
            onClick={() => onNavigate('highscores')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-colors ${
              currentPage === 'highscores'
                ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#e11d48]'
                : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#facc15]" />
            Top Rankings / Highscores
          </button>

          <button
            id="nav-btn-server-info"
            onClick={() => onNavigate('server_info')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-colors ${
              currentPage === 'server_info'
                ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#e11d48]'
                : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#22c55e]" />
            Informações do Servidor
          </button>

          <button
            id="nav-btn-downloads"
            onClick={() => onNavigate('downloads')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-colors ${
              currentPage === 'downloads'
                ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#e11d48]'
                : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
            }`}
          >
            <Download className="w-4 h-4 text-[#e11d48]" />
            Download do Client 8.60
          </button>
        </nav>

        {/* Menu Category: Equipe & Host */}
        <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-4 py-2 border-t border-b border-[#2b3d2b] mt-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#facc15] font-serif flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#22c55e]" />
            Administração
          </span>
        </div>
        <div className="p-2 space-y-1 text-xs">
          <button
            id="nav-btn-deploy"
            onClick={() => onNavigate('deploy_guide')}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 transition-colors ${
              currentPage === 'deploy_guide'
                ? 'bg-[#1b4324] text-[#facc15] font-bold border-l-4 border-[#facc15]'
                : 'text-neutral-300 hover:bg-[#182319] hover:text-[#facc15]'
            }`}
          >
            <Server className="w-4 h-4 text-[#e11d48]" />
            Deploy & Sincronização VPS
          </button>

          {isLoggedIn && (
            <button
              id="nav-btn-logout"
              onClick={onLogout}
              className="w-full text-left px-3 py-2 rounded flex items-center gap-2 text-rose-400 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
            >
              Desconectar da Conta
            </button>
          )}
        </div>
      </div>

      {/* Jamaica Roots Badge / Quick Discord */}
      <div className="p-3 bg-gradient-to-br from-[#121a13] to-[#0f1410] border border-[#2b3d2b] rounded-lg text-center space-y-2">
        <div className="flex justify-center items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#16a34a]"></span>
          <span className="w-3 h-3 rounded-full bg-[#facc15]"></span>
          <span className="w-3 h-3 rounded-full bg-[#dc2626]"></span>
          <span className="w-3 h-3 rounded-full bg-[#000000] border border-neutral-700"></span>
        </div>
        <p className="text-[11px] font-bold text-neutral-300">
          MarleyOT 8.60 &bull; One Love, One Server
        </p>
        <p className="text-[10px] text-neutral-400">
          Desenvolvido sob o motor TFS 1.5 com estabilidade máxima para você e sua guild.
        </p>
      </div>
    </aside>
  );
};
