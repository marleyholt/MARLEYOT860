#!/bin/bash
set -e

echo "=================================================================="
echo "🧹 LIMPANDO PROCESSOS E CONFIGURANDO MARLEYOT 8.6 (24/7)"
echo "=================================================================="

# 1. Parar todos os serviços systemd que possam existir relacionados a ot
echo "-> [1/5] Parando serviços systemd antigos..."
sudo systemctl stop otserv.service 2>/dev/null || true
sudo systemctl disable otserv.service 2>/dev/null || true
sudo systemctl stop marleyot.service 2>/dev/null || true
sudo systemctl disable marleyot.service 2>/dev/null || true
sudo systemctl stop marleyot86.service 2>/dev/null || true
sudo systemctl disable marleyot86.service 2>/dev/null || true

# 2. Matar qualquer processo tfs ou otserver rodando em segundo plano
echo "-> [2/5] Encerrando processos órfãos (tfs / otserver)..."
sudo killall -9 tfs 2>/dev/null || true
sudo killall -9 otserver 2>/dev/null || true
pkill -f tfs 2>/dev/null || true
pkill -f otserver 2>/dev/null || true

# 3. Liberar portas 7171 e 7172
echo "-> [3/5] Liberando portas 7171 e 7172..."
sudo fuser -k 7171/tcp 2>/dev/null || true
sudo fuser -k 7172/tcp 2>/dev/null || true

# 4. Criar o novo serviço limpo para o OT 8.6
echo "-> [4/5] Criando o novo serviço limpo /etc/systemd/system/marleyot86.service..."
sudo bash -c 'cat << "EOF" > /etc/systemd/system/marleyot86.service
[Unit]
Description=MarleyOT 8.6 Styller Yurots 24/7
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/marleyot86/Styller Yourots 0.6.1 Rev 01 (8.50)
ExecStart=/home/ubuntu/marleyot86/Styller Yourots 0.6.1 Rev 01 (8.50)/theforgottenserver
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF'

sudo systemctl daemon-reload
sudo systemctl enable marleyot86.service

# 5. Iniciar o serviço
echo "-> [5/5] Iniciando o MarleyOT 8.6..."
sudo systemctl start marleyot86.service

echo "=================================================================="
echo "📊 STATUS DO MARLEYOT 8.6:"
echo "=================================================================="
sudo systemctl status marleyot86.service --no-pager -l
echo "=================================================================="
echo "✅ SERVIDOR CONFIGURADO PARA RODAR 24/7 COM SUCESSO!"
echo "=================================================================="
