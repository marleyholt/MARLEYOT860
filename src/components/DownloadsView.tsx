import React from 'react';
import { Download, Monitor, CheckCircle, Shield, FileText, ArrowRight } from 'lucide-react';

export const DownloadsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#14381c] via-[#24542c] to-[#14381c] px-6 py-4 border-b border-[#3b7347] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#102416] border border-[#facc15] rounded">
              <Download className="w-5 h-5 text-[#facc15]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#facc15] font-serif uppercase tracking-wider">
                Downloads &bull; Clientes MarleyOT 8.60
              </h2>
              <p className="text-xs text-neutral-300">
                Baixe o cliente oficial e comece a jogar em instantes
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Opção 1: OTClientV8 Customizado */}
          <div className="p-5 bg-[#0e140f] border-2 border-[#26442c] rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#22c55e] transition-colors">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16a34a] text-neutral-950 uppercase">
                  Recomendado
                </span>
                <h3 className="text-base font-bold text-neutral-100">
                  MarleyOT Client V8 (Com Bot & Sound Nativo)
                </h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Cliente moderno acelerado por OpenGL/DirectX, com vBot embutido, luzes suaves, efeitos sonoros opcionais e configuração de IP automática. Basta extrair e clicar em Jogar!
              </p>
              <div className="flex flex-wrap gap-3 text-[11px] text-neutral-400 pt-1">
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-[#22c55e]" /> Windows 10/11</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-[#22c55e]" /> 60 FPS Estáveis</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-[#22c55e]" /> Sem necessidade de IP Changer</span>
              </div>
            </div>

            <a
              id="download-otclient-btn"
              href="http://marleyot.duckdns.org/downloads/MarleyOT-ClientV8.zip"
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#16a34a] to-[#22c55e] hover:brightness-110 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded shadow border border-[#86efac] flex items-center justify-center gap-2 shrink-0 transition-all"
            >
              <Download className="w-4 h-4" />
              Download OTClient (.ZIP)
            </a>
          </div>

          {/* Opção 2: Cliente Clássico 8.60 */}
          <div className="p-5 bg-[#0e140f] border border-[#213323] rounded-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-base font-bold text-neutral-100">
                Cliente Tibia 8.60 Clássico (Original CipSoft)
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Para quem prefere a experiência 100% nostálgica clássica. Requer um IP Changer configurado para o host <code className="text-[#facc15] font-mono">marleyot.duckdns.org</code> na porta <code className="text-[#facc15] font-mono">7171</code>.
              </p>
            </div>

            <a
              id="download-classic-btn"
              href="https://static.tibia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-6 py-2.5 bg-[#172318] hover:bg-[#203322] text-neutral-200 font-bold text-xs uppercase tracking-wider rounded border border-[#2b442d] flex items-center justify-center gap-2 shrink-0 transition-all"
            >
              <Download className="w-4 h-4 text-neutral-400" />
              Download Cliente Clássico
            </a>
          </div>

          {/* Instruções de Instalação */}
          <div className="p-4 bg-[#0a0f0b] rounded border border-[#1e2a1f] space-y-2">
            <h4 className="text-xs font-bold text-[#facc15] uppercase tracking-wider font-serif">
              Como começar a jogar:
            </h4>
            <ol className="list-decimal list-inside text-xs text-neutral-300 space-y-1 pl-1">
              <li>Crie sua conta aqui no portal na aba <strong className="text-neutral-100">Criar Conta</strong>.</li>
              <li>Baixe o cliente acima e extraia em qualquer pasta do seu computador.</li>
              <li>Execute o inicializador e digite o número da sua conta e senha para entrar!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
