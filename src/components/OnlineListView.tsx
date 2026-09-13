import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, RefreshCw, Trophy, Skull } from 'lucide-react';
import { PageId } from '../types';

interface OnlinePlayer {
  id: number;
  name: string;
  level: number;
  vocation: string;
  guildName?: string;
  skull?: number;
  groupName?: string;
}

interface OnlineListViewProps {
  onNavigate: (page: PageId) => void;
  onInspectCharacter?: (charName: string) => void;
}

export const OnlineListView: React.FC<OnlineListViewProps> = ({ onNavigate, onInspectCharacter }) => {
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vocFilter, setVocFilter] = useState('all');

  const fetchOnline = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/onlinelist');
      if (res.ok) {
        const data = await res.json();
        setPlayers(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Erro ao carregar jogadores online:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnline();
  }, []);

  const filteredPlayers = players.filter(p => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.guildName && p.guildName.toLowerCase().includes(search.toLowerCase()));
    const matchVoc = vocFilter === 'all' || p.vocation.toLowerCase().includes(vocFilter.toLowerCase());
    return matchName && matchVoc;
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#14381c] via-[#24542c] to-[#14381c] px-6 py-4 border-b border-[#3b7347] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#102416] border border-[#22c55e] rounded-lg">
              <Users className="w-6 h-6 text-[#22c55e]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#facc15] font-serif uppercase tracking-wider">
                  Jogadores Conectados
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#16a34a] text-neutral-950 text-[10px] font-black uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  {players.length} Online
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Lista em tempo real dos heróis explorando o mundo de MarleyOT 8.60 (Styller Yourots).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOnline}
              disabled={loading}
              className="px-3 py-1.5 bg-[#172619] hover:bg-[#203623] border border-[#2b3d2b] text-neutral-300 hover:text-white rounded text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#facc15]' : ''}`} />
              Atualizar
            </button>
            <span className="text-[11px] font-mono text-neutral-400 bg-[#0e140f] px-2.5 py-1 rounded border border-[#263a29]">
              marleyot.duckdns.org:7171
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-4 bg-[#141b14] border-b border-[#2b3d2b] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome do personagem ou guilda..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0e140f] border border-[#2b3d2b] rounded text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#facc15]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-neutral-400 font-bold uppercase shrink-0">Vocação:</span>
            {[
              { id: 'all', label: 'Todas' },
              { id: 'sorcerer', label: 'Sorcerers' },
              { id: 'druid', label: 'Druids' },
              { id: 'paladin', label: 'Paladins' },
              { id: 'knight', label: 'Knights' }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setVocFilter(v.id)}
                className={`px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap transition-all ${
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

        {/* Players Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#172318] text-neutral-400 font-serif uppercase text-[10px] tracking-wider border-b border-[#2b3d2b]">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Nome do Personagem</th>
                <th className="py-3 px-4">Nível</th>
                <th className="py-3 px-4">Vocação</th>
                <th className="py-3 px-4">Guilda</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e291e] bg-[#0e140f]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#facc15]" />
                      Carregando jogadores online...
                    </div>
                  </td>
                </tr>
              ) : filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs">
                    {search || vocFilter !== 'all' 
                      ? 'Nenhum jogador encontrado com os filtros informados.'
                      : 'Nenhum jogador conectado no momento. Seja o primeiro a entrar!'}
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-[#182319] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block shadow-sm shadow-emerald-500/50"></span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Online</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {player.groupName === 'GOD' && (
                          <Shield className="w-3.5 h-3.5 text-[#facc15] shrink-0" />
                        )}
                        <span className={`font-bold ${player.groupName === 'GOD' ? 'text-[#facc15]' : 'text-neutral-100'}`}>
                          {player.name}
                        </span>
                        {player.groupName === 'GOD' && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-900/80 text-rose-200 text-[9px] font-black uppercase">
                            STAFF
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        {player.level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getVocationBadge(player.vocation)}`}>
                        {player.vocation}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-neutral-300 font-medium">
                        {player.guildName || <span className="text-neutral-500 italic">Sem Guilda</span>}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (onInspectCharacter) {
                            onInspectCharacter(player.name);
                          }
                          onNavigate('character_profile');
                        }}
                        className="px-2.5 py-1 bg-[#1b2b1d] hover:bg-[#253b28] text-sky-400 hover:text-sky-300 border border-[#2b442f] rounded text-[11px] font-bold transition-colors"
                      >
                        Ver Perfil &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-[#141b14] border-t border-[#2b3d2b] flex items-center justify-between text-xs text-neutral-400">
          <span>Exibindo {filteredPlayers.length} de {players.length} jogadores conectados</span>
          <span className="text-neutral-500">Atualização automática a cada 30 segundos</span>
        </div>
      </div>
    </div>
  );
};
