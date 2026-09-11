#!/bin/bash
set -e

echo "=================================================================="
echo "🛠️ RETOMANDO ETAPA 2: BAIXANDO E COMPILANDO O MOTOR TFS 0.4"
echo "=================================================================="

# 1. Baixar código fonte com repositórios alternativos estáveis
echo "-> [1/3] Baixando código fonte do TFS 0.4 / Styller..."
cd /home/ubuntu
rm -rf tfs-0.4-source

git clone https://github.com/otland/forgottenserver.git tfs-0.4-source || \
git clone https://github.com/gesior/forgottenserver.git tfs-0.4-source || \
git clone https://github.com/peonso/forgottenserver.git tfs-0.4-source || \
git clone https://github.com/opendal/forgottenserver.git tfs-0.4-source

cd tfs-0.4-source

# 2. Compilar com CMake ou Autotools / Make
echo "-> [2/3] Compilando o motor (isso pode levar alguns minutos)..."
if [ -f "CMakeLists.txt" ]; then
    mkdir -p build && cd build
    cmake ..
    make -j$(nproc)
    BINARY_PATH="theforgottenserver"
elif [ -f "autogen.sh" ]; then
    ./autogen.sh
    ./configure --enable-mysql --enable-server-diagnostics
    make -j$(nproc)
    BINARY_PATH="theforgottenserver"
elif [ -f "Makefile" ]; then
    make -j$(nproc)
    BINARY_PATH="theforgottenserver"
else
    mkdir -p build && cd build
    cmake ..
    make -j$(nproc)
    BINARY_PATH="theforgottenserver"
fi

# 3. Copiar para a pasta do Styller 8.50
echo "-> [3/3] Copiando binário compilado para a pasta do Styller 8.50..."
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
