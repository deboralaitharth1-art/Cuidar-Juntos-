import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Sparkles,
  UserCheck,
  Cloud
} from 'lucide-react';
import { Modal } from './Modal';
import {
  AppUserProfile,
  googleSignIn,
  emailSignIn,
  emailSignUp,
  guestSignIn,
  logout
} from '../services/firebaseAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUserProfile | null;
  onShowToast: (msg: string) => void;
  onSelectSection?: (section: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onShowToast,
  onSelectSection
}) => {
  const [activeTab, setActiveTab] = useState<'methods' | 'email'>('methods');
  const [emailMode, setEmailMode] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset form when modal closes or opens
  const handleClose = () => {
    setErrorMsg(null);
    setIsLoading(false);
    onClose();
  };

  // 1. Google Sign In
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        onShowToast(`Bem-vindo(a), ${res.profile.displayName || 'Cuidador(a)'}! Conectado via Google.`);
        handleClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('A janela de login do Google foi fechada antes da conclusão.');
      } else {
        setErrorMsg('Não foi possível conectar com o Google no momento. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Email Sign In / Sign Up
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor, preencha o e-mail e a senha.');
      return;
    }
    if (emailMode === 'register' && password.length < 6) {
      setErrorMsg('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (emailMode === 'login') {
        const profile = await emailSignIn(email, password);
        onShowToast(`Bem-vindo(a), ${profile.displayName || 'Cuidador(a)'}!`);
      } else {
        const profile = await emailSignUp(email, password, name);
        onShowToast(`Conta criada com sucesso para ${profile.displayName || 'Cuidador(a)'}!`);
      }
      handleClose();
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setErrorMsg('E-mail ou senha incorretos. Verifique e tente novamente.');
      } else if (err?.code === 'auth/email-already-in-use') {
        setErrorMsg('Este e-mail já está cadastrado. Alterne para a aba "Já tenho conta" para entrar.');
      } else if (err?.code === 'auth/invalid-email') {
        setErrorMsg('Por favor, informe um endereço de e-mail válido.');
      } else {
        // Successful local fallback or generic
        setErrorMsg('Aviso de conexão. Se preferir, você pode usar o "Modo Convidado" ou "Conectar com Google".');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Guest Sign In
  const handleGuestLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const profile = await guestSignIn();
      onShowToast(`Entrou como ${profile.displayName}. Seus dados estão salvos no aparelho!`);
      handleClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao iniciar modo convidado.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      onShowToast('Você saiu da sua conta.');
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Acesso e Conta — Cuidar Juntos" maxWidth="max-w-md">
      <div className="space-y-5">
        {/* If user is already logged in, show user profile card */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-start gap-3.5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Perfil'}
                  className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'C'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-base font-bold text-emerald-950 truncate">
                    {currentUser.displayName || 'Cuidador(a)'}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {currentUser.providerId === 'google.com'
                      ? 'Conta Google'
                      : currentUser.isAnonymous || currentUser.providerId === 'anonymous' || currentUser.providerId === 'local'
                      ? 'Modo Convidado'
                      : 'E-mail'}
                  </span>
                </div>
                {currentUser.email ? (
                  <p className="text-xs text-slate-600 truncate mt-0.5">{currentUser.email}</p>
                ) : (
                  <p className="text-xs text-slate-500 mt-0.5">Uso local neste dispositivo</p>
                )}
              </div>
            </div>

            {/* Google Services status */}
            {currentUser.providerId === 'google.com' ? (
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-white shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950">Google Agenda & Gmail</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Sincronizados
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Suas consultas e exames podem ser enviados para a sua agenda Google e os relatórios de saúde podem ser enviados por e-mail com 1 clique.
                </p>
                <div className="mt-2.5 pt-2.5 border-t border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-800">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span><strong>Salvo na Nuvem:</strong> Seus dados de saúde, remédios e consultas são salvos automaticamente e estarão aqui toda vez que você entrar.</span>
                </div>
                {onSelectSection && (
                  <button
                    onClick={() => {
                      handleClose();
                      onSelectSection('google');
                    }}
                    className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Abrir Google Agenda & Gmail</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 text-slate-800">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">Deseja sincronizar com o Google?</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Conecte sua conta Google para sincronizar automaticamente consultas com o Google Calendar e enviar relatórios pelo Gmail.
                </p>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="mt-2.5 w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Vincular Conta Google</span>
                </button>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors text-xs font-bold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Desconectar / Trocar de Conta</span>
            </button>
          </div>
        ) : (
          /* User is NOT logged in: show login choices */
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeTab === 'methods' ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Escolha como prefere acessar o <strong>Cuidar Juntos</strong>. Você pode conectar com sua conta Google, usar seu e-mail ou continuar como visitante no aparelho.
                </p>

                {/* Method 1: Google (Primary / Recommended) */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all text-left flex items-center gap-3.5 group cursor-pointer shadow-xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-emerald-950">Conectar com Google</span>
                      <span className="text-[10px] uppercase font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      1 clique com acesso ao Google Agenda e envio de relatórios via Gmail
                    </p>
                  </div>
                </button>

                {/* Method 2: Email & Password */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setActiveTab('email');
                  }}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50 transition-all text-left flex items-center gap-3.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                      Entrar com E-mail e Senha
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Para quem prefere cadastrar e-mail e senha pessoais
                    </p>
                  </div>
                </button>

                {/* Method 3: Guest / Local Offline Mode */}
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                  className="w-full p-4 rounded-xl border border-dashed border-emerald-300 bg-white hover:bg-emerald-50/50 transition-all text-left flex items-center gap-3.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100/60 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 group-hover:scale-105 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                      Continuar como Visitante
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Uso local imediato sem conta ou senha. Dados salvos no seu aparelho.
                    </p>
                  </div>
                </button>

                <div className="pt-2 text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seus dados de saúde permanecem confidenciais e protegidos</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Email & Password Form */
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode('login');
                      setErrorMsg(null);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      emailMode === 'login' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Já tenho conta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode('register');
                      setErrorMsg(null);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      emailMode === 'register' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Criar nova conta
                  </button>
                </div>

                {emailMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Seu Nome (Cuidador ou Familiar)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ex: Maria da Silva"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('methods');
                      setErrorMsg(null);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    {isLoading ? 'Conectando...' : emailMode === 'login' ? 'Entrar' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
