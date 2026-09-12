import React from 'react';
import { PageId } from '../types';
import { 
  Sparkles, 
  Swords, 
  Download, 
  ShieldCheck, 
  UserPlus, 
  Flame, 
  Layers, 
  Zap, 
  Compass, 
  ChevronRight,
  Gift,
  HelpCircle
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (page: PageId) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner com Paleta Jamaica / Marley */}
      <div className="relative overflow-hidden rounded-lg border-2 border-[#3b7347] bg-gradient-to-r from-[#0d2112] via-[#1a381e] to-[#0f140f] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b4324] border border-[#22c55e] text-[#86efac] text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#facc15]" />
            Seja Bem-vindo ao Servidor Oficial
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#facc15] font-serif tracking-tight drop-shadow-md">
            MARLEY OT 8.60
          </h1>

          <p className="text-sm text-neutral-300 leading-relaxed">
            O clássico mapa <strong className="text-neutral-100">Styller Yourots</strong> reconstruído sobre o motor ultrarrápido do <strong className="text-neutral-100">The Forgotten Server 1.5</strong>. 
            Sem lag, balanceamento nostálgico, suporte nativo a clientes modernos e muita ação PvP!
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              id="hero-btn-create-account"
              onClick={() => onNavigate('create_account')}
              className="px-6 py-2.5 bg-gradient-to-r from-[#16a34a] via-[#eab308] to-[#dc2626] hover:brightness-110 text-neutral-950 font-black tracking-wider uppercase rounded-md shadow-lg border border-[#fef08a] text-xs flex items-center gap-2 transition-all transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Criar Conta Grátis (30 Dias VIP)
            </button>

            <button
              id="hero-btn-downloads"
              onClick={() => onNavigate('downloads')}
              className="px-5 py-2.5 bg-[#142316] hover:bg-[#1b331f] text-neutral-200 font-bold text-xs rounded-md border border-[#2b4d30] flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-[#facc15]" />
              Baixar Cliente 8.60
            </button>
          </div>
        </div>

        {/* Rastafari Diagonal Stripe Accents Background */}
        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-15 hidden md:flex">
          <div className="w-1/3 bg-[#16a34a] h-full transform skew-x-12"></div>
          <div className="w-1/3 bg-[#facc15] h-full transform skew-x-12"></div>
          <div className="w-1/3 bg-[#dc2626] h-full transform skew-x-12"></div>
        </div>
      </div>

      {/* Notícias do Servidor (Znote Classic News Feed) */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#14381c] to-[#121612] px-6 py-3 border-b border-[#2b3d2b] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#facc15] uppercase tracking-wider font-serif flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#e11d48]" />
            Últimas Notícias & Atualizações do MarleyOT
          </h2>
          <span className="text-[11px] text-neutral-400">Postado pela Administração</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Postagem 1: Lançamento */}
          <article className="border-b border-[#1e291e] pb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
                Servidor MarleyOT 8.60 Aberto Oficialmente!
              </h3>
              <span className="text-xs text-neutral-400 font-mono">Hoje às 14:00</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Temos o prazer de anunciar o lançamento do novo portal e servidor <strong className="text-[#facc15]">MarleyOT 8.60</strong>! 
              O servidor conta com sistema bancário completo via Talkactions (<code className="text-[#86efac]">!bank, !deposit, !withdraw, !transfer</code>), 
              estabilidade sob Oracle Cloud VPS, e criação rápida de contas sem complicações.
            </p>
            <div className="p-3 bg-[#0d140f] border border-[#213323] rounded text-xs space-y-1 text-neutral-300">
              <p className="font-semibold text-[#facc15]">&bull; Bônus Especial de Inauguração:</p>
              <p>Todas as contas criadas pelo portal web recebem automaticamente <span className="text-emerald-400 font-bold">30 dias de Premium Account</span> para usufruir de magias exclusivas, tapetes e barcos!</p>
            </div>
          </article>

          {/* Postagem 2: Informações de Conexão */}
          <article className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#facc15]"></span>
                Como conectar no servidor
              </h3>
              <span className="text-xs text-neutral-400 font-mono">Guia Rápido</span>
            </div>
            <div className="text-xs text-neutral-300 space-y-2">
              <p>Para jogar no MarleyOT você pode usar seu cliente 8.60 preferido com IP Changer ou baixar nosso OTClient dedicado:</p>
              <ul className="list-disc list-inside space-y-1 text-neutral-300 pl-2">
                <li><strong className="text-neutral-200">IP do Servidor:</strong> <span className="font-mono text-[#facc15]">marleyot.duckdns.org</span> (ou 137.131.196.66)</li>
                <li><strong className="text-neutral-200">Porta:</strong> <span className="font-mono text-[#facc15]">7171</span> (Login) e <span className="font-mono text-[#facc15]">7172</span> (Game)</li>
                <li><strong className="text-neutral-200">Versão:</strong> <span className="font-mono text-[#facc15]">Tibia 8.60</span></li>
              </ul>
            </div>
          </article>
        </div>
      </div>

      {/* Cards de Recursos Rápidos (Estilo Znote) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121612] border border-[#263828] p-4 rounded-lg space-y-2 hover:border-[#3b7347] transition-colors">
          <div className="flex items-center gap-2 text-[#22c55e]">
            <Layers className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wide">Mapa Styller Yourots</h4>
          </div>
          <p className="text-[11px] text-neutral-400">
            Centenas de hunts, quests clássicas (Annihilator, Demon Helmet, POI) e teleports dinâmicos.
          </p>
        </div>

        <div className="bg-[#121612] border border-[#263828] p-4 rounded-lg space-y-2 hover:border-[#3b7347] transition-colors">
          <div className="flex items-center gap-2 text-[#facc15]">
            <Zap className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wide">Fast Attack Balanceado</h4>
          </div>
          <p className="text-[11px] text-neutral-400">
            Ataques de armas afinados e magias clássicas para um PvP dinâmico e sem travamentos.
          </p>
        </div>

        <div className="bg-[#121612] border border-[#263828] p-4 rounded-lg space-y-2 hover:border-[#3b7347] transition-colors">
          <div className="flex items-center gap-2 text-[#e11d48]">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wide">Proteção & Uptime</h4>
          </div>
          <p className="text-[11px] text-neutral-400">
            Hospedagem em nuvem na Oracle Cloud Infrastructure com backups automáticos.
          </p>
        </div>
      </div>
    </div>
  );
};
