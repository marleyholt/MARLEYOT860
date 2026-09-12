import React, { useState, useEffect } from 'react';
import { User, Shield, Trophy, MapPin, Skull, Search, Coins, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { CharacterDetail } from '../types';

interface CharacterProfileViewProps {
  initialCharName?: string;
  onSelectCharacter?: (name: string) => void;
}

export const CharacterProfileView: React.FC<CharacterProfileViewProps> = ({
  initialCharName = 'Marley Sorcerer',
  onSelectCharacter
}) => {
  const [searchTerm, setSearchTerm] = useState(initialCharName);
  const [charData, setCharData] = useState<CharacterDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacter = async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/character/${encodeURIComponent(name.trim())}`);
      if (!res.ok) {
        throw new Error('Personagem não encontrado ou inexistente no banco');
      }
      const data = await res.json();
      setCharData(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar perfil');
      setCharData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCharName) {
      setSearchTerm(initialCharName);
      fetchCharacter(initialCharName);
    }
  }, [initialCharName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCharacter(searchTerm);
  };

  return (
    <div className="space-y-6">
      {/* Busca de Personagem */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-5 shadow-xl">
        <div className="flex items-center gap-3 border-b border-[#2b3d2b] pb-4 mb-4">
          <div className="p-2.5 bg-sky-950/40 border border-sky-800/60 rounded-lg text-sky-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wide text-[#facc15] font-serif uppercase">
              Consulta de Personagem (Character Search)
            </h2>
            <p className="text-xs text-neutral-400">
              Verifique status, level, histórico de mortes e guilda de qualquer jogador
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Digite o nome do personagem (ex: Marley Sorcerer)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-[#0d120e] border border-[#2b3d2b] rounded text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#facc15]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded border border-[#3b7347] font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {error && (
          <div className="mt-3 p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded">
            {error}
          </div>
        )}
      </div>

      {/* Detalhes do Personagem */}
      {charData && (
        <div className="space-y-6">
          <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#2b3d2b] pb-4">
              <div>
                <h3 className="text-2xl font-black text-[#facc15] font-serif flex items-center gap-2">
                  {charData.name}
                  {charData.online ? (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-sans font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Online
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-400 font-sans font-bold flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Offline
                    </span>
                  )}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {charData.vocation} &bull; {charData.groupName}
                </p>
              </div>

              <div className="bg-[#0d120e] px-3.5 py-1.5 rounded border border-[#2b3d2b] text-right">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-bold">
                  Último Login
                </span>
                <span className="text-xs font-mono text-neutral-200">{charData.lastlogin}</span>
              </div>
            </div>

            {/* Atributos Básicos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="p-3 bg-[#0d120e] border border-[#1e291e] rounded">
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Level</span>
                <span className="text-lg font-black text-[#facc15] font-serif">{charData.level}</span>
              </div>

              <div className="p-3 bg-[#0d120e] border border-[#1e291e] rounded">
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Magic Level</span>
                <span className="text-lg font-black text-sky-400 font-serif">{charData.maglevel}</span>
              </div>

              <div className="p-3 bg-[#0d120e] border border-[#1e291e] rounded">
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Cidade Natal</span>
                <span className="text-sm font-bold text-neutral-200">{charData.town}</span>
              </div>

              <div className="p-3 bg-[#0d120e] border border-[#1e291e] rounded">
                <span className="text-neutral-500 block text-[10px] uppercase font-bold">Saldo Bancário</span>
                <span className="text-sm font-mono text-[#facc15] font-bold">
                  {charData.balance.toLocaleString()} gps
                </span>
              </div>
            </div>

            {/* Guild Info */}
            {charData.guildName && (
              <div className="mt-4 p-3.5 bg-[#0d120e] border border-[#253526] rounded flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#facc15]" />
                  <span className="text-neutral-400">Membro da Guilda:</span>
                  <span className="font-bold text-[#facc15]">{charData.guildName}</span>
                </div>
                <span className="px-2 py-0.5 bg-[#1b2b1d] border border-[#2e4732] text-[11px] rounded text-emerald-300 font-semibold">
                  Rank: {charData.guildRank || 'Membro'}
                </span>
              </div>
            )}
          </div>

          {/* Histórico de Mortes do Personagem */}
          <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-4 py-2.5 border-b border-[#2b3d2b] flex items-center gap-2 text-xs font-bold text-[#facc15]">
              <Skull className="w-4 h-4 text-rose-500" />
              <span>Histórico de Mortes de {charData.name}</span>
            </div>

            {charData.deaths.length === 0 ? (
              <div className="p-6 text-center text-neutral-400 text-xs">
                Este personagem ainda não possui mortes registradas no servidor! Um verdadeiro guerreiro.
              </div>
            ) : (
              <div className="divide-y divide-[#1e291e]">
                {charData.deaths.map((death: any) => (
                  <div key={death.id} className="p-3 flex items-center justify-between text-xs hover:bg-[#162117]">
                    <div>
                      <span className="text-neutral-300 font-medium">
                        Morto no level <strong className="text-[#facc15]">{death.level}</strong> por{' '}
                        <strong className={death.isPlayer ? 'text-rose-400' : 'text-neutral-100'}>
                          {death.killer}
                        </strong>
                      </span>
                      {death.isPlayer && (
                        <span className="ml-2 px-1 py-0.5 rounded bg-rose-950 border border-rose-800 text-[10px] text-rose-300 font-bold uppercase">
                          PvP
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <Clock className="w-3 h-3" />
                      <span>{death.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
