import React, { useState } from 'react';
import { UserPlus, ShieldAlert, CheckCircle2, Key, User, Mail } from 'lucide-react';

interface CreateAccountProps {
  onAccountCreated: (accountName: string) => void;
}

export const CreateAccountView: React.FC<CreateAccountProps> = ({ onAccountCreated }) => {
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [vocation, setVocation] = useState('1'); // 1: Sorcerer, 2: Druid, 3: Paladin, 4: Knight
  const [sex, setSex] = useState('1'); // 1: Male, 0: Female

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validações no padrão ZnoteAAC
    if (!accountName.trim() || !password.trim()) {
      setError('Por favor preencha o número/nome da conta e a senha.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (!characterName.trim()) {
      setError('Por favor escolha o nome do seu primeiro personagem.');
      return;
    }

    if (characterName.length < 3 || characterName.length > 20) {
      setError('O nome do personagem deve ter entre 3 e 20 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/accounts/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountName: accountName.trim(),
          password: password.trim(),
          email: email.trim(),
          characterName: characterName.trim(),
          vocation,
          sex: 1 // default male
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Erro ao criar conta no servidor.');
        setLoading(false);
        return;
      }

      // Salvar a sessão retornada pelo backend
      if (data.account) {
        localStorage.setItem('marleyot_active_session', JSON.stringify(data.account));
      }

      setLoading(false);
      setSuccess(data.message || `Conta '${accountName}' criada com sucesso no banco de dados!`);

      setTimeout(() => {
        onAccountCreated(accountName);
      }, 1500);
    } catch (err: any) {
      console.error('Falha de rede ao registrar conta:', err);
      setError(`Falha de conexão com o servidor do MarleyOT: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121612] border-2 border-[#2b3d2b] rounded-lg shadow-2xl overflow-hidden">
      {/* Top Banner ZnoteAAC-2 Style */}
      <div className="bg-gradient-to-r from-[#14381c] via-[#24542c] to-[#14381c] px-6 py-4 border-b border-[#3b7347] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#102416] border border-[#22c55e] rounded">
            <UserPlus className="w-5 h-5 text-[#facc15]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#facc15] font-serif uppercase tracking-wider">
              Criar Nova Conta &bull; Register Account
            </h2>
            <p className="text-xs text-neutral-300">
              Crie sua conta para jogar no MarleyOT 8.60 (TFS 1.5 Styller Yourots)
            </p>
          </div>
        </div>

        {/* Rastafari stripe accent */}
        <div className="hidden sm:flex items-center gap-1">
          <span className="w-2.5 h-6 bg-[#16a34a] rounded-sm"></span>
          <span className="w-2.5 h-6 bg-[#facc15] rounded-sm"></span>
          <span className="w-2.5 h-6 bg-[#dc2626] rounded-sm"></span>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-rose-950/70 border border-rose-600 rounded-md flex items-center gap-3 text-rose-200 text-sm">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-950/70 border border-emerald-500 rounded-md flex items-center gap-3 text-emerald-200 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sessão 1: Dados da Conta */}
          <div className="bg-[#0e130f] p-4 rounded border border-[#233525] space-y-4">
            <h3 className="text-sm font-bold text-[#facc15] uppercase tracking-wider font-serif border-b border-[#233525] pb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#22c55e]" />
              1. Informações de Acesso da Conta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Número ou Nome da Conta:
                </label>
                <input
                  id="reg-acc-name"
                  type="text"
                  required
                  placeholder="Ex: 123456 ou meuusuario"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-sm focus:outline-none focus:border-[#facc15]"
                />
                <span className="text-[10px] text-neutral-400">Usado para conectar no cliente do jogo.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Endereço de E-mail (Opcional):
                </label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-sm focus:outline-none focus:border-[#facc15]"
                />
                <span className="text-[10px] text-neutral-400">Para recuperação de conta e suporte.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Senha de Acesso:
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-sm focus:outline-none focus:border-[#facc15]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Confirmar Senha:
                </label>
                <input
                  id="reg-confirm-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-sm focus:outline-none focus:border-[#facc15]"
                />
              </div>
            </div>
          </div>

          {/* Sessão 2: Criação do Primeiro Personagem */}
          <div className="bg-[#0e130f] p-4 rounded border border-[#233525] space-y-4">
            <h3 className="text-sm font-bold text-[#facc15] uppercase tracking-wider font-serif border-b border-[#233525] pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#e11d48]" />
              2. Seu Primeiro Personagem (Level 8 Inicial)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nome do Personagem:
                </label>
                <input
                  id="reg-char-name"
                  type="text"
                  required
                  placeholder="Ex: Marley Knight"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-sm focus:outline-none focus:border-[#facc15]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Vocação Inicial:
                </label>
                <select
                  id="reg-vocation"
                  value={vocation}
                  onChange={(e) => setVocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-sm focus:outline-none focus:border-[#facc15]"
                >
                  <option value="1">Sorcerer (Magias de Fogo/Energia)</option>
                  <option value="2">Druid (Cura/Gelo/Terra)</option>
                  <option value="3">Paladin (Distância/Holy)</option>
                  <option value="4">Knight (Espada/Axe/Club/Blocker)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Gênero / Sexo:
                </label>
                <select
                  id="reg-sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full px-3 py-2 bg-[#172118] border border-[#2e4732] rounded text-neutral-100 text-sm focus:outline-none focus:border-[#facc15]"
                >
                  <option value="1">Masculino (Male)</option>
                  <option value="0">Feminino (Female)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botão de Criação estilo Znote Classic com cores Jamaicanas */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-[#facc15]"></span>
              Ao criar a conta, você aceita as regras do servidor MarleyOT 8.60.
            </div>

            <button
              id="btn-submit-account"
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#15803d] via-[#eab308] to-[#dc2626] hover:brightness-110 text-neutral-950 font-black tracking-wider uppercase rounded-md shadow-lg border border-[#fef08a] transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Criando Conta...' : 'Cadastrar e Jogar Agora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
