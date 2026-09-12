import { ClientFileNode, BotScriptPreset, TroubleIssue } from '../types';

export const REPOSITORIES_INFO = {
  styller: {
    name: 'luanluciano93/styller',
    url: 'https://github.com/luanluciano93/styller',
    description: 'Servidor OTServ 7.72 clássico baseado no lendário mapa Styller Yourots, otimizado para combate retro sem mira automática (sem crosshair hotkeys para runas), exaustão unificada e suporte moderno a MariaDB.',
    protocol: '7.72',
    author: 'Luan Luciano',
    coreBase: 'TFS 0.4 / TFS 1.5 Downgrade (Nekiro) compatível com protocolo 7.72',
  },
  otclientv8: {
    name: 'OTCv8/otclientv8',
    url: 'https://github.com/OTCv8/otclientv8',
    description: 'Cliente open-source de alta performance com renderizador acelerado via hardware (OpenGL/DirectX), bot integrado nativo em Lua (vBot/game_bot), suporte a Extended Opcodes (0x32), e sprites U32.',
    features: ['vBot Integrado', 'Extended Opcodes (0x32)', 'Hardware Acceleration', 'Discord Rich Presence', 'Cross-Platform'],
  },
};

export const COMPILATION_DEPENDENCIES_UBUNTU = [
  { name: 'build-essential', desc: 'Compiladores gcc e g++ e ferramentas make' },
  { name: 'cmake', desc: 'Sistema de build multiplataforma para gerar Makefiles' },
  { name: 'libboost-all-dev', desc: 'Bibliotecas Boost (asio, filesystem, system, iostreams) cruciais para a rede assíncrona' },
  { name: 'libmariadb-dev / libmysqlclient-dev', desc: 'Headers e conectores C++ para o banco de dados MariaDB/MySQL' },
  { name: 'liblua5.1-0-dev', desc: 'Interpretador Lua 5.1 e bibliotecas de ligação com o servidor' },
  { name: 'libcrypto++-dev / libssl-dev', desc: 'Bibliotecas de criptografia RSA/XTEA para descriptografar pacotes de login' },
  { name: 'libgmp-dev', desc: 'Biblioteca aritmética de precisão múltipla (GNU Multiple Precision)' },
  { name: 'libpugixml-dev', desc: 'Parser XML de alta velocidade para carregar monstros, itens, npcs e spells' },
];

