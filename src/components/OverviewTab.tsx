import React from 'react';
import { 
  Server, 
  Monitor, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Layers, 
  Zap, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { TabId } from '../types';
import { REPOSITORIES_INFO } from '../data/guideData';

interface OverviewTabProps {
  onNavigate: (tab: TabId) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Hero Card */}
      <div className="rounded-xl border border-neutral-800 bg-gradient-to-b from-neutral-900/90 to-[#0d1117] p-6 shadow-lg">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-3">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Protocolo 7.72 Old School • Engenharia Definitiva</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-100 tracking-tight mb-3">
            Arquitetura &amp; Desenvolvimento Avançado para OTServ 7.72
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed mb-5">
            Este ambiente integra a fidelidade mecânica do servidor retro <strong>Styller Yourots 7.72</strong> com
            a modernidade e aceleração gráfica do <strong>OTClientV8</strong> com vBot embutido.
            Da compilação C++ em Linux Ubuntu/OCI até a montagem da pasta cliente pronta para distribuição.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('compilation')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-colors shadow-md"
            >
              <span>Começar Compilação do Servidor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('client-packaging')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
            >
              <span>Montar Pasta OTClientV8</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('config-lua')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-medium border border-neutral-800 transition-colors"
            >
              <span>Gerar config.lua 7.72</span>
            </button>
          </div>
        </div>
      </div>

      {/* The 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Styller 7.72 */}
        <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Server className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-neutral-100">Servidor Styller 7.72</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">
                Core C++
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Baseado no clássico repositório <span className="font-mono text-neutral-300">luanluciano93/styller</span>.
              Regras estritas de combate: exaustão compartilhada, dano calibrado por ML/Level e mapa clássico Yourots refinado.
            </p>

            <ul className="text-xs text-neutral-300 space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Sem crosshair hotkey automática para runas (PvP manual)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Suporte nativo a MariaDB com InnoDB e prepared queries</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Canais abertos de NPC clássico no chat "Default"</span>
              </li>
            </ul>
          </div>

          <a
            href={REPOSITORIES_INFO.styller.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 mt-2"
          >
            Ver repositório GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Pillar 2: OTClientV8 */}
        <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Monitor className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-neutral-100">OTClientV8 com vBot</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                Client V8
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Cliente moderno com renderizador em hardware (OpenGL / DirectX), bot embutido nativo sem DLL injection, e suporte a opcodes estendidos.
            </p>

            <ul className="text-xs text-neutral-300 space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <span>Pasta <code className="text-cyan-300">data/things/772/</code> com Tibia.spr e Tibia.dat</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <span>vBot nativo em Lua (Auto UH, Mana Fluid, Haste)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <span>Extended Opcode (0x32) para HUD e dados customizados</span>
              </li>
            </ul>
          </div>

          <a
            href={REPOSITORIES_INFO.otclientv8.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 mt-2"
          >
            Ver repositório GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Pillar 3: Infraestrutura Cloud & CI/CD */}
        <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Database className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-neutral-100">MariaDB &amp; Oracle Cloud</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                DevOps
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Hospedagem em nuvem de alta disponibilidade na Oracle Cloud Infrastructure (OCI) ou VPS Ubuntu com deploy contínuo via GitHub Actions.
            </p>

            <ul className="text-xs text-neutral-300 space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Gerenciamento de daemon com systemd (auto-restart)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Desalocação obrigatória de memória com result.free</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Abertura de portas 7171, 7172 no iptables da OCI</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate('cicd-oci')}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 mt-2 text-left"
          >
            Ver guia de deploy OCI <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table: 7.72 Old School vs Modern 8.60+ */}
      <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-6 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-semibold text-neutral-100">
            Diferenças Fundamentais: Protocolo 7.72 vs Servidores Modernos (8.60+)
          </h3>
        </div>
        <p className="text-xs text-neutral-400 mb-4">
          Compreender estas diferenças mecânicas é indispensável para não tentar implementar recursos inexistentes na versão 7.72 e garantir a fidelidade clássica:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-900/50">
                <th className="py-2.5 px-4 font-semibold">Aspecto Mecânico</th>
                <th className="py-2.5 px-4 font-semibold text-amber-300">Padrão 7.72 (Styller / Old School)</th>
                <th className="py-2.5 px-4 font-semibold text-neutral-400">Padrão Moderno (8.60+ / TFS 1.x)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              <tr>
                <td className="py-2.5 px-4 font-medium text-neutral-200">Mira de Runas (Crosshair)</td>
                <td className="py-2.5 px-4 text-amber-300/90 font-mono">Inexistente. Mira manual no mouse ou script vBot useWith</td>
                <td className="py-2.5 px-4 text-neutral-400">Hotkeys automáticas com mira em alvo travado (With crosshair)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-neutral-200">Exaustão (Cooldown)</td>
                <td className="py-2.5 px-4 text-amber-300/90">Unificada e rígida (1s de item + 1s a 2s de magia de ataque)</td>
                <td className="py-2.5 px-4 text-neutral-400">Barras de cooldown individuais e cooldown groups flexíveis</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-neutral-200">Canais de NPC</td>
                <td className="py-2.5 px-4 text-amber-300/90">Voz aberta no canal Default (visível a todos ao redor)</td>
                <td className="py-2.5 px-4 text-neutral-400">Aba privada individual (NPC Channel com chat dedicado)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-neutral-200">Treino Offline &amp; Montarias</td>
                <td className="py-2.5 px-4 text-amber-300/90">Não existem nativamente no 7.72 (apenas estátuas de treino se customizado)</td>
                <td className="py-2.5 px-4 text-neutral-400">Sistemas nativos da CipSoft com estátuas e montarias</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-neutral-200">Formato de Sprites</td>
                <td className="py-2.5 px-4 text-amber-300/90">Limite clássico 16-bit (&lt;= 65535 sprites) e Magenta Chroma Key</td>
                <td className="py-2.5 px-4 text-neutral-400">Sprites U32 e canal Alpha RGBA com milhares de sprites</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-neutral-200">Motor de Banco</td>
                <td className="py-2.5 px-4 text-amber-300/90 font-mono">MariaDB / MySQL (InnoDB com prepared statements)</td>
                <td className="py-2.5 px-4 text-neutral-400 font-mono">MariaDB / MySQL / SQLite3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Quick-Step Roadmap */}
      <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-semibold text-neutral-100">
            Roteiro Rápido de Execução: Do Zero à Produção
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigate('compilation')}
            className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 hover:border-amber-500/40 cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="text-xs font-mono text-amber-400 font-bold mb-1">FASE 1</div>
            <h4 className="text-sm font-semibold text-neutral-100 mb-1">Compilar o Servidor</h4>
            <p className="text-xs text-neutral-400">
              Instalar pacotes no Ubuntu, clonar o Styller e compilar o binário C++ com CMake e gcc.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('database')}
            className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/40 cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="text-xs font-mono text-emerald-400 font-bold mb-1">FASE 2</div>
            <h4 className="text-sm font-semibold text-neutral-100 mb-1">Subir o MariaDB</h4>
            <p className="text-xs text-neutral-400">
              Criar banco, criar usuário do Styller e importar o schema.sql otimizado para InnoDB.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('config-lua')}
            className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="text-xs font-mono text-cyan-400 font-bold mb-1">FASE 3</div>
            <h4 className="text-sm font-semibold text-neutral-100 mb-1">Ajustar config.lua</h4>
            <p className="text-xs text-neutral-400">
              Configurar IP público, portas 7171/7172, taxas de exp e regras retrô de PvP e exaustão.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('client-packaging')}
            className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 hover:border-purple-500/40 cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="text-xs font-mono text-purple-400 font-bold mb-1">FASE 4</div>
            <h4 className="text-sm font-semibold text-neutral-100 mb-1">Montar o OTClientV8</h4>
            <p className="text-xs text-neutral-400">
              Estruturar pasta data/things/772/, travar IP no entergame.lua e empacotar para os jogadores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
