import React, { useState, useEffect } from 'react';
import { ShoppingCart, Coins, ShieldCheck, Sparkles, Check, Gift, HeartHandshake, Copy } from 'lucide-react';
import { ShopOffer } from '../types';

export const ShopView: React.FC = () => {
  const [offers, setOffers] = useState<ShopOffer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vip' | 'items' | 'runes'>('all');
  const [copiedPix, setCopiedPix] = useState(false);

  useEffect(() => {
    fetch('/api/shop/offers')
      .then(res => res.json())
      .then(data => setOffers(data))
      .catch(() => {});
  }, []);

  const handleCopyPix = () => {
    navigator.clipboard.writeText('doacoes@marleyot.duckdns.org');
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const filtered = offers.filter(o => selectedCategory === 'all' || o.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2b3d2b] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-lg text-[#facc15]">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-[#facc15] font-serif uppercase">
                Shop & Doações VIP (MarleyOT Store)
              </h2>
              <p className="text-xs text-neutral-400">
                Ajude a manter a infraestrutura Oracle Cloud dedicada e receba pontos e vantagens in-game
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs font-bold rounded flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Seguro & Automático
            </span>
          </div>
        </div>

        {/* Informações de Doação Pix */}
        <div className="mt-4 p-4 bg-gradient-to-r from-[#142316] via-[#101b12] to-[#121612] border border-[#2e4732] rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#facc15] flex items-center gap-1.5">
              <Gift className="w-4 h-4" />
              Chave Pix Oficial para Doação:
            </span>
            <p className="font-mono text-sm text-neutral-200 mt-1 font-bold">
              doacoes@marleyot.duckdns.org
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              R$ 1,00 = 1 Ponto no Shop. Envie o comprovante via ticket no Helpdesk ou WhatsApp do GM.
            </p>
          </div>

          <button
            onClick={handleCopyPix}
            className="px-4 py-2 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded border border-[#3b7347] font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow"
          >
            <Copy className="w-3.5 h-3.5" />
            {copiedPix ? 'Chave Copiada!' : 'Copiar Chave Pix'}
          </button>
        </div>

        {/* Filtro de Categorias */}
        <div className="flex gap-2 mt-4 pt-2 border-t border-[#1e291e]">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              selectedCategory === 'all' ? 'bg-[#1b4324] text-[#facc15]' : 'bg-[#0d120e] text-neutral-400 hover:text-white'
            }`}
          >
            Todos os Pacotes
          </button>
          <button
            onClick={() => setSelectedCategory('vip')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              selectedCategory === 'vip' ? 'bg-[#1b4324] text-[#facc15]' : 'bg-[#0d120e] text-neutral-400 hover:text-white'
            }`}
          >
            Dias VIP & Acessos
          </button>
          <button
            onClick={() => setSelectedCategory('items')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              selectedCategory === 'items' ? 'bg-[#1b4324] text-[#facc15]' : 'bg-[#0d120e] text-neutral-400 hover:text-white'
            }`}
          >
            Equipamentos Raros
          </button>
          <button
            onClick={() => setSelectedCategory('runes')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              selectedCategory === 'runes' ? 'bg-[#1b4324] text-[#facc15]' : 'bg-[#0d120e] text-neutral-400 hover:text-white'
            }`}
          >
            Runas & Suprimentos
          </button>
        </div>
      </div>

      {/* Grid de Ofertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((offer) => (
          <div
            key={offer.id}
            className="bg-[#121612] border-2 border-[#2b3d2b] hover:border-[#3d5a3f] rounded-lg p-4 shadow-xl flex flex-col justify-between space-y-4 transition-all"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-sm font-black text-[#facc15] font-serif">
                  {offer.title}
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-[#facc15] font-mono text-xs font-bold shrink-0">
                  {offer.points} Pontos
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {offer.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#1e291e] flex justify-between items-center text-xs">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
                {offer.category}
              </span>
              <button
                onClick={() => alert(`Para resgatar "${offer.title}", adquira pontos via Pix e digite !shopbuy no jogo ou contate o GM.`)}
                className="px-3 py-1.5 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded border border-[#3b7347] font-bold text-xs transition-colors"
              >
                Como Resgatar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
