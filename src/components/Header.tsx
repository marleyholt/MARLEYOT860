import React from 'react';
import { Sparkles, Crown } from 'lucide-react';

interface HeaderProps {
  serverName: string;
  ip: string;
  serverIconUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ serverName, ip, serverIconUrl }) => {
  return (
    <header className="relative w-full border-b-4 border-[#2b3d2b] shadow-2xl bg-[#0a0f0b]">
      {/* Flag Stripes Top Accent (Jamaica Colors) */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#15803d]"></div>
        <div className="flex-1 bg-[#eab308]"></div>
        <div className="flex-1 bg-[#dc2626]"></div>
        <div className="flex-1 bg-[#0a0f0b]"></div>
      </div>

      {/* Main Banner Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Logo Style */}
        <div className="flex items-center gap-4 text-center md:text-left">
          {/* Custom Emblem / Icon Badge */}
          <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[#1b4324] via-[#24542c] to-[#121612] border-2 border-[#eab308] flex items-center justify-center shadow-lg shadow-emerald-950/60 shrink-0 overflow-hidden">
            {serverIconUrl ? (
              <img 
                src={serverIconUrl} 
                alt="Logo do Servidor" 
                className="w-12 h-12 object-contain drop-shadow" 
              />
            ) : (
              <Crown className="w-9 h-9 text-[#facc15] drop-shadow-md" />
            )}
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-[#dc2626] border border-[#fef08a] rounded text-[9px] font-black text-white uppercase">
              8.60
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5 justify-center md:justify-start">
              {/* Ícone na lateral esquerda do nome no título */}
              {serverIconUrl && (
                <img 
                  src={serverIconUrl} 
                  alt="Ícone" 
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-md border border-[#facc15]/80 bg-[#121a13] p-0.5 shadow shrink-0" 
                />
              )}
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-[#facc15] font-serif uppercase drop-shadow">
                {serverName}
              </h1>
              <span className="px-2 py-0.5 rounded bg-[#16a34a] text-neutral-950 text-[10px] font-black tracking-widest uppercase shadow">
                TFS 1.5
              </span>
            </div>
            <p className="text-xs text-neutral-300 font-medium">
              Styller Yourots Clássico &bull; ZnoteAAC-2 Portal Oficial
            </p>
          </div>
        </div>

        {/* Quick Connect Pill */}
        <div className="bg-[#121a13] border border-[#263e29] rounded-lg px-4 py-2 flex items-center gap-3 text-xs shadow-inner">
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-bold text-neutral-400">Servidor Online</span>
            <span className="font-mono text-[#facc15] font-bold">{ip}:7171</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse"></div>
        </div>
      </div>
    </header>
  );
};
