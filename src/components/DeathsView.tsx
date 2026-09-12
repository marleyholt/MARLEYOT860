import React, { useState, useEffect } from 'react';
import { Skull, Search, Swords, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { DeathRecord, PageId } from '../types';

interface DeathsViewProps {
  onSelectCharacter?: (name: string) => void;
}

export const DeathsView: React.FC<DeathsViewProps> = ({ onSelectCharacter }) => {
  const [deaths, setDeaths] = useState<DeathRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pvp' | 'pvm'>('all');

  const fetchDeaths = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/deaths');
      if (res.ok) {
        const data = await res.json();
        setDeaths(data);
      }
    } catch (err) {
      console.error('Falha ao carregar mortes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeaths();
  }, []);

  const filtered = deaths.filter(d => {
    const matchSearch = d.victim.toLowerCase().includes(search.toLowerCase()) ||
                        d.killer.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filterType === 'pvp') return d.isPlayer;
    if (filterType === 'pvm') return !d.isPlayer;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header do Sistema */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2b3d2b] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-500">
              <Skull className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-[#facc15] font-serif uppercase">
                Últimas Mortes (Latest Deaths)
              </h2>
              <p className="text-xs text-neutral-400">
                Registro em tempo real de fatalidades em PvP e PvM no MarleyOT 8.60
              </p>
            </div>
          </div>
          <button
            onClick={fetchDeaths}
            disabled={loading}
            className="px-3 py-1.5 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded border border-[#3b7347] text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Filtros e Busca */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por vítima ou algoz..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0d120e] border border-[#2b3d2b] rounded text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#facc15]"
            />
          </div>

          <div className="flex gap-1.5 bg-[#0d120e] p-1 border border-[#2b3d2b] rounded">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1 text-[11px] font-bold rounded transition-colors ${
                filterType === 'all' ? 'bg-[#1b4324] text-[#facc15]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('pvp')}
              className={`flex-1 py-1 text-[11px] font-bold rounded transition-colors ${
                filterType === 'pvp' ? 'bg-rose-950 text-rose-300' : 'text-neutral-400 hover:text-white'
              }`}
            >
              PvP
            </button>
            <button
              onClick={() => setFilterType('pvm')}
              className={`flex-1 py-1 text-[11px] font-bold rounded transition-colors ${
                filterType === 'pvm' ? 'bg-amber-950 text-amber-300' : 'text-neutral-400 hover:text-white'
              }`}
            >
              PvM
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Mortes */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-4 py-2.5 border-b border-[#2b3d2b] flex justify-between items-center text-xs font-bold text-[#facc15]">
          <span>Histórico de Combate</span>
          <span className="text-neutral-400 font-normal">{filtered.length} registro(s)</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-neutral-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#facc15]" />
            Carregando fatalidades do MariaDB...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-xs">
            Nenhuma morte encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-[#1e291e]">
            {filtered.map((death) => (
              <div
                key={death.id}
                className="p-3.5 hover:bg-[#162117] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full border ${death.isPlayer ? 'bg-rose-950/60 border-rose-700 text-rose-400' : 'bg-amber-950/60 border-amber-700 text-amber-400'}`}>
                    {death.isPlayer ? <Swords className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectCharacter && onSelectCharacter(death.victim)}
                        className="font-bold text-[#facc15] hover:underline cursor-pointer"
                      >
                        {death.victim}
                      </button>
                      <span className="px-1.5 py-0.2 bg-[#1b2b1d] border border-[#2e4732] text-[10px] font-mono rounded text-neutral-300">
                        Level {death.level}
                      </span>
                    </div>

                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Morto no level {death.level} por{' '}
                      <span className={`font-semibold ${death.isPlayer ? 'text-rose-400' : 'text-neutral-200'}`}>
                        {death.killer}
                      </span>
                      {death.isPlayer && (
                        <span className="ml-1.5 px-1 py-0.2 rounded bg-rose-900/60 text-rose-300 text-[9px] uppercase font-bold">
                          PvP Frag
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] self-end sm:self-center">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{death.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
