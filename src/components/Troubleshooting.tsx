import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Wrench, 
  CheckCircle2, 
  HelpCircle,
  Terminal,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { TROUBLESHOOTING_LIST } from '../data/guideData';
import { TroubleIssue } from '../types';
import { CodeBlock } from './CodeBlock';

export const Troubleshooting: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Cliente/Sprites', 'Rede/Firewall', 'Banco MariaDB', 'Crash/Memória'];

  const filteredIssues = useMemo(() => {
    return TROUBLESHOOTING_LIST.filter((issue) => {
      const matchesCat = selectedCategory === 'all' || issue.category === selectedCategory;
      const matchesSearch = 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.symptom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.rootCause.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.solution.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>DIAGNÓSTICO &amp; RESOLUÇÃO DE ERROS</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">
          Base de Conhecimento: Troubleshooting 7.72
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm mt-1">
          Diagnóstico cirúrgico dos erros mais frequentes na compilação, portas bloqueadas na Oracle Cloud, divergência de sprites e vazamento de memória.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-neutral-800 bg-[#0d1117]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por erro (ex: 10060, signature, RAM)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-neutral-950 font-semibold'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Todos os Erros' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Accordion / List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-neutral-800 bg-[#0d1117] text-neutral-400 text-xs">
            Nenhum problema encontrado para o termo pesquisado.
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-xl border border-neutral-800 bg-[#0d1117] p-5 space-y-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-100">
                    {issue.title}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-amber-300 w-fit">
                  {issue.category}
                </span>
              </div>

              {/* Symptom & Root Cause Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15">
                  <span className="text-red-400 font-semibold block mb-1">
                    Sintoma Observado:
                  </span>
                  <p className="text-neutral-300 leading-relaxed">{issue.symptom}</p>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                  <span className="text-amber-400 font-semibold block mb-1">
                    Causa Raiz Técnica:
                  </span>
                  <p className="text-neutral-300 leading-relaxed">{issue.rootCause}</p>
                </div>
              </div>

              {/* Solution */}
              <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs space-y-2">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Como Corrigir Definitivamente:
                </span>
                <p className="text-neutral-300 whitespace-pre-line leading-relaxed">
                  {issue.solution}
                </p>

                {issue.codeSnippet && (
                  <div className="pt-2">
                    <CodeBlock code={issue.codeSnippet} language="bash" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
