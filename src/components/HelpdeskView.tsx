import React, { useState, useEffect } from 'react';
import { LifeBuoy, PlusCircle, MessageSquare, Clock, CheckCircle2, AlertCircle, RefreshCw, Send } from 'lucide-react';
import { SupportTicket } from '../types';

interface HelpdeskViewProps {
  isGM?: boolean;
}

export const HelpdeskView: React.FC<HelpdeskViewProps> = ({ isGM = false }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Form states
  const [showCreate, setShowCreate] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/helpdesk/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        if (selectedTicket) {
          const updated = data.find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Falha ao buscar chamados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/helpdesk/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authorName.trim(),
          subject: subject.trim(),
          message: message.trim()
        })
      });
      if (res.ok) {
        setShowCreate(false);
        setSubject('');
        setMessage('');
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/helpdesk/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          username: isGM ? 'GM Marley' : authorName || 'Jogador',
          message: replyText.trim(),
          status: isGM ? 'in_progress' : undefined
        })
      });
      if (res.ok) {
        setReplyText('');
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2b3d2b] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-950/40 border border-blue-800/60 rounded-lg text-blue-400">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-[#facc15] font-serif uppercase">
                Central de Suporte & Chamados (Helpdesk)
              </h2>
              <p className="text-xs text-neutral-400">
                Envie dúvidas sobre doações, reporte falhas de mapa ou requisite suporte à Staff
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-3.5 py-1.5 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-bold rounded text-xs flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              Abrir Novo Ticket
            </button>
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="px-3 py-1.5 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded border border-[#3b7347] text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Modal de Abertura */}
        {showCreate && (
          <form onSubmit={handleCreateTicket} className="mt-4 p-4 bg-[#0d120e] border border-[#2b3d2b] rounded-lg space-y-3">
            <h4 className="text-xs font-bold text-[#facc15] uppercase tracking-wider">
              Formulário de Abertura de Ticket
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Seu Nome / Char:</label>
                <input
                  type="text"
                  placeholder="Nome do seu personagem..."
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121612] border border-[#2b3d2b] rounded text-xs text-neutral-200 focus:outline-none focus:border-[#facc15]"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Assunto do Chamado:</label>
                <input
                  type="text"
                  placeholder="Ex: Dúvida sobre doação VIP"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121612] border border-[#2b3d2b] rounded text-xs text-neutral-200 focus:outline-none focus:border-[#facc15]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">Mensagem Explicativa:</label>
              <textarea
                rows={3}
                placeholder="Explique com clareza o seu problema ou dúvida..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-[#121612] border border-[#2b3d2b] rounded text-xs text-neutral-200 focus:outline-none focus:border-[#facc15]"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-3 py-1.5 bg-neutral-800 text-neutral-300 text-xs font-bold rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] text-xs font-bold rounded border border-[#3b7347]"
              >
                {submitting ? 'Enviando...' : 'Enviar Chamado'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Grid de Tickets e Detalhe */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista */}
        <div className="lg:col-span-1 bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-4 py-2.5 border-b border-[#2b3d2b] text-xs font-bold text-[#facc15] flex justify-between items-center">
            <span>Chamados Registrados</span>
            <span className="text-neutral-400 font-normal">{tickets.length}</span>
          </div>

          <div className="divide-y divide-[#1e291e] max-h-[500px] overflow-y-auto">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`w-full text-left p-3.5 transition-colors block ${
                  selectedTicket?.id === t.id ? 'bg-[#1b3b21] border-l-4 border-[#facc15]' : 'hover:bg-[#162117]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-neutral-200 text-xs truncate">{t.subject}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      t.status === 'closed'
                        ? 'bg-neutral-800 text-neutral-400'
                        : t.status === 'in_progress'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {t.status === 'closed' ? 'Fechado' : t.status === 'in_progress' ? 'Em Progresso' : 'Aberto'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500">
                  <span>Por: {t.username}</span>
                  <span>{t.creation.split(' ')[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detalhe do Chamado Selecionado */}
        <div className="lg:col-span-2 bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-5 shadow-xl flex flex-col justify-between">
          {selectedTicket ? (
            <div className="space-y-4">
              <div className="border-b border-[#2b3d2b] pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#facc15] font-serif">
                    {selectedTicket.subject}
                  </h3>
                  <span className="text-xs text-neutral-400 font-mono">
                    ID #{selectedTicket.id}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Aberto por <strong className="text-neutral-200">{selectedTicket.username}</strong> em {selectedTicket.creation}
                </p>
              </div>

              {/* Mensagem Inicial */}
              <div className="p-3.5 bg-[#0d120e] border border-[#253526] rounded text-xs text-neutral-200 leading-relaxed">
                {selectedTicket.message}
              </div>

              {/* Respostas / Histórico */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Respostas da Equipe & Jogador
                </h4>
                {selectedTicket.replies.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic p-3 bg-[#0d120e] rounded">
                    Nenhuma resposta registrada até o momento.
                  </p>
                ) : (
                  selectedTicket.replies.map((reply: any) => (
                    <div key={reply.id} className="p-3 bg-[#0d120e] border border-[#1e291e] rounded text-xs space-y-1">
                      <div className="flex justify-between text-[10px] text-neutral-400">
                        <span className="font-bold text-[#facc15]">{reply.username}</span>
                        <span>{reply.created}</span>
                      </div>
                      <p className="text-neutral-300">{reply.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Responder ao Chamado */}
              <form onSubmit={handleSendReply} className="pt-2 border-t border-[#1e291e] space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar resposta ao chamado..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#0d120e] border border-[#2b3d2b] rounded text-xs text-neutral-200 focus:outline-none focus:border-[#facc15]"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded border border-[#3b7347] font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Responder
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-500 text-xs">
              <MessageSquare className="w-8 h-8 mb-2 opacity-30 text-[#facc15]" />
              Selecione um chamado da lista lateral para visualizar os detalhes e histórico de respostas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
