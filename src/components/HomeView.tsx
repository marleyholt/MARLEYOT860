import React, { useState, useRef } from 'react';
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
  HelpCircle,
  Camera,
  UploadCloud,
  Check,
  RotateCcw
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (page: PageId) => void;
  heroBannerUrl?: string;
  isGM?: boolean;
  onUpdateHeroBanner?: (newUrl: string) => Promise<boolean>;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  onNavigate, 
  heroBannerUrl, 
  isGM, 
  onUpdateHeroBanner 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processBannerFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, etc).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 15MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl && onUpdateHeroBanner) {
        await onUpdateHeroBanner(dataUrl);
        setUploadToast('Imagem de fundo aplicada com sucesso!');
        setTimeout(() => setUploadToast(null), 4000);
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processBannerFile(file);
    }
  };

  const handleBannerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleBannerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBannerFile(file);
    }
  };

  const handleRemoveBanner = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateHeroBanner) {
      await onUpdateHeroBanner('');
      setUploadToast('Fundo restaurado para o padrão.');
      setTimeout(() => setUploadToast(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner com Imagem de Fundo & Paleta Marley / Jamaica */}
      <div 
        id="home-hero-banner"
        onDragOver={handleBannerDragOver}
        onDragLeave={handleBannerDragLeave}
        onDrop={handleBannerDrop}
        className={`relative overflow-hidden rounded-lg border-2 border-[#3b7347] bg-[#0d2112] p-6 sm:p-8 shadow-2xl min-h-[280px] flex flex-col justify-center transition-all ${
          isDragOver ? 'ring-4 ring-[#facc15] border-[#facc15]' : ''
        }`}
      >
        {/* Imagem de Fundo (Se definida pelo usuário ou padrão) */}
        {heroBannerUrl ? (
          <div 
            className="absolute inset-0 bg-cover bg-right md:bg-center transition-all duration-700 ease-out"
            style={{ backgroundImage: `url(${heroBannerUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d2112] via-[#1a381e] to-[#0f140f]" />
        )}

        {/* Gradientes Escuros de Alto Contraste para Garantir Leitura Perfeita do Texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061108]/95 via-[#08180c]/85 to-[#061108]/30 sm:to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061108]/90 via-transparent to-[#061108]/40 pointer-events-none" />

        {/* Botão Flutuante de Upload/Alterar Imagem de Fundo (Top Right) */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {uploadToast && (
            <div className="bg-[#14381c] border border-[#22c55e] text-[#86efac] text-xs px-3 py-1 rounded shadow-lg flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-3.5 h-3.5 text-[#22c55e]" />
              {uploadToast}
            </div>
          )}

          <input 
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Alterar Imagem de Fundo do Banner (Ou arraste a imagem para cá)"
            className="px-2.5 py-1.5 bg-[#0a140d]/90 hover:bg-[#14291a] text-[#facc15] text-[11px] font-bold rounded border border-[#3b7347] hover:border-[#facc15] shadow-lg flex items-center gap-1.5 backdrop-blur-sm transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Alterar Fundo</span>
          </button>

          {heroBannerUrl && (
            <button
              type="button"
              onClick={handleRemoveBanner}
              title="Restaurar fundo original"
              className="p-1.5 bg-[#0a140d]/90 hover:bg-rose-950/90 text-neutral-400 hover:text-rose-300 rounded border border-[#3b7347] hover:border-rose-500 shadow-lg backdrop-blur-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Drag Overlay visual quando o usuário arrasta uma imagem por cima do banner */}
        {isDragOver && (
          <div className="absolute inset-0 z-40 bg-[#061108]/90 border-2 border-dashed border-[#facc15] flex flex-col items-center justify-center gap-3 backdrop-blur-xs">
            <div className="w-14 h-14 rounded-full bg-[#182e1c] border border-[#facc15] flex items-center justify-center text-[#facc15] animate-bounce">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-[#facc15] font-serif uppercase tracking-wider">
              Solte a imagem aqui para aplicar ao fundo do banner!
            </p>
            <p className="text-xs text-neutral-300">
              Formatos aceitos: PNG, JPG, WEBP
            </p>
          </div>
        )}

        {/* Conteúdo Principal do Banner (Textos e Botões com Alta Legibilidade) */}
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b4324]/90 border border-[#22c55e] text-[#86efac] text-xs font-bold tracking-wide uppercase backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#facc15]" />
            Seja Bem-vindo ao Servidor Oficial
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#facc15] font-serif tracking-tight drop-shadow-lg">
            MARLEY OT 8.60
          </h1>

          <p className="text-sm text-neutral-200 leading-relaxed drop-shadow">
            O clássico mapa <strong className="text-[#fef08a]">Styller Yourots</strong> reconstruído sobre o motor ultrarrápido do <strong className="text-[#86efac]">The Forgotten Server 1.5</strong>. 
            Sem lag, balanceamento nostálgico, suporte nativo a clientes modernos e muita ação PvP!
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              id="hero-btn-create-account"
              onClick={() => onNavigate('create_account')}
              className="px-6 py-2.5 bg-gradient-to-r from-[#16a34a] via-[#eab308] to-[#dc2626] hover:brightness-110 text-neutral-950 font-black tracking-wider uppercase rounded-md shadow-xl border border-[#fef08a] text-xs flex items-center gap-2 transition-all transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Criar Conta Grátis (30 Dias VIP)
            </button>

            <button
              id="hero-btn-downloads"
              onClick={() => onNavigate('downloads')}
              className="px-5 py-2.5 bg-[#142316]/90 hover:bg-[#1b331f] text-neutral-200 font-bold text-xs rounded-md border border-[#2b4d30] flex items-center gap-2 transition-colors shadow-lg backdrop-blur-xs"
            >
              <Download className="w-4 h-4 text-[#facc15]" />
              Baixar Cliente 8.60
            </button>
          </div>
        </div>

        {/* Rastafari Diagonal Stripe Accents Background (quando sem imagem) */}
        {!heroBannerUrl && (
          <div className="absolute right-0 top-0 bottom-0 w-32 opacity-15 hidden md:flex pointer-events-none">
            <div className="w-1/3 bg-[#16a34a] h-full transform skew-x-12"></div>
            <div className="w-1/3 bg-[#facc15] h-full transform skew-x-12"></div>
            <div className="w-1/3 bg-[#dc2626] h-full transform skew-x-12"></div>
          </div>
        )}
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