export const CLIENT_DIRECTORY_TREE: ClientFileNode = {
  name: 'otclientv8-772/',
  type: 'folder',
  path: '/',
  description: 'Raiz da pasta do OTClientV8 pronta para empacotamento e distribuição',
  required: true,
  children: [
    {
      name: 'otclientv8.exe',
      type: 'file',
      path: '/otclientv8.exe',
      description: 'Executável binário compilado do cliente OTClientV8 para Windows (x86/x64).',
      required: true,
      notes: 'Pode ser protegido com encriptação de assets em produção.'
    },
    {
      name: 'init.lua',
      type: 'file',
      path: '/init.lua',
      description: 'Ponto de entrada do cliente. Carrega as flags de jogo, resolução, versão padrão forçada (772) e opcodes estendidos.',
      required: true,
      notes: 'Deve conter g_game.setClientVersion(772) e g_game.enableFeature(GameExtendedOpcode).'
    },
    {
      name: 'config.otml',
      type: 'file',
      path: '/config.otml',
      description: 'Arquivo de preferências do jogador (resolução de tela, fullscreen, v-sync, volume de som, layout).',
      required: false,
    },
    {
      name: 'data/',
      type: 'folder',
      path: '/data',
      description: 'Pasta com os ativos brutos, fontes, sons, gráficos e estilos da interface OTUI.',
      required: true,
      children: [
        {
          name: 'things/',
          type: 'folder',
          path: '/data/things',
          description: 'Diretório com os arquivos binários das sprites e metadados de cada protocolo.',
          required: true,
          children: [
            {
              name: '772/',
              type: 'folder',
              path: '/data/things/772',
              description: 'Pasta sagrada do protocolo 7.72. O cliente lê diretamente daqui.',
              required: true,
              children: [
                {
                  name: 'Tibia.spr',
                  type: 'file',
                  path: '/data/things/772/Tibia.spr',
                  description: 'Matriz gráfica contendo todos os blocos de 32x32 pixels das criaturas, itens e chão da versão 7.72.',
                  required: true,
                  notes: 'Tamanho clássico original 7.72: ~18.5 MB a 24 MB.'
                },
                {
                  name: 'Tibia.dat',
                  type: 'file',
                  path: '/data/things/772/Tibia.dat',
                  description: 'Metadados ThingType: associa as sprites aos objetos, definindo largura, altura, camadas, direções e animações.',
                  required: true,
                  notes: 'Sua assinatura (Signature) deve bater rigorosamente com o items.otb do servidor!'
                }
              ]
            }
          ]
        },
        {
          name: 'fonts/',
          type: 'folder',
          path: '/data/fonts',
          description: 'Fontes TrueType (.ttf) usadas na interface (Martel, Roboto, consola).',
          required: true,
        },
        {
          name: 'styles/',
          type: 'folder',
          path: '/data/styles',
          description: 'Definições visuais de botões, barras e janelas em sintaxe OTML.',
          required: true,
        }
      ]
    },
    {
      name: 'modules/',
      type: 'folder',
      path: '/modules',
      description: 'Módulos independentes em Lua/OTUI que formam todos os subsistemas do jogo.',
      required: true,
      children: [
        {
          name: 'client_entergame/',
          type: 'folder',
          path: '/modules/client_entergame',
          description: 'Janela de login onde o jogador digita Conta e Senha.',
          required: true,
          children: [
            {
              name: 'entergame.lua',
              type: 'file',
              path: '/modules/client_entergame/entergame.lua',
              description: 'Onde o IP (host) e a porta (7171) do servidor Styller são fixados para o cliente entrar direto sem digitação de IP Changer!',
              required: true,
            },
            {
              name: 'entergame.otui',
              type: 'file',
              path: '/modules/client_entergame/entergame.otui',
              description: 'Layout visual da janela de login (campos, botão Conectar, logo customizado).',
              required: true,
            }
          ]
        },
        {
          name: 'game_bot/',
          type: 'folder',
          path: '/modules/game_bot',
          description: 'Módulo do vBot oficial embutido no OTClientV8. Opera diretamente no loop de eventos do cliente sem injeção de DLL.',
          required: true,
          children: [
            {
              name: 'bot.lua',
              type: 'file',
              path: '/modules/game_bot/bot.lua',
              description: 'Núcleo do motor de automação (registrador da primitiva macro, timers, listeners).',
              required: true,
            },
            {
              name: 'default_scripts/',
              type: 'folder',
              path: '/modules/game_bot/default_scripts',
              description: 'Scripts pré-instalados: Auto UH 7.72, Auto Mana Fluid, Auto Haste, Anti-Paralyze, CaveBot e TargetBot.',
              required: true,
            }
          ]
        },
        {
          name: 'game_interface/',
          type: 'folder',
          path: '/modules/game_interface',
          description: 'Barra lateral de equipamentos (inventário), mini-mapa, barras de vida/mana e console de mensagens.',
          required: true,
        },
        {
          name: 'game_custom_ui/',
          type: 'folder',
          path: '/modules/game_custom_ui',
          description: 'Módulo customizado para receber Extended Opcodes (0x32) e mostrar saldo bancário, pontos VIP e ranking.',
          required: false,
        }
      ]
    }
  ]
};

