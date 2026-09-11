#!/bin/bash
set -e

echo "=================================================================="
echo "🛠️ COMPILANDO O TFS 0.4 (GLINHARENB / OT 8.50-8.60) NA VPS"
echo "=================================================================="

# 1. Garantir dependências de compilação instaladas
echo "-> [1/4] Garantindo dependências no Ubuntu..."
sudo apt update
sudo apt install -y git build-essential autoconf automake libtool make pkg-config \
libmysqlclient-dev libxml2-dev libboost-all-dev liblua5.1-0-dev libssl-dev libcrypto++-dev 2>/dev/null || \
sudo apt install -y git build-essential autoconf automake libtool make pkg-config \
libmariadb-dev libxml2-dev libboost-all-dev liblua5.1-0-dev libssl-dev libcrypto++-dev

# 2. Clonar o repositório comprovado do TFS 0.4 (glinharesb/theforgottenserver-0.4)
echo "-> [2/4] Clonando repositório TFS 0.4 otimizado para Linux..."
cd /home/ubuntu
rm -rf tfs-0.4-source
git clone https://github.com/glinharesb/theforgottenserver-0.4.git tfs-0.4-source

cd tfs-0.4-source

# 3. Compilar usando Autotools (padrão TFS 0.4)
echo "-> [3/4] Compilando o motor (isso pode levar alguns minutos)..."
if [ -f "autogen.sh" ]; then
    ./autogen.sh
    ./configure --enable-mysql --enable-server-diagnostics
    make -j$(nproc)
    BINARY_PATH="theforgottenserver"
elif [ -f "CMakeLists.txt" ]; then
    mkdir -p build && cd build
    cmake ..
    make -j$(nproc)
    BINARY_PATH="theforgottenserver"
else
    make -j$(nproc)
    BINARY_PATH="theforgottenserver"
fi

# 4. Copiar para a pasta do Styller 8.50
echo "-> [4/4] Copiando binário compilado para a pasta do Styller 8.50..."
TARGET_DIR="/home/ubuntu/marleyot86/Styller Yourots 0.6.1 Rev 01 (8.50)"
mkdir -p "$TARGET_DIR"

if [ -f "$BINARY_PATH" ]; then
    cp -f "$BINARY_PATH" "$TARGET_DIR/theforgottenserver"
else
    find . -name "theforgottenserver" -exec cp -f {} "$TARGET_DIR/theforgottenserver" \;
fi
chmod +x "$TARGET_DIR/theforgottenserver"

# Reiniciar serviço systemd
sudo systemctl restart marleyot86.service

echo "=================================================================="
echo "✅ COMPILAÇÃO CONCLUÍDA E SERVIÇO REINICIADO COM SUCESSO!"
echo "=================================================================="
sudo systemctl status marleyot86.service --no-pager -l
