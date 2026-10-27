'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, LayoutDashboard, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a0f] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#111622] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xl text-center animate-in fade-in duration-300">
        {/* Amber Alert Badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 shadow-lg shadow-amber-500/10">
          <AlertCircle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs font-bold mb-3 border border-amber-200/80 dark:border-amber-800">
          <span>Paiement Interrompu</span>
        </span>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Paiement Annulé
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          La transaction a été annulée ou interrompue. Aucun montant n'a été débité de votre compte. Vous pouvez relancer le règlement à tout moment.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Retourner au tableau de bord</span>
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