export const BOT_PRESETS: BotScriptPreset[] = [
  {
    id: 'auto-uh',
    name: 'Auto UH 7.72 (Rune Healing)',
    category: 'Healing',
    description: 'Utiliza a Ultimate Healing Rune (ID 3160) diretamente no personagem respeitando rigorosamente a exaustão mecânica de itens de 1000ms do protocolo 7.72.',
    parameters: [
      { name: 'Vida Mínima (%)', key: 'minHp', type: 'number', defaultVal: 70, description: 'Percentual de HP abaixo do qual a UH é disparada' },
      { name: 'Item ID da UH', key: 'runeId', type: 'number', defaultVal: 3160, description: 'ID clássico da Ultimate Healing Rune no 7.72' },
      { name: 'Exaustão (ms)', key: 'exhaustDelay', type: 'number', defaultVal: 1000, description: 'Pausa mínima entre tentativas para não estourar exaustão mecânica' },
    ],
    code: `-- modules/game_bot/default_scripts/AutoUH_772.lua
-- Script nativo de alta performance para vBot (OTClientV8)
-- Desenvolvido para regras de combate 7.72 (exaustão compartilhada de 1s)

local CONFIG = {
    minHpPercent = 70,      -- Curar quando o HP for menor ou igual a 70%
    uhId = 3160,            -- ID clássico da Ultimate Healing Rune no 7.72
    exhaustionMs = 1000     -- 1000ms de cooldown clássico de runas/itens
}

macro(100, "Auto UH 7.72", function()
    -- Se o jogador estiver morto ou desconectado, não prosseguir
    if not g_game.isOnline() then return end
    
    local currentHp = hppercent()
    if currentHp <= CONFIG.minHpPercent then
        local rune = findItem(CONFIG.uhId)
        if rune then
            -- No 7.72, useWith aplica a runa no próprio player
            useWith(rune, player)
            -- delay() previne flood no loop do cliente e respeita o tick do servidor
            delay(CONFIG.exhaustionMs)
        end
    end
end)`
  },
  {
    id: 'auto-manafluid',
    name: 'Auto Mana Fluid 7.72',
    category: 'Healing',
    description: 'Bebe Mana Fluid (ID 2874 / 2006 com sub-tipo mana) quando o percentual de mana cair abaixo do limite configurado.',
    parameters: [
      { name: 'Mana Mínima (%)', key: 'minMana', type: 'number', defaultVal: 50, description: 'Percentual de MP para usar Mana Fluid' },
      { name: 'Item ID do Mana Fluid', key: 'fluidId', type: 'number', defaultVal: 2874, description: 'ID do frasco de mana' },
      { name: 'Intervalo (ms)', key: 'delayMs', type: 'number', defaultVal: 800, description: 'Intervalo de checagem do frasco' },
    ],
    code: `-- modules/game_bot/default_scripts/AutoManaFluid_772.lua
-- Bebe Mana Fluid automaticamente em background
local CONFIG = {
    minManaPercent = 50,
    manaFluidId = 2874, -- ID padrão de Mana Fluid no 7.72
    intervalMs = 800
}

macro(200, "Auto Mana Fluid", function()
    if not g_game.isOnline() then return end

    if manapercent() <= CONFIG.minManaPercent then
        local fluid = findItem(CONFIG.manaFluidId)
        if fluid then
            useWith(fluid, player)
            delay(CONFIG.intervalMs)
        end
    end
end)`
  },
  {
    id: 'auto-haste',
    name: 'Auto Haste (Utani Hur / Utani Gran Hur)',
    category: 'Support',
    description: 'Mantém velocidade acelerada contínua verificando se o personagem não está com o ícone de velocidade ativo.',
    parameters: [
      { name: 'Feitiço', key: 'spell', type: 'string', defaultVal: 'utani hur', description: 'Nome da magia (utani hur ou utani gran hur)' },
      { name: 'Mana Mínima', key: 'minManaReq', type: 'number', defaultVal: 60, description: 'Mana requerida para lançar o feitiço' },
    ],
    code: `-- modules/game_bot/default_scripts/AutoHaste_772.lua
local SPELL_NAME = "utani hur"
local MIN_MANA = 60

macro(500, "Auto Haste 7.72", function()
    if not g_game.isOnline() then return end

    -- hasHaste() checa os flags de condições do jogador
    if not hasHaste() and mana() >= MIN_MANA then
        say(SPELL_NAME)
        delay(1200)
    end
end)`
  },
  {
    id: 'anti-paralyze',
    name: 'Anti-Paralyze Automático',
    category: 'Support',
    description: 'Detecta instantaneamente a condição de paralisia e solta a magia de cura ou suporte configurada para restaurar a velocidade.',
    parameters: [
      { name: 'Feitiço de Cura', key: 'healSpell', type: 'string', defaultVal: 'exura', description: 'Magia usada para remover paralisia (exura, exura gran, utani hur)' },
    ],
    code: `-- modules/game_bot/default_scripts/AntiParalyze_772.lua
local CURE_SPELL = "exura"

macro(100, "Anti-Paralyze", function()
    if not g_game.isOnline() then return end

    -- Se o personagem estiver sob efeito de Paralyze
    if isParalyzed() then
        say(CURE_SPELL)
        delay(600)
    end
end)`
  },
  {
    id: 'aimbot-rune-772',
    name: 'Aimbot SD / HMM (Sem Crosshair)',
    category: 'Targeting',
    description: 'Como o 7.72 não possui mira de cruz (crosshair hotkey) nativa no client da CipSoft, o vBot simula o useWith diretamente no alvo atual travado na batalha.',
    parameters: [
      { name: 'ID da Runa', key: 'runeId', type: 'number', defaultVal: 3155, description: '3155 (SD) ou 3198 (HMM)' },
      { name: 'Intervalo (ms)', key: 'shootDelay', type: 'number', defaultVal: 1500, description: 'Exaustão de ataque ofensivo no 7.72' },
    ],
    code: `-- modules/game_bot/default_scripts/AimbotRune_772.lua
local CONFIG = {
    runeId = 3155, -- Sudden Death Rune (SD)
    shootInterval = 1500 -- 1.5s entre disparos ofensivos
}

macro(200, "Auto Shoot SD on Target", function()
    if not g_game.isOnline() then return end

    local currentTarget = g_game.getAttackingCreature()
    if currentTarget and currentTarget:getPosition() then
        local rune = findItem(CONFIG.runeId)
        if rune then
            useWith(rune, currentTarget)
            delay(CONFIG.shootInterval)
        end
    end
end)`
  },
];

