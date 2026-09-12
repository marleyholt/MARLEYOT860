import React, { useState, useEffect } from 'react';
import { FileText, PlusCircle, CheckCircle, Sparkles, Wrench, Shield, Calendar, RefreshCw } from 'lucide-react';
import { ChangelogEntry } from '../types';

interface ChangelogViewProps {
  isGM?: boolean;
}

export const ChangelogView: React.FC<ChangelogViewProps> = ({ isGM = false }) => {
  const [changelogs, setChangelogs] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchChangelog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/changelog');
      if (res.ok) {
        const data = await res.json();
        setChangelogs(data);
      }
    } catch (err) {
      console.error('Erro ao carregar changelog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChangelog();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, text: newText })
      });
      if (res.ok) {
        setNewTitle('');
        setNewText('');
        setShowAddModal(false);
        fetchChangelog();
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
            <div className="p-2.5 bg-purple-950/40 border border-purple-800/60 rounded-lg text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-[#facc15] font-serif uppercase">
                Notas de Atualização (Changelog)
              </h2>
              <p className="text-xs text-neutral-400">
                Histórico de melhorias, correções de bugs e novos sistemas aplicados no MarleyOT 8.60
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isGM && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-bold rounded text-xs flex items-center gap-1.5 shadow"
              >
                <PlusCircle className="w-4 h-4" />
                Nova Nota
              </button>
            )}
            <button
              onClick={fetchChangelog}
              disabled={loading}
              className="px-3 py-1.5 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded border border-[#3b7347] text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Modal / Formulário de Adição */}
        {showAddModal && (
          <form onSubmit={handleAdd} className="mt-4 p-4 bg-[#0d120e] border border-[#eab308]/40 rounded-lg space-y-3">
            <h4 className="text-xs font-bold text-[#facc15] uppercase tracking-wider">
              Publicar Nova Atualização
            </h4>
            <input
              type="text"
              placeholder="Título da Atualização (ex: Novo Boss na Arena)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#121612] border border-[#2b3d2b] rounded text-xs text-neutral-200 focus:outline-none focus:border-[#facc15]"
              required
            />
            <textarea
              rows={3}
              placeholder="Descrição detalhada das alterações..."
              value={newText}
              onChange={e => setNewText(e.target.value)}
              className="w-full px-3 py-2 bg-[#121612] border border-[#2b3d2b] rounded text-xs text-neutral-200 focus:outline-none focus:border-[#facc15]"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-neutral-800 text-neutral-300 text-xs font-bold rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] text-xs font-bold rounded border border-[#3b7347]"
              >
                {submitting ? 'Salvando...' : 'Salvar Nota'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Linha do Tempo */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-neutral-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#facc15]" />
            Carregando changelog...
          </div>
        ) : (
          changelogs.map((item) => (
            <div
              key={item.id}
              className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-4 shadow-xl hover:border-[#3d5a3f] transition-all space-y-2"
            >
              <div className="flex justify-between items-start gap-2 border-b border-[#1e291e] pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#facc15]" />
                  <h3 className="text-sm font-black text-[#facc15] font-serif">
                    {item.title}
                  </h3>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  {item.date}
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                {item.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
