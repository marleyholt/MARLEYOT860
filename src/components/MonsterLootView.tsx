import React, { useState, useEffect } from 'react';
import { Flame, Search, Shield, Zap, Sparkles, Gem, Skull } from 'lucide-react';
import { PageId } from '../types';

interface MonsterDrop {
  item: string;
  chance: string;
  count?: string;
  rare?: boolean;
}

interface Monster {
  name: string;
  hp: number;
  exp: number;
  elements?: { strong?: string; weak?: string };
  drops: MonsterDrop[];
}

interface MonsterLootViewProps {
  onNavigate?: (page: PageId) => void;
}

export const MonsterLootView: React.FC<MonsterLootViewProps> = () => {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/monsters')
      .then(r => r.json())
      .then(data => {
        setMonsters(Array.isArray(data) ? data : []);
      })
      .catch(e => console.error('Erro ao carregar monstros:', e))
      .finally(() => setLoading(false));
  }, []);

  const filteredMonsters = monsters.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.drops.some(d => d.item.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#14381c] via-[#24542c] to-[#14381c] px-6 py-4 border-b border-[#3b7347] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#102416] border border-[#22c55e] rounded-lg">
              <Flame className="w-6 h-6 text-[#facc15]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#facc15] font-serif uppercase tracking-wider">
                  Bestiário de Monstros & Loot
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#16a34a] text-neutral-950 text-[10px] font-black uppercase">
                  Loot Rate 3.0x
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Guia oficial de pontos de vida, experiência e tabela de drops das criaturas no MarleyOT 8.60.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-300 bg-[#0e140f] px-3 py-1.5 rounded border border-[#263a29] flex items-center gap-1.5 font-bold">
              <Gem className="w-3.5 h-3.5 text-[#facc15]" />
              Itens Raros & Lendários
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-[#141b14] border-b border-[#2b3d2b]">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por monstro (ex: Demon) ou item de loot (ex: Boots of Haste)..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0e140f] border border-[#2b3d2b] rounded text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#facc15]"
            />
          </div>
        </div>

        {/* Monsters Grid */}
        <div className="p-4 bg-[#0e140f] space-y-4">
          {loading ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              Carregando bestiário de monstros e drops...
            </div>
          ) : filteredMonsters.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              Nenhum monstro ou item encontrado com o termo "{search}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMonsters.map((m, idx) => (
                <div key={idx} className="p-4 bg-[#141d15] border border-[#273d29] hover:border-[#facc15]/60 rounded-lg transition-all space-y-3">
                  {/* Monster Header */}
                  <div className="flex items-start justify-between border-b border-[#223624] pb-2.5">
                    <div>
                      <h4 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-[#facc15]" />
                        {m.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-rose-400 font-mono font-bold">
                          HP: {m.hp.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-emerald-400 font-mono font-bold">
                          EXP: {m.exp.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {m.elements && (
                      <div className="text-right text-[11px] space-y-0.5">
                        {m.elements.weak && (
                          <span className="block text-emerald-400">
                            Fraco: <b className="text-neutral-200">{m.elements.weak}</b>
                          </span>
                        )}
                        {m.elements.strong && (
                          <span className="block text-rose-400">
                            Forte: <b className="text-neutral-200">{m.elements.strong}</b>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Loot List */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1.5">
                      Tabela de Loot & Drops:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.drops.map((drop, dIdx) => (
                        <span
                          key={dIdx}
                          className={`px-2 py-1 rounded text-xs flex items-center gap-1.5 border ${
                            drop.rare
                              ? 'bg-amber-950/60 border-amber-600/80 text-amber-200 font-bold shadow-sm'
                              : 'bg-[#0f1710] border-[#223624] text-neutral-300'
                          }`}
                        >
                          {drop.rare && <Gem className="w-3 h-3 text-[#facc15] shrink-0" />}
                          <span>{drop.item}</span>
                          <span className="text-[10px] font-mono opacity-75">
                            ({drop.chance})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#141b14] border-t border-[#2b3d2b] flex items-center justify-between text-xs text-neutral-400">
          <span>Bestiário sincronizado com o data/monster do TFS 1.5 Styller</span>
          <span className="text-neutral-500">Taxa de Loot global multiplicada por 3.0x</span>
        </div>
      </div>
    </div>
  );
};
