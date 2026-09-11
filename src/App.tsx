/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Terminal, 
  Server, 
  Database, 
  FolderSync, 
  Cpu, 
  CheckCircle2, 
  Copy, 
  FileText, 
  ShieldCheck, 
  Layers, 
  AlertTriangle,
  Play,
  Check,
  HardDrive
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'steps' | 'script' | 'configs' | 'faq'>('steps');
  const [copied, setCopied] = useState(false);
  const [dbPassword, setDbPassword] = useState('styller123_secure');
  const [dbName, setDbName] = useState('styller_86_db');

  const fullScript = `#!/bin/bash
# ==============================================================================
# SCRIPT DE AUTOMATIZAÇÃO DE DEVOPS - STYLLER YurOTS 8.60 (Ubuntu 20.04)
# Autor: Engenheiro DevOps Sênior / Gerenciador OpenTibia 8.60
# ==============================================================================

set -e

GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
RED='\\033[0;31m'
NC='\\033[0m' # No Color

echo -e "\${BLUE}[+] 1. Atualizando sistema e instalando dependências essenciais...\${NC}"
sudo apt update && sudo apt upgrade -y
sudo apt install -y git cmake build-essential libboost-all-dev libmariadb-dev liblua5.1-0-dev libpugixml-dev libcrypto++-dev mariadb-server unzip

echo -e "\${BLUE}[+] 2. Configurando Memória Swap (Proteção para VPS 1GB RAM)...\${NC}"
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo -e "\${GREEN}[✓] Swap de 2GB configurada com sucesso!\${NC}"
else
    echo -e "\${GREEN}[✓] Swap já existe no sistema.\${NC}"
fi

echo -e "\${BLUE}[+] 3. Estruturando pastas do projeto...\${NC}"
# Apagar completamente o conteúdo anterior da pasta otserv80 (se existir)
if [ -d "/home/ubuntu/otserv80" ]; then
    echo "Removendo /home/ubuntu/otserv80 antigo..."
    rm -rf /home/ubuntu/otserv80
fi

# Criar a nova pasta otserv86 (preservando intacta a pasta legada /home/ubuntu/otserv)
mkdir -p /home/ubuntu/otserv86
echo -e "\${GREEN}[✓] Pasta /home/ubuntu/otserv86 criada. A pasta legada /home/ubuntu/otserv foi preservada.\${NC}"

echo -e "\${BLUE}[+] 4. Configurando o Banco de Dados MariaDB...\${NC}"
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Criar banco de dados e usuário dedicado para evitar erros de autenticação do root
sudo mariadb -u root <<EOF
CREATE DATABASE IF NOT EXISTS ${dbName};
CREATE USER IF NOT EXISTS 'otserv'@'localhost' IDENTIFIED BY '${dbPassword}';
GRANT ALL PRIVILEGES ON ${dbName}.* TO 'otserv'@'localhost';
FLUSH PRIVILEGES;
EOF

echo -e "\${GREEN}[✓] Banco '${dbName}' e usuário 'otserv'@'localhost' criados com sucesso!\${NC}"

echo -e "\${BLUE}[+] 5. Procurando arquivo SQL e importando dados...\${NC}"
# Se houver um arquivo .sql na pasta, importar automaticamente
SQL_FILE=\$(find /home/ubuntu/otserv86 -name "*.sql" | head -n 1)
if [ -n "\$SQL_FILE" ]; then
    echo "Importando \$SQL_FILE para o banco ${dbName}..."
    mariadb -u otserv -p'${dbPassword}' ${dbName} < "\$SQL_FILE"
    echo -e "\${GREEN}[✓] Banco de dados importado com sucesso!\${NC}"
else
    echo -e "\${RED}[!] Nenhum arquivo .sql encontrado na pasta /home/ubuntu/otserv86 ainda.\${NC}"
    echo "    Você poderá importar manualmente depois com: mariadb -u otserv -p'${dbPassword}' ${dbName} < seu_arquivo.sql"
fi

echo -e "\${BLUE}[+] 6. Configurando Systemd para 24/7...\${NC}"
SERVICE_FILE="/etc/systemd/system/styller86.service"
sudo bash -c "cat > \$SERVICE_FILE" <<EOF
[Unit]
Description=Styller YurOTS 8.60 OpenTibia Server
After=network.target mariadb.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/otserv86
ExecStart=/home/ubuntu/otserv86/theforgottenserver
Restart=always
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable styller86.service

echo -e "\${GREEN}============================================================\${NC}"
echo -e "\${GREEN} IMPLANTAÇÃO PREPARADA COM SUCESSO!\${NC}"
echo -e "\${GREEN} Pasta do Servidor: /home/ubuntu/otserv86\${NC}"
echo -e "\${GREEN} Banco de Dados: ${dbName} (Usuário: otserv)\${NC}"
echo -e "\${GREEN} Para iniciar o servidor: sudo systemctl start styller86\${NC}"
echo -e "\${GREEN} Para ver os logs: sudo journalctl -u styller86 -f\${NC}"
echo -e "\${GREEN}============================================================\${NC}"
`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Styller YurOTS 8.60 <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-medium">DevOps Manager</span>
              </h1>
              <p className="text-xs text-slate-400">VPS Ubuntu 20.04 • 1GB RAM + Swap • MariaDB • Systemd 24/7</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button 
              onClick={() => setActiveTab('steps')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'steps' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              1. Passo a Passo
            </button>
            <button 
              onClick={() => setActiveTab('script')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'script' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              2. Script Bash Automático
            </button>
            <button 
              onClick={() => setActiveTab('configs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'configs' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              3. Configs & God
            </button>
            <button 
              onClick={() => setActiveTab('faq')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'faq' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Guia para Leigos
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Notice Banner for Beginners */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white">Ambiente Preparado para Subir o Styller YurOTS 8.60 no Servidor</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Este painel foi estruturado especialmente para guiar você passo a passo (mesmo sendo iniciante) na migração e subida limpa do seu servidor OpenTibia na VPS Ubuntu 20.04. Abaixo estão todos os comandos, scripts e instruções de pastas.
              </p>
            </div>
          </div>
        </div>

        {/* TAB 1: PASSOS DETALHADOS */}
        {activeTab === 'steps' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">Passo 1</span>
                  <FolderSync className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white text-base">Limpeza e Pastas</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Apaga o antigo <code className="text-indigo-300">/home/ubuntu/otserv80</code>, cria a nova pasta limpa <code className="text-indigo-300">/home/ubuntu/otserv86</code> e preserva intacta a pasta <code className="text-indigo-300">/home/ubuntu/otserv</code>.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">Passo 2</span>
                  <Database className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white text-base">MariaDB & Banco</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cria o banco <code className="text-indigo-300">{dbName}</code>, cria o usuário dedicado <code className="text-indigo-300">otserv@localhost</code> com senha segura e importa o arquivo <code className="text-indigo-300">.sql</code> da distribuição.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">Passo 3</span>
                  <Server className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white text-base">Systemd & 24/7</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Configura o serviço systemd para iniciar o Styller YurOTS automaticamente ao ligar a VPS e mantê-lo rodando em segundo plano.
                </p>
              </div>
            </div>

            {/* Detailed step cards */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                Instruções Passo a Passo para Execução na VPS
              </h3>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="border-l-2 border-indigo-500 pl-4 space-y-1">
                  <h4 className="font-semibold text-white">1. Conectar na sua VPS via SSH</h4>
                  <p className="text-slate-400 text-xs">Abra o terminal do seu computador (ou PuTTY) e acesse sua VPS:</p>
                  <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-indigo-300 border border-slate-800 mt-1">
                    ssh ubuntu@seu_ip_da_vps
                  </div>
                </div>

                <div className="border-l-2 border-indigo-500 pl-4 space-y-1">
                  <h4 className="font-semibold text-white">2. Criar e Executar o Script de Automação</h4>
                  <p className="text-slate-400 text-xs">Na sua VPS, crie um arquivo chamado <code className="text-indigo-300">deploy.sh</code>, cole o script que está na aba "Script Bash Automático", dê permissão e execute:</p>
                  <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-indigo-300 border border-slate-800 mt-1 space-y-1">
                    <div>nano deploy.sh</div>
                    <div className="text-slate-500"># (Cole o script, salve com Ctrl+O e feche com Ctrl+X)</div>
                    <div>chmod +x deploy.sh</div>
                    <div>sudo ./deploy.sh</div>
                  </div>
                </div>

                <div className="border-l-2 border-indigo-500 pl-4 space-y-1">
                  <h4 className="font-semibold text-white">3. Enviar os arquivos do Styller YurOTS 8.60</h4>
                  <p className="text-slate-400 text-xs">Utilize um programa como WinSCP, FileZilla ou scp para enviar os arquivos descompactados da sua distribuição Styller YurOTS 8.60 diretamente para a pasta:</p>
                  <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-indigo-300 border border-slate-800 mt-1">
                    /home/ubuntu/otserv86
                  </div>
                  <p className="text-slate-400 text-xs mt-1">Certifique-se de que o executável (<code className="text-indigo-300">theforgottenserver</code>) e o arquivo <code className="text-indigo-300">config.lua</code> estão nessa pasta.</p>
                </div>

                <div className="border-l-2 border-indigo-500 pl-4 space-y-1">
                  <h4 className="font-semibold text-white">4. Ajustar o config.lua para o novo Banco de Dados</h4>
                  <p className="text-slate-400 text-xs">Abra o <code className="text-indigo-300">config.lua</code> na pasta <code className="text-indigo-300">/home/ubuntu/otserv86/config.lua</code> e configure as credenciais:</p>
                  <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-emerald-300 border border-slate-800 mt-1">
                    mysqlDatabase = "{dbName}"<br/>
                    mysqlUser = "otserv"<br/>
                    mysqlPass = "{dbPassword}"<br/>
                    mysqlHost = "127.0.0.1"<br/>
                    mysqlPort = 3306
                  </div>
                </div>

                <div className="border-l-2 border-indigo-500 pl-4 space-y-1">
                  <h4 className="font-semibold text-white">5. Iniciar o Servidor via Systemd</h4>
                  <p className="text-slate-400 text-xs">Com tudo configurado, inicie o servidor 24/7 com:</p>
                  <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-indigo-300 border border-slate-800 mt-1 space-y-1">
                    <div>sudo systemctl start styller86</div>
                    <div>sudo systemctl status styller86</div>
                    <div>sudo journalctl -u styller86 -f  <span className="text-slate-500"># Para ver o console em tempo real</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCRIPT BASH AUTOMÁTICO */}
        {activeTab === 'script' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-white">Script Bash Automatizado (<code className="text-indigo-400">deploy.sh</code>)</h3>
                <p className="text-xs text-slate-400">Copie o script abaixo e crie na sua VPS. Este script faz a limpeza, dependências, Swap de 2GB, MariaDB e Systemd.</p>
              </div>
              <button
                onClick={() => copyToClipboard(fullScript)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado com Sucesso!' : 'Copiar Script Completo'}
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>deploy.sh (Bash)</span>
                <span>Ubuntu 20.04 • Styller YurOTS 8.60</span>
              </div>
              <pre className="p-4 text-xs font-mono text-indigo-200 overflow-x-auto max-h-[500px] leading-relaxed">
                {fullScript}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: CONFIGS & GOD */}
        {activeTab === 'configs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database & GOD config */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                Criar Conta de GOD (Admin) no Banco
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Para criar um personagem GOD (Grupo 6) diretamente no MariaDB após importar o banco, execute o comando abaixo no terminal MySQL (<code className="text-indigo-300">sudo mariadb -u otserv -p {dbName}</code>):
              </p>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 space-y-2">
                <div className="text-slate-500">-- Inserir conta de GOD (Senha: god123)</div>
                <div>INSERT INTO accounts (id, name, password, type) VALUES (1, 'god', '127lksdjfh...', 5);</div>
                <div className="text-slate-500 mt-2">-- Inserir personagem GOD vinculado à conta</div>
                <div>INSERT INTO players (id, name, group_id, account_id, level, vocation, health, maxhealth, mana, maxmana) VALUES (1, 'God Account', 6, 1, 500, 1, 1000, 1000, 1000, 1000);</div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Comandos úteis do Systemd</h4>
                <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-indigo-300 border border-slate-800 space-y-1">
                  <div>sudo systemctl start styller86    # Iniciar</div>
                  <div>sudo systemctl stop styller86     # Parar</div>
                  <div>sudo systemctl restart styller86  # Reiniciar</div>
                  <div>sudo systemctl status styller86   # Ver status</div>
                </div>
              </div>
            </div>

            {/* config.lua snippet */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Trecho essencial do <code className="text-indigo-300">config.lua</code>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Garanta que estas linhas no seu <code className="text-indigo-300">/home/ubuntu/otserv86/config.lua</code> estejam configuradas exatamente assim para conectar ao banco MariaDB criado:
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-200 space-y-1">
                <div className="text-slate-500">-- Database configuration</div>
                <div>sqlType = "mysql"</div>
                <div>sqlHost = "127.0.0.1"</div>
                <div>sqlPort = 3306</div>
                <div>sqlUser = "otserv"</div>
                <div className="text-emerald-400">sqlPass = "{dbPassword}"</div>
                <div className="text-emerald-400">sqlDatabase = "{dbName}"</div>
                <div>sqlFile = "theforgottenserver.s3db"</div>
                <div>encryptionType = "sha1"</div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  <strong>Atenção VPS 1GB RAM:</strong> O Styller YurOTS 8.60 consome boa quantidade de RAM ao carregar mapas pesados (.otbm). A criação da memória Swap de 2GB incluída no nosso script evita travamentos (<code className="text-indigo-300">Out of Memory</code>).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GUIA PARA LEIGOS */}
        {activeTab === 'faq' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Guia Prático para Iniciantes (Onde colocar e o que fazer)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
              <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h4 className="font-semibold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">A</span>
                  Onde colocar os arquivos no servidor?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sempre que você baixar sua distribuição Styller YurOTS 8.60 no seu computador, descompacte o arquivo zip. Você obterá uma pasta cheia de subpastas como <code className="text-indigo-300">data/</code>, <code className="text-indigo-300">modules/</code>, <code className="text-indigo-300">config.lua</code> e o executável.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Você deve enviar todo o conteúdo descompactado para a pasta da VPS: <br/>
                  <code className="text-indigo-300 font-mono">/home/ubuntu/otserv86</code>
                </p>
              </div>

              <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h4 className="font-semibold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">B</span>
                  O que acontece com a pasta antiga?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  O script apaga com segurança o conteúdo anterior da pasta <code className="text-indigo-300">/home/ubuntu/otserv80</code> para evitar conflitos de versão, cria a pasta limpa <code className="text-indigo-300">/home/ubuntu/otserv86</code>, e <strong>mantém totalmente intacta</strong> a pasta legada <code className="text-indigo-300">/home/ubuntu/otserv</code>.
                </p>
              </div>

              <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h4 className="font-semibold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">C</span>
                  Como compilar se for necessário source?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Caso sua distribuição venha com a pasta <code className="text-indigo-300">src/</code> e exija compilação na VPS de 1GB RAM, utilize obrigatoriamente <code className="text-indigo-300">make -j1</code> dentro da pasta de compilação (ex: <code className="text-indigo-300">mkdir build && cd build && cmake .. && make -j1</code>) para não estourar a memória RAM e causar travamento.
                </p>
              </div>

              <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h4 className="font-semibold text-white text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">D</span>
                  Pronto para enviar os arquivos?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Como mencionado no seu pedido ("assim que rodar esse prompt, vou enviar a pasta com os arquivos"), você pode anexar os arquivos ou pastas aqui no chat do AI Studio a qualquer momento ou seguir os passos na VPS!
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        OpenTibia Styller YurOTS 8.60 • Gerenciado por Engenheiro DevOps Sênior • Ubuntu 20.04
      </footer>
    </div>
  );
}
