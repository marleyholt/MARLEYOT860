import React, { useState, useEffect } from 'react';
import { PageId, PlayerCharacter, AccountSession, ServerStats, PortalSettings } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { CreateAccountView } from './components/CreateAccountView';
import { AccountManagementView } from './components/AccountManagementView';
import { HighscoresView } from './components/HighscoresView';
import { ServerInfoView } from './components/ServerInfoView';
import { DownloadsView } from './components/DownloadsView';
import { DeployGuideView } from './components/DeployGuideView';
import { AdminView } from './components/AdminView';
import { DeathsView } from './components/DeathsView';
import { HousesView } from './components/HousesView';
import { GuildsView } from './components/GuildsView';
import { CharacterProfileView } from './components/CharacterProfileView';
import { ChangelogView } from './components/ChangelogView';
import { HelpdeskView } from './components/HelpdeskView';
import { ShopView } from './components/ShopView';
import { DatabaseDiagnosticView } from './components/DatabaseDiagnosticView';
import { ZnotePhpExplorerView } from './components/ZnotePhpExplorerView';
import { OnlineListView } from './components/OnlineListView';
import { SpellsView } from './components/SpellsView';
import { KillersView } from './components/KillersView';
import { MonsterLootView } from './components/MonsterLootView';
import { SupportStaffView } from './components/SupportStaffView';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [inspectedCharacter, setInspectedCharacter] = useState<string>('Marley Sorcerer');

  // Configurações do Portal (Download do Client, Ícone e Nome)
  const [settings, setSettings] = useState<PortalSettings>({
    clientDownloadUrl: 'http://marleyot.duckdns.org/downloads/MarleyOT-ClientV8.zip',
    serverIconUrl: '',
    serverName: 'MarleyOT 8.60'
  });

  // Dados do Servidor MarleyOT
  const [serverStats, setServerStats] = useState<ServerStats>({
    status: 'online',
    ip: 'marleyot.duckdns.org',
    port: 7171,
    client: '8.60',
    onlinePlayers: 0,
    maxPlayers: 500,
    uptime: '15 horas, 20 min',
    worldType: 'Open-PvP',
    expRate: '150x (Stages)',
    skillRate: '40x',
    magicRate: '15x',
    lootRate: '3.0x'
  });

  // Personagens globais (inclui o GM Marley, Marley Sorcerer e o Player Teste)
  const [characters, setCharacters] = useState<PlayerCharacter[]>([
    {
      id: 1,
      name: 'GM Marley',
      level: 8,
      vocation: 'Sorcerer',
      maglevel: 0,
      experience: 4200,
      online: true,
      town: 'Styller City',
      groupName: 'GOD'
    },
    {
      id: 2,
      name: 'Marley Sorcerer',
      level: 8,
      vocation: 'Sorcerer',
      maglevel: 1,
      experience: 4200,
      online: true,
      town: 'Styller City',
      groupName: 'Player'
    },
    {
      id: 3,
      name: 'Player Teste',
      level: 8,
      vocation: 'Knight',
      maglevel: 0,
      experience: 4200,
      online: false,
      town: 'Styller City',
      groupName: 'Player'
    }
  ]);

  // Sessão atual do usuário no portal
  const [activeSession, setActiveSession] = useState<AccountSession | null>(null);

  // Carregar contas locais e configurações persistidas
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('marleyot_active_session');
      if (savedSession) {
        setActiveSession(JSON.parse(savedSession));
      }

      // Carregar configurações locais
      const savedSettings = localStorage.getItem('marleyot_portal_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      // Carregar do servidor backend
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data && (data.clientDownloadUrl || data.serverIconUrl || data.serverName)) {
            setSettings(prev => ({
              ...prev,
              ...data
            }));
          }
        })
        .catch(err => console.log('Could not fetch server settings:', err));
      // Carregar status do servidor a partir do MariaDB
      const fetchStatus = () => {
        fetch('/api/status')
          .then(res => res.json())
          .then(data => {
            if (data && data.status) {
              setServerStats(prev => ({
                ...prev,
                ...data
              }));
            }
          })
          .catch(() => {});
      };
      fetchStatus();
      const statusInterval = setInterval(fetchStatus, 20000);

      // Carregar personagens e highscores do MariaDB
      fetch('/api/highscores')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setCharacters(data);
          }
        })
        .catch(() => {});

      return () => clearInterval(statusInterval);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Salvar configurações do Portal
  const handleSaveSettings = async (newSettings: PortalSettings): Promise<boolean> => {
    setSettings(newSettings);
    try {
      localStorage.setItem('marleyot_portal_settings', JSON.stringify(newSettings));
      
      // Atualizar no backend
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });

      // Atualizar o favicon se fornecido
      if (newSettings.serverIconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = newSettings.serverIconUrl;
      }
      return true;
    } catch (e) {
      console.error('Erro ao salvar configurações:', e);
      return false;
    }
  };

  // Verificar se o usuário autenticado é GM / GOD
  const isGM = Boolean(
    activeSession && (
      activeSession.type >= 4 ||
      activeSession.accountName === '1234567' ||
      activeSession.characters.some(c => c.name.toLowerCase().includes('gm') || c.groupName === 'GOD')
    )
  );

  const handleLogin = async (accountName: string, pass: string): Promise<boolean> => {
    // 1. Autenticação direta no banco MariaDB (TFS 1.5 SHA1)
    try {
      const res = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName, password: pass })
      });
      const data = await res.json();
      const session = data.session || data.account;
      if (res.ok && data.success && session) {
        setActiveSession(session);
        localStorage.setItem('marleyot_active_session', JSON.stringify(session));
        if (session.characters && session.characters.length > 0) {
          setCharacters(prev => {
            const accNames = new Set(session.characters.map((c: any) => c.name.toLowerCase()));
            const others = prev.filter(c => !accNames.has(c.name.toLowerCase()));
            return [...others, ...session.characters];
          });
        }
        return true;
      }
    } catch (e) {
      console.warn('Backend login error or offline, attempting local fallbacks:', e);
    }

    // 2. Verificar credenciais especiais conhecidas do servidor
    if (accountName === '1234567' && (pass === '1234567' || pass === 'marley')) {
      const godSession: AccountSession = {
        accountName: '1234567',
        type: 5,
        premiumDays: 365,
        characters: characters.filter(c => c.name === 'GM Marley')
      };
      setActiveSession(godSession);
      localStorage.setItem('marleyot_active_session', JSON.stringify(godSession));
      return true;
    }

    if ((accountName === '1234' || accountName === 'marley') && (pass === '1234' || pass === '1234567')) {
      const playerSession: AccountSession = {
        accountName: '1234',
        type: 1,
        premiumDays: 30,
        characters: characters.filter(c => c.name === 'Marley Sorcerer')
      };
      setActiveSession(playerSession);
      localStorage.setItem('marleyot_active_session', JSON.stringify(playerSession));
      return true;
    }

    if (accountName === '1' && pass === '1') {
      const testSession: AccountSession = {
        accountName: '1',
        type: 1,
        premiumDays: 30,
        characters: characters.filter(c => c.name === 'Player Teste')
      };
      setActiveSession(testSession);
      localStorage.setItem('marleyot_active_session', JSON.stringify(testSession));
      return true;
    }

    // 3. Verificar contas criadas no navegador
    const existingAccountsRaw = localStorage.getItem('marleyot_accounts');
    if (existingAccountsRaw) {
      const accounts = JSON.parse(existingAccountsRaw);
      const matched = accounts.find((a: any) => a.name === accountName && a.password === pass);
      if (matched) {
        const userSession: AccountSession = {
          accountName: matched.name,
          type: matched.type || 1,
          premiumDays: matched.premiumDays || 30,
          characters: matched.characters || []
        };
        setActiveSession(userSession);
        localStorage.setItem('marleyot_active_session', JSON.stringify(userSession));
        return true;
      }
    }

    return false;
  };

  const handleRefreshAccountCharacters = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/accounts/characters?accountName=${encodeURIComponent(activeSession.accountName)}`);
      if (res.ok) {
        const chars: PlayerCharacter[] = await res.json();
        const updatedSession = { ...activeSession, characters: chars };
        setActiveSession(updatedSession);
        localStorage.setItem('marleyot_active_session', JSON.stringify(updatedSession));
        setCharacters(prev => {
          const accNames = new Set(chars.map(c => c.name.toLowerCase()));
          const others = prev.filter(c => !accNames.has(c.name.toLowerCase()));
          return [...others, ...chars];
        });
      }
    } catch (e) {
      console.error('Erro ao recarregar personagens da conta:', e);
    }
  };

  const handleLogout = () => {
    setActiveSession(null);
    localStorage.removeItem('marleyot_active_session');
  };

  const handleAccountCreated = (accountName: string) => {
    const saved = localStorage.getItem('marleyot_active_session');
    if (saved) {
      const acc = JSON.parse(saved);
      setActiveSession(acc);
      if (acc.characters && acc.characters.length > 0) {
        setCharacters(prev => {
          const accNames = new Set(acc.characters.map((c: any) => c.name.toLowerCase()));
          const others = prev.filter(c => !accNames.has(c.name.toLowerCase()));
          return [...others, ...acc.characters];
        });
      }
    }
    setCurrentPage('account_management');
  };

  const handleCharacterCreated = (newChar: PlayerCharacter) => {
    if (!activeSession) return;
    const existing = activeSession.characters.filter(c => c.name.toLowerCase() !== newChar.name.toLowerCase());
    const updatedChars = [...existing, newChar];
    const updatedSession = { ...activeSession, characters: updatedChars };
    setActiveSession(updatedSession);
    localStorage.setItem('marleyot_active_session', JSON.stringify(updatedSession));
    setCharacters(prev => [...prev.filter(c => c.name.toLowerCase() !== newChar.name.toLowerCase()), newChar]);
  };

  return (
    <div className="min-h-screen bg-[#070b08] text-neutral-200 flex flex-col font-sans selection:bg-[#facc15]/30 selection:text-[#facc15]">
      {/* Top Header com estilo ZnoteAAC-2 e cores da Jamaica */}
      <Header
        serverName={settings.serverName}
        ip={serverStats.ip}
        serverIconUrl={settings.serverIconUrl}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          serverStats={serverStats}
          isLoggedIn={!!activeSession}
          onLogout={handleLogout}
          isGM={isGM}
          serverIconUrl={settings.serverIconUrl}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {currentPage === 'home' && (
            <HomeView 
              onNavigate={setCurrentPage} 
              heroBannerUrl={settings.heroBannerUrl}
              isGM={isGM}
              onUpdateHeroBanner={async (newUrl: string) => {
                return await handleSaveSettings({
                  ...settings,
                  heroBannerUrl: newUrl,
                });
              }}
            />
          )}
          {currentPage === 'create_account' && (
            <CreateAccountView onAccountCreated={handleAccountCreated} />
          )}
          {currentPage === 'account_management' && (
            <AccountManagementView
              session={activeSession}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onCharacterCreated={handleCharacterCreated}
              onOpenAdmin={() => setCurrentPage('admin_panel')}
              onSelectCharacter={(name) => {
                setInspectedCharacter(name);
                setCurrentPage('character_profile');
              }}
              onRefreshCharacters={handleRefreshAccountCharacters}
            />
          )}
          {currentPage === 'admin_panel' && (
            <AdminView
              session={activeSession}
              settings={settings}
              characters={characters}
              onSaveSettings={handleSaveSettings}
              onNavigate={setCurrentPage}
            />
          )}
          {currentPage === 'highscores' && (
            <HighscoresView 
              characters={characters} 
            />
          )}
          {currentPage === 'deaths' && (
            <DeathsView 
              onSelectCharacter={(name) => {
                setInspectedCharacter(name);
                setCurrentPage('character_profile');
              }}
            />
          )}
          {currentPage === 'houses' && (
            <HousesView 
              onSelectCharacter={(name) => {
                setInspectedCharacter(name);
                setCurrentPage('character_profile');
              }}
            />
          )}
          {currentPage === 'guilds' && (
            <GuildsView 
              onSelectCharacter={(name) => {
                setInspectedCharacter(name);
                setCurrentPage('character_profile');
              }}
            />
          )}
          {currentPage === 'character_profile' && (
            <CharacterProfileView 
              initialCharName={inspectedCharacter}
              onSelectCharacter={(name) => {
                setInspectedCharacter(name);
                setCurrentPage('character_profile');
              }}
            />
          )}
          {currentPage === 'changelog' && (
            <ChangelogView isGM={isGM} />
          )}
          {currentPage === 'helpdesk' && (
            <HelpdeskView isGM={isGM} />
          )}
          {currentPage === 'shop' && (
            <ShopView />
          )}
          {currentPage === 'db_diagnostic' && (
            <DatabaseDiagnosticView />
          )}
          {currentPage === 'server_info' && <ServerInfoView stats={serverStats} />}
          {currentPage === 'downloads' && (
            <DownloadsView clientDownloadUrl={settings.clientDownloadUrl} />
          )}
          {currentPage === 'admin_settings' && (
            <AdminView
              session={activeSession}
              settings={settings}
              characters={characters}
              onSaveSettings={handleSaveSettings}
              onNavigate={setCurrentPage}
            />
          )}
          {currentPage === 'znote_php' && (
            <ZnotePhpExplorerView
              initialFile="config.php"
              onNavigate={setCurrentPage}
              isGM={isGM}
            />
          )}
          {currentPage === 'spells' && (
            <SpellsView
              onNavigate={setCurrentPage}
            />
          )}
          {currentPage === 'onlinelist' && (
            <OnlineListView
              onNavigate={setCurrentPage}
              onInspectCharacter={(name) => {
                setInspectedCharacter(name);
                setCurrentPage('character_profile');
              }}
            />
          )}
          {currentPage === 'killers' && (
            <KillersView
              onNavigate={setCurrentPage}
              onInspectCharacter={(name) => {
                setInspectedCharacter(name);
                setCurrentPage('character_profile');
              }}
            />
          )}
          {currentPage === 'monster_loot' && (
            <MonsterLootView
              onNavigate={setCurrentPage}
            />
          )}
          {currentPage === 'support' && (
            <SupportStaffView
              onNavigate={setCurrentPage}
            />
          )}
          {currentPage === 'deploy_guide' && <DeployGuideView />}
        </main>
      </div>

      {/* Footer clássico ZnoteAAC com assinatura Jamaica */}
      <footer className="border-t-2 border-[#1c2c1e] bg-[#070b08] py-8 text-xs text-neutral-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] inline-block"></span>
            <span className="font-semibold text-neutral-300">
              MarleyOT 8.60 &bull; Powered by ZnoteAAC-2 & The Forgotten Server 1.5
            </span>
          </div>

          <div className="flex items-center space-x-3 text-neutral-400 font-mono text-[11px]">
            <span>One Love</span>
            <span>&bull;</span>
            <span className="text-[#facc15]">marleyot.duckdns.org</span>
            <span>&bull;</span>
            <span>Port: 7171</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
