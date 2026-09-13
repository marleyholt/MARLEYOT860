import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Sparkles, Flame, Shield, Heart } from 'lucide-react';
import { PageId } from '../types';

interface Spell {
  name: string;
  words: string;
  level: number;
  mana: number;
  vocation: string;
  premium: boolean;
  type: string;
}

interface SpellsViewProps {
  onNavigate?: (page: PageId) => void;
}

export const SpellsView: React.FC<SpellsViewProps> = () => {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vocFilter, setVocFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetch('/api/spells')
      .then(r => r.json())
      .then(data => {
        setSpells(Array.isArray(data) ? data : []);
      })
      .catch(e => console.error('Erro ao carregar spells:', e))
      .finally(() => setLoading(false));
  }, []);

  const filteredSpells = spells.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.words.toLowerCase().includes(search.toLowerCase());
    const matchVoc = vocFilter === 'all' || s.vocation.toLowerCase().includes(vocFilter.toLowerCase());
    const matchType = typeFilter === 'all' || s.type.toLowerCase() === typeFilter.toLowerCase();
    return matchSearch && matchVoc && matchType;
  });

  const getVocationBadge = (voc: string) => {
    const v = voc.toLowerCase();
    if (v.includes('sorcerer')) {
      return 'bg-purple-950/80 text-purple-300 border-purple-800';
    } else if (v.includes('druid')) {
      return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
    } else if (v.includes('paladin')) {
      return 'bg-amber-950/80 text-amber-300 border-amber-800';
    } else if (v.includes('knight')) {
      return 'bg-rose-950/80 text-rose-300 border-rose-800';
    }
    return 'bg-neutral-800 text-neutral-300 border-neutral-700';
  };

  const getTypeBadge = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('ataque') || t.includes('attack')) {
      return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
    } else if (t.includes('cura') || t.includes('healing')) {
      return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
    } else if (t.includes('suporte') || t.includes('support')) {
      return 'text-sky-400 bg-sky-950/40 border-sky-800/60';
    }
    return 'text-neutral-300 bg-neutral-900 border-neutral-700';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#14381c] via-[#24542c] to-[#14381c] px-6 py-4 border-b border-[#3b7347] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#102416] border border-[#22c55e] rounded-lg">
              <BookOpen className="w-6 h-6 text-[#facc15]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#facc15] font-serif uppercase tracking-wider">
                  Grimório de Magias & Feitiços
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#16a34a] text-neutral-950 text-[10px] font-black uppercase">
                  {spells.length} Magias
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Consulte todas as palavras de conjuração, requisitos de mana e nível para sua vocação no MarleyOT 8.60.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-300 bg-[#0e140f] px-3 py-1.5 rounded border border-[#263a29] flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#facc15]" />
              Fórmula Clássica 8.60
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-[#141b14] border-b border-[#2b3d2b] space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por magia ou palavras mágicas (ex: exori, exura)..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#0e140f] border border-[#2b3d2b] rounded text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#facc15]"
              />
            </div>

            {/* Vocation Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'Todas as Vocações' },
                { id: 'sorcerer', label: 'Sorcerers' },
                { id: 'druid', label: 'Druids' },
                { id: 'paladin', label: 'Paladins' },
                { id: 'knight', label: 'Knights' }
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setVocFilter(v.id)}
                  className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-all ${
                    vocFilter === v.id
                      ? 'bg-[#facc15] text-neutral-950 font-black shadow'
                      : 'bg-[#0e140f] text-neutral-400 hover:text-neutral-200 border border-[#2b3d2b]'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter Sub-tabs */}
          <div className="flex items-center gap-2 pt-1 border-t border-[#1e291e] text-xs">
            <span className="text-neutral-400 font-bold uppercase text-[10px]">Tipo de Magia:</span>
            {[
              { id: 'all', label: 'Todas' },
              { id: 'Ataque', label: 'Ataque' },
              { id: 'Cura', label: 'Cura & Suporte' },
              { id: 'Suporte', label: 'Utilidade & Luz' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  typeFilter === t.id
                    ? 'bg-[#24542c] text-[#facc15] font-bold border border-[#3b7347]'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spells Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#172318] text-neutral-400 font-serif uppercase text-[10px] tracking-wider border-b border-[#2b3d2b]">
              <tr>
                <th className="py-3 px-4">Nome da Magia</th>
                <th className="py-3 px-4">Palavras Mágicas</th>
                <th className="py-3 px-4">Vocação</th>
                <th className="py-3 px-4 text-center">Nível</th>
                <th className="py-3 px-4 text-center">Mana</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4 text-center">Conta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e291e] bg-[#0e140f]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 text-xs">
                    Carregando o grimório de magias do servidor...
                  </td>
                </tr>
              ) : filteredSpells.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 text-xs">
                    Nenhuma magia encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredSpells.map((spell, idx) => (
                  <tr key={idx} className="hover:bg-[#182319] transition-colors">
                    <td className="py-3 px-4 font-bold text-neutral-100 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#facc15] shrink-0" />
                      {spell.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-bold text-[#facc15] bg-[#162217] px-2 py-0.5 rounded border border-[#2b3d2b]">
                        "{spell.words}"
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getVocationBadge(spell.vocation)}`}>
                        {spell.vocation}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                      {spell.level}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-sky-400">
                      {spell.mana}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeBadge(spell.type)}`}>
                        {spell.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {spell.premium ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                          VIP
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px]">
                          Free
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#141b14] border-t border-[#2b3d2b] flex items-center justify-between text-xs text-neutral-400">
          <span>Exibindo {filteredSpells.length} magias registradas</span>
          <span className="text-neutral-500">Todas as magias podem ser aprendidas nos NPCs de Spells em Styller City</span>
        </div>
      </div>
    </div>
  );
};
