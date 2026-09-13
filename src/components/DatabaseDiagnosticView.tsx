import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  Copy, 
  Shield, 
  Server, 
  Layers, 
  Check, 
  Wrench,
  Code
} from 'lucide-react';
import { DatabaseDiagnostic } from '../types';

export const DatabaseDiagnosticView: React.FC = () => {
  const [diag, setDiag] = useState<DatabaseDiagnostic | null>(null);
  const [loading, setLoading] = useState(true);
  const [customQuery, setCustomQuery] = useState('SELECT `name`, `level`, `vocation` FROM `players` ORDER BY `level` DESC LIMIT 5;');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<any>(null);
  const [migrating, setMigrating] = useState(false);

  const fetchDiagnostic = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/db-diagnostic');
      if (res.ok) {
        const data = await res.json();
        setDiag(data);
      }
    } catch (err) {
      console.error('Erro no diagnóstico:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostic();
  }, []);

  const handleRunQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    setQueryLoading(true);
    setQueryResult(null);
    try {
      const res = await fetch('/api/admin/db-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: customQuery.trim() })
      });
      const data = await res.json();
      setQueryResult(data);
    } catch (err: any) {
      setQueryResult({
        success: false,
        error: err.message || 'Erro ao conectar à API de consulta'
      });
    } finally {
      setQueryLoading(false);
    }
  };

  const handleMigrateZnote = async () => {
    if (!confirm('Deseja aplicar as migrações estruturais do ZnoteAAC-2 no banco marleyot86?')) return;
    setMigrating(true);
    setMigrationStatus(null);
    try {
      const res = await fetch('/api/admin/db-migrate-znote', { method: 'POST' });
      const data = await res.json();
      setMigrationStatus(data);
      fetchDiagnostic();
    } catch (err: any) {
      setMigrationStatus({ success: false, error: err.message });
    } finally {
      setMigrating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2b3d2b] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/50 border border-emerald-700/60 rounded-lg text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-[#facc15] font-serif uppercase">
                Diagnóstico & Acessos MariaDB / ZnoteAAC
              </h2>
              <p className="text-xs text-neutral-400">
                Credenciais de acesso, status da conexão em tempo real, auditoria de tabelas e console SQL
              </p>
            </div>
          </div>

          <button
            onClick={fetchDiagnostic}
            disabled={loading}
            className="px-3.5 py-1.5 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded border border-[#3b7347] text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Testar Conexão
          </button>
        </div>

        {/* Status de Conexão */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 bg-[#0d120e] border border-[#1e291e] rounded flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Status do Banco</span>
              <span className={`text-sm font-bold flex items-center gap-1.5 ${diag?.connected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {diag?.connected ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {diag?.connected ? 'Conectado (Online)' : 'Desconectado (Offline)'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#0d120e] border border-[#1e291e] rounded">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Database</span>
            <span className="text-sm font-mono text-[#facc15] font-bold">
              {diag?.database || 'marleyot86'}
            </span>
          </div>

          <div className="p-3 bg-[#0d120e] border border-[#1e291e] rounded">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Versão do Engine</span>
            <span className="text-sm font-mono text-neutral-200">
              {diag?.serverVersion || 'MariaDB 10.x'}
            </span>
          </div>

          <div className="p-3 bg-[#0d120e] border border-[#1e291e] rounded">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Latência de Query</span>
            <span className="text-sm font-mono text-emerald-400 font-bold">
              {diag?.latencyMs || 0} ms
            </span>
          </div>
        </div>

        {diag?.errorDetails && (
          <div className="mt-4 p-3.5 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <strong className="block font-bold">Aviso de Diagnóstico:</strong>
              {diag.errorDetails}
            </div>
          </div>
        )}
      </div>

      {/* Box de Todos os Acessos Oficiais do MariaDB */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-5 shadow-xl space-y-4">
        <div className="border-b border-[#2b3d2b] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#facc15]" />
            <h3 className="text-sm font-black text-[#facc15] font-serif uppercase">
              Acessos e Credenciais Oficiais do MariaDB (Oracle Cloud VPS)
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-[#1b2b1d] border border-[#2e4732] text-[10px] font-bold text-neutral-300 rounded">
            Porta Padrão: 3306
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#0d120e] border border-[#1e291e] rounded">
            <span className="text-neutral-500 block text-[10px] uppercase font-bold">Host / IP</span>
            <span className="font-mono text-neutral-200 font-semibold">127.0.0.1 / 137.131.196.66</span>
          </div>

          <div className="p-3 bg-[#0d120e] border border-[#1e291e] rounded">
            <span className="text-neutral-500 block text-[10px] uppercase font-bold">Usuário (User)</span>
            <span className="font-mono text-neutral-200 font-semibold">root</span>
          </div>

          <div className="p-3 bg-[#0d120e] border border-[#1e291e] rounded">
            <span className="text-neutral-500 block text-[10px] uppercase font-bold">Senha (Password)</span>
            <span className="font-mono text-[#facc15] font-bold">MARLEY22@@##</span>
          </div>

          <div className="p-3 bg-[#0d120e] border border-[#1e291e] rounded">
            <span className="text-neutral-500 block text-[10px] uppercase font-bold">Nome do Banco (Schema)</span>
            <span className="font-mono text-emerald-400 font-bold">{diag?.database || 'yurots_db'}</span>
          </div>
        </div>

        {/* Comandos Rápidos Prontos para Copiar */}
        <div className="space-y-2 pt-2">
          <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Comandos de Terminal SSH (Copiar e Colar na VPS):
          </label>

          <div className="p-3 bg-[#0a0e0b] border border-[#253526] rounded-lg font-mono text-xs text-neutral-300 flex items-center justify-between gap-3">
            <span className="truncate">
              mariadb -u root -p'MARLEY22@@##' {diag?.database || 'yurots_db'}
            </span>
            <button
              onClick={() => copyToClipboard(`mariadb -u root -p'MARLEY22@@##' ${diag?.database || 'yurots_db'}`, 'cli-login')}
              className="px-2.5 py-1 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded text-[10px] font-bold flex items-center gap-1 shrink-0"
            >
              {copiedCmd === 'cli-login' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedCmd === 'cli-login' ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <div className="p-3 bg-[#0a0e0b] border border-[#253526] rounded-lg font-mono text-xs text-neutral-300 flex items-center justify-between gap-3">
            <span className="truncate">
              sudo systemctl status mariadb.service
            </span>
            <button
              onClick={() => copyToClipboard("sudo systemctl status mariadb.service", 'cli-status')}
              className="px-2.5 py-1 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded text-[10px] font-bold flex items-center gap-1 shrink-0"
            >
              {copiedCmd === 'cli-status' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedCmd === 'cli-status' ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>

      {/* Auditoria de Tabelas do ZnoteAAC & OTServ */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-4 py-2.5 border-b border-[#2b3d2b] flex justify-between items-center text-xs font-bold text-[#facc15]">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Tabelas do Servidor & Integração ZnoteAAC-2
          </span>
          <button
            onClick={handleMigrateZnote}
            disabled={migrating}
            className="px-2.5 py-1 bg-[#eab308] hover:bg-[#ca8a04] text-neutral-950 font-bold rounded text-[11px] flex items-center gap-1 shadow"
          >
            <Wrench className="w-3.5 h-3.5" />
            {migrating ? 'Migrando...' : 'Auto-Criar Tabelas ZnoteAAC'}
          </button>
        </div>

        {migrationStatus && (
          <div className={`p-3 text-xs border-b border-[#2b3d2b] ${migrationStatus.success ? 'bg-emerald-950/40 text-emerald-300' : 'bg-rose-950/40 text-rose-300'}`}>
            {migrationStatus.success ? (
              <span>
                Migração ZnoteAAC concluída: {migrationStatus.executed} queries executadas com sucesso!
              </span>
            ) : (
              <span>Erro na migração: {migrationStatus.error}</span>
            )}
          </div>
        )}

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {(diag?.tables || []).map((t) => (
            <div
              key={t.name}
              className={`p-2.5 rounded border flex items-center justify-between ${
                t.rows >= 0
                  ? 'bg-[#0d120e] border-[#253526]'
                  : 'bg-[#181111] border-rose-950/80 opacity-70'
              }`}
            >
              <div className="truncate">
                <span className="font-mono font-semibold text-neutral-200 block truncate">
                  {t.name}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {t.rows >= 0 ? `${t.rows} registro(s)` : 'Pendente de Migração'}
                </span>
              </div>

              {t.rows >= 0 ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Execute a auto-migração"></span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SQL Query Debugger Console */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg p-5 shadow-xl space-y-4">
        <div className="border-b border-[#2b3d2b] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-[#facc15] font-serif uppercase">
              Terminal SQL Interativo (Debug em Tempo Real)
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400">
            Executa consultas diretamente no pool MariaDB com medição de tempo
          </span>
        </div>

        <form onSubmit={handleRunQuery} className="space-y-3">
          <textarea
            rows={3}
            value={customQuery}
            onChange={e => setCustomQuery(e.target.value)}
            className="w-full p-3 bg-[#0a0e0b] border border-[#2b3d2b] rounded-lg font-mono text-xs text-neutral-200 focus:outline-none focus:border-[#facc15]"
            placeholder="Digite qualquer query SQL válida (ex: SHOW TABLES; SELECT * FROM players LIMIT 5;)..."
          />

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCustomQuery('SHOW TABLES;')}
                className="px-2.5 py-1 bg-[#0d120e] hover:bg-[#182319] border border-[#2b3d2b] rounded text-[10px] font-mono text-neutral-300"
              >
                SHOW TABLES
              </button>
              <button
                type="button"
                onClick={() => setCustomQuery('SELECT id, name, level, vocation, balance FROM players ORDER BY level DESC LIMIT 5;')}
                className="px-2.5 py-1 bg-[#0d120e] hover:bg-[#182319] border border-[#2b3d2b] rounded text-[10px] font-mono text-neutral-300"
              >
                Top 5 Players
              </button>
              <button
                type="button"
                onClick={() => setCustomQuery('SELECT * FROM player_deaths ORDER BY time DESC LIMIT 5;')}
                className="px-2.5 py-1 bg-[#0d120e] hover:bg-[#182319] border border-[#2b3d2b] rounded text-[10px] font-mono text-neutral-300"
              >
                Deaths
              </button>
            </div>

            <button
              type="submit"
              disabled={queryLoading}
              className="px-4 py-2 bg-[#1b4324] hover:bg-[#255e32] text-[#facc15] rounded border border-[#3b7347] font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${queryLoading ? 'animate-spin' : ''}`} />
              {queryLoading ? 'Executando...' : 'Executar Query'}
            </button>
          </div>
        </form>

        {/* Resultado da Query */}
        {queryResult && (
          <div className="mt-4 p-4 bg-[#0a0e0b] border border-[#253526] rounded-lg space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className={`font-bold flex items-center gap-1.5 ${queryResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {queryResult.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {queryResult.success ? 'Sucesso' : 'Falha na Execução'}
              </span>
              <span className="font-mono text-neutral-400 text-[11px]">
                Tempo: {queryResult.executionTimeMs} ms &bull; Linhas: {queryResult.rowCount || 0}
              </span>
            </div>

            {queryResult.error ? (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono rounded">
                <p><strong>Erro:</strong> {queryResult.error}</p>
                {queryResult.code && <p className="text-[10px] mt-1 text-rose-400">Código: {queryResult.code} | SQLState: {queryResult.sqlState}</p>}
              </div>
            ) : Array.isArray(queryResult.rows) && queryResult.rows.length > 0 ? (
              <div className="overflow-x-auto max-h-60 border border-[#1e291e] rounded">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#121a13] text-[#facc15] sticky top-0">
                    <tr>
                      {Object.keys(queryResult.rows[0]).map((col) => (
                        <th key={col} className="p-2 border-b border-[#2b3d2b] font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e291e] text-neutral-300">
                    {queryResult.rows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#121612]">
                        {Object.values(row).map((val: any, valIdx: number) => (
                          <td key={valIdx} className="p-2 whitespace-nowrap">
                            {val !== null ? String(val) : '<NULL>'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                A consulta foi executada com sucesso, mas não retornou nenhuma linha.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