export const EXTENDED_OPCODE_EXAMPLES = {
  opcodeNumber: 105,
  serverLua: `-- data/creaturescripts/scripts/extended_opcode_styller.lua
-- Evento registrado no login do jogador para sincronização com OTClientV8
local OPCODE_UI_SYNC = 105

function onExtendedOpcode(player, opcode, buffer)
    if opcode ~= OPCODE_UI_SYNC then
        return true
    end

    local status, data = pcall(json.decode, buffer)
    if not status or type(data) ~= "table" then
        return true
    end

    if data.action == "request_balance_and_points" then
        local payload = {
            action = "update_hud_info",
            bankBalance = player:getBankBalance(),
            vipPoints = player:getStorageValue(50000) > 0 and player:getStorageValue(50000) or 0,
            serverName = "Styller 7.72 Retro",
            uptimeMinutes = math.floor(os.uptime() / 60)
        }
        player:sendExtendedOpcode(OPCODE_UI_SYNC, json.encode(payload))
    end

    return true
end`,
  serverXml: `<!-- data/creaturescripts/creaturescripts.xml -->
<event type="extendedopcode" name="ExtendedOpcodeHandler" script="extended_opcode_styller.lua" />`,
  clientLua: `-- modules/game_custom_ui/custom_ui.lua
-- Registrado no OTClientV8 para exibir dados do servidor em tempo real
local OPCODE_UI_SYNC = 105

local hudWindow = nil
local balanceLabel = nil
local pointsLabel = nil

function init()
    ProtocolGame.registerExtendedOpcode(OPCODE_UI_SYNC, onReceiveServerData)
    connect(g_game, {
        onGameStart = requestServerData,
        onGameEnd = destroyUi
    })
    createUi()
end

function terminate()
    ProtocolGame.unregisterExtendedOpcode(OPCODE_UI_SYNC)
    destroyUi()
end

function createUi()
    hudWindow = g_ui.displayUI("custom_ui.otui")
    balanceLabel = hudWindow:getChildById("balanceLabel")
    pointsLabel = hudWindow:getChildById("pointsLabel")
end

function destroyUi()
    if hudWindow then
        hudWindow:destroy()
        hudWindow = nil
    end
end

function requestServerData()
    local protocol = g_game.getProtocolGame()
    if protocol then
        protocol:sendExtendedOpcode(OPCODE_UI_SYNC, json.encode({
            action = "request_balance_and_points"
        }))
    end
end

function onReceiveServerData(protocol, opcode, buffer)
    local status, data = pcall(json.decode, buffer)
    if status and data and data.action == "update_hud_info" then
        if balanceLabel then
            balanceLabel:setText(string.format("Banco: %s gps", comma_value(data.bankBalance)))
        end
        if pointsLabel then
            pointsLabel:setText(string.format("Pontos VIP: %d", data.vipPoints))
        end
    end
end`,
  clientOtui: `/* modules/game_custom_ui/custom_ui.otui */
MainWindow
  id: customHudWindow
  !text: tr('Painel Styller 7.72')
  size: 220 110
  @onEscape: self:destroy()

  Label
    id: balanceLabel
    !text: tr('Banco: Carregando...')
    anchors.top: parent.top
    anchors.left: parent.left
    margin-top: 10
    color: #ffde70

  Label
    id: pointsLabel
    !text: tr('Pontos VIP: 0')
    anchors.top: balanceLabel.bottom
    anchors.left: parent.left
    margin-top: 8
    color: #55ff55

  Button
    id: syncButton
    !text: tr('Atualizar')
    anchors.bottom: parent.bottom
    anchors.horizontalCenter: parent.horizontalCenter
    size: 100 24
    @onClick: requestServerData()`
};

