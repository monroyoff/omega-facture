'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Send,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Check,
  Copy,
  Sparkles,
  AlertCircle,
  Loader2,
  Key,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pendingVerificationUser, resendVerificationEmail, confirmEmailVerification } = useInvoices();

  const urlEmail = searchParams.get('email');
  const [storedToken, setStoredToken] = useState<string>('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('facturo:v1:pending_verification');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token) setStoredToken(parsed.token);
      }
    } catch (e) {}
  }, []);

  const userEmail = urlEmail || pendingVerificationUser?.email || 'votre.adresse@domaine.com';
  const userToken = storedToken || pendingVerificationUser?.token || 'active-token';

  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = otpInput.replace(/\D/g, '');
    if (clean.length < 6) {
      setOtpError('Veuillez saisir le code à 6 chiffres reçu par email');
      return;
    }
    confirmEmailVerification(userToken || userEmail);
    router.push(`/confirm-email?token=${userToken}&email=${encodeURIComponent(userEmail)}`);
  };

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setResendSuccess(false);

    try {
      await resendVerificationEmail(userEmail);
      setResendSuccess(true);
      setCountdown(30);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (e) {
      console.error('Erreur lors du renvoi :', e);
    } finally {
      setResending(false);
    }
  };

  const handleCopyEmail = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(userEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Detect webmail provider
  const isGmail = userEmail.toLowerCase().includes('@gmail');
  const isOutlook =
    userEmail.toLowerCase().includes('@outlook') ||
    userEmail.toLowerCase().includes('@hotmail') ||
    userEmail.toLowerCase().includes('@live');

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
            Ω
          </div>
          <div className="text-left">
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase block">
              OMEGA <span className="text-brand-600 dark:text-brand-400">FACTURE</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium block -mt-1">
              Plateforme de Facturation & Devis UEMOA
            </span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white dark:bg-[#111622] py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center relative z-10 space-y-6">
          {/* Animated Envelope Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto ring-8 ring-brand-500/5 shadow-lg shadow-brand-500/15 animate-in zoom-in-75 duration-300">
              <Mail className="w-10 h-10 stroke-[2]" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md animate-pulse">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Étape finale de sécurité</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Vérifiez votre boîte mail
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Nous avons envoyé un lien de confirmation sécurisé à l'adresse :
            </p>

            {/* Recipient Email Pill */}
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Mail className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
              <span className="truncate max-w-[260px] sm:max-w-xs">{userEmail}</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 hover:text-brand-600 transition-colors ml-1 cursor-pointer"
                title="Copier l'email"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* OTP Code Form — Direct Activation from Smartphone Email */}
          <form onSubmit={handleVerifyOtp} className="p-5 rounded-2xl bg-gradient-to-b from-blue-50/80 to-slate-50 dark:from-blue-950/30 dark:to-slate-900/40 border-2 border-blue-200/80 dark:border-blue-800/60 text-center space-y-3.5 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-blue-900 dark:text-blue-300 text-xs font-black uppercase tracking-wider">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Saisir le Code de Sécurité (6 chiffres)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Vous avez reçu l'email sur votre smartphone ? Recopiez simplement les 6 chiffres ici :
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-xs mx-auto">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setOtpInput(val);
                  setOtpError('');
                  if (val.length === 6) {
                    confirmEmailVerification(userToken || userEmail);
                    router.push(`/confirm-email?token=${userToken}&email=${encodeURIComponent(userEmail)}`);
                  }
                }}
                placeholder="Ex: 849201"
                className="w-full text-center text-2xl font-black tracking-widest py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#151c2c] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 font-mono shadow-inner"
              />
              <button
                type="submit"
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Valider</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {otpError && (
              <p className="text-xs text-rose-500 font-semibold">{otpError}</p>
            )}
          </form>

          {/* Direct One-Click Activation Button */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-left">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Accès direct sur cet ordinateur</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Vous êtes déjà sur votre ordinateur ? Ouvrez directement votre tableau de bord sans attendre :
            </p>
            <Link
              href={`/confirm-email?token=${userToken}&email=${encodeURIComponent(userEmail)}`}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
            >
              <span>Activer mon compte & Accéder au Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left text-xs space-y-2.5">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Comment activer votre compte ?</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-500 dark:text-slate-400 pl-1 leading-relaxed">
              <li>Ouvrez votre messagerie électronique.</li>
              <li>Recherchez le message d'<strong>OMEGA FACTURE</strong>.</li>
              <li>
                Cliquez sur le lien <strong className="text-slate-800 dark:text-slate-200">« Confirmer mon adresse email »</strong>.
              </li>
              <li>Vous serez automatiquement redirigé vers votre tableau de bord activé.</li>
            </ol>
          </div>

          {/* Webmail Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all shadow-2xs active:scale-98 ${
                isGmail
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                  : 'bg-white dark:bg-[#151c2c] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>Ouvrir Gmail</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <a
              href="https://outlook.live.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all shadow-2xs active:scale-98 ${
                isOutlook
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                  : 'bg-white dark:bg-[#151c2c] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>Ouvrir Outlook</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          {/* Feedback Toast */}
          {resendSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-center gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Un nouvel email de confirmation vient de vous être envoyé !</span>
            </div>
          )}

          {/* Resend CTA */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Vous n'avez rien reçu ?
            </span>

            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="inline-flex items-center gap-1.5 font-bold text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>
                {resending
                  ? 'Envoi en cours...'
                  : countdown > 0
                  ? `Renvoyer dans ${countdown}s`
                  : 'Renvoyer le lien de confirmation'}
              </span>
            </button>
          </div>



          {/* Change Email or Login */}
          <div className="text-xs text-slate-400 flex items-center justify-center gap-3">
            <Link href="/register" className="hover:text-slate-600 dark:hover:text-slate-200 underline">
              Modifier mon adresse email
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-slate-600 dark:hover:text-slate-200 underline">
              Se connecter
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>© 2026 OMEGA FACTURE • Vérifiez vos spams si l'email tarde à arriver</span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
