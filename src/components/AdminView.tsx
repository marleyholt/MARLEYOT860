import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  Crown, 
  Download, 
  Image as ImageIcon, 
  Save, 
  Upload, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  AlertTriangle,
  Server,
  FileCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { AccountSession, PortalSettings, PlayerCharacter } from '../types';

interface AdminViewProps {
  session: AccountSession | null;
  settings: PortalSettings;
  characters: PlayerCharacter[];
  onSaveSettings: (newSettings: PortalSettings) => Promise<boolean>;
  onNavigate: (page: any) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  session,
  settings,
  characters,
  onSaveSettings,
  onNavigate,
}) => {
  const [downloadUrl, setDownloadUrl] = useState(settings.clientDownloadUrl);
  const [serverIcon, setServerIcon] = useState(settings.serverIconUrl);
  const [heroBanner, setHeroBanner] = useState(settings.heroBannerUrl || '');
  const [serverNameInput, setServerNameInput] = useState(settings.serverName || 'MarleyOT 8.60');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isBannerDragging, setIsBannerDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const isGM = session && (session.type >= 4 || session.accountName === '1234567' || session.characters.some(c => c.name.toLowerCase().includes('gm') || c.groupName === 'GOD'));

  if (!isGM) {
    return (
      <div className="bg-[#121612] border-2 border-rose-800 rounded-lg p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-950/80 border-2 border-rose-500 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-rose-300 font-serif uppercase tracking-wider">
          Acesso Restrito ao Painel de Administração
        </h2>
        <p className="text-xs text-neutral-300 max-w-md mx-auto">
          Este painel é exclusivo para a administração do servidor (Contas do tipo GOD / GM). Por favor, conecte-se com a conta <strong className="text-[#facc15]">1234567</strong>.
        </p>
        <button
          onClick={() => onNavigate('account_management')}
          className="px-6 py-2 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] font-bold text-xs uppercase tracking-wider rounded border border-[#3b7347] transition-all"
        >
          Ir para Login de Conta
        </button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WEBP, ICO).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setServerIcon(event.target.result as string);
        setStatusMessage({ type: 'success', text: 'Ícone carregado! Clique em "Salvar Alterações" para aplicar em todo o site.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const processBannerFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).' });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'A imagem do banner deve ter no máximo 15MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setHeroBanner(event.target.result as string);
        setStatusMessage({ type: 'success', text: 'Imagem do banner carregada! Clique em "Salvar Alterações" para aplicar.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processBannerFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleBannerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBannerDragging(true);
  };

  const handleBannerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBannerDragging(false);
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBannerDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processBannerFile(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const success = await onSaveSettings({
        clientDownloadUrl: downloadUrl.trim(),
        serverIconUrl: serverIcon.trim(),
        serverName: serverNameInput.trim() || 'MarleyOT 8.60',
        heroBannerUrl: heroBanner.trim(),
      });

      if (success) {
        setStatusMessage({ 
          type: 'success', 
          text: 'Configurações salvas com sucesso! O ícone, banner e o link de download já estão ativos no site.' 
        });
      } else {
        setStatusMessage({ 
          type: 'error', 
          text: 'Não foi possível persistir no servidor. As alterações foram salvas localmente no navegador.' 
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao salvar alterações.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setDownloadUrl('http://marleyot.duckdns.org/downloads/MarleyOT-ClientV8.zip');
    setServerIcon('');
    setHeroBanner('');
    setServerNameInput('MarleyOT 8.60');
    setStatusMessage({ type: 'success', text: 'Valores redefinidos para os padrões! Salve para aplicar.' });
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal do Painel */}
      <div className="bg-[#121612] border-2 border-[#eab308] rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#2a2408] via-[#423408] to-[#1a1505] px-6 py-4 border-b border-[#eab308]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#171305] border border-[#facc15] rounded-lg shadow-inner">
              <Crown className="w-6 h-6 text-[#facc15]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#facc15] font-serif uppercase tracking-wider">
                  Painel de Administração do Servidor (GOD)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#dc2626] text-white tracking-widest uppercase">
                  GM Marley
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Gerencie ativos do portal, links de download, ícone do servidor e configurações operacionais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-neutral-400">Logado como:</span>
            <span className="font-mono text-[#facc15] font-bold bg-neutral-900/80 px-2 py-1 rounded border border-neutral-700">
              {session.accountName} (Nível 5)
            </span>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div className={`mx-6 mt-6 p-4 rounded-lg border text-xs flex items-center justify-between gap-3 ${
            statusMessage.type === 'success' 
              ? 'bg-[#122818] border-[#22c55e] text-[#86efac]' 
              : 'bg-[#291417] border-rose-600 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-[#22c55e] shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button 
              onClick={() => setStatusMessage(null)}
              className="text-neutral-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-8">
          {/* Seção 1: Ícone do Servidor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2b3d2b] pb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#22c55e]" />
                <h3 className="text-sm font-bold text-[#facc15] uppercase tracking-wider font-serif">
                  1. Ícone do Servidor (Título & Barra de Navegação)
                </h3>
              </div>
              <span className="text-[11px] text-neutral-400">
                Aparece na lateral esquerda do nome no título e na barra lateral
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Dropzone & Upload */}
              <div className="lg:col-span-7 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    isDragging 
                      ? 'border-[#22c55e] bg-[#16361e]' 
                      : 'border-[#2b442d] bg-[#0c120d] hover:border-[#facc15] hover:bg-[#111a13]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#182a1c] border border-[#26442c] flex items-center justify-center text-[#22c55e]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-neutral-200">
                      Clique para fazer upload ou arraste o arquivo do seu ícone
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Formatos suportados: PNG, JPG, WEBP, SVG ou ICO (Recomendado: 64x64 ou 128x128 transparente)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-[#1b4324] hover:bg-[#276034] text-[#facc15] text-[11px] font-bold rounded border border-[#3b7347]"
                  >
                    Selecionar Imagem do Computador
                  </button>
                </div>

                {/* Ou URL Direta */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-300">
                    Ou informe uma URL externa direta da imagem:
                  </label>
                  <input
                    type="text"
                    value={serverIcon}
                    onChange={(e) => setServerIcon(e.target.value)}
                    placeholder="https://exemplo.com/icone-marleyot.png"
                    className="w-full bg-[#080d09] border border-[#2b3d2b] rounded px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#facc15]"
                  />
                </div>
              </div>

              {/* Preview Box em Tempo Real */}
              <div className="lg:col-span-5 bg-[#080d09] border border-[#263e29] rounded-lg p-4 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#facc15]" />
                    Pré-visualização em Tempo Real:
                  </h4>

                  {/* 1. Preview no Título */}
                  <div className="p-3 bg-[#0a0f0b] rounded border border-[#1e2a1f] space-y-1.5 mb-3">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Na lateral do Título:</span>
                    <div className="flex items-center gap-3">
                      {serverIcon ? (
                        <img 
                          src={serverIcon} 
                          alt="Server Icon" 
                          className="w-10 h-10 object-contain rounded-lg border border-[#eab308] bg-[#121a13] p-0.5 shadow shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#1b4324] border border-[#eab308] flex items-center justify-center shrink-0">
                          <Crown className="w-5 h-5 text-[#facc15]" />
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-black text-[#facc15] font-serif uppercase tracking-wider">
                          {serverNameInput || 'MarleyOT 8.60'}
                        </span>
                        <p className="text-[10px] text-neutral-400">Styller Yourots Clássico</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Preview na Barra de Navegação */}
                  <div className="p-3 bg-[#121612] rounded border border-[#1e2a1f] space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Na Barra de Navegação:</span>
                    <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-3 py-2 rounded border border-[#2b3d2b] flex items-center gap-2">
                      {serverIcon ? (
                        <img 
                          src={serverIcon} 
                          alt="Nav Icon" 
                          className="w-4 h-4 object-contain rounded shrink-0" 
                        />
                      ) : (
                        <Crown className="w-4 h-4 text-[#facc15] shrink-0" />
                      )}
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#facc15] font-serif">
                        Navegação Principal
                      </span>
                    </div>
                  </div>
                </div>

                {serverIcon && (
                  <button
                    type="button"
                    onClick={() => setServerIcon('')}
                    className="mt-2 text-rose-400 hover:text-rose-300 text-[11px] font-medium flex items-center justify-center gap-1 py-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Remover ícone customizado
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Seção 2: Imagem de Fundo do Banner Principal (Hero Welcome Banner) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2b3d2b] pb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#facc15]" />
                <h3 className="text-sm font-bold text-[#facc15] uppercase tracking-wider font-serif">
                  2. Imagem de Fundo do Banner Principal (Hero Banner)
                </h3>
              </div>
              <span className="text-[11px] text-neutral-400">
                Aparece como fundo ilustrado na seção de boas-vindas da página inicial
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Dropzone & Upload do Banner */}
              <div className="lg:col-span-7 space-y-3">
                <input
                  ref={bannerFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={handleBannerDragOver}
                  onDragLeave={handleBannerDragLeave}
                  onDrop={handleBannerDrop}
                  onClick={() => bannerFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    isBannerDragging 
                      ? 'border-[#facc15] bg-[#222e17]' 
                      : 'border-[#2b442d] bg-[#0c120d] hover:border-[#facc15] hover:bg-[#111a13]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#1e2a14] border border-[#445b23] flex items-center justify-center text-[#facc15]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-neutral-200">
                      Clique para fazer upload ou arraste o arquivo da imagem para o Banner
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Formatos suportados: PNG, JPG, WEBP (Recomendado: Ilustração panorâmica 16:9 ou 21:9 em alta resolução)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-[#1b4324] hover:bg-[#276034] text-[#facc15] text-[11px] font-bold rounded border border-[#3b7347]"
                  >
                    Selecionar Imagem do Computador
                  </button>
                </div>

                {/* Ou URL Direta do Banner */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-neutral-300">
                    Ou informe uma URL externa direta da imagem:
                  </label>
                  <input
                    type="text"
                    value={heroBanner}
                    onChange={(e) => setHeroBanner(e.target.value)}
                    placeholder="https://exemplo.com/fundo-marleyot-banner.png"
                    className="w-full bg-[#080d09] border border-[#2b3d2b] rounded px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#facc15]"
                  />
                </div>
              </div>

              {/* Preview Box do Banner em Miniatura */}
              <div className="lg:col-span-5 bg-[#080d09] border border-[#263e29] rounded-lg p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#facc15]" />
                    Pré-visualização do Banner:
                  </h4>

                  <div className="relative overflow-hidden rounded-lg border border-[#3b7347] bg-[#0d2112] min-h-[140px] p-4 flex flex-col justify-between shadow-inner">
                    {heroBanner ? (
                      <div 
                        className="absolute inset-0 bg-cover bg-right sm:bg-center"
                        style={{ backgroundImage: `url(${heroBanner})` }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0d2112] via-[#1a381e] to-[#0f140f]" />
                    )}
                    {/* Vignette escura sobre o preview */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#061108]/90 via-[#08180c]/75 to-transparent pointer-events-none" />

                    <div className="relative z-10 space-y-1">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-[#1b4324]/90 text-[#86efac] text-[9px] font-bold uppercase tracking-wider">
                        Servidor Oficial
                      </span>
                      <p className="text-sm font-black text-[#facc15] font-serif uppercase tracking-tight drop-shadow">
                        MARLEY OT 8.60
                      </p>
                      <p className="text-[10px] text-neutral-200 line-clamp-2 drop-shadow">
                        O clássico mapa Styller Yourots com TFS 1.5!
                      </p>
                    </div>

                    <div className="relative z-10 flex gap-1.5 pt-2">
                      <span className="px-2 py-0.5 bg-gradient-to-r from-[#16a34a] to-[#eab308] text-neutral-950 font-black text-[9px] rounded uppercase">
                        Criar Conta
                      </span>
                      <span className="px-2 py-0.5 bg-[#142316]/90 text-neutral-200 font-bold text-[9px] rounded border border-[#2b4d30]">
                        Download
                      </span>
                    </div>
                  </div>
                </div>

                {heroBanner && (
                  <button
                    type="button"
                    onClick={() => setHeroBanner('')}
                    className="text-rose-400 hover:text-rose-300 text-[11px] font-medium flex items-center justify-center gap-1 py-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Remover imagem de fundo do banner
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Seção 3: Link de Download do Client */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2b3d2b] pb-2">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#e11d48]" />
                <h3 className="text-sm font-bold text-[#facc15] uppercase tracking-wider font-serif">
                  3. Link de Download do Client Oficial
                </h3>
              </div>
              <span className="text-[11px] text-neutral-400">
                Redireciona os jogadores ao clicar no botão "Download OTClient"
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-200 block mb-1">
                  URL Completa do Arquivo .ZIP do Client:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    required
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="http://marleyot.duckdns.org/downloads/MarleyOT-ClientV8.zip"
                    className="flex-1 bg-[#080d09] border border-[#2b3d2b] rounded px-3 py-2 text-xs text-[#facc15] font-mono focus:outline-none focus:border-[#facc15]"
                  />
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#121e14] hover:bg-[#1a2d1d] text-neutral-200 text-xs font-bold rounded border border-[#26442c] flex items-center justify-center gap-1.5 shrink-0 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#22c55e]" />
                      Testar Link
                    </a>
                  )}
                </div>
              </div>

              {/* Atalhos Rápidos de Links Sugeridos */}
              <div className="bg-[#0a0f0b] p-3 rounded border border-[#1e2a1f] space-y-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Sugestões de Links:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDownloadUrl('http://marleyot.duckdns.org/downloads/MarleyOT-ClientV8.zip')}
                    className="px-2.5 py-1 bg-[#101912] hover:bg-[#18291b] border border-[#263e29] rounded text-[11px] text-neutral-300 font-mono"
                  >
                    VPS Oficial (marleyot.duckdns.org)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDownloadUrl('https://www.mediafire.com/file/exemplo/MarleyOT.zip/file')}
                    className="px-2.5 py-1 bg-[#101912] hover:bg-[#18291b] border border-[#263e29] rounded text-[11px] text-neutral-300 font-mono"
                  >
                    Exemplo MediaFire
                  </button>
                  <button
                    type="button"
                    onClick={() => setDownloadUrl('https://drive.google.com/uc?export=download&id=SEU_ID_AQUI')}
                    className="px-2.5 py-1 bg-[#101912] hover:bg-[#18291b] border border-[#263e29] rounded text-[11px] text-neutral-300 font-mono"
                  >
                    Exemplo Google Drive
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3: Nome do Servidor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2b3d2b] pb-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#facc15]" />
                <h3 className="text-sm font-bold text-[#facc15] uppercase tracking-wider font-serif">
                  4. Identificação do Servidor
                </h3>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-200 block mb-1">
                Nome de Exibição no Topo e Título da Página:
              </label>
              <input
                type="text"
                value={serverNameInput}
                onChange={(e) => setServerNameInput(e.target.value)}
                placeholder="MarleyOT 8.60"
                className="w-full max-w-md bg-[#080d09] border border-[#2b3d2b] rounded px-3 py-2 text-xs text-neutral-100 font-semibold focus:outline-none focus:border-[#facc15]"
              />
            </div>
          </div>

          {/* Botões de Ação Final */}
          <div className="pt-4 border-t border-[#2b3d2b] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-neutral-400 hover:text-neutral-200 text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Padrões Originais
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#16a34a] hover:brightness-110 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg border border-[#86efac] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Salvando Alterações...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações do Portal
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Lista Rápida de Personagens no Servidor */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#22c55e]" />
            <h3 className="text-xs font-bold text-[#facc15] uppercase tracking-wider font-serif">
              Personagens Registrados no Servidor ({characters.length})
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400">Banco de Dados: marleyot86</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#1e2a1f]">
            <thead className="bg-[#0b100c] text-neutral-400 text-[10px] uppercase font-bold border-b border-[#1e2a1f]">
              <tr>
                <th className="p-2.5">Nome</th>
                <th className="p-2.5">Level</th>
                <th className="p-2.5">Vocação</th>
                <th className="p-2.5">Magic Level</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182319]">
              {characters.map((char) => (
                <tr key={char.id || char.name} className="hover:bg-[#152016]">
                  <td className="p-2.5 font-bold text-[#facc15] flex items-center gap-1.5">
                    {char.name.toLowerCase().includes('gm') && (
                      <Crown className="w-3.5 h-3.5 text-[#eab308]" />
                    )}
                    {char.name}
                  </td>
                  <td className="p-2.5 text-neutral-200">{char.level}</td>
                  <td className="p-2.5 text-neutral-300">{char.vocation}</td>
                  <td className="p-2.5 text-neutral-300">{char.maglevel}</td>
                  <td className="p-2.5">
                    {char.online ? (
                      <span className="text-[#4ade80] font-bold">Online</span>
                    ) : (
                      <span className="text-neutral-500">Offline</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
