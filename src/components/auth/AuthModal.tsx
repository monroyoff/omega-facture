'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  User,
  Building2,
  Check,
  AlertCircle,
  ArrowRight,
  Sparkles,
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Smartphone,
  Globe,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import {
  PHONE_PREFIXES,
  getCountryPhonePrefix,
  normalizePhone,
  cleanPhoneDigits,
} from '@/lib/auth/phone-utils';

export type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const router = useRouter();
  const { login, register } = useInvoices();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regAuthMethod, setRegAuthMethod] = useState<'phone' | 'email'>('phone');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regOrganization, setRegOrganization] = useState('');
  const [regCountry, setRegCountry] = useState('Bénin');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Réinitialisation stricte à l'ouverture pour garantir la séparation totale des comptes
  React.useEffect(() => {
    if (isOpen) {
      setLoginEmail('');
      setLoginPassword('');
      setLoginError(null);
      setRegAuthMethod('phone');
      setRegFirstName('');
      setRegLastName('');
      setRegOrganization('');
      setRegCountry('Bénin');
      setRegPhone('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegError(null);
      try {
        localStorage.removeItem('facturo:v1:last_email');
        localStorage.removeItem('facturo:v1:last_registered_email');
      } catch (e) {}
    }
  }, [isOpen]);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Vide', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Faible', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Moyen', color: 'bg-amber-500' };
    return { score: 3, label: 'Robuste', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(regPassword);
  const passwordsMatch = regConfirmPassword.length > 0 && regPassword === regConfirmPassword;
  const passwordsMismatch = regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  // Handle Login (support Email OU Téléphone)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanIdentifier = loginEmail.trim();
    const cleanPassword = loginPassword.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setLoginError('Veuillez renseigner votre email ou téléphone et votre mot de passe.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(cleanIdentifier, cleanPassword);
      if (res.success) {
        const firstName = res.user?.firstName || res.user?.name?.split(' ')[0] || 'Cher Partenaire';
        onSuccess?.(`Ravi de vous revoir, ${firstName} ! Connexion réussie.`);
        onClose();
        router.push('/dashboard');
      } else {
        setLoginError(res.error || 'Identifiants incorrects ou compte introuvable.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Erreur lors de la tentative de connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Register (support Téléphone OU Email)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regFirstName.trim() || !regLastName.trim()) {
      setRegError('Veuillez renseigner votre nom et prénom.');
      return;
    }
    if (!regOrganization.trim()) {
      setRegError('Veuillez renseigner le nom de votre entreprise ou organisation.');
      return;
    }

    // Validation selon méthode choisie
    if (regAuthMethod === 'phone') {
      const digits = cleanPhoneDigits(regPhone);
      if (digits.length < 8) {
        setRegError('Veuillez renseigner un numéro de téléphone valide (au moins 8 chiffres).');
        return;
      }
    } else {
      if (!regEmail.trim() || !regEmail.includes('@')) {
        setRegError('Veuillez renseigner une adresse email valide.');
        return;
      }
    }

    if (regPassword.length < 6) {
      setRegError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (regAuthMethod === 'phone') {
        const fullPhone = normalizePhone(regPhone, regCountry);
        const res = await register({
          firstName: regFirstName.trim(),
          lastName: regLastName.trim(),
          phone: fullPhone,
          country: regCountry,
          authMethod: 'phone',
          email: regEmail.trim() || undefined,
          organization: regOrganization.trim(),
          password: regPassword,
        });

        setIsSubmitting(false);
        if (res?.success) {
          onSuccess?.(`Bienvenue, ${regFirstName.trim()} ! Votre compte est activé.`);
          onClose();
          router.push('/dashboard');
        } else {
          setRegError(res?.error || "Erreur lors de la création de l'espace entreprise.");
        }
      } else {
        await register({
          firstName: regFirstName.trim(),
          lastName: regLastName.trim(),
          email: regEmail.trim(),
          country: regCountry,
          authMethod: 'email',
          organization: regOrganization.trim(),
          password: regPassword,
        });

        setIsSubmitting(false);
        onClose();
        router.push(`/verify-email?email=${encodeURIComponent(regEmail.trim())}`);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setRegError(err?.message || "Une erreur est survenue lors de l'enregistrement de votre compte.");
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) return;

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111622] rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-200/90 dark:border-slate-800 animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 active:text-slate-900 hover:bg-slate-100 active:bg-slate-200 dark:hover:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 transition-all active:scale-95 z-20 cursor-pointer touch-manipulation"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 pointer-events-none" />
        </button>

        {/* Top Centered Squircle Icon (Matches capture) */}
        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-xs border border-blue-100 dark:border-blue-900/50">
            {mode === 'login' ? (
              <Lock className="w-7 h-7 stroke-[2]" />
            ) : mode === 'register' ? (
              <UserPlus className="w-7 h-7 stroke-[2]" />
            ) : (
              <Key className="w-7 h-7 stroke-[2]" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            {mode === 'login'
              ? 'Connexion à OMEGA FACTURE'
              : mode === 'register'
              ? 'Inscription à OMEGA FACTURE'
              : 'Mot de passe oublié'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {mode === 'login'
              ? 'Accédez à votre espace entreprise et synchronisez vos factures en toute sécurité.'
              : mode === 'register'
              ? 'Créez votre espace entreprise en quelques secondes pour synchroniser vos factures.'
              : 'Saisissez votre adresse email pour recevoir un lien de réinitialisation sécurisé.'}
          </p>
        </div>

        {/* MODE TABS (Only show for login / register) */}
        {mode !== 'forgot-password' && (
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl mb-5 text-xs font-bold border border-slate-200/60 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#111622] text-brand-600 dark:text-brand-400 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Connexion</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegError(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#111622] text-brand-600 dark:text-brand-400 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Inscription</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. LOGIN MODE */}
        {/* ======================================================== */}
        {mode === 'login' && (
          <div>
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Email ou Numéro de téléphone
                </label>
                <div className="relative">
                  {loginEmail.trim().startsWith('+') || /^[0-9]/.test(loginEmail.trim()) ? (
                    <Smartphone className="w-4 h-4 text-brand-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  ) : (
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  )}
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    data-lpignore="true"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="contact@entreprise.bj ou +229 97 00 00 00"
                    className="w-full pl-10 pr-3.5 py-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mot de Passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                      setForgotEmail(loginEmail);
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
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    data-lpignore="true"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full pl-10 pr-10 py-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    aria-label={showLoginPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{isSubmitting ? 'Connexion en cours...' : 'Se connecter à mon compte'}</span>
                </button>
              </div>
            </form>

            {/* Bottom link to Register */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Vous n'avez pas de compte ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setRegError(null);
                  }}
                  className="font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  Créer un compte
                </button>
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. REGISTER MODE */}
        {/* ======================================================== */}
        {mode === 'register' && (
          <div>
            {regError && (
              <div className="mb-3.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3" autoComplete="off">
              {/* Row 1: Nom & Prénom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nom <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="ex: OLANIRAN"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Prénom <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="ex: Jean-Luc"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 capitalize"
                    />
                  </div>
                  <span className="text-[10px] text-brand-600 dark:text-brand-400 mt-0.5 block">
                    Sera utilisé pour vous accueillir sur le tableau de bord
                  </span>
                </div>
              </div>

              {/* Row 2: Nom de l'entreprise ou organisation */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nom de votre entreprise ou organisation <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regOrganization}
                    onChange={(e) => setRegOrganization(e.target.value)}
                    placeholder="ex: KORA Tech SARL, Cabinet Sylla & Associés..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Sélecteur de méthode d'inscription */}
              <div className="p-1 bg-slate-100 dark:bg-slate-900 rounded-xl flex gap-1 border border-slate-200/60 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRegAuthMethod('phone')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    regAuthMethod === 'phone'
                      ? 'bg-white dark:bg-[#111622] text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Numéro Téléphone (Direct)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegAuthMethod('email')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    regAuthMethod === 'email'
                      ? 'bg-white dark:bg-[#111622] text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Adresse E-mail</span>
                </button>
              </div>

              {/* Pays d'immatriculation / Indicatif */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Pays d'activité <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={regCountry}
                    onChange={(e) => setRegCountry(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    {PHONE_PREFIXES.map((p) => (
                      <option key={p.code} value={p.name}>
                        {p.flag} {p.name} ({p.dialCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Champ principal : Téléphone ou Email */}
              {regAuthMethod === 'phone' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Numéro de Téléphone Mobile <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                      ⚡ Activation instantanée
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
                      <span>{getCountryPhonePrefix(regCountry).flag}</span>
                      <span>{getCountryPhonePrefix(regCountry).dialCode}</span>
                    </div>
                    <div className="relative flex-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="97 00 00 00"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                      Email professionnel (optionnel, pour copies PDF)
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="contact@kora-tech.bj (optionnel)"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Adresse Email Professionnelle <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ex: contact@kora-tech.bj"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>
              )}

              {/* Row 4: Mot de passe & Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mot de passe <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 caractères"
                      className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {regPassword && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                        <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Confirmation du mot de passe <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Retapez le mot de passe"
                      className={`w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                        passwordsMatch
                          ? 'border-emerald-500 focus:ring-emerald-500/20'
                          : passwordsMismatch
                          ? 'border-rose-500 focus:ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800 focus:ring-brand-500/20 focus:border-brand-500'
                      }`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {passwordsMatch && (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  {passwordsMismatch && (
                    <span className="text-[10px] text-rose-500 block mt-0.5">
                      Les mots de passe ne correspondent pas
                    </span>
                  )}
                </div>
              </div>

              {/* Legal disclaimer */}
              <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Vos données sont hébergées et sécurisées conformément aux normes de facturation OHADA et UEMOA (Bénin, CI, Sénégal, etc.).
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Création de votre espace en cours...'
                      : "S'inscrire et se connecter"}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-3 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Vous avez déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  Se connecter
                </button>
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. FORGOT PASSWORD MODE */}
        {/* ======================================================== */}
        {mode === 'forgot-password' && (
          <div>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setForgotSuccess(false);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-3 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à la connexion</span>
            </button>

            <div className="mb-5">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Mot de passe oublié ?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Saisissez l'adresse email associée à votre compte OMEGA FACTURE pour recevoir les instructions de réinitialisation.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2 animate-in zoom-in-95 duration-150">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Lien de réinitialisation envoyé !
                </h3>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Un email avec un lien sécurisé a été transmis à <strong>{forgotEmail}</strong>. Veuillez vérifier votre boîte de réception ou vos courriers indésirables.
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
                    Retourner à la page de connexion
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
                      placeholder="ex: direction@entreprise.bj"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <Mail className="w-4 h-4" />
                  <span>
                    {forgotLoading
                      ? 'Transmission en cours...'
                      : 'Envoyer le lien de réinitialisation'}
                  </span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
