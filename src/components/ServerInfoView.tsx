import React from 'react';
import { HelpCircle, Server, Shield, Zap, Swords, Sparkles, MapPin } from 'lucide-react';
import { ServerStats } from '../types';

interface ServerInfoProps {
  stats: ServerStats;
}

export const ServerInfoView: React.FC<ServerInfoProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#14381c] via-[#24542c] to-[#14381c] px-6 py-4 border-b border-[#3b7347] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#102416] border border-[#facc15] rounded">
              <HelpCircle className="w-5 h-5 text-[#facc15]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#facc15] font-serif uppercase tracking-wider">
                Informações Técnicas & Rates do Servidor
              </h2>
              <p className="text-xs text-neutral-300">
                Regras de jogo, taxas de experiência e especificações do MarleyOT 8.60
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Tabela de Rates */}
          <div className="bg-[#0e140f] border border-[#213323] rounded-lg overflow-hidden">
            <div className="bg-[#152317] px-4 py-2 border-b border-[#213323] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#facc15]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#facc15] font-serif">
                Taxas de Evolução (Rates)
              </h3>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-[#111a12] rounded border border-[#1b2b1d]">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Experiência</div>
                <div className="text-lg font-bold text-[#22c55e] font-mono mt-1">{stats.expRate}</div>
              </div>

              <div className="p-3 bg-[#111a12] rounded border border-[#1b2b1d]">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Skills</div>
                <div className="text-lg font-bold text-[#facc15] font-mono mt-1">{stats.skillRate}</div>
              </div>

              <div className="p-3 bg-[#111a12] rounded border border-[#1b2b1d]">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Magic Level</div>
                <div className="text-lg font-bold text-[#e11d48] font-mono mt-1">{stats.magicRate}</div>
              </div>

              <div className="p-3 bg-[#111a12] rounded border border-[#1b2b1d]">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Loot Rate</div>
                <div className="text-lg font-bold text-amber-400 font-mono mt-1">{stats.lootRate}</div>
              </div>
            </div>
          </div>

          {/* Configurações do Mundo */}
          <div className="bg-[#0e140f] border border-[#213323] rounded-lg overflow-hidden">
            <div className="bg-[#152317] px-4 py-2 border-b border-[#213323] flex items-center gap-2">
              <Swords className="w-4 h-4 text-[#e11d48]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#facc15] font-serif">
                Especificações de PvP & Sistema
              </h3>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-[#1b2b1d]">
                <span className="text-neutral-400">Tipo de Mundo:</span>
                <span className="font-semibold text-neutral-200">Open-PvP Clássico</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#1b2b1d]">
                <span className="text-neutral-400">Red Skull:</span>
                <span className="font-semibold text-neutral-200">3 frags por dia / 15 semanais</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#1b2b1d]">
                <span className="text-neutral-400">Black Skull:</span>
                <span className="font-semibold text-neutral-200">6 frags por dia</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#1b2b1d]">
                <span className="text-neutral-400">Proteção de Nível:</span>
                <span className="font-semibold text-neutral-200">Até Level 50</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#1b2b1d]">
                <span className="text-neutral-400">Sistema Bancário:</span>
                <span className="font-semibold text-[#86efac]">Talkactions (!bank, !deposit, !withdraw)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#1b2b1d]">
                <span className="text-neutral-400">Aluguel de Casas:</span>
                <span className="font-semibold text-neutral-200">Semanal via saldo do banco</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
