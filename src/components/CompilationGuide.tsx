import React, { useState } from 'react';
import { 
  Terminal, 
  Check, 
  Copy, 
  ShieldAlert, 
  Sparkles, 
  FolderCheck, 
  Cpu, 
  Layers,
  Server,
  PlayCircle
} from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { COMPILATION_DEPENDENCIES_UBUNTU } from '../data/guideData';

export const CompilationGuide: React.FC = () => {
  const [activeDistro, setActiveDistro] = useState<'ubuntu-22' | 'ubuntu-24' | 'debian-12'>('ubuntu-22');
  const [buildSystem, setBuildSystem] = useState<'cmake' | 'autotools'>('cmake');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyText = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      // fallback
    }
  };

  const aptDependenciesCmd = `sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y \\
  build-essential \\
  cmake \\
  git \\
  libboost-all-dev \\
  libmariadb-dev \\
  liblua5.1-0-dev \\
  libcrypto++-dev \\
  libgmp-dev \\
  libpugixml-dev \\
  mariadb-server \\
  netfilter-persistent \\
  iptables-persistent`;

  const cloneAndBuildCmake = `# 1. Clonar o repositório oficial do Styller 7.72
git clone https://github.com/luanluciano93/styller.git /home/ubuntu/styller772
cd /home/ubuntu/styller772

# 2. Criar diretório de build isolado
mkdir -p build && cd build

# 3. Gerar arquivos de compilação CMake otimizados para produção (Release)
cmake -DCMAKE_BUILD_TYPE=Release ..

# 4. Compilar usando todos os núcleos da CPU
make -j$(nproc)

# 5. O binário executável 'tfs' é gerado na raiz do servidor
cd /home/ubuntu/styller772
ls -lh tfs`;

  const autotoolsBuild = `# Método alternativo legado caso a branch utilize Autotools (./autogen.sh)
cd /home/ubuntu/styller772
./autogen.sh
./configure --enable-mysql --enable-server-diag
make -j$(nproc)`;

  const oracleFirewallCmds = `# Liberar as portas 7171 (Login) e 7172 (Game Server) no iptables da OCI:
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 7171 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 7172 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Salvar regras permanentemente para sobreviver a reinicializações:
sudo netfilter-persistent save
sudo netfilter-persistent reload`;

  const systemdService = `[Unit]
Description=OTServ Styller 7.72 Daemon Service
After=network.target mariadb.service
Requires=mariadb.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/styller772
ExecStart=/home/ubuntu/styller772/tfs
Restart=always
RestartSec=5
StandardOutput=append:/home/ubuntu/styller772/server.log
StandardError=append:/home/ubuntu/styller772/server_error.log
LimitNOFILE=65535
LimitCORE=infinity

[Install]
WantedBy=multi-user.target`;

  const systemdCommands = `# 1. Criar o arquivo de serviço systemd
sudo nano /etc/systemd/system/otserv.service
# (Cole o conteúdo acima e salve com Ctrl+O e Ctrl+X)

# 2. Recarregar o daemon do systemd
sudo systemctl daemon-reload

# 3. Habilitar o servidor para iniciar automaticamente no boot do sistema
sudo systemctl enable otserv.service

# 4. Iniciar o servidor agora
sudo systemctl start otserv.service

# 5. Conferir status de execução em tempo real
sudo systemctl status otserv.service

# 6. Acompanhar os logs do servidor em tempo real (como no terminal aberto)
tail -f /home/ubuntu/styller772/server.log`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Description */}
      <div>
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
          <Terminal className="w-3.5 h-3.5" />
          <span>GUIA DE COMPILAÇÃO C++ &amp; HOSPEDAGEM</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">
          Compilação do Servidor Styller 7.72 no Linux
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm mt-1">
          Instruções de alta precisão para compilar o core C++ a partir do repositório{' '}
          <a
            href="https://github.com/luanluciano93/styller"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline font-mono"
          >
            luanluciano93/styller
          </a>{' '}
          em instâncias Ubuntu/Debian (Oracle Cloud OCI, AWS, DigitalOcean ou VPS dedicada).
        </p>
      </div>

      {/* Target OS and Build Engine Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-neutral-800 bg-[#0d1117]">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-neutral-400 font-medium">Distribuição Linux:</span>
          <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
            <button
              onClick={() => setActiveDistro('ubuntu-22')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                activeDistro === 'ubuntu-22'
                  ? 'bg-amber-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Ubuntu 22.04 LTS (Recomendado)
            </button>
            <button
              onClick={() => setActiveDistro('ubuntu-24')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                activeDistro === 'ubuntu-24'
                  ? 'bg-amber-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Ubuntu 24.04 LTS
            </button>
            <button
              onClick={() => setActiveDistro('debian-12')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                activeDistro === 'debian-12'
                  ? 'bg-amber-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Debian 12 Bookworm
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-neutral-400 font-medium">Sistema de Build:</span>
          <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
            <button
              onClick={() => setBuildSystem('cmake')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                buildSystem === 'cmake'
                  ? 'bg-cyan-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              CMake (Moderno)
            </button>
            <button
              onClick={() => setBuildSystem('autotools')}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                buildSystem === 'autotools'
                  ? 'bg-cyan-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Autotools (Legado)
            </button>
          </div>
        </div>
      </div>

      {/* Step 1: Dependencies */}
      <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
              1
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100">
                Instalação das Bibliotecas &amp; Compiladores C++
              </h3>
              <p className="text-xs text-neutral-400">
                Instale todas as dependências nativas necessárias para compilar o núcleo do The Forgotten Server 7.72.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCopyText(aptDependenciesCmd, 'dep-cmd')}
            className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
          >
            {copiedSection === 'dep-cmd' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Comando APT</span>
              </>
            )}
          </button>
        </div>

        <CodeBlock code={aptDependenciesCmd} language="bash" filename="1_install_dependencies.sh" downloadable />

        {/* Detailed packages grid */}
        <div className="mt-3">
          <span className="text-xs font-semibold text-neutral-300 block mb-2">
            Função das dependências instaladas:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {COMPILATION_DEPENDENCIES_UBUNTU.map((dep) => (
              <div key={dep.name} className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
                <code className="text-amber-400 text-xs font-mono font-semibold block truncate">
                  {dep.name}
                </code>
                <p className="text-[11px] text-neutral-400 mt-1 leading-tight">{dep.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Clone & Compile */}
      <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
              2
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100">
                Clonagem do Repositório &amp; Compilação C++
              </h3>
              <p className="text-xs text-neutral-400">
                Geração do binário executável <code className="text-amber-300">./tfs</code> com otimização Release.
              </p>
            </div>
          </div>
        </div>

        {buildSystem === 'cmake' ? (
          <CodeBlock 
            code={cloneAndBuildCmake} 
            language="bash" 
            filename="2_build_cmake.sh" 
            downloadable 
          />
        ) : (
          <CodeBlock 
            code={autotoolsBuild} 
            language="bash" 
            filename="2_build_autotools.sh" 
            downloadable 
          />
        )}

        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Dica de Performance:</strong> O parâmetro <code className="font-mono text-amber-200">-j$(nproc)</code> instrui o compilador a usar todas as threads e núcleos da CPU da sua máquina virtual simultaneamente, reduzindo o tempo de compilação de ~15 minutos para menos de 2 minutos!
          </div>
        </div>
      </div>

      {/* Step 3: Oracle Cloud & Linux Firewall (Port Forwarding) */}
      <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
            3
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-100">
              Liberação de Portas na Oracle Cloud (OCI) &amp; iptables
            </h3>
            <p className="text-xs text-neutral-400">
              Essencial para permitir que jogadores externos consigam conectar nas portas 7171 e 7172.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-red-300/90 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <strong>Atenção Crucial na Oracle Cloud:</strong> Mesmo liberando as portas no painel web da Oracle (VCN Ingress Rules), o Ubuntu na OCI vem por padrão com regras restritivas no <code className="font-mono text-red-200">iptables</code> que rejeitam conexões externas. Execute os comandos abaixo no terminal da sua instância para abrir as portas no sistema operacional:
          </div>
        </div>

        <CodeBlock code={oracleFirewallCmds} language="bash" filename="3_firewall_rules.sh" downloadable />
      </div>

      {/* Step 4: Systemd Service Daemon */}
      <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
            4
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-100">
              Serviço Daemon com systemd (Execução Contínua e Auto-Restart)
            </h3>
            <p className="text-xs text-neutral-400">
              Evita rodar em terminal temporário. Se o servidor cair por queda de luz ou crash inesperado, o Linux reinicia o OTServ automaticamente em 5 segundos!
            </p>
          </div>
        </div>

        <CodeBlock 
          code={systemdService} 
          language="ini" 
          filename="/etc/systemd/system/otserv.service" 
          downloadable 
        />

        <span className="text-xs font-semibold text-neutral-300 block">
          Comandos para ativar e controlar o serviço do servidor:
        </span>

        <CodeBlock code={systemdCommands} language="bash" filename="4_systemd_control.sh" />
      </div>
    </div>
  );
};
