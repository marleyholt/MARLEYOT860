import React, { useState } from 'react';
import { Server, Copy, Check, Terminal, Shield, RefreshCw } from 'lucide-react';

export const DeployGuideView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const eofScript = `cat << 'EOF' > /home/ubuntu/atualizar_portal_marleyot.sh
#!/bin/bash
set -e

echo "=================================================================="
echo "🌐 ATUALIZANDO E SINCRONIZANDO O PORTAL ZNOTE MARLEYOT 8.6"
echo "=================================================================="

# 1. Diretório do portal na VPS
PORTAL_DIR="/home/ubuntu/otserv/portal"
if [ ! -d "$PORTAL_DIR" ]; then
    PORTAL_DIR="/home/ubuntu/portal"
fi
mkdir -p "$PORTAL_DIR"
cd "$PORTAL_DIR"

echo "-> Diretório do portal: $(pwd)"

# 2. Puxar as últimas alterações do GitHub
echo "-> [1/4] Puxando atualizações do repositório..."
git pull origin main || true

# 3. Instalar dependências
echo "-> [2/4] Instalando pacotes npm..."
npm install

# 4. Compilar o site
echo "-> [3/4] Compilando portal..."
npm run build

# 5. Reiniciar no PM2
echo "-> [4/4] Reiniciando aplicação no PM2..."
pm2 restart "marleyot-portal" || pm2 start npm --name "marleyot-portal" -- run preview -- --port 3000 --host 0.0.0.0
pm2 save

echo "=================================================================="
echo "✅ PORTAL DO MARLEYOT ATUALIZADO E DISPONÍVEL NA PORTA 3000!"
echo "=================================================================="
EOF

chmod +x /home/ubuntu/atualizar_portal_marleyot.sh
/home/ubuntu/atualizar_portal_marleyot.sh`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(eofScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#14381c] via-[#24542c] to-[#14381c] px-6 py-4 border-b border-[#3b7347] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#102416] border border-[#facc15] rounded">
              <Server className="w-5 h-5 text-[#facc15]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#facc15] font-serif uppercase tracking-wider">
                Deploy do Portal na VPS (Oracle Cloud)
              </h2>
              <p className="text-xs text-neutral-300">
                Instruções automatizadas no formato EOF pronto para o terminal SSH
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-neutral-300 leading-relaxed">
            Após validarmos o layout aqui no Google AI Studio e fizermos o commit/push no repositório GitHub, 
            você poderá executar o comando abaixo diretamente no SSH da VPS para publicar o site em produção:
          </p>

          <div className="relative bg-[#070b08] border border-[#1e2e20] rounded-lg overflow-hidden">
            <div className="bg-[#0f1710] px-4 py-2 border-b border-[#1e2e20] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#86efac] font-mono">
                <Terminal className="w-3.5 h-3.5" />
                Script Bash Automatizado (EOF)
              </div>

              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-[#1b4324] hover:bg-[#23572e] text-[#facc15] text-xs font-bold rounded flex items-center gap-1.5 transition-colors border border-[#30613a]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Comando'}
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-[#4ade80] overflow-x-auto leading-relaxed max-h-80">
              {eofScript}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
