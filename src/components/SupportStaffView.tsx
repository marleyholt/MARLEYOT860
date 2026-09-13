import React, { useState, useEffect } from 'react';
import { Shield, Users, MessageSquare, AlertTriangle, CheckCircle, HelpCircle, HeartHandshake } from 'lucide-react';
import { PageId } from '../types';

interface StaffMember {
  name: string;
  role: string;
  group: number;
  contact?: string;
  description: string;
}

interface SupportStaffViewProps {
  onNavigate?: (page: PageId) => void;
}

export const SupportStaffView: React.FC<SupportStaffViewProps> = ({ onNavigate }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/support')
      .then(r => r.json())
      .then(data => {
        setStaff(Array.isArray(data) ? data : []);
      })
      .catch(e => console.error('Erro ao carregar equipe:', e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#14381c] via-[#24542c] to-[#14381c] px-6 py-4 border-b border-[#3b7347] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#102416] border border-[#22c55e] rounded-lg">
              <Shield className="w-6 h-6 text-[#facc15]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#facc15] font-serif uppercase tracking-wider">
                  Equipe do Servidor &bull; Staff MarleyOT
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#16a34a] text-neutral-950 text-[10px] font-black uppercase">
                  Oficial
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Conheça os membros dedicados à moderação, desenvolvimento e suporte da comunidade no MarleyOT 8.60.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-300 bg-[#0e140f] px-3 py-1.5 rounded border border-[#263a29] flex items-center gap-1.5 font-bold">
              <HeartHandshake className="w-3.5 h-3.5 text-[#22c55e]" />
              Suporte In-Game
            </span>
          </div>
        </div>

        {/* Staff Members Cards */}
        <div className="p-6 bg-[#0e140f] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-3 py-10 text-center text-xs text-neutral-400">
                Carregando membros da equipe...
              </div>
            ) : (
              staff.map((member, idx) => (
                <div 
                  key={idx} 
                  className={`p-5 rounded-lg border transition-all space-y-3 ${
                    member.group >= 5
                      ? 'bg-gradient-to-b from-[#221c10] to-[#16120b] border-[#eab308]/70 shadow-lg'
                      : member.group >= 4
                      ? 'bg-[#151c16] border-[#2e4d33]'
                      : 'bg-[#121612] border-[#223324]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                      member.group >= 5
                        ? 'bg-amber-950 text-[#facc15] border-[#facc15]/80'
                        : member.group >= 4
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {member.role}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block shadow-sm"></span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                      <Shield className={`w-4 h-4 ${member.group >= 5 ? 'text-[#facc15]' : 'text-neutral-400'}`} />
                      {member.name}
                    </h4>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      {member.description}
                    </p>
                  </div>

                  {member.contact && (
                    <div className="pt-2 border-t border-white/5 text-[11px] text-neutral-400">
                      <span className="text-neutral-500 font-medium">Contato:</span>{' '}
                      <span className="font-mono text-neutral-300">{member.contact}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Support Guidelines Box */}
          <div className="mt-6 p-5 bg-[#151f16] border border-[#2b442e] rounded-lg space-y-3">
            <h4 className="text-sm font-bold text-[#facc15] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#22c55e]" />
              Diretrizes de Atendimento & Regras do Suporte
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-300">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
                  <span>
                    <b>Canal Help In-Game:</b> Abra a janela de canais (Ctrl+O) e selecione o canal <b>Help</b> para tirar dúvidas sobre quests, magias e sistemas.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
                  <span>
                    <b>Report de Bugs:</b> Use o sistema de tickets ou envie mensagem direta para a staff com detalhes de coordenadas e passos para reproduzir o bug.
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <b>Membros da Staff nunca pedirão sua senha:</b> Jamais compartilhe seus dados de login com ninguém, nem mesmo com membros da equipe.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <b>Proibido pedir itens ou teleportes:</b> A equipe não doa itens, dinheiro ou níveis a nenhum jogador para manter o equilíbrio justo do jogo.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#141b14] border-t border-[#2b3d2b] flex items-center justify-between text-xs text-neutral-400">
          <span>Horário de Atendimento da Staff: Todos os dias das 10:00 às 22:00</span>
          <span className="text-neutral-500">MarleyOT 8.60 Server</span>
        </div>
      </div>
    </div>
  );
};
