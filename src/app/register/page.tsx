'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Building2,
  Mail,
  Key,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  Check,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useInvoices();

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Garantir des champs 100% vierges à l'ouverture, sans rémanence ni pré-remplissage
  React.useEffect(() => {
    setLastName('');
    setFirstName('');
    setOrganization('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    try {
      localStorage.removeItem('facturo:v1:last_email');
      localStorage.removeItem('facturo:v1:last_registered_email');
    } catch (e) {}
  }, []);

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

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!lastName.trim() || !firstName.trim()) {
      setError('Veuillez renseigner votre nom et votre prénom.');
      return;
    }
    if (!organization.trim()) {
      setError('Veuillez renseigner le nom de votre entreprise ou organisation.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez renseigner une adresse email valide.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        organization: organization.trim(),
        email: email.trim(),
        password,
      });

      setLoading(false);
      // Redirection vers la page d'attente et d'instructions de confirmation d'email
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setLoading(false);
      setError("Une erreur est survenue lors de l'envoi de votre lien de confirmation. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand-600/25 group-hover:scale-105 transition-transform">
            Ω
          </div>
          <div className="text-left">
            <span className="text-lg font-black text-brand-600 dark:text-brand-400 tracking-tight uppercase block">
              OMEGA FACTURE
            </span>
            <span className="text-[10px] text-slate-400 font-medium block -mt-1">
              Création de votre espace de facturation UEMOA
            </span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white dark:bg-[#111622] py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 relative z-10">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6 stroke-[2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Créer votre compte OMEGA FACTURE
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rejoignez les entreprises de la zone UEMOA et gérez vos finances avec précision.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Row 1: Nom & Prénom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nom de famille <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="ex: KOUAME"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Prénom <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="ex: Arnaud"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 capitalize"
                  />
                </div>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 mt-1 block">
                  Utilisé pour vous accueillir sur votre tableau de bord
                </span>
              </div>
            </div>

            {/* Row 2: Nom de l'entreprise ou organisation */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nom de votre entreprise ou organisation <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="ex: KOUAME & PARTNERS SARL, Cabinet Sylla..."
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Row 3: Email Professionnel */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Adresse Email Professionnelle <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: arnaud.kouame@partners.ci"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Row 4: Mot de passe & Confirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mot de passe <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength Meter */}
                {password && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Confirmer le mot de passe <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Retapez votre mot de passe"
                    className={`w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                      passwordsMatch
                        ? 'border-emerald-500 focus:ring-emerald-500/20'
                        : passwordsMismatch
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-800 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {passwordsMatch && (
                      <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                    )}
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {passwordsMismatch && (
                  <span className="text-[10px] text-rose-500 block mt-1">
                    Les mots de passe ne correspondent pas
                  </span>
                )}
              </div>
            </div>

            {/* Legal security disclaimer */}
            <div className="flex items-start gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                En créant un compte, vous acceptez les conditions de service d'OMEGA FACTURE conformes aux normes OHADA et UEMOA (Bénin, Côte d'Ivoire, Sénégal, Togo, etc.).
              </span>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-600/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Envoi de votre lien de confirmation...'
                    : "Créer mon compte & Recevoir le lien d'activation"}
                </span>
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Vous possédez déjà un compte OMEGA ?{' '}
              <Link
                href="/login"
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Se connecter</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>© 2026 OMEGA FACTURE • Tous droits réservés</span>
        </div>
      </div>
    </div>
  );
}
