import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  Search, 
  Layers, 
  ExternalLink, 
  Code, 
  Eye, 
  Copy, 
  Check, 
  Server, 
  Zap, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  Users, 
  Skull, 
  BookOpen, 
  Cpu, 
  Lock,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { PageId } from '../types';

interface ZnotePhpFileMeta {
  filename: string;
  category: string;
  description: string;
  mappedRoute?: PageId;
  sizeBytes: number;
  sizeKb: number;
  linesCount: number;
}

interface ZnotePhpExplorerProps {
  initialFile?: string;
  initialTab?: 'code' | 'interactive' | 'overview';
  onNavigate: (page: PageId) => void;
  isGM?: boolean;
}

export const ZnotePhpExplorerView: React.FC<ZnotePhpExplorerProps> = ({ 
  initialFile = 'config.php', 
  initialTab,
  onNavigate,
  isGM = false 
}) => {
  const [files, setFiles] = useState<ZnotePhpFileMeta[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>(initialFile);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileDetails, setFileDetails] = useState<any>(null);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'interactive' | 'overview'>(
    initialTab || (['spells.php', 'onlinelist.php', 'killers.php', 'monster_loot.php', 'support.php'].includes(initialFile) ? 'interactive' : 'overview')
  );

  useEffect(() => {
    if (initialFile) {
      setSelectedFile(initialFile);
    }
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (initialFile && ['spells.php', 'onlinelist.php', 'killers.php', 'monster_loot.php', 'support.php'].includes(initialFile)) {
      setActiveTab('interactive');
    }
  }, [initialFile, initialTab]);

  // Interactive views data
  const [spells, setSpells] = useState<any[]>([]);
  const [spellVocation, setSpellVocation] = useState<string>('all');
  const [spellSearch, setSpellSearch] = useState<string>('');
  const [onlineList, setOnlineList] = useState<any[]>([]);
  const [killers, setKillers] = useState<any[]>([]);
  const [monsters, setMonsters] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch('/api/znote/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (e) {
      console.error('Erro ao carregar lista de arquivos Znote PHP:', e);
    } finally {
      setLoadingFiles(false);
    }
  };

  const loadFileContent = async (filename: string) => {
    setSelectedFile(filename);
    setLoadingContent(true);
    try {
      const res = await fetch(`/api/znote/file?name=${encodeURIComponent(filename)}`);
      if (res.ok) {
        const data = await res.json();
        setFileContent(data.content || '');
        setFileDetails(data);
      }
    } catch (e) {
      console.error('Erro ao carregar arquivo:', e);
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      loadFileContent(selectedFile);
    }
  }, [selectedFile]);

  // Load interactive data if needed
  useEffect(() => {
    if (selectedFile === 'spells.php') {
      fetch('/api/spells').then(r => r.json()).then(setSpells).catch(() => {});
    } else if (selectedFile === 'onlinelist.php') {
      fetch('/api/onlinelist').then(r => r.json()).then(setOnlineList).catch(() => {});
    } else if (selectedFile === 'killers.php') {
      fetch('/api/killers').then(r => r.json()).then(setKillers).catch(() => {});
    } else if (selectedFile === 'monster_loot.php') {
      fetch('/api/monsters').then(r => r.json()).then(setMonsters).catch(() => {});
    } else if (selectedFile === 'support.php') {
      fetch('/api/support').then(r => r.json()).then(setStaff).catch(() => {});
    }
  }, [selectedFile]);

  const categories = ['all', ...Array.from(new Set(files.map(f => f.category)))];

  const filteredFiles = files.filter(f => {
    const matchSearch = f.filename.toLowerCase().includes(searchTerm.toLowerCase()) || 
      f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || f.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleCopyCode = () => {
    if (fileContent) {
      navigator.clipboard.writeText(fileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#1b3d22] via-[#122315] to-[#0a100c] border-2 border-[#eab308] rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#eab308]/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#244c2c] border border-[#facc15] flex items-center justify-center shadow-lg shrink-0">
              <FileCode className="w-6 h-6 text-[#facc15]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#facc15] font-serif uppercase tracking-wider">
                  ZnoteAAC-2 &bull; Repositório de Arquivos .PHP
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#16a34a] text-neutral-950 font-black text-[10px] uppercase">
                  {files.length} Arquivos
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Todos os arquivos originais em PHP do ZnoteAAC integrados ao MarleyOT 8.60 com visualização de código e conversão interativa para o React/TypeScript.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-[#facc15] text-neutral-950 shadow-md'
                  : 'bg-[#1a2c1d] text-neutral-300 hover:text-white border border-[#2d4932]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Catálogo Geral
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-[#facc15] text-neutral-950 shadow-md'
                  : 'bg-[#1a2c1d] text-neutral-300 hover:text-white border border-[#2d4932]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Código Fonte .PHP
            </button>
            <button
              onClick={() => setActiveTab('interactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'interactive'
                  ? 'bg-[#facc15] text-neutral-950 shadow-md'
                  : 'bg-[#1a2c1d] text-neutral-300 hover:text-white border border-[#2d4932]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#22c55e]" />
              Módulo Ativo
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar of PHP Files + Viewer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: PHP File Explorer / List (4 cols) */}
        <div className="lg:col-span-4 bg-[#121612] border-2 border-[#2b3d2b] rounded-xl shadow-xl overflow-hidden flex flex-col h-[750px]">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-[#2b3d2b] bg-[#172318] space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar arquivo .php ou função..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#0e140f] border border-[#2b3d2b] rounded text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#facc15]"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#facc15] text-neutral-950 font-black shadow'
                      : 'bg-[#0f1710] text-neutral-400 hover:text-neutral-200 border border-[#263a29]'
                  }`}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1e291e] p-1.5 space-y-0.5">
            {loadingFiles ? (
              <div className="p-6 text-center text-xs text-neutral-400">
                Carregando arquivos do ZnoteAAC...
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400">
                Nenhum arquivo encontrado.
              </div>
            ) : (
              filteredFiles.map(file => {
                const isSelected = selectedFile === file.filename;
                return (
                  <button
                    key={file.filename}
                    onClick={() => {
                      setSelectedFile(file.filename);
                      if (activeTab === 'overview') setActiveTab('code');
                    }}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start justify-between gap-2 transition-all ${
                      isSelected
                        ? 'bg-[#1b4324] border-l-4 border-[#facc15] text-white shadow-md'
                        : 'hover:bg-[#182319] text-neutral-300'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#facc15]' : 'text-emerald-400'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold truncate">
                            {file.filename}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 line-clamp-1">
                          {file.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#0d140e] border border-[#263e29] text-neutral-300 font-mono">
                        {file.sizeKb} KB
                      </span>
                      <span className="text-[8px] text-neutral-400 mt-0.5">
                        {file.linesCount} lin
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Code Viewer / Interactive Preview / Overview (8 cols) */}
        <div className="lg:col-span-8 bg-[#121612] border-2 border-[#2b3d2b] rounded-xl shadow-xl overflow-hidden flex flex-col h-[750px]">
          {/* Header of Active File */}
          <div className="p-4 border-b border-[#2b3d2b] bg-[#152417] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#244c2c] border border-[#facc15] flex items-center justify-center shadow shrink-0">
                <Code className="w-5 h-5 text-[#facc15]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-sm font-bold text-[#facc15]">
                    /ZnoteAAC-2/{selectedFile}
                  </h3>
                  {fileDetails?.category && (
                    <span className="px-2 py-0.5 rounded bg-[#1e3d23] text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      {fileDetails.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-300">
                  {fileDetails?.description || 'Arquivo PHP do ZnoteAAC'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {fileDetails?.mappedRoute && (
                <button
                  onClick={() => onNavigate(fileDetails.mappedRoute)}
                  className="px-2.5 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-neutral-950 font-bold rounded-md text-xs flex items-center gap-1 shadow transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver no Portal
                </button>
              )}
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1.5 bg-[#1f2e21] hover:bg-[#2e4732] text-[#facc15] font-bold rounded-md text-xs flex items-center gap-1 border border-[#3b593f] transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar PHP'}
              </button>
            </div>
          </div>

          {/* Body content based on activeTab */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
            {activeTab === 'overview' && (
              <div className="space-y-5 font-sans">
                <div className="bg-[#172318] border border-[#2b3d2b] rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-black text-[#facc15] font-serif uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#facc15]" />
                    Visão Geral dos Arquivos ZnoteAAC-2 Integrados
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    O ecossistema MarleyOT 8.60 incorporou todos os arquivos em PHP da pasta oficial <code className="text-[#facc15] font-mono bg-[#0d140e] px-1.5 py-0.5 rounded">ZnoteAAC-2</code>. Você pode navegar em qualquer script PHP para analisar como as consultas SQL eram estruturadas e ver a versão convertida em tempo real:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    onClick={() => { setSelectedFile('spells.php'); setActiveTab('interactive'); }}
                    className="p-3 bg-[#0e1610] border border-[#223d26] hover:border-[#facc15] rounded-lg cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#facc15]">spells.php</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">Spells 8.60</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Grimório de todas as magias de Sorcerer, Druid, Paladin e Knight.
                    </p>
                  </div>

                  <div 
                    onClick={() => { setSelectedFile('onlinelist.php'); setActiveTab('interactive'); }}
                    className="p-3 bg-[#0e1610] border border-[#223d26] hover:border-[#facc15] rounded-lg cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#facc15]">onlinelist.php</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">Jogadores Online</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Lista detalhada de personagens online com vocação e nível.
                    </p>
                  </div>

                  <div 
                    onClick={() => { setSelectedFile('killers.php'); setActiveTab('interactive'); }}
                    className="p-3 bg-[#0e1610] border border-[#223d26] hover:border-[#facc15] rounded-lg cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#facc15]">killers.php</span>
                      <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800">Top Fraggers</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Ranking dos maiores assassinos PvP e contagem de frags.
                    </p>
                  </div>

                  <div 
                    onClick={() => { setSelectedFile('monster_loot.php'); setActiveTab('interactive'); }}
                    className="p-3 bg-[#0e1610] border border-[#223d26] hover:border-[#facc15] rounded-lg cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#facc15]">monster_loot.php</span>
                      <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">Bestiário & Loot</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Drops de Demon, Dragon Lord, Behemoth, Hydra com chances.
                    </p>
                  </div>

                  <div 
                    onClick={() => { setSelectedFile('config.php'); setActiveTab('code'); }}
                    className="p-3 bg-[#0e1610] border border-[#223d26] hover:border-[#facc15] rounded-lg cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#facc15]">config.php</span>
                      <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800">Configurações</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Configurações centrais do ZnoteAAC: MySQL, stages, shop, e vocações.
                    </p>
                  </div>

                  <div 
                    onClick={() => { setSelectedFile('support.php'); setActiveTab('interactive'); }}
                    className="p-3 bg-[#0e1610] border border-[#223d26] hover:border-[#facc15] rounded-lg cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#facc15]">support.php</span>
                      <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800">Equipe</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Lista oficial de membros da Staff (GOD Marley, Gamemasters, Tutores).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="relative">
                {loadingContent ? (
                  <div className="text-neutral-400 py-10 text-center font-sans text-xs">
                    Carregando código PHP de {selectedFile}...
                  </div>
                ) : (
                  <pre className="p-4 bg-[#0a0e0b] border border-[#1e291e] rounded-lg text-emerald-300 text-xs leading-relaxed overflow-x-auto whitespace-pre">
                    {fileContent}
                  </pre>
                )}
              </div>
            )}

            {activeTab === 'interactive' && (
              <div className="font-sans space-y-4">
                {/* 1. Spells Interactive View */}
                {selectedFile === 'spells.php' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#172318] p-3 rounded-lg border border-[#2b3d2b]">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#facc15]" />
                        <h4 className="text-sm font-bold text-[#facc15]">
                          Grimório de Magias & Feitiços (Tibia 8.60)
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                          value={spellVocation}
                          onChange={e => setSpellVocation(e.target.value)}
                          className="bg-[#0e140f] border border-[#2b3d2b] rounded px-2.5 py-1 text-xs text-neutral-200"
                        >
                          <option value="all">Todas as Vocações</option>
                          <option value="Sorcerer">Sorcerers</option>
                          <option value="Druid">Druids</option>
                          <option value="Paladin">Paladins</option>
                          <option value="Knight">Knights</option>
                        </select>
                        <input
                          type="text"
                          value={spellSearch}
                          onChange={e => setSpellSearch(e.target.value)}
                          placeholder="Filtrar feitiço..."
                          className="bg-[#0e140f] border border-[#2b3d2b] rounded px-2.5 py-1 text-xs text-neutral-200 w-36"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-[#2b3d2b] rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#172318] text-neutral-400 font-serif uppercase text-[10px] border-b border-[#2b3d2b]">
                          <tr>
                            <th className="p-2.5">Nome do Feitiço</th>
                            <th className="p-2.5">Palavras Mágicas</th>
                            <th className="p-2.5">Vocação</th>
                            <th className="p-2.5">Level</th>
                            <th className="p-2.5">Mana</th>
                            <th className="p-2.5">Tipo</th>
                            <th className="p-2.5">Conta</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e291e] bg-[#0e140f]">
                          {spells
                            .filter(s => spellVocation === 'all' || s.vocation.toLowerCase() === spellVocation.toLowerCase())
                            .filter(s => !spellSearch || s.name.toLowerCase().includes(spellSearch.toLowerCase()) || s.words.toLowerCase().includes(spellSearch.toLowerCase()))
                            .map((s, idx) => (
                              <tr key={idx} className="hover:bg-[#182319]">
                                <td className="p-2.5 font-bold text-neutral-200">{s.name}</td>
                                <td className="p-2.5 font-mono text-[#facc15] font-bold">"{s.words}"</td>
                                <td className="p-2.5 text-neutral-300">{s.vocation}</td>
                                <td className="p-2.5 font-bold text-emerald-400">{s.level}</td>
                                <td className="p-2.5 text-sky-400 font-mono">{s.mana}</td>
                                <td className="p-2.5 text-neutral-400">{s.type}</td>
                                <td className="p-2.5">
                                  {s.premium ? (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-bold">VIP</span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px]">Free</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. Online List Interactive View */}
                {selectedFile === 'onlinelist.php' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-[#172318] p-3 rounded-lg border border-[#2b3d2b]">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#22c55e]" />
                        <h4 className="text-sm font-bold text-[#facc15]">
                          Jogadores Conectados no Servidor ({onlineList.length})
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-xs font-bold rounded border border-emerald-800">
                        marleyot.duckdns.org:7171
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-[#2b3d2b] rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#172318] text-neutral-400 font-serif uppercase text-[10px] border-b border-[#2b3d2b]">
                          <tr>
                            <th className="p-2.5">Nome do Jogador</th>
                            <th className="p-2.5">Nível</th>
                            <th className="p-2.5">Vocação</th>
                            <th className="p-2.5">Guilda</th>
                            <th className="p-2.5">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e291e] bg-[#0e140f]">
                          {onlineList.map(player => (
                            <tr key={player.id} className="hover:bg-[#182319]">
                              <td className="p-2.5 font-bold text-neutral-100 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block animate-pulse"></span>
                                {player.name}
                              </td>
                              <td className="p-2.5 font-bold text-emerald-400">{player.level}</td>
                              <td className="p-2.5 text-neutral-300">{player.vocation}</td>
                              <td className="p-2.5 text-[#facc15]">{player.guildName || 'Sem Guilda'}</td>
                              <td className="p-2.5">
                                <button
                                  onClick={() => onNavigate('character_profile')}
                                  className="text-xs text-sky-400 hover:underline"
                                >
                                  Ver Perfil &rarr;
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. Killers Interactive View */}
                {selectedFile === 'killers.php' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-[#172318] p-3 rounded-lg border border-[#2b3d2b]">
                      <div className="flex items-center gap-2">
                        <Skull className="w-5 h-5 text-rose-500" />
                        <h4 className="text-sm font-bold text-rose-400">
                          Top Fraggers / Assassinos PvP do MarleyOT
                        </h4>
                      </div>
                      <span className="text-xs text-neutral-400">Baseado no MariaDB player_deaths</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {killers.map((k, index) => (
                        <div key={index} className="p-3 bg-[#151c16] border border-[#263a29] rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              index === 0 ? 'bg-[#facc15] text-neutral-950' : 'bg-[#1b2b1d] text-neutral-300'
                            }`}>
                              #{index + 1}
                            </span>
                            <div>
                              <h5 className="font-bold text-neutral-100 text-xs">{k.name}</h5>
                              <p className="text-[10px] text-neutral-400">{k.vocation || 'Guerreiro'} &bull; Level {k.level || 8}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-rose-400 text-sm font-mono">{k.frags}</span>
                            <span className="block text-[9px] uppercase font-bold text-neutral-500">Frags</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Monster Loot Interactive View */}
                {selectedFile === 'monster_loot.php' && (
                  <div className="space-y-4">
                    <div className="bg-[#172318] p-3 rounded-lg border border-[#2b3d2b]">
                      <h4 className="text-sm font-bold text-[#facc15] flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-500" />
                        Bestiário Oficial de Criaturas & Drops (8.60)
                      </h4>
                      <p className="text-xs text-neutral-300">
                        Chances reais de drop configuradas no servidor TFS 1.5 Downgrade.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {monsters.map((m, index) => (
                        <div key={index} className="bg-[#0e140f] border border-[#263e29] rounded-lg p-3.5 space-y-2">
                          <div className="flex items-center justify-between border-b border-[#1e291e] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-[#facc15] uppercase font-serif">{m.name}</span>
                              <span className="text-[10px] text-neutral-400 font-mono">HP: {m.hp} | EXP: {m.exp}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 bg-[#1b2b1d] text-neutral-300 rounded font-mono">
                              Imunidades: {m.immune}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-300">{m.description}</p>

                          <div className="pt-1">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                              Tabela de Loot & Raridade:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                              {m.loot?.map((item: any, i: number) => (
                                <div key={i} className="p-1.5 bg-[#121a13] border border-[#1e2d20] rounded flex items-center justify-between text-[11px]">
                                  <span className="text-neutral-200 truncate">{item.item}</span>
                                  <span className="font-mono text-[#facc15] font-bold shrink-0 ml-1">{item.chance}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Support Staff Interactive View */}
                {selectedFile === 'support.php' && (
                  <div className="space-y-4">
                    <div className="bg-[#172318] p-3 rounded-lg border border-[#2b3d2b]">
                      <h4 className="text-sm font-bold text-[#facc15] flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        Equipe Oficial de Moderação & Suporte (MarleyOT)
                      </h4>
                      <p className="text-xs text-neutral-300">
                        Membros oficiais responsáveis pela administração do servidor.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {staff.map((member, i) => (
                        <div key={i} className="p-3 bg-[#0e140f] border border-[#263e29] rounded-lg flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-[#facc15] text-sm">{member.name}</h5>
                              <span className="px-2 py-0.5 bg-[#1a3320] text-emerald-300 text-[10px] font-bold rounded">
                                {member.group}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400">{member.role}</p>
                            <p className="text-xs text-neutral-300 mt-1">{member.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            member.status === 'Online' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-neutral-800 text-neutral-400'
                          }`}>
                            {member.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback for files without a custom interactive view */}
                {!['spells.php', 'onlinelist.php', 'killers.php', 'monster_loot.php', 'support.php'].includes(selectedFile) && (
                  <div className="text-center py-12 space-y-3 bg-[#0e140f] border border-[#263e29] rounded-lg p-6">
                    <FileCode className="w-10 h-10 text-[#facc15] mx-auto opacity-70" />
                    <h4 className="text-sm font-bold text-neutral-200">
                      Módulo PHP: {selectedFile}
                    </h4>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto">
                      {fileDetails?.description || 'Este arquivo faz parte do núcleo do Znote AAC e possui sua lógica integrada à API do MarleyOT.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('code')}
                      className="px-4 py-2 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] font-bold rounded-lg text-xs inline-flex items-center gap-2"
                    >
                      <Code className="w-4 h-4" />
                      Inspecionar Código Fonte PHP
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
