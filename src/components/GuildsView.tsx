import React, { useState, useEffect } from 'react';
import { Users, Shield, Crown, Calendar, MessageSquare, Search, RefreshCw } from 'lucide-react';
import { GuildRecord } from '../types';

interface GuildsViewProps {
  onSelectCharacter?: (name: string) => void;
}

export const GuildsView: React.FC<GuildsViewProps> = ({ onSelectCharacter }) => {
  const [guilds, setGuilds] = useState<GuildRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchGuilds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/guilds');
      if (res.ok) {
        const data = await res.json();
        setGuilds(data);
      }
    } catch (err) {
      console.error('Falha ao buscar guildas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuilds();
  }, []);

  const filtered = guilds.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.leaderName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2b3d2b] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-lg text-[#facc15]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-[#facc15] font-serif uppercase">
                Guildas do Servidor (Guilds System)
              </h2>
              <p className="text-xs text-neutral-400">
                Alianças, clãs e equipes dominantes no MarleyOT 8.60
              </p>
            </div>
          </div>
          <button
            onClick={fetchGuilds}
            disabled={loading}
            className="px-3 py-1.5 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded border border-[#3b7347] text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Guildas
          </button>
        </div>

        {/* Busca e Informações */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por guild ou líder..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0d120e] border border-[#2b3d2b] rounded text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#facc15]"
            />
          </div>

          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <span className="font-bold text-[#facc15]">{guilds.length}</span> guildas ativas
          </div>
        </div>
      </div>

      {/* Lista de Guildas */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-4 py-2.5 border-b border-[#2b3d2b] flex justify-between items-center text-xs font-bold text-[#facc15]">
          <span>Guildas Registradas</span>
          <span className="text-neutral-400 font-normal">Organizadas por força & membros</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-neutral-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#facc15]" />
            Carregando alianças do MariaDB...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-xs">
            Nenhuma guilda encontrada.
          </div>
        ) : (
          <div className="divide-y divide-[#1e291e]">
            {filtered.map((guild, idx) => (
              <div
                key={guild.id}
                className="p-4 hover:bg-[#162117] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1c2c1e] to-[#0f1810] border border-[#2e4732] flex items-center justify-center text-[#facc15] font-black text-sm font-serif shrink-0">
                    #{idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-[#facc15] font-serif">
                        {guild.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-[#1b2b1d] border border-[#2e4732] text-[10px] font-bold text-emerald-400 rounded-full flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {guild.memberCount} membro(s)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-[#facc15]" />
                        Líder:{' '}
                        <button
                          onClick={() => onSelectCharacter && onSelectCharacter(guild.leaderName)}
                          className="font-bold text-neutral-200 hover:text-[#facc15] hover:underline"
                        >
                          {guild.leaderName}
                        </button>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                        <Calendar className="w-3 h-3" />
                        Fundada em {guild.creationDate}
                      </span>
                    </div>

                    {guild.motd && (
                      <p className="text-neutral-400 text-xs mt-1.5 flex items-start gap-1.5 italic bg-[#0d120e] p-2 rounded border border-[#1e291e]">
                        <MessageSquare className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                        "{guild.motd}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="self-end md:self-center">
                  <span className="px-2.5 py-1 bg-[#14532d]/40 border border-[#22c55e]/50 text-[#86efac] text-xs font-bold rounded">
                    Ativa in-game
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