export const TROUBLESHOOTING_LIST: TroubleIssue[] = [
  {
    id: 'issue-signature-mismatch',
    category: 'Cliente/Sprites',
    title: 'Erro: "Unsupported client version" ou "Only 7.72 clients are allowed"',
    symptom: 'Ao tentar conectar o OTClientV8, o servidor rejeita imediatamente com mensagem de protocolo incorreto ou versão não suportada.',
    rootCause: 'A assinatura hexadecimal do items.otb no servidor diverge da assinatura gravada no Tibia.dat do cliente, ou o cliente está enviando a versão 770/860 ao invés de 772.',
    solution: '1. No arquivo init.lua do OTClientV8, certifique-se de definir g_game.setClientVersion(772).\n2. Verifique se os arquivos Tibia.spr e Tibia.dat na pasta data/things/772/ são da versão 7.72 exata.\n3. Abra o items.otb com o Item Editor 7.72 e confirme que a versão do client alvo está gravada como 7.72.',
    codeSnippet: `-- No init.lua do cliente OTClientV8:
g_game.setClientVersion(772)
g_game.enableFeature(GameSpritesU32) -- Se suas sprites forem estendidas
g_game.enableFeature(GameExtendedOpcode)`
  },
  {
    id: 'issue-oracle-firewall',
    category: 'Rede/Firewall',
    title: 'Erro de Conexão: "Cannot connect to a login server (Error 10060)" na Oracle Cloud',
    symptom: 'O servidor inicia normalmente no terminal sem erros, mas nenhum jogador externo consegue conectar nas portas 7171 e 7172.',
    rootCause: 'A Oracle Cloud Infrastructure (OCI) possui duas camadas de firewall: o VCN Security List (na nuvem) e as regras iptables padrão do Ubuntu na VM que bloqueiam todas as conexões de entrada com REJECT.',
    solution: 'Você precisa liberar as portas 7171 e 7172 no painel web da OCI (Ingress Rules) E liberar as regras do iptables no Linux da instância.',
    codeSnippet: `# 1. Liberar portas no iptables do Ubuntu na OCI:
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 7171 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 7172 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT

# 2. Persistir as regras para não perder ao reiniciar:
sudo apt-get install -y netfilter-persistent iptables-persistent
sudo netfilter-persistent save
sudo netfilter-persistent reload`
  },
  {
    id: 'issue-result-free-leak',
    category: 'Crash/Memória',
    title: 'Crash do Servidor por Exaustão de RAM (OOM Killer) por falta de result.free',
    symptom: 'Após algumas horas ou dias online, o processo do TFS fecha repentinamente e os logs mostram "Killed" ou falha de alocação de memória.',
    rootCause: 'Toda consulta que usa db.storeQuery aloca memória nativa no driver C++ do MariaDB. Se result.free(resultId) não for chamado ao final, a memória vaza indefinidamente.',
    solution: 'Audite todos os scripts Lua em data/actions, data/creaturescripts e data/globalevents para garantir que todo db.storeQuery possua a devida desalocação com result.free.',
    codeSnippet: `-- Padrão correto e seguro:
local resultId = db.storeQuery("SELECT \`name\`, \`level\` FROM \`players\` WHERE \`id\` = 1;")
if resultId then
    local name = result.getString(resultId, "name")
    local level = result.getNumber(resultId, "level")
    result.free(resultId) -- MANDATÓRIO: Desaloca o ponteiro do heap!
end`
  },
  {
    id: 'issue-mysql-access-denied',
    category: 'Banco MariaDB',
    title: 'Erro de Inicialização: "[Error - Mysql::connect] Access denied for user \'styller\'@\'localhost\'"',
    symptom: 'Ao executar ./tfs, o servidor encerra dizendo que não conseguiu conectar com o banco de dados.',
    rootCause: 'Usuário do banco de dados não foi criado, senha no config.lua está incorreta, ou o usuário não tem permissão para autenticar via socket ou porta 3306.',
    solution: 'Acesse o MariaDB como root e recrie o usuário com autenticação por senha nativa (mysql_native_password).',
    codeSnippet: `sudo mysql -u root -p

-- No console do MariaDB:
CREATE DATABASE IF NOT EXISTS styller772 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'styller'@'localhost' IDENTIFIED BY 'SuaSenhaSegura123';
GRANT ALL PRIVILEGES ON styller772.* TO 'styller'@'localhost';
FLUSH PRIVILEGES;
EXIT;`
  },
  {
    id: 'issue-crosshair-targeting',
    category: 'Cliente/Sprites',
    title: 'Mecânica 7.72: Jogadores tentam usar mira de cruz (crosshair) nas runas e falham',
    symptom: 'Jogadores acostumados com versões 8.0+ reclamam que não conseguem colocar runas de ataque direto no botão de atalho (hotkey com mira automática).',
    rootCause: 'No protocolo 7.72 clássico original, as hotkeys de combate com mira no alvo ainda não existiam (foram introduzidas apenas no Tibia 8.0). As runas devem ser disparadas com o cursor do mouse ou via macro de auxílio no vBot.',
    solution: 'Para manter a fidelidade Old School, explique aos jogadores que o Styller 7.72 valoriza a jogabilidade mecânica e mira manual (PvP raiz), ou instrua o uso do script Aimbot integrado no vBot do OTClientV8.',
  }
];

