import React, { useState } from 'react';
import { AccountSession, PlayerCharacter } from '../types';
import { 
  UserCheck, 
  PlusCircle, 
  Crown, 
  Calendar, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  User, 
  Swords 
} from 'lucide-react';

interface AccountManagementProps {
  session: AccountSession | null;
  onLogin: (accountName: string, pass: string) => boolean;
  onLogout: () => void;
  onCharacterCreated: (newChar: PlayerCharacter) => void;
}

export const AccountManagementView: React.FC<AccountManagementProps> = ({
  session,
  onLogin,
  onLogout,
  onCharacterCreated
}) => {
  const [loginAcc, setLoginAcc] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form de novo char
  const [isCreatingChar, setIsCreatingChar] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharVoc, setNewCharVoc] = useState('1');
  const [charError, setCharError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const success = onLogin(loginAcc.trim(), loginPass.trim());
    if (!success) {
      setLoginError('Conta ou senha incorretos. (Dica: Use 1234567 / 1234567 ou 1 / 1)');
    }
  };

  const handleCreateCharSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCharError(null);

    if (!newCharName.trim() || newCharName.length < 3) {
      setCharError('Nome deve ter ao menos 3 caracteres.');
      return;
    }

    const vocMap: Record<string, string> = {
      '1': 'Sorcerer',
      '2': 'Druid',
      '3': 'Paladin',
      '4': 'Knight'
    };

    const newChar: PlayerCharacter = {
      id: Math.floor(Math.random() * 80000) + 1000,
      name: newCharName.trim(),
      level: 8,
      vocation: vocMap[newCharVoc] || 'Sorcerer',
      maglevel: 0,
      experience: 4200,
      online: false,
      town: 'Styller City'
    };

    onCharacterCreated(newChar);
    setNewCharName('');
    setIsCreatingChar(false);
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
            <div className="mb-4 p-3 bg-rose-950/70 border border-rose-600 rounded text-rose-200 text-xs">
              {loginError}
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
                placeholder="Ex: 1234567 ou 1"
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
                className="w-full py-2.5 bg-gradient-to-r from-[#15803d] to-[#22c55e] hover:brightness-110 text-neutral-950 font-bold tracking-wider uppercase rounded shadow border border-[#86efac] text-xs transition-all"
              >
                Entrar na Conta
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
                Bem-vindo à sua Conta: {session.accountName}
              </h2>
              <p className="text-xs text-neutral-300">
                Tipo: {session.type === 5 ? 'Administrador (GOD / Staff)' : 'Jogador Normal'}
              </p>
            </div>
          </div>

          <button
            id="btn-account-logout"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-600 rounded text-rose-200 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>

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
              <div className="text-sm font-bold text-neutral-200">SHA1 Protegido</div>
            </div>
          </div>
        </div>
      </div>

      {/* Characters List Table */}
      <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#182e1c] to-[#121612] px-6 py-3 border-b border-[#2b3d2b] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#facc15] uppercase tracking-wider font-serif flex items-center gap-2">
            <Swords className="w-4 h-4 text-[#e11d48]" />
            Seus Personagens no MarleyOT 8.60
          </h3>

          <button
            id="btn-toggle-create-char"
            onClick={() => setIsCreatingChar(!isCreatingChar)}
            className="px-3 py-1 bg-[#15803d] hover:bg-[#16a34a] border border-[#86efac] text-neutral-950 font-bold text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Criar Novo Personagem
          </button>
        </div>

        {/* Form para adicionar personagem */}
        {isCreatingChar && (
          <div className="p-4 bg-[#0d120e] border-b border-[#213323]">
            {charError && (
              <div className="mb-3 p-2 bg-rose-950/70 border border-rose-600 rounded text-rose-200 text-xs">
                {charError}
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

              <div className="w-full sm:w-48">
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

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#eab308] hover:bg-[#facc15] text-neutral-950 font-bold text-xs rounded transition-colors"
                >
                  Criar
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e291e]">
              {session.characters.map((char) => (
                <tr key={char.id} className="hover:bg-[#151c16] transition-colors">
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
                  <td className="py-3 px-4 text-neutral-400">{char.town}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      char.online 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-700'
                    }`}>
                      {char.online ? 'ONLINE' : 'OFFLINE'}
                    </span>
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
