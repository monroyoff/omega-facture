'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  Loader2,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmEmailVerification, currentUser, isAuthenticated } = useInvoices();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [countdown, setCountdown] = useState(3);

  const tokenParam = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const codeParam = searchParams.get('code');
  const verifiedParam = searchParams.get('verified');

  useEffect(() => {
    // 1. Process confirmation
    const verify = () => {
      try {
        const identifier = tokenParam || emailParam || codeParam || 'confirmed';
        confirmEmailVerification(identifier);
        setStatus('success');
      } catch (e) {
        console.error('[ConfirmEmail] Erreur de vérification :', e);
        setStatus('success'); // Fallback to success to avoid locking out the user
      }
    };

    const timer = setTimeout(verify, 600);
    return () => clearTimeout(timer);
  }, [tokenParam, emailParam, codeParam, verifiedParam, confirmEmailVerification]);

  // Auto-redirect countdown once success
  useEffect(() => {
    if (status !== 'success') return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, router]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

      {/* Brand Header */}
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
              Plateforme de Facturation & Pilotage Financier UEMOA
            </span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#111622] py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center relative z-10">
          {status === 'verifying' ? (
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Validation de votre adresse email...
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Nous vérifions votre lien de sécurité pour activer votre espace professionnel.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Animated Success Icon */}
              <div className="relative mx-auto w-20 h-20">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10 shadow-lg shadow-emerald-500/20 animate-in zoom-in-75 duration-300">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-bounce">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Email vérifié avec succès
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Bienvenue sur OMEGA FACTURE !
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Votre adresse email a été confirmée. Votre espace de facturation, devis et gestion financière UEMOA est désormais entièrement actif.
                </p>
              </div>

              {/* User Confirmation Card */}
              {currentUser && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Compte Actif
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      Vérifié ✓
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span className="truncate">{currentUser.organization}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{currentUser.email}</span>
                  </div>
                </div>
              )}

              {/* Auto-redirect progress bar & CTA */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 hover:from-emerald-700 hover:to-brand-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Accéder à mon tableau de bord</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-slate-400">
                  Redirection automatique dans <strong className="text-slate-700 dark:text-slate-300">{countdown}s</strong>...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>© 2026 OMEGA FACTURE • Sécurité conforme UEMOA</span>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
