import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Key,
  HardDrive
} from 'lucide-react';
import { FULL_SCHEMA_SQL } from '../data/guideData';
import { CodeBlock } from './CodeBlock';

export const DatabaseManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'setup' | 'schema' | 'leak-audit'>('setup');

  const mariaDbSetupCmds = `# 1. Instalar o servidor MariaDB no Ubuntu / Debian:
sudo apt-get update
sudo apt-get install -y mariadb-server

# 2. Iniciar o serviço do MariaDB e habilitar no boot do sistema:
sudo systemctl start mariadb
sudo systemctl enable mariadb

# 3. Acessar o console do MariaDB como superusuário root:
sudo mysql -u root

-- DENTRO DO CONSOLE DO MARIADB, EXECUTE:
CREATE DATABASE IF NOT EXISTS \`styller772\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário com senha forte (ajuste 'senha_segura_772' para a sua senha)
CREATE USER IF NOT EXISTS 'styller'@'localhost' IDENTIFIED BY 'senha_segura_772';

-- Conceder todos os privilégios no banco do servidor:
GRANT ALL PRIVILEGES ON \`styller772\`.* TO 'styller'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 4. Importar o schema.sql para criar a estrutura das tabelas:
mariadb -u styller -p styller772 < /home/ubuntu/styller772/schema.sql`;

  const badVsGoodLeak = `-- ❌ PADRÃO PERIGOSO (Causa vazamento de RAM e crash silencioso após horas online)
local function badGetPlayerLevel(name)
    local resultId = db.storeQuery(string.format("SELECT \`level\` FROM \`players\` WHERE \`name\` = %s;", db.escapeString(name)))
    if resultId then
        local lvl = result.getNumber(resultId, "level")
        -- ERRO FATAL: Esquecer result.free(resultId)!
        -- O ponteiro alocado no driver C++ do MariaDB nunca é liberado!
        return lvl
    end
    return 0
end

-- ✅ PADRÃO SEGURO E INDUSTRIAL (Zero Memory Leak)
local function safeGetPlayerLevel(name)
    local resultId = db.storeQuery(string.format("SELECT \`level\` FROM \`players\` WHERE \`name\` = %s;", db.escapeString(name)))
    if not resultId then
        return 0
    end

    local lvl = result.getNumber(resultId, "level")
    -- MANDATÓRIO: Libera o cursor da memória C++ imediatamente após o uso!
    result.free(resultId)
    return lvl
end`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
          <Database className="w-3.5 h-3.5" />
          <span>PERSISTÊNCIA RELACIONAL &amp; SEGURANÇA</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">
          Base de Dados MariaDB (InnoDB) &amp; Schema 7.72
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm mt-1">
          Configuração de alto desempenho para armazenamento atômico de contas, personagens, inventário e auditoria de memória em scripts Lua.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('setup')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'setup'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Setup Passo a Passo MariaDB</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'schema'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Visualizador schema.sql Completo</span>
        </button>

        <button
          onClick={() => setActiveTab('leak-audit')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'leak-audit'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Prevenção de Memory Leaks (result.free)</span>
        </button>
      </div>

      {/* TAB 1: Setup Commands */}
      {activeTab === 'setup' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-[#0d1117] text-xs text-neutral-300 leading-relaxed space-y-2">
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>Por que usar MariaDB com motor InnoDB no Styller 7.72?</span>
            </h3>
            <p>
              Diferente de bancos SQLite em arquivo único (que travam com múltiplos acessos simultâneos e corrompem dados sob quedas bruscas de energia),
              o <strong>MariaDB com tabelas InnoDB</strong> garante transações ACID (atômicas), bloqueio a nível de linha e escrita segura durante o <em>Server Save</em> sem congelar o jogo.
            </p>
          </div>

          <CodeBlock
            code={mariaDbSetupCmds}
            language="bash"
            filename="setup_mariadb.sh"
            downloadable
          />
        </div>
      )}

      {/* TAB 2: Schema.sql Viewer */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-300">
              <span className="font-semibold text-neutral-100">schema.sql</span> — Tabelas essenciais: accounts, players, player_storage, player_items, player_skills.
            </div>
          </div>

          <CodeBlock
            code={FULL_SCHEMA_SQL}
            language="sql"
            filename="schema.sql"
            downloadable
            maxHeight="max-h-[550px]"
          />
        </div>
      )}

      {/* TAB 3: Memory Leak Prevention Audit */}
      {activeTab === 'leak-audit' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-300 leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-semibold text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>A Causa #1 de Quedas Inexplicáveis de Servidores OTServ</span>
            </div>
            <p>
              Quando um script Lua executa <code className="text-amber-300 font-mono">db.storeQuery()</code>, o driver C++ do servidor aloca buffers de dados diretamente na memória RAM nativa (heap).
              O Garbage Collector do Lua <strong>NÃO</strong> limpa esses ponteiros do C++ automaticamente.
            </p>
            <p>
              Se você esquecer de chamar <code className="text-emerald-300 font-mono">result.free(resultId)</code>, a memória consumida pelo processo do servidor cresce a cada segundo até que o Linux execute o <strong>OOM Killer</strong> (Out-Of-Memory) e derrube o servidor sem aviso!
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-neutral-200">
              Comparativo de Implementação em Lua:
            </span>
            <CodeBlock
              code={badVsGoodLeak}
              language="lua"
              filename="memory_leak_prevention.lua"
              maxHeight="max-h-[450px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
