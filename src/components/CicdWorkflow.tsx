import React from 'react';
import { 
  Cloud, 
  GitBranch, 
  Key, 
  Terminal, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Server
} from 'lucide-react';
import { CodeBlock } from './CodeBlock';

export const CicdWorkflow: React.FC = () => {
  const workflowYaml = `# .github/workflows/deploy.yml
# Pipeline de Entrega Contínua (CI/CD) para Styller 7.72 na Oracle Cloud (OCI)
name: Deploy OTServ to Oracle Cloud

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: Sincronizar e Reiniciar Servidor na OCI
    runs-on: ubuntu-latest

    steps:
      - name: Executar Sincronização Remota via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: \${{ secrets.OCI_HOST_IP }}
          username: \${{ secrets.OCI_USERNAME }}
          key: \${{ secrets.OCI_SSH_PRIVATE_KEY }}
          port: 22
          script: |
            set -e
            cd /home/ubuntu/styller772

            echo "==> [1/4] Atualizando repositório via Git pull..."
            git reset --hard
            git pull origin main

            echo "==> [2/4] Aplicando possíveis migrações de banco SQL..."
            if [ -d "migrations" ]; then
              for sql_file in migrations/*.sql; do
                if [ -f "$sql_file" ]; then
                  echo "Aplicando migração: $sql_file..."
                  mariadb -u"\${{ secrets.DB_USER }}" -p"\${{ secrets.DB_PASS }}" "\${{ secrets.DB_NAME }}" < "$sql_file"
                  mv "$sql_file" "$sql_file.applied"
                fi
              done
            fi

            echo "==> [3/4] Reiniciando o daemon gerenciado via systemd..."
            sudo systemctl restart otserv.service

            echo "==> [4/4] Verificando integridade operacional..."
            systemctl is-active --quiet otserv.service && echo "Servidor Styller 7.72 ativo e operacional com sucesso!"`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
          <Cloud className="w-3.5 h-3.5" />
          <span>DEVOPS &amp; DEPLOY CONTÍNUO</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">
          Automação CI/CD: GitHub Actions &rarr; Oracle Cloud (OCI)
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm mt-1">
          Configure um fluxo de trabalho profissional onde qualquer alteração enviada ao GitHub atualiza o servidor na nuvem em segundos sem necessidade de FTP ou comandos manuais.
        </p>
      </div>

      {/* Workflow Diagram Banner */}
      <div className="p-5 rounded-xl border border-neutral-800 bg-[#0d1117]">
        <span className="text-xs font-semibold text-neutral-200 block mb-4">
          Fluxo de Deploy Automatizado (Zero Downtime Humano):
        </span>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="text-amber-400 font-mono font-bold mb-1">1. Git Push</div>
            <p className="text-neutral-400 text-[11px]">
              Você envia um novo script, monstro ou NPC para a branch <code className="text-neutral-200 font-mono">main</code>.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="text-cyan-400 font-mono font-bold mb-1">2. GitHub Actions</div>
            <p className="text-neutral-400 text-[11px]">
              O runner do GitHub conecta com segurança na sua VPS da Oracle Cloud usando chave SSH criptografada.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="text-purple-400 font-mono font-bold mb-1">3. Migrações MariaDB</div>
            <p className="text-neutral-400 text-[11px]">
              Se houver novas colunas ou tabelas na pasta <code className="text-neutral-200 font-mono">migrations/</code>, são aplicadas automaticamente.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="text-emerald-400 font-mono font-bold mb-1">4. Reload via systemd</div>
            <p className="text-neutral-400 text-[11px]">
              O serviço <code className="text-neutral-200 font-mono">otserv.service</code> é reiniciado e o status validado.
            </p>
          </div>
        </div>
      </div>

      {/* GitHub Actions YAML */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-200 font-mono flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-amber-400" />
            .github/workflows/deploy.yml
          </span>
          <span className="text-[11px] text-neutral-400">Pronto para commitar</span>
        </div>

        <CodeBlock
          code={workflowYaml}
          language="yaml"
          filename=".github/workflows/deploy.yml"
          downloadable
          maxHeight="max-h-[480px]"
        />
      </div>

      {/* Secrets Configuration Guide */}
      <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-5 space-y-4">
        <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          <span>Configuração dos Secrets no Repositório GitHub</span>
        </h3>

        <p className="text-xs text-neutral-300">
          No seu repositório GitHub, acesse <strong>Settings &rarr; Secrets and variables &rarr; Actions &rarr; New repository secret</strong> e adicione as seguintes variáveis:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-900/60">
                <th className="py-2.5 px-3 font-semibold font-mono text-amber-300">Nome do Secret</th>
                <th className="py-2.5 px-3 font-semibold">Exemplo de Valor</th>
                <th className="py-2.5 px-3 font-semibold">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              <tr>
                <td className="py-2.5 px-3 font-mono text-amber-400">OCI_HOST_IP</td>
                <td className="py-2.5 px-3 font-mono text-neutral-400">129.148.42.10</td>
                <td className="py-2.5 px-3">IP público reservado da sua VM na Oracle Cloud</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-amber-400">OCI_USERNAME</td>
                <td className="py-2.5 px-3 font-mono text-neutral-400">ubuntu</td>
                <td className="py-2.5 px-3">Usuário de login SSH padrão da instância</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-amber-400">OCI_SSH_PRIVATE_KEY</td>
                <td className="py-2.5 px-3 font-mono text-neutral-400">-----BEGIN RSA PRIVATE KEY-----...</td>
                <td className="py-2.5 px-3">Conteúdo da sua chave privada SSH (.key / id_rsa)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-amber-400">DB_USER</td>
                <td className="py-2.5 px-3 font-mono text-neutral-400">styller</td>
                <td className="py-2.5 px-3">Usuário do banco MariaDB configurado no servidor</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-amber-400">DB_PASS</td>
                <td className="py-2.5 px-3 font-mono text-neutral-400">sua_senha_secreta</td>
                <td className="py-2.5 px-3">Senha do usuário styller no MariaDB</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono text-amber-400">DB_NAME</td>
                <td className="py-2.5 px-3 font-mono text-neutral-400">styller772</td>
                <td className="py-2.5 px-3">Nome da base de dados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
