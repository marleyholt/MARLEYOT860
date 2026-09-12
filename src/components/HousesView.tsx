import React, { useState, useEffect } from 'react';
import { Home as HouseIcon, MapPin, Search, Coins, User, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { HouseRecord } from '../types';

interface HousesViewProps {
  onSelectCharacter?: (name: string) => void;
}

export const HousesView: React.FC<HousesViewProps> = ({ onSelectCharacter }) => {
  const [houses, setHouses] = useState<HouseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTown, setSelectedTown] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'rented' | 'empty'>('all');
  const [search, setSearch] = useState('');

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/houses');
      if (res.ok) {
        const data = await res.json();
        setHouses(data);
      }
    } catch (err) {
      console.error('Falha ao buscar casas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const towns = Array.from(new Set(houses.map(h => h.townName)));

  const filtered = houses.filter(h => {
    if (selectedTown !== 'all' && h.townName !== selectedTown) return false;
    if (statusFilter === 'rented' && !h.isRented) return false;
    if (statusFilter === 'empty' && h.isRented) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !(h.ownerName?.toLowerCase().includes(search.toLowerCase()))) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2b3d2b] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-400">
              <HouseIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-[#facc15] font-serif uppercase">
                Sistema de Casas (House System)
              </h2>
              <p className="text-xs text-neutral-400">
                Residências, guild halls e imóveis disponíveis no mapa de Styller e arredores
              </p>
            </div>
          </div>
          <button
            onClick={fetchHouses}
            disabled={loading}
            className="px-3 py-1.5 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded border border-[#3b7347] text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Imóveis
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <label className="block text-[11px] font-bold text-neutral-400 mb-1">Cidade / Região:</label>
            <select
              value={selectedTown}
              onChange={e => setSelectedTown(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d120e] border border-[#2b3d2b] rounded text-xs text-neutral-200 focus:outline-none focus:border-[#facc15]"
            >
              <option value="all">Todas as Cidades</option>
              {towns.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-400 mb-1">Status de Ocupação:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#0d120e] border border-[#2b3d2b] rounded text-xs text-neutral-200 focus:outline-none focus:border-[#facc15]"
            >
              <option value="all">Todas as Casas</option>
              <option value="empty">Disponíveis / Desocupadas (Vagas)</option>
              <option value="rented">Alugadas (Ocupadas)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-400 mb-1">Filtrar por Nome / Dono:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Ex: Styller, Marley..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#0d120e] border border-[#2b3d2b] rounded text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#facc15]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Casas */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-4 py-2.5 border-b border-[#2b3d2b] flex justify-between items-center text-xs font-bold text-[#facc15]">
          <span>Lista de Casas Registradas</span>
          <span className="text-neutral-400 font-normal">{filtered.length} imóvel(is) exibido(s)</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-neutral-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#facc15]" />
            Carregando catálogo de casas...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-xs">
            Nenhuma casa encontrada para os critérios selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {filtered.map((house) => (
              <div
                key={house.id}
                className="bg-[#0d120e] border border-[#253526] hover:border-[#3d5a3f] rounded-lg p-4 transition-all shadow-md space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#facc15] font-serif flex items-center gap-1.5">
                      <HouseIcon className="w-4 h-4 text-emerald-400" />
                      {house.name}
                    </h3>
                    <div className="flex items-center gap-1 text-neutral-400 text-[11px] mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>{house.townName}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      house.isRented
                        ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                        : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    }`}
                  >
                    {house.isRented ? 'Ocupada' : 'Disponível'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#1e291e] text-[11px]">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Tamanho:</span>
                    <span className="font-semibold text-neutral-200">{house.size} sqm</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Camas:</span>
                    <span className="font-semibold text-neutral-200">{house.beds} cama(s)</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Aluguel:</span>
                    <span className="font-mono text-[#facc15] font-bold">{house.rent.toLocaleString()} gps</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-neutral-400 text-[11px]">Proprietário:</span>
                    {house.ownerName ? (
                      <button
                        onClick={() => onSelectCharacter && onSelectCharacter(house.ownerName!)}
                        className="text-[#facc15] hover:underline font-bold text-[11px]"
                      >
                        {house.ownerName}
                      </button>
                    ) : (
                      <span className="text-neutral-500 italic text-[11px]">Nenhum (Livre para compra)</span>
                    )}
                  </div>

                  {!house.isRented && (
                    <span className="text-[10px] bg-[#14532d] text-[#86efac] px-2 py-0.5 rounded font-bold border border-[#22c55e]">
                      !buyhouse in-game
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
