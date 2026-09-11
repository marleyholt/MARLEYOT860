#!/bin/bash
set -e

echo "=================================================================="
echo "🛠️ ETAPA 2: COMPILANDO O MOTOR TFS 0.4 PARA O STYLLER 8.50"
echo "=================================================================="

# 1. Instalar dependências essenciais para compilação no Ubuntu 20.04
echo "-> [1/4] Instalando dependências de compilação..."
sudo apt update
sudo apt install -y git build-essential autoconf automake libtool make pkg-config \
libmysqlclient-dev libxml2-dev libboost-all-dev liblua5.1-0-dev libssl-dev libcrypto++-dev 2>/dev/null || \
sudo apt install -y git build-essential autoconf automake libtool make pkg-config \
libmariadb-dev libxml2-dev libboost-all-dev liblua5.1-0-dev libssl-dev libcrypto++-dev

# 2. Clonar o código fonte do TFS 0.4 (compatível com Styller 0.6.1 / 8.50)
echo "-> [2/4] Baixando código fonte do TFS 0.4..."
cd /home/ubuntu
rm -rf tfs-0.4-source
git clone https://github.com/otland/forgottenserver.git -b 0.4 tfs-0.4-source || \
git clone https://github.com/opentibia/forgottenserver.git tfs-0.4-source

cd tfs-0.4-source

# 3. Compilar usando autotools ou cmake (dependendo do repo)
echo "-> [3/4] Compilando o executável (theforgottenserver)..."
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
else
    # Caso seja makefile direto
    make -j$(nproc)
    BINARY_PATH="theforgottenserver"
fi

# 4. Copiar o binário gerado para a pasta do Styller 8.50
echo "-> [4/4] Copiando o binário para a pasta do Styller 8.50..."
TARGET_DIR="/home/ubuntu/marleyot86/Styller Yourots 0.6.1 Rev 01 (8.50)"
mkdir -p "$TARGET_DIR"

if [ -f "$BINARY_PATH" ]; then
    cp -f "$BINARY_PATH" "$TARGET_DIR/theforgottenserver"
    chmod +x "$TARGET_DIR/theforgottenserver"
    echo "   [+] Executável copiado com sucesso para $TARGET_DIR!"
else
    # Buscar recursivamente se necessário
    find . -name "theforgottenserver" -exec cp -f {} "$TARGET_DIR/theforgottenserver" \;
    chmod +x "$TARGET_DIR/theforgottenserver"
    echo "   [+] Binário localizado e copiado!"
fi

# Reiniciar o serviço systemd
sudo systemctl restart marleyot86.service

echo "=================================================================="
echo "📊 STATUS DO SERVIÇO APÓS ETAPA 2:"
echo "=================================================================="
sudo systemctl status marleyot86.service --no-pager -l
echo "=================================================================="
echo "✅ ETAPA 2 CONCLUÍDA COM SUCESSO!"
echo "=================================================================="
