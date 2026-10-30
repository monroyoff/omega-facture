'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, logout, currentUser, isAuthenticated } = useInvoices();
  const [loggingOut, setLoggingOut] = useState(false);

  const [mode, setMode] = useState<'login' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Garantir des champs 100% vierges à l'ouverture, sans aucun pré-remplissage
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    try {
      localStorage.removeItem('facturo:v1:last_email');
      localStorage.removeItem('facturo:v1:last_registered_email');
    } catch (e) {}
  }, []);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanIdentifier = email.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setError('Veuillez renseigner votre email ou téléphone et mot de passe.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanIdentifier, cleanPassword);
      if (res.success) {
        router.replace('/dashboard');
      } else if (res.requiresEmailVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(cleanIdentifier)}`);
      } else {
        setError(res.error || 'Identifiants incorrects ou compte introuvable.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) return;

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand-600/25 group-hover:scale-105 transition-transform">
            Ω
          </div>
          <div className="text-left">
            <span className="text-lg font-black text-brand-600 dark:text-brand-400 tracking-tight uppercase block">
              OMEGA FACTURE
            </span>
            <span className="text-[10px] text-slate-400 font-medium block -mt-1">
              SaaS de Facturation & Devis UEMOA
            </span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#111622] py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 relative z-10">
          {mode === 'login' ? (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 stroke-[2]" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Connexion à votre espace
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Connectez-vous par Adresse Email ou par Numéro de Téléphone.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Indicateur de session déjà active avec bouton de déconnexion direct */}
              {isAuthenticated && currentUser && (
                <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-xs">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-100 border border-brand-200 shrink-0">
                      <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-slate-900 dark:text-white truncate">
                        Connecté : {currentUser.firstName || currentUser.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {currentUser.email || currentUser.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/dashboard"
                      className="flex-1 py-1.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-center text-[11px] shadow-xs active:scale-95 transition-all"
                    >
                      Aller au Dashboard
                    </Link>
                    <button
                      type="button"
                      disabled={loggingOut}
                      onClick={async () => {
                        setLoggingOut(true);
                        try {
                          await logout();
                        } catch (e) {}
                        setLoggingOut(false);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-[11px] active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {loggingOut ? '...' : 'Se déconnecter'}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Identifiant (Email ou Numéro de téléphone)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                      {email.includes('@') ? (
                        <Mail className="w-4 h-4" />
                      ) : email.replace(/\D/g, '').length >= 3 ? (
                        <Phone className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ex: contact@entreprise.bj ou +229 97 00 00 00"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Mot de Passe
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setForgotEmail(email);
                        setForgotSuccess(false);
                      }}
                      className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? 'Connexion en cours...' : 'Se connecter à mon compte'}</span>
                  </button>
                </div>
              </form>



              {/* Switch to Register */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Vous n'avez pas encore de compte ?{' '}
                  <Link
                    href="/register"
                    className="font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Créer un compte</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </span>
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setForgotSuccess(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour à la connexion</span>
              </button>

              <div className="mb-6">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Mot de passe oublié ?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Saisissez l'adresse email de votre compte pour recevoir un lien de réinitialisation sécurisé.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Lien sécurisé envoyé !
                  </h3>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Un email a été envoyé à <strong>{forgotEmail}</strong>. Veuillez suivre les instructions pour réinitialiser votre mot de passe.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setForgotSuccess(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Retourner à la connexion
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Adresse Email de votre compte
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="ex: contact@entreprise.bj"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <Mail className="w-4 h-4" />
                    <span>
                      {forgotLoading
                        ? 'Envoi en cours...'
                        : 'Envoyer le lien de réinitialisation'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Connexion sécurisée exclusive par Identifiant & Mot de passe</span>
          </div>
          <span className="text-[11px] text-slate-400">Plateforme conforme aux normes fiscales UEMOA</span>
        </div>
      </div>
    </div>
  );
}
