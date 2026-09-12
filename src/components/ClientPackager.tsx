import React, { useState } from 'react';
import { 
  FolderTree, 
  FileCode, 
  Folder, 
  File, 
  Download, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  PackageCheck,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { CLIENT_DIRECTORY_TREE } from '../data/guideData';
import { ClientFileNode } from '../types';
import { CodeBlock } from './CodeBlock';

export const ClientPackager: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ClientFileNode>(CLIENT_DIRECTORY_TREE);
  const [serverIp, setServerIp] = useState('127.0.0.1');
  const [serverPort, setServerPort] = useState(7171);
  const [serverTitle, setServerTitle] = useState('Styller 7.72 Retro');
  const [activeTab, setActiveTab] = useState<'tree' | 'entergame' | 'init' | 'sprites-guide'>('tree');

  // Generator for entergame.lua
  const generatedEntergameLua = `-- modules/client_entergame/entergame.lua
-- Configurado para conectar automaticamente no servidor Styller 7.72
EnterGame = { }

-- Dados fixados do seu servidor (Elimina a necessidade de IP Changer para os jogadores!)
local DEFAULT_SERVER = "${serverIp}"
local DEFAULT_PORT = ${serverPort}
local DEFAULT_VERSION = 772
local SERVER_NAME = "${serverTitle}"

function EnterGame.init()
  enterGameButton = modules.client_topmenu.addLeftButton('enterGameButton', tr('Login Box'), '/images/topmenu/login', EnterGame.openWindow)
  
  enterGame = g_ui.displayUI('entergame')
  enterGame:hide()

  -- Auto-preenchimento do IP e Porta nos campos
  local serverHost = enterGame:getChildById('serverHostTextEdit')
  if serverHost then
    serverHost:setText(DEFAULT_SERVER)
  end

  local serverPortWidget = enterGame:getChildById('serverPortTextEdit')
  if serverPortWidget then
    serverPortWidget:setText(tostring(DEFAULT_PORT))
  end

  local clientVersionCombo = enterGame:getChildById('clientVersionSelector')
  if clientVersionCombo then
    clientVersionCombo:setCurrentOption(tostring(DEFAULT_VERSION))
  end

  -- Trava a versão para 772
  g_game.setClientVersion(DEFAULT_VERSION)
  g_game.setProtocolVersion(DEFAULT_VERSION)
end

function EnterGame.terminate()
  enterGame:destroy()
  enterGame = nil
  enterGameButton:destroy()
  enterGameButton = nil
end

function EnterGame.doLogin()
  local account = enterGame:getChildById('accountNameTextEdit'):getText()
  local password = enterGame:getChildById('accountPasswordTextEdit'):getText()
  local host = DEFAULT_SERVER
  local port = DEFAULT_PORT

  EnterGame.hide()
  g_game.loginWorld(account, password, host, port, "")
end`;

  // Generator for init.lua
  const generatedInitLua = `-- init.lua (Raiz do OTClientV8)
-- Ponto de entrada do cliente - Protocolo 7.72

-- Forçar versão 7.72
g_game.setClientVersion(772)
g_game.setProtocolVersion(772)

-- Habilitar recursos modernos do OTClientV8 compatíveis com 7.72
g_game.enableFeature(GameExtendedOpcode)    -- Comunicação JSON (Opcode 0x32) com o servidor
g_game.enableFeature(GameDiagonalAnimatedWalk)
g_game.enableFeature(GameClassicPvP)       -- Força mira manual retro

-- Caso utilize sprites estendidas compiladas no Object Builder:
-- g_game.enableFeature(GameSpritesU32)
-- g_game.enableFeature(GameSpritesAlphaChannel)

-- Resolução inicial recomendada
g_window.setTitle("${serverTitle} - OTClientV8")
g_window.setMinimumSize({ width = 800, height = 600 })

-- Carregamento dos módulos primordiais
dofile('core.lua')
dofile('modules.lua')`;

  // Recursive Tree Node Renderer
  const renderTree = (node: ClientFileNode, depth: number = 0) => {
    const isSelected = selectedNode.path === node.path;
    const isFolder = node.type === 'folder';

    return (
      <div key={node.path} className="select-none">
        <div
          onClick={() => setSelectedNode(node)}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          className={`flex items-center py-1.5 pr-2 rounded-md cursor-pointer text-xs font-mono transition-colors ${
            isSelected
              ? 'bg-amber-500/20 text-amber-300 font-semibold border-l-2 border-amber-500'
              : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
          }`}
        >
          <span className="mr-2 opacity-70">
            {isFolder ? (
              <Folder className="w-3.5 h-3.5 text-amber-400 inline" />
            ) : (
              <File className="w-3.5 h-3.5 text-neutral-400 inline" />
            )}
          </span>
          <span className="truncate">{node.name}</span>
          {node.required && (
            <span className="ml-auto text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">
              Obrigatório
            </span>
          )}
        </div>

        {node.children && (
          <div className="border-l border-neutral-800 ml-4">
            {node.children.map((child) => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
          <FolderTree className="w-3.5 h-3.5" />
          <span>MONTAGEM DO CLIENTE OTCLIENTV8</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">
          Estrutura de Pastas &amp; Empacotamento do Cliente 7.72
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm mt-1">
          Aprenda a montar a pasta do OTClientV8 com os arquivos binários do 7.72 (<code className="text-amber-300">Tibia.spr</code> e <code className="text-amber-300">Tibia.dat</code>),
          travar o IP no login e gerar o pacote pronto para distribuição (.ZIP).
        </p>
      </div>

      {/* Sub-Tabs */}
      <div className="flex space-x-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('tree')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'tree'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Árvore de Pastas Oficial</span>
        </button>

        <button
          onClick={() => setActiveTab('entergame')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'entergame'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Gerador entergame.lua (IP Travado)</span>
        </button>

        <button
          onClick={() => setActiveTab('init')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'init'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Gerador init.lua (7.72 Forçado)</span>
        </button>

        <button
          onClick={() => setActiveTab('sprites-guide')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'sprites-guide'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Sincronizar Sprites &amp; OTB</span>
        </button>
      </div>

      {/* TAB 1: Tree Viewer */}
      {activeTab === 'tree' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Tree Explorer */}
          <div className="lg:col-span-5 rounded-xl border border-neutral-800 bg-[#0d1117] p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800 text-xs font-semibold text-neutral-300">
              <span>Navegador de Arquivos do Cliente</span>
              <span className="text-neutral-500 font-mono text-[10px]">Clique para inspecionar</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-0.5">
              {renderTree(CLIENT_DIRECTORY_TREE)}
            </div>
          </div>

          {/* Right Inspector Box */}
          <div className="lg:col-span-7 rounded-xl border border-neutral-800 bg-[#0d1117] p-5 space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                {selectedNode.type === 'folder' ? (
                  <Folder className="w-4 h-4 text-amber-400" />
                ) : (
                  <File className="w-4 h-4 text-cyan-400" />
                )}
                <h3 className="text-base font-semibold text-neutral-100 font-mono">
                  {selectedNode.path}
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-neutral-800 text-neutral-300">
                Tipo: {selectedNode.type === 'folder' ? 'Diretório' : 'Arquivo'}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-neutral-900/70 border border-neutral-800/80 space-y-2">
              <span className="text-xs font-semibold text-neutral-300 block">Finalidade &amp; Regra Técnica:</span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {selectedNode.description}
              </p>
              {selectedNode.notes && (
                <div className="pt-2 border-t border-neutral-800 text-[11px] text-amber-300/90 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{selectedNode.notes}</span>
                </div>
              )}
            </div>

            {/* Packaging Checklist */}
            <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/50 p-4 space-y-3">
              <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                Checklist para Compactar e Distribuir aos Jogadores (.ZIP):
              </span>
              <ul className="text-xs text-neutral-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    Coloque o <code className="text-amber-300">Tibia.spr</code> e o <code className="text-amber-300">Tibia.dat</code> dentro de <code className="text-neutral-200 font-mono">data/things/772/</code>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    Edite <code className="text-neutral-200 font-mono">modules/client_entergame/entergame.lua</code> com o IP fixado do seu servidor Styller.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    Delete arquivos de histórico local antes de compactar (ex: <code className="text-neutral-400 font-mono">config.otml</code> e pastas de logs geradas).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    Compacte toda a pasta em formato <code className="text-neutral-200 font-mono">.zip</code>. O jogador descompacta e roda direto <code className="text-neutral-200 font-mono">otclientv8.exe</code>!
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: entergame.lua Generator */}
      {activeTab === 'entergame' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-[#0d1117] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">IP ou Host do Servidor</label>
              <input
                type="text"
                value={serverIp}
                onChange={(e) => setServerIp(e.target.value)}
                placeholder="ex: 129.148.42.10 ou styller772.com"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Porta de Conexão</label>
              <input
                type="number"
                value={serverPort}
                onChange={(e) => setServerPort(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Título da Janela do Cliente</label>
              <input
                type="text"
                value={serverTitle}
                onChange={(e) => setServerTitle(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <CodeBlock
            code={generatedEntergameLua}
            language="lua"
            filename="modules/client_entergame/entergame.lua"
            downloadable
            maxHeight="max-h-[500px]"
          />
        </div>
      )}

      {/* TAB 3: init.lua Generator */}
      {activeTab === 'init' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-[#0d1117] text-xs text-neutral-300 space-y-1">
            <span className="font-semibold text-amber-400 block">
              Ponto de Inicialização do OTClientV8:
            </span>
            <p>
              O arquivo <code className="text-amber-300 font-mono">init.lua</code> reside na raiz da pasta do cliente.
              Ele trava a versão 772, habilita o protocolo de comunicação bidirecional <strong>Extended Opcode</strong> (0x32) e ativa o renderer gráfico.
            </p>
          </div>

          <CodeBlock
            code={generatedInitLua}
            language="lua"
            filename="init.lua"
            downloadable
            maxHeight="max-h-[500px]"
          />
        </div>
      )}

      {/* TAB 4: Sprites, DAT, OTB Synchronization Guide */}
      {activeTab === 'sprites-guide' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-neutral-800 bg-[#0d1117] p-5 space-y-4">
            <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>O Fluxo Sagrado de Sincronização dos 4 Arquivos Binários</span>
            </h3>

            <p className="text-xs text-neutral-300 leading-relaxed">
              No OpenTibia 7.72, qualquer item, criatura ou efeito visual exige sincronia absoluta entre o cliente e o servidor.
              Se um dos 4 arquivos for alterado sem atualizar os outros três, o servidor não inicializa ou o cliente fecha com crash (Debug Assertion):
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-xs font-bold text-amber-400 font-mono block">1. Tibia.spr (Client)</span>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Matriz de pixels de 32x32. Editado pelo <strong>Object Builder</strong>. Armazena a arte visual pura.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-xs font-bold text-cyan-400 font-mono block">2. Tibia.dat (Client)</span>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Agrupa as sprites em objetos (ThingType), dimensões (1x1, 2x2), camadas de cor e direções cardeais.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-xs font-bold text-emerald-400 font-mono block">3. items.otb (Server)</span>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Mapeia o <strong>Client ID</strong> para o <strong>Server ID</strong>. Contém flags físicas: bloqueia passagem, empilha, etc.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-xs font-bold text-purple-400 font-mono block">4. items.xml (Server)</span>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Define nome, ataque, defesa, peso e armadura do item em tempo de execução para os scripts Lua.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-900/80 border border-neutral-800 space-y-2 mt-4">
              <h4 className="text-xs font-semibold text-neutral-200">
                Passo a Passo para Adicionar um Novo Item Customizado no 7.72:
              </h4>
              <ol className="text-xs text-neutral-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>
                  Abra o <strong>Object Builder</strong>, selecione a versão 7.72 e importe a imagem PNG de 32x32 com fundo transparente.
                </li>
                <li>
                  Crie um novo Item, associe a sprite importada e salve. O Object Builder atualizará o <code className="text-amber-300 font-mono">Tibia.spr</code> e o <code className="text-amber-300 font-mono">Tibia.dat</code>.
                </li>
                <li>
                  Abra o <strong>Item Editor 7.72</strong>, carregue o <code className="text-amber-300 font-mono">Tibia.dat</code> recém-salvo e o <code className="text-emerald-300 font-mono">items.otb</code> do seu servidor.
                </li>
                <li>
                  Crie um novo item apontando para o Client ID correspondente e salve o novo <code className="text-emerald-300 font-mono">items.otb</code>.
                </li>
                <li>
                  No servidor, abra <code className="text-neutral-200 font-mono">data/items/items.xml</code> e declare o item com o Server ID gerado:
                  <div className="my-2">
                    <CodeBlock
                      code={`<item id="9500" article="a" name="ancient hydra scale">\n    <attribute key="weight" value="120" />\n    <attribute key="description" value="A petrified scale from an ancient beast." />\n</item>`}
                      language="xml"
                      filename="data/items/items.xml"
                    />
                  </div>
                </li>
                <li>
                  Copie o novo <code className="text-emerald-300 font-mono">items.otb</code> também para a pasta do <strong>Remere's Map Editor (RME)</strong> para poder colocar o item no mapa sem erro de versão incompatível!
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
