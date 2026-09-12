import React, { useState } from 'react';
import { TabId } from './types';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { CompilationGuide } from './components/CompilationGuide';
import { ConfigLuaGenerator } from './components/ConfigLuaGenerator';
import { ClientPackager } from './components/ClientPackager';
import { VBotScriptStudio } from './components/VBotScriptStudio';
import { DatabaseManager } from './components/DatabaseManager';
import { CicdWorkflow } from './components/CicdWorkflow';
import { Troubleshooting } from './components/Troubleshooting';
import { ShieldCheck, Heart, Github, Terminal } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabId>('overview');

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-200 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'overview' && <OverviewTab onNavigate={setCurrentTab} />}
        {currentTab === 'compilation' && <CompilationGuide />}
        {currentTab === 'config-lua' && <ConfigLuaGenerator />}
        {currentTab === 'client-packaging' && <ClientPackager />}
        {currentTab === 'vbot-scripts' && <VBotScriptStudio />}
        {currentTab === 'database' && <DatabaseManager />}
        {currentTab === 'cicd-oci' && <CicdWorkflow />}
        {currentTab === 'troubleshooting' && <Troubleshooting />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-neutral-800/80 bg-[#0a0d13] py-6 text-xs text-neutral-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span className="font-semibold text-neutral-300">
              Guia Definitivo OTServ 7.72 &bull; Styller Yourots + OTClientV8
            </span>
          </div>

          <div className="flex items-center space-x-4 text-neutral-400">
            <a
              href="https://github.com/luanluciano93/styller"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 transition-colors flex items-center gap-1 font-mono"
            >
              <Github className="w-3.5 h-3.5" />
              luanluciano93/styller
            </a>
            <span>&bull;</span>
            <a
              href="https://github.com/OTCv8/otclientv8"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-300 transition-colors flex items-center gap-1 font-mono"
            >
              <Github className="w-3.5 h-3.5" />
              OTCv8/otclientv8
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