export const FULL_SCHEMA_SQL = `-- schema_styller_772.sql
-- Estrutura relacional para Styller 7.72 / TFS 1.5 Nekiro / TFS 0.4
-- Motor: InnoDB para transações atômicas e performance sob concorrência

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS \`server_config\` (
  \`config\` varchar(50) NOT NULL,
  \`value\` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (\`config\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO \`server_config\` (\`config\`, \`value\`) VALUES
('db_version', '772'),
('server_name', 'Styller 7.72'),
('last_dragon_invasion', '0')
ON DUPLICATE KEY UPDATE \`config\`=\`config\`;

CREATE TABLE IF NOT EXISTS \`accounts\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(32) NOT NULL,
  \`password\` char(40) NOT NULL,
  \`premdays\` int(11) NOT NULL DEFAULT '0',
  \`lastday\` int(10) unsigned NOT NULL DEFAULT '0',
  \`email\` varchar(255) NOT NULL DEFAULT '',
  \`key\` varchar(20) NOT NULL DEFAULT '0',
  \`blocked\` tinyint(1) NOT NULL DEFAULT '0',
  \`warnings\` int(11) NOT NULL DEFAULT '0',
  \`group_id\` int(11) NOT NULL DEFAULT '1',
  \`created\` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`players\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`group_id\` int(11) NOT NULL DEFAULT '1',
  \`account_id\` int(11) NOT NULL DEFAULT '0',
  \`level\` int(11) NOT NULL DEFAULT '1',
  \`vocation\` int(11) NOT NULL DEFAULT '0',
  \`health\` int(11) NOT NULL DEFAULT '150',
  \`healthmax\` int(11) NOT NULL DEFAULT '150',
  \`experience\` bigint(20) NOT NULL DEFAULT '0',
  \`lookbody\` int(11) NOT NULL DEFAULT '0',
  \`lookfeet\` int(11) NOT NULL DEFAULT '0',
  \`lookhead\` int(11) NOT NULL DEFAULT '0',
  \`looklegs\` int(11) NOT NULL DEFAULT '0',
  \`looktype\` int(11) NOT NULL DEFAULT '136',
  \`lookaddons\` int(11) NOT NULL DEFAULT '0',
  \`maglevel\` int(11) NOT NULL DEFAULT '0',
  \`mana\` int(11) NOT NULL DEFAULT '0',
  \`manamax\` int(11) NOT NULL DEFAULT '0',
  \`mana_spent\` int(11) NOT NULL DEFAULT '0',
  \`soul\` int(10) unsigned NOT NULL DEFAULT '0',
  \`town_id\` int(11) NOT NULL DEFAULT '1',
  \`posx\` int(11) NOT NULL DEFAULT '160',
  \`posy\` int(11) NOT NULL DEFAULT '54',
  \`posz\` int(11) NOT NULL DEFAULT '7',
  \`cap\` int(11) NOT NULL DEFAULT '400',
  \`sex\` int(11) NOT NULL DEFAULT '0',
  \`lastlogin\` bigint(20) unsigned NOT NULL DEFAULT '0',
  \`lastip\` int(10) unsigned NOT NULL DEFAULT '0',
  \`save\` tinyint(1) NOT NULL DEFAULT '1',
  \`skull\` tinyint(1) unsigned NOT NULL DEFAULT '0',
  \`skulltime\` int(11) NOT NULL DEFAULT '0',
  \`rank_id\` int(11) NOT NULL DEFAULT '0',
  \`guildnick\` varchar(255) NOT NULL DEFAULT '',
  \`lastlogout\` bigint(20) unsigned NOT NULL DEFAULT '0',
  \`blessings\` tinyint(2) NOT NULL DEFAULT '0',
  \`balance\` bigint(20) NOT NULL DEFAULT '0',
  \`stamina\` bigint(20) NOT NULL DEFAULT '151200000',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`name\` (\`name\`),
  KEY \`account_id\` (\`account_id\`),
  KEY \`vocation\` (\`vocation\`),
  CONSTRAINT \`players_account_fk\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`player_storage\` (
  \`player_id\` int(11) NOT NULL DEFAULT '0',
  \`key\` int(10) unsigned NOT NULL DEFAULT '0',
  \`value\` varchar(255) NOT NULL DEFAULT '0',
  PRIMARY KEY (\`player_id\`,\`key\`),
  CONSTRAINT \`player_storage_fk\` FOREIGN KEY (\`player_id\`) REFERENCES \`players\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`player_items\` (
  \`player_id\` int(11) NOT NULL DEFAULT '0',
  \`pid\` int(11) NOT NULL DEFAULT '0',
  \`sid\` int(11) NOT NULL DEFAULT '0',
  \`itemtype\` smallint(6) NOT NULL DEFAULT '0',
  \`count\` smallint(6) NOT NULL DEFAULT '0',
  \`attributes\` blob NOT NULL,
  PRIMARY KEY (\`player_id\`,\`sid\`),
  KEY \`sid\` (\`sid\`),
  CONSTRAINT \`player_items_fk\` FOREIGN KEY (\`player_id\`) REFERENCES \`players\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`player_skills\` (
  \`player_id\` int(11) NOT NULL DEFAULT '0',
  \`skillid\` tinyint(2) NOT NULL DEFAULT '0',
  \`value\` int(10) unsigned NOT NULL DEFAULT '0',
  \`count\` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (\`player_id\`,\`skillid\`),
  CONSTRAINT \`player_skills_fk\` FOREIGN KEY (\`player_id\`) REFERENCES \`players\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`player_deaths\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`player_id\` int(11) NOT NULL,
  \`time\` bigint(20) unsigned NOT NULL DEFAULT '0',
  \`level\` int(11) NOT NULL DEFAULT '1',
  \`killed_by\` varchar(255) NOT NULL,
  \`is_player\` tinyint(1) NOT NULL DEFAULT '1',
  \`mostdamage_by\` varchar(100) NOT NULL,
  \`mostdamage_is_player\` tinyint(1) NOT NULL DEFAULT '0',
  \`unjustified\` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (\`id\`),
  KEY \`player_id\` (\`player_id\`),
  KEY \`time\` (\`time\`),
  CONSTRAINT \`player_deaths_fk\` FOREIGN KEY (\`player_id\`) REFERENCES \`players\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- Conta padrão para testes imediatos (Account: 1 / Password: 1)
-- Hash SHA1 de "1" = 356a192b7913b04c54574d18c28d46e6395428ab
INSERT INTO \`accounts\` (\`id\`, \`name\`, \`password\`, \`premdays\`, \`email\`, \`group_id\`, \`created\`) 
VALUES (1, '1', '356a192b7913b04c54574d18c28d46e6395428ab', 999, 'admin@styller772.local', 3, UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE \`id\`=\`id\`;
`;
