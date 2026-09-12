import React, { useState } from 'react';
import { Trophy, Medal, Search, Flame } from 'lucide-react';
import { PlayerCharacter } from '../types';

interface HighscoresProps {
  characters: PlayerCharacter[];
}

export const HighscoresView: React.FC<HighscoresProps> = ({ characters }) => {
  const [category, setCategory] = useState<'level' | 'maglevel'>('level');
  const [searchTerm, setSearchTerm] = useState('');

  // Ordenar conforme categoria selecionada
  const sorted = [...characters]
    .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (category === 'level') return b.level - a.level;
      return b.maglevel - a.maglevel;
    });

  return (
    <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-2xl overflow-hidden">
      {/* Top Banner Znote Style */}
      <div className="bg-gradient-to-r from-[#14381c] via-[#24542c] to-[#14381c] px-6 py-4 border-b border-[#3b7347] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#102416] border border-[#facc15] rounded">
            <Trophy className="w-5 h-5 text-[#facc15]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#facc15] font-serif uppercase tracking-wider">
              Highscores &bull; Top Rankings MarleyOT
            </h2>
            <p className="text-xs text-neutral-300">
              Classificação geral dos melhores guerreiros de Styller Yourots
            </p>
          </div>
        </div>

        {/* Rastafari stripe accent */}
        <div className="hidden sm:flex items-center gap-1">
          <span className="w-2.5 h-6 bg-[#16a34a] rounded-sm"></span>
          <span className="w-2.5 h-6 bg-[#facc15] rounded-sm"></span>
          <span className="w-2.5 h-6 bg-[#dc2626] rounded-sm"></span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 bg-[#0e130f] border-b border-[#213323] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCategory('level')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              category === 'level'
                ? 'bg-gradient-to-r from-[#15803d] to-[#22c55e] text-neutral-950 shadow'
                : 'bg-[#172118] text-neutral-300 hover:text-[#facc15]'
            }`}
          >
            Top Experience (Level)
          </button>
          <button
            onClick={() => setCategory('maglevel')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              category === 'maglevel'
                ? 'bg-gradient-to-r from-[#eab308] to-[#facc15] text-neutral-950 shadow'
                : 'bg-[#172118] text-neutral-300 hover:text-[#facc15]'
            }`}
          >
            Top Magic Level
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar jogador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-xs focus:outline-none focus:border-[#facc15]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0a0f0b] text-[#facc15] uppercase tracking-wider font-mono border-b border-[#213323]">
            <tr>
              <th className="py-2.5 px-4 text-center w-12">#</th>
              <th className="py-2.5 px-4">Nome do Jogador</th>
              <th className="py-2.5 px-4">Vocação</th>
              <th className="py-2.5 px-4 text-center">{category === 'level' ? 'Level' : 'Magic Level'}</th>
              <th className="py-2.5 px-4 text-right">Experiência</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b261c]">
            {sorted.map((char, index) => {
              const rank = index + 1;
              return (
                <tr key={char.id} className="hover:bg-[#151d16] transition-colors">
                  <td className="py-3 px-4 text-center font-bold font-mono">
                    {rank === 1 && <span className="text-[#facc15] inline-flex items-center gap-1"><Medal className="w-4 h-4" /> 1</span>}
                    {rank === 2 && <span className="text-neutral-300 inline-flex items-center gap-1"><Medal className="w-4 h-4" /> 2</span>}
                    {rank === 3 && <span className="text-amber-600 inline-flex items-center gap-1"><Medal className="w-4 h-4" /> 3</span>}
                    {rank > 3 && <span className="text-neutral-400">{rank}</span>}
                  </td>
                  <td className="py-3 px-4 font-semibold text-neutral-100 flex items-center gap-2">
                    {char.name === 'GM Marley' && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[10px]">
                        GOD
                      </span>
                    )}
                    {char.name}
                  </td>
                  <td className="py-3 px-4 text-neutral-300">{char.vocation}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#4ade80]">
                    {category === 'level' ? char.level : char.maglevel}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-neutral-300">
                    {char.experience.toLocaleString()} exp
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
