#!/bin/bash
set -e

echo "=================================================================="
echo "🛠️ COMPILANDO O MOTOR TFS 1.5 (DOWNGRADE 8.60 - NEKIRO) NA VPS"
echo "=================================================================="

# 1. Instalar dependências de compilação
echo "-> [1/5] Instalando dependências (cmake, g++, mysql, boost, etc)..."
sudo apt update
sudo apt install -y git cmake g++ build-essential libmysqlclient-dev libxml2-dev libboost-all-dev liblua5.2-dev libssl-dev libfmt-dev libspdlog-dev 2>/dev/null || \
sudo apt install -y git cmake g++ build-essential libmariadb-dev libxml2-dev libboost-all-dev liblua5.2-dev libssl-dev

# 2. Clonar o repositório do Nekiro branch 8.60
echo "-> [2/5] Baixando código fonte do TFS 1.5 (Nekiro 8.60)..."
cd /home/ubuntu
rm -rf tfs-src
git clone -b 8.60 https://github.com/nekiro/TFS-1.5-Downgrades.git tfs-src

# 3. Compilar com CMake
echo "-> [3/5] Compilando o executável (isso pode levar alguns minutos)..."
cd tfs-src
mkdir -p build
cd build
cmake ..
make -j$(nproc)

# 4. Copiar o binário gerado para a pasta do Styller 8.60
echo "-> [4/5] Copiando o binário 'theforgottenserver' para a pasta do servidor..."
TARGET_DIR="/home/ubuntu/marleyot86/Styller Yourots 0.6.1 Rev 01 (8.50)"
mkdir -p "$TARGET_DIR"
cp -f theforgottenserver "$TARGET_DIR/"
chmod +x "$TARGET_DIR/theforgottenserver"

# 5. Reiniciar o serviço systemd
echo "-> [5/5] Reiniciando o serviço marleyot86.service..."
sudo systemctl restart marleyot86.service

echo "=================================================================="
echo "📊 STATUS DO SERVIÇO APÓS COMPILAÇÃO:"
echo "=================================================================="
sudo systemctl status marleyot86.service --no-pager -l
echo "=================================================================="
echo "✅ TFS 1.5 8.60 COMPILADO E EXECUTANDO COM SUCESSO!"
echo "=================================================================="
