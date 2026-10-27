'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, LayoutDashboard, Home, ShieldCheck } from 'lucide-react';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || searchParams.get('invoice_token') || '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a0f] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#111622] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xl text-center animate-in fade-in duration-300">
        {/* Animated Success Badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5] animate-bounce" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-3 border border-emerald-200/80 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Transaction Traitée avec Succès</span>
        </span>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Paiement Confirmé
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          Votre règlement a bien été enregistré par la passerelle de paiement et synchronisé avec votre compte <strong className="text-brand-600 dark:text-brand-400 font-bold">OMEGA FACTURE</strong>.
        </p>

        {token && (
          <div className="mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Réf. transaction : </span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{token.slice(0, 16)}...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Accéder à mon tableau de bord</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#070a0f] flex items-center justify-center">
          <div className="text-sm font-bold text-slate-500">Chargement de la confirmation...</div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
