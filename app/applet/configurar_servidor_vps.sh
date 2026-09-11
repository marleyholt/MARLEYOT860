#!/bin/bash
set -e

echo "=================================================================="
echo "🚀 CONFIGURANDO O MARLEYOT 8.6 NO SERVIDOR (MARLEYOT)"
echo "=================================================================="

SERVER_DIR="/home/ubuntu/marleyot86/Styller Yourots 0.6.1 Rev 01 (8.50)"

if [ ! -d "$SERVER_DIR" ]; then
    echo "❌ Diretório $SERVER_DIR não encontrado!"
    exit 1
fi

cd "$SERVER_DIR"

echo "-> [1/3] Configurando privilégios do banco de dados MySQL..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS styller;" 2>/dev/null || true
sudo mysql -e "CREATE USER IF NOT EXISTS 'marleyot'@'localhost' IDENTIFIED BY 'marley22';" 2>/dev/null || true
sudo mysql -e "GRANT ALL PRIVILEGES ON styller.* TO 'marleyot'@'localhost';" 2>/dev/null || true
sudo mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || true

echo "-> [2/3] Importando schema mysql.sql..."
sudo mysql styller < schemas/mysql.sql || echo "Schema já importado."

echo "-> [3/3] Criando serviço systemd (otserv.service)..."
sudo bash -c 'cat << "EOF" > /etc/systemd/system/otserv.service
[Unit]
Description=MarleyOT 8.6 OpenTibia Server
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/marleyot86/Styller Yourots 0.6.1 Rev 01 (8.50)
ExecStart=/home/ubuntu/marleyot86/Styller Yourots 0.6.1 Rev 01 (8.50)/theforgottenserver
Restart=always
RestartSec=10
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF'

sudo systemctl daemon-reload
sudo systemctl enable otserv.service

echo "=================================================================="
echo "✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
echo "=================================================================="
