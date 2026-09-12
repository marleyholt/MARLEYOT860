import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Sliders, 
  Layers, 
  Copy, 
  Check, 
  Terminal, 
  ArrowRight,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { BOT_PRESETS, EXTENDED_OPCODE_EXAMPLES } from '../data/guideData';
import { BotScriptPreset } from '../types';
import { CodeBlock } from './CodeBlock';

export const VBotScriptStudio: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<BotScriptPreset>(BOT_PRESETS[0]);
  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'extended-opcode'>('presets');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
          <Bot className="w-3.5 h-3.5" />
          <span>AUTOMAÇÃO CLIENT-SIDE &amp; EXTENDED OPCODES</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">
          Módulos vBot (OTClientV8) &amp; Extended Opcodes
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm mt-1">
          Scripts prontos para o bot nativo do OTClientV8 e canal de transmissão bidirecional de dados (Opcode 0x32) com o servidor Styller.
        </p>
      </div>

      {/* Sub-Tabs */}
      <div className="flex space-x-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveSubTab('presets')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeSubTab === 'presets'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Biblioteca de Macros vBot (7.72)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('extended-opcode')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeSubTab === 'extended-opcode'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Canal de Rede Extended Opcode (0x32)</span>
        </button>
      </div>

      {/* SUB-TAB 1: BOT PRESETS */}
      {activeSubTab === 'presets' && (
        <div className="space-y-6">
          {/* Top Explanation Banner */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-[#0d1117] flex items-start gap-3 text-xs text-neutral-300">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-neutral-100 block mb-1">
                Por que o vBot do OTClientV8 é a Solução Definitiva para o 7.72?
              </strong>
              Diferente de bots externos que injetam DLLs no processo do Windows (sujeitos a crashes e detecções de antivírus),
              o <code className="text-amber-300 font-mono">game_bot</code> do OTClientV8 roda em scripts Lua nativos integrados ao loop assíncrono de eventos do próprio cliente.
              Ele acessa com custo computacional zero o HP/MP do jogador, inventário e posições no mapa.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Presets List (4 cols) */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-semibold text-neutral-400 block px-1">
                Selecione o Script / Macro:
              </span>
              {BOT_PRESETS.map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-sm'
                        : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-neutral-100">{preset.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Preview & Details (8 cols) */}
            <div className="lg:col-span-8 rounded-xl border border-neutral-800 bg-[#0d1117] p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-semibold text-neutral-100">
                    {selectedPreset.name}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {selectedPreset.category}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {selectedPreset.description}
                </p>
              </div>

              {/* Location Instructions */}
              <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 flex items-center justify-between">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Onde salvar no OTClientV8:</span>
                  <code className="text-amber-300 font-mono text-xs">
                    modules/game_bot/default_scripts/{selectedPreset.id}.lua
                  </code>
                </div>
              </div>

              {/* Code */}
              <CodeBlock
                code={selectedPreset.code}
                language="lua"
                filename={`${selectedPreset.id}.lua`}
                downloadable
                maxHeight="max-h-96"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EXTENDED OPCODES */}
      {activeSubTab === 'extended-opcode' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-neutral-800 bg-[#0d1117] text-xs text-neutral-300 leading-relaxed space-y-2">
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>O que são Extended Opcodes (0x32)?</span>
            </h3>
            <p>
              O protocolo de rede original do Tibia 7.72 é estático e não possui pacotes nativos para interfaces customizadas (como saldo bancário na tela, pontos VIP, árvores de talento ou teleports).
            </p>
            <p>
              O <strong>Extended Opcode</strong> encapsula qualquer dado em formato JSON sob o byte de rede <code className="text-cyan-300 font-mono">0x32</code>.
              Desta forma, o servidor Styller envia informações instantaneamente para o OTClientV8 sem corromper a fidelidade das mecânicas clássicas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Server Side Lua */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Lado do Servidor (Styller C++ / Lua)
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">data/creaturescripts/</span>
              </div>
              <CodeBlock
                code={EXTENDED_OPCODE_EXAMPLES.serverLua}
                language="lua"
                filename="extended_opcode_styller.lua"
                downloadable
                maxHeight="max-h-[380px]"
              />

              <span className="text-[11px] text-neutral-400 block">Registro no creaturescripts.xml:</span>
              <CodeBlock
                code={EXTENDED_OPCODE_EXAMPLES.serverXml}
                language="xml"
                filename="creaturescripts.xml"
              />
            </div>

            {/* Client Side Lua & OTUI */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Lado do Cliente (OTClientV8)
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">modules/game_custom_ui/</span>
              </div>
              <CodeBlock
                code={EXTENDED_OPCODE_EXAMPLES.clientLua}
                language="lua"
                filename="custom_ui.lua"
                downloadable
                maxHeight="max-h-[260px]"
              />

              <span className="text-[11px] text-neutral-400 block">Layout visual da Janela (.otui):</span>
              <CodeBlock
                code={EXTENDED_OPCODE_EXAMPLES.clientOtui}
                language="css"
                filename="custom_ui.otui"
                maxHeight="max-h-[180px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
