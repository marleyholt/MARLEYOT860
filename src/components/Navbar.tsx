import React from 'react';
import { 
  Terminal, 
  Settings, 
  FolderTree, 
  Bot, 
  Database, 
  Cloud, 
  AlertTriangle, 
  Compass,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { TabId } from '../types';
import { REPOSITORIES_INFO } from '../data/guideData';

interface NavbarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Arquitetura 7.72', icon: <Compass className="w-4 h-4" /> },
    { id: 'compilation', label: 'Compilação Servidor', icon: <Terminal className="w-4 h-4" />, badge: 'Linux/OCI' },
    { id: 'config-lua', label: 'Gerador config.lua', icon: <Settings className="w-4 h-4" /> },
    { id: 'client-packaging', label: 'Pasta OTClientV8', icon: <FolderTree className="w-4 h-4" />, badge: 'Client' },
    { id: 'vbot-scripts', label: 'vBot & Opcodes', icon: <Bot className="w-4 h-4" /> },
    { id: 'database', label: 'Banco MariaDB', icon: <Database className="w-4 h-4" /> },
    { id: 'cicd-oci', label: 'CI/CD & Nuvem OCI', icon: <Cloud className="w-4 h-4" /> },
    { id: 'troubleshooting', label: 'Diagnóstico & Fixes', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-neutral-800 bg-[#0a0d13]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with Branding & Links */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3 border-b border-neutral-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base shadow-sm">
              7.72
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold text-neutral-100 tracking-tight">
                  Guia OTServ 7.72 &amp; OTClientV8
                </h1>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 inline" /> Produção
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Styller Yourots + OTClientV8 (vBot) • Compilação, Configuração e Empacotamento
              </p>
            </div>
          </div>

          {/* External GitHub Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={REPOSITORIES_INFO.styller.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-md border border-neutral-800 transition-colors"
              title="Acessar repositório do Styller no GitHub"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              <span className="font-mono">styller</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>
            <a
              href={REPOSITORIES_INFO.otclientv8.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-md border border-neutral-800 transition-colors"
              title="Acessar repositório do OTClientV8 no GitHub"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
              <span className="font-mono">otclientv8</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-amber-500/20 text-amber-200' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
