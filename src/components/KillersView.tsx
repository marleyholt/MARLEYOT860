import React, { useState, useEffect } from 'react';
import { Skull, Trophy, Swords, Flame, ShieldAlert, Award } from 'lucide-react';
import { PageId } from '../types';

interface Killer {
  name: string;
  frags: number;
  level?: number;
  vocation?: string;
  skull?: number;
}

interface KillersViewProps {
  onNavigate?: (page: PageId) => void;
  onInspectCharacter?: (name: string) => void;
}

export const KillersView: React.FC<KillersViewProps> = ({ onNavigate, onInspectCharacter }) => {
  const [killers, setKillers] = useState<Killer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/killers')
      .then(r => r.json())
      .then(data => {
        setKillers(Array.isArray(data) ? data : []);
      })
      .catch(e => console.error('Erro ao carregar killers:', e))
      .finally(() => setLoading(false));
  }, []);

  const top1 = killers[0];
  const top2 = killers[1];
  const top3 = killers[2];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#381414] via-[#541c1c] to-[#241010] px-6 py-4 border-b border-[#733b3b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#241010] border border-[#ef4444] rounded-lg">
              <Skull className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-rose-400 font-serif uppercase tracking-wider">
                  Top Fraggers &bull; Hall da Fama PvP
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-black uppercase">
                  Open-PvP
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Os maiores guerreiros e assassinos em combate player-versus-player no MarleyOT 8.60.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-300 bg-[#1a0f0f] px-3 py-1.5 rounded border border-[#3d2222] flex items-center gap-1.5 font-bold">
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              Ranking de Mortes PvP
            </span>
          </div>
        </div>

        {/* Podium Highlight (Top 3 Fraggers) */}
        {killers.length >= 1 && (
          <div className="p-6 bg-[#161212] border-b border-[#2b1e1e] grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top 2 */}
            {top2 && (
              <div className="p-4 bg-[#1a1414] border border-[#3d2b2b] rounded-lg flex flex-col items-center text-center relative overflow-hidden order-2 md:order-1">
                <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-200 border-2 border-slate-400 flex items-center justify-center font-bold text-sm shadow-md mb-2">
                  #2
                </div>
                <h4 className="font-bold text-neutral-100 text-sm">{top2.name}</h4>
                <p className="text-xs text-neutral-400">{top2.vocation || 'Guerreiro'} &bull; Level {top2.level || 8}</p>
                <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-[#281515] border border-rose-900/60 rounded-full text-rose-400 font-mono font-bold text-xs">
                  <Skull className="w-3 h-3 text-rose-500" />
                  {top2.frags} Frags
                </div>
              </div>
            )}

            {/* Top 1 (Champion) */}
            {top1 && (
              <div className="p-5 bg-gradient-to-b from-[#2e1d14] to-[#1e130f] border-2 border-[#facc15] rounded-lg flex flex-col items-center text-center relative overflow-hidden shadow-2xl order-1 md:order-2">
                <div className="w-12 h-12 rounded-full bg-[#facc15] text-neutral-950 border-2 border-white flex items-center justify-center font-black text-base shadow-xl mb-2">
                  <Trophy className="w-6 h-6 text-neutral-950" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#facc15] bg-[#422912] px-2 py-0.5 rounded-full mb-1">
                  Rei do PvP
                </span>
                <h4 className="font-bold text-neutral-100 text-base">{top1.name}</h4>
                <p className="text-xs text-neutral-300">{top1.vocation || 'Guerreiro'} &bull; Level {top1.level || 8}</p>
                <div className="mt-3 flex items-center gap-1.5 px-4 py-1.5 bg-[#421515] border border-rose-600 rounded-full text-rose-300 font-mono font-black text-sm shadow">
                  <Skull className="w-4 h-4 text-rose-400" />
                  {top1.frags} Frags
                </div>
              </div>
            )}

            {/* Top 3 */}
            {top3 && (
              <div className="p-4 bg-[#1a1414] border border-[#3d2b2b] rounded-lg flex flex-col items-center text-center relative overflow-hidden order-3">
                <div className="w-10 h-10 rounded-full bg-amber-800 text-amber-200 border-2 border-amber-600 flex items-center justify-center font-bold text-sm shadow-md mb-2">
                  #3
                </div>
                <h4 className="font-bold text-neutral-100 text-sm">{top3.name}</h4>
                <p className="text-xs text-neutral-400">{top3.vocation || 'Guerreiro'} &bull; Level {top3.level || 8}</p>
                <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-[#281515] border border-rose-900/60 rounded-full text-rose-400 font-mono font-bold text-xs">
                  <Skull className="w-3 h-3 text-rose-500" />
                  {top3.frags} Frags
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1f1515] text-neutral-400 font-serif uppercase text-[10px] tracking-wider border-b border-[#3d2424]">
              <tr>
                <th className="py-3 px-4 text-center w-16">Posição</th>
                <th className="py-3 px-4">Nome do Guerreiro</th>
                <th className="py-3 px-4">Vocação</th>
                <th className="py-3 px-4 text-center">Nível</th>
                <th className="py-3 px-4 text-right">Frags Confirmados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#261818] bg-[#120e0e]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400 text-xs">
                    Carregando o ranking de assassinos PvP...
                  </td>
                </tr>
              ) : killers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400 text-xs">
                    Nenhum combate registrado até o momento no servidor.
                  </td>
                </tr>
              ) : (
                killers.map((killer, idx) => (
                  <tr key={idx} className="hover:bg-[#1a1212] transition-colors">
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        idx === 0 ? 'bg-[#facc15] text-neutral-950 shadow' :
                        idx === 1 ? 'bg-slate-300 text-neutral-950' :
                        idx === 2 ? 'bg-amber-700 text-white' :
                        'bg-[#221717] text-neutral-400 border border-[#3b2525]'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-100 flex items-center gap-2">
                      <Skull className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      {killer.name}
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      {killer.vocation || 'Sorcerer'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                      {killer.level || 8}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-sm font-bold text-rose-400 bg-[#2b1414] px-2.5 py-0.5 rounded border border-rose-900/60">
                        {killer.frags} frags
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#161010] border-t border-[#2d1b1b] flex items-center justify-between text-xs text-neutral-400">
          <span>Ranking baseado nos registros de player_deaths do MariaDB</span>
          <span className="text-neutral-500">Servidor com sistema de Red Skull e Black Skull ativo</span>
        </div>
      </div>
    </div>
  );
};
