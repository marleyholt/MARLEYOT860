import React, { useState } from 'react';
import { AccountSession, PlayerCharacter } from '../types';
import { 
  UserCheck, 
  PlusCircle, 
  Crown, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  User, 
  Swords,
  KeyRound,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AccountManagementProps {
  session: AccountSession | null;
  onLogin: (accountName: string, pass: string) => Promise<boolean> | boolean;
  onLogout: () => void;
  onCharacterCreated: (newChar: PlayerCharacter) => void;
  onOpenAdmin?: () => void;
  onSelectCharacter?: (name: string) => void;
  onRefreshCharacters?: () => Promise<void>;
}

export const AccountManagementView: React.FC<AccountManagementProps> = ({
  session,
  onLogin,
  onLogout,
  onCharacterCreated,
  onOpenAdmin,
  onSelectCharacter,
  onRefreshCharacters
}) => {
  const [loginAcc, setLoginAcc] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form de novo char
  const [isCreatingChar, setIsCreatingChar] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharVoc, setNewCharVoc] = useState('1');
  const [newCharSex, setNewCharSex] = useState('1');
  const [charLoading, setCharLoading] = useState(false);
  const [charError, setCharError] = useState<string | null>(null);
  const [charSuccess, setCharSuccess] = useState<string | null>(null);

  // Form de troca de senha
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const success = await onLogin(loginAcc.trim(), loginPass.trim());
      if (!success) {
        setLoginError('Conta ou senha incorretos. Verifique se o nome da conta e senha estão cadastrados.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao efetuar login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCreateCharSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCharError(null);
    setCharSuccess(null);

    const cleanName = newCharName.trim();
    if (!cleanName || cleanName.length < 3) {
      setCharError('O nome deve ter no mínimo 3 caracteres.');
      return;
    }

    if (!session) return;

    setCharLoading(true);

    try {
      // Chama o backend real em /api/characters/create
      const res = await fetch('/api/characters/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: session.accountName,
          characterName: cleanName,
          vocation: newCharVoc,
          sex: newCharSex
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setCharError(data.error || 'Erro ao criar personagem no servidor.');
        setCharLoading(false);
        return;
      }

      setCharSuccess(data.message || `Personagem '${cleanName}' criado com sucesso!`);
      if (data.character) {
        onCharacterCreated(data.character);
      }

      setNewCharName('');
      setTimeout(() => {
        setIsCreatingChar(false);
        setCharSuccess(null);
      }, 2000);
    } catch (err: any) {
      setCharError(`Erro de comunicação com o servidor: ${err.message}`);
    } finally {
      setCharLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!session) return;

    if (!currPass) {
      setPassError('Informe sua senha atual.');
      return;
    }
    if (newPass.length < 4) {
      setPassError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (newPass !== confirmNewPass) {
      setPassError('A confirmação da nova senha não confere.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await fetch('/api/accounts/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: session.accountName,
          currentPassword: currPass,
          newPassword: newPass
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPassError(data.error || 'Erro ao alterar a senha.');
        setPassLoading(false);
        return;
      }

      setPassSuccess(data.message || 'Senha alterada com sucesso no banco de dados!');
      setCurrPass('');
      setNewPass('');
      setConfirmNewPass('');
      setTimeout(() => {
        setIsChangingPass(false);
        setPassSuccess(null);
      }, 2500);
    } catch (err: any) {
      setPassError(`Erro de rede: ${err.message}`);
    } finally {
      setPassLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!onRefreshCharacters) return;
    setRefreshing(true);
    try {
      await onRefreshCharacters();
    } finally {
      setRefreshing(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-2xl overflow-hidden max-w-xl mx-auto">
        <div className="bg-gradient-to-r from-[#14381c] via-[#24542c] to-[#14381c] px-6 py-4 border-b border-[#3b7347] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#102416] border border-[#22c55e] rounded">
              <LogIn className="w-5 h-5 text-[#facc15]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#facc15] font-serif uppercase tracking-wider">
                Painel da Conta &bull; Account Login
              </h2>
              <p className="text-xs text-neutral-300">
                Acesse sua conta do MarleyOT para gerenciar seus personagens
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loginError && (
            <div className="mb-4 p-3 bg-rose-950/70 border border-rose-600 rounded text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Número / Nome da Conta:
              </label>
              <input
                id="login-acc-name"
                type="text"
                required
                placeholder="Ex: 1234567 ou o nome da sua conta criada"
                value={loginAcc}
                onChange={(e) => setLoginAcc(e.target.value)}
                className="w-full px-3 py-2 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-sm focus:outline-none focus:border-[#facc15]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Senha:
              </label>
              <input
                id="login-acc-password"
                type="password"
                required
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-3 py-2 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-sm focus:outline-none focus:border-[#facc15]"
              />
            </div>

            <div className="pt-2">
              <button
                id="btn-do-login"
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 bg-gradient-to-r from-[#15803d] to-[#22c55e] hover:brightness-110 text-neutral-950 font-bold tracking-wider uppercase rounded shadow border border-[#86efac] text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar na Conta'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#1e291e] text-center text-xs text-neutral-400">
            Ainda não possui conta? Crie em menos de 1 minuto na aba <span className="text-[#facc15] font-semibold">Criar Conta</span>!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Info Box */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#14381c] via-[#24542c] to-[#14381c] px-6 py-4 border-b border-[#3b7347] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#102416] border border-[#facc15] rounded">
              <UserCheck className="w-5 h-5 text-[#facc15]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#facc15] font-serif uppercase tracking-wider">
                Conta: {session.accountName}
              </h2>
              <p className="text-xs text-neutral-300">
                Tipo: {session.type === 5 ? 'Administrador (GOD / Staff)' : 'Jogador Normal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChangingPass(!isChangingPass)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#17291a] hover:bg-[#233d27] border border-[#3b7347] rounded text-[#facc15] text-xs font-semibold transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Trocar Senha
            </button>
            <button
              id="btn-account-logout"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-600 rounded text-rose-200 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>

        {/* Modal / Painel de Troca de Senha */}
        {isChangingPass && (
          <div className="p-4 bg-[#0e1610] border-b border-[#213323]">
            <h4 className="text-xs font-bold text-[#facc15] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Alterar Senha da Conta ({session.accountName})
            </h4>
            {passError && (
              <div className="mb-3 p-2 bg-rose-950/70 border border-rose-600 rounded text-rose-200 text-xs">
                {passError}
              </div>
            )}
            {passSuccess && (
              <div className="mb-3 p-2 bg-emerald-950/70 border border-emerald-600 rounded text-emerald-200 text-xs flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                {passSuccess}
              </div>
            )}
            <form onSubmit={handleChangePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[11px] text-neutral-300 mb-1">Senha Atual:</label>
                <input
                  type="password"
                  required
                  placeholder="Sua senha atual"
                  value={currPass}
                  onChange={e => setCurrPass(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-xs focus:outline-none focus:border-[#facc15]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-300 mb-1">Nova Senha:</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 4 caracteres"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-xs focus:outline-none focus:border-[#facc15]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-300 mb-1">Confirmar Nova Senha:</label>
                <input
                  type="password"
                  required
                  placeholder="Repita a nova senha"
                  value={confirmNewPass}
                  onChange={e => setConfirmNewPass(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-xs focus:outline-none focus:border-[#facc15]"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPass(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="px-4 py-1.5 bg-[#15803d] hover:bg-[#16a34a] text-neutral-950 font-bold text-xs rounded border border-[#86efac] disabled:opacity-50"
                >
                  {passLoading ? 'Salvando...' : 'Confirmar Nova Senha'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0f140f] p-3 rounded border border-[#213323] flex items-center gap-3">
            <Crown className="w-8 h-8 text-[#facc15] shrink-0" />
            <div>
              <div className="text-[11px] text-neutral-400">Status Premium:</div>
              <div className="text-sm font-bold text-emerald-400">
                {session.premiumDays > 0 ? `${session.premiumDays} Dias VIP` : 'Free Account'}
              </div>
            </div>
          </div>

          <div className="bg-[#0f140f] p-3 rounded border border-[#213323] flex items-center gap-3">
            <User className="w-8 h-8 text-[#22c55e] shrink-0" />
            <div>
              <div className="text-[11px] text-neutral-400">Personagens:</div>
              <div className="text-sm font-bold text-[#facc15]">
                {session.characters.length} Personagem(ns)
              </div>
            </div>
          </div>

          <div className="bg-[#0f140f] p-3 rounded border border-[#213323] flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#e11d48] shrink-0" />
            <div>
              <div className="text-[11px] text-neutral-400">Segurança da Conta:</div>
              <div className="text-sm font-bold text-neutral-200">SHA1 Protegido (MariaDB)</div>
            </div>
          </div>
        </div>

        {/* Banner GM / Staff se for conta GOD */}
        {(session.type >= 4 || session.accountName === '1234567') && (
          <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-[#292209] to-[#1a1505] border-2 border-[#eab308] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#121004] border border-[#facc15] rounded">
                <Crown className="w-6 h-6 text-[#facc15]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#facc15] uppercase font-serif">
                    Acesso Privilegiado de Administrador (GM)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#dc2626] text-white text-[9px] font-black uppercase">
                    GOD
                  </span>
                </div>
                <p className="text-xs text-neutral-300">
                  Você tem acesso total para gerenciar o servidor, alterar o link de download do client e o ícone do servidor.
                </p>
              </div>
            </div>

            {onOpenAdmin && (
              <button
                id="btn-goto-admin"
                onClick={onOpenAdmin}
                className="px-5 py-2.5 bg-gradient-to-r from-[#eab308] to-[#facc15] hover:brightness-110 text-neutral-950 font-black text-xs uppercase tracking-wider rounded border border-[#fef08a] shadow-lg shrink-0 transition-all"
              >
                Abrir Painel de Administração
              </button>
            )}
          </div>
        )}
      </div>

      {/* Characters List Table */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-6 py-3 border-b border-[#2b3d2b] flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-[#facc15] uppercase tracking-wider font-serif flex items-center gap-2">
            <Swords className="w-4 h-4 text-[#e11d48]" />
            Seus Personagens no MarleyOT 8.60
          </h3>

          <div className="flex items-center gap-2">
            {onRefreshCharacters && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title="Recarregar personagens do banco"
                className="p-1.5 bg-[#17291a] hover:bg-[#233d27] border border-[#3b7347] text-[#86efac] rounded text-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}

            <button
              id="btn-toggle-create-char"
              onClick={() => setIsCreatingChar(!isCreatingChar)}
              className="px-3 py-1 bg-[#15803d] hover:bg-[#16a34a] border border-[#86efac] text-neutral-950 font-bold text-xs rounded flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Criar Novo Personagem
            </button>
          </div>
        </div>

        {/* Form para adicionar personagem */}
        {isCreatingChar && (
          <div className="p-4 bg-[#0d120e] border-b border-[#213323]">
            {charError && (
              <div className="mb-3 p-2 bg-rose-950/70 border border-rose-600 rounded text-rose-200 text-xs">
                {charError}
              </div>
            )}
            {charSuccess && (
              <div className="mb-3 p-2 bg-emerald-950/70 border border-emerald-600 rounded text-emerald-200 text-xs flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                {charSuccess}
              </div>
            )}
            <form onSubmit={handleCreateCharSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[11px] text-neutral-300 font-semibold mb-1">Nome do Personagem:</label>
                <input
                  id="new-char-input-name"
                  type="text"
                  required
                  placeholder="Ex: Marley Knight"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-xs focus:outline-none focus:border-[#facc15]"
                />
              </div>

              <div className="w-full sm:w-40">
                <label className="block text-[11px] text-neutral-300 font-semibold mb-1">Vocação:</label>
                <select
                  id="new-char-input-voc"
                  value={newCharVoc}
                  onChange={(e) => setNewCharVoc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-xs focus:outline-none focus:border-[#facc15]"
                >
                  <option value="1">Sorcerer</option>
                  <option value="2">Druid</option>
                  <option value="3">Paladin</option>
                  <option value="4">Knight</option>
                </select>
              </div>

              <div className="w-full sm:w-28">
                <label className="block text-[11px] text-neutral-300 font-semibold mb-1">Sexo:</label>
                <select
                  value={newCharSex}
                  onChange={(e) => setNewCharSex(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-xs focus:outline-none focus:border-[#facc15]"
                >
                  <option value="1">Male</option>
                  <option value="0">Female</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={charLoading}
                  className="px-4 py-2 bg-[#eab308] hover:bg-[#facc15] text-neutral-950 font-bold text-xs rounded transition-colors disabled:opacity-50"
                >
                  {charLoading ? 'Criando...' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingChar(false)}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f140f] text-[#facc15] uppercase tracking-wider font-mono border-b border-[#213323]">
              <tr>
                <th className="py-2.5 px-4">Nome</th>
                <th className="py-2.5 px-4">Level</th>
                <th className="py-2.5 px-4">Vocação</th>
                <th className="py-2.5 px-4">Cidade</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e291e]">
              {session.characters.map((char) => (
                <tr key={char.id || char.name} className="hover:bg-[#151c16] transition-colors">
                  <td className="py-3 px-4 font-semibold text-neutral-100 flex items-center gap-2">
                    {char.name === 'GM Marley' ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[10px]">
                        GOD
                      </span>
                    ) : null}
                    {char.name}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#facc15]">{char.level}</td>
                  <td className="py-3 px-4 text-neutral-300">{char.vocation}</td>
                  <td className="py-3 px-4 text-neutral-400">{char.town || 'Styller City'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      char.online 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-700'
                    }`}>
                      {char.online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {onSelectCharacter && (
                      <button
                        onClick={() => onSelectCharacter(char.name)}
                        className="text-xs text-[#facc15] hover:underline flex items-center gap-1 justify-end ml-auto"
                      >
                        Ver Perfil
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
