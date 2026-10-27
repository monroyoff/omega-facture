'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator, Clock, ShieldAlert, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { formatFCFA } from '@/lib/money/format';

export const RoiCalculator: React.FC = () => {
  const [invoicesCount, setInvoicesCount] = useState<number>(20);

  // Calculations based on 45 minutes saved per invoice + reduced overdue days + VAT error avoidance
  const hoursSavedPerMonth = Math.round((invoicesCount * 45) / 60);
  const estimatedCashflowAccelerated = invoicesCount * 120000; // estimated FCFA recovered faster
  const daysSavedOnPayment = 18; // Average from 35 days to 17 days

  return (
    <section className="py-20 bg-[#FAFAF9] dark:bg-[#070a0f] border-b border-slate-100 dark:border-slate-800 scroll-mt-24" id="calculateur-roi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#111622] rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Interactive Controls */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulateur d'économies réelles</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
                Combien d’heures et de cash gagnez-vous chaque mois ?
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                Ajustez le volume de factures mensuelles de votre entreprise pour estimer l’impact direct sur votre trésorerie et votre temps de travail.
              </p>

              {/* Slider Component */}
              <div className="bg-[#FAFAF9] dark:bg-slate-900/80 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                    Factures &amp; Devis émis par mois :
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-brand-600 dark:text-brand-400 font-mono">
                    {invoicesCount} factures
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={invoicesCount}
                  onChange={(e) => setInvoicesCount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-2">
                  <span>5 factures (Indépendant)</span>
                  <span>50 factures (PME)</span>
                  <span>100+ factures (Agence)</span>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Computed Metrics */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Hours Saved */}
              <div className="bg-brand-50/70 dark:bg-brand-950/40 p-5 rounded-2xl border border-brand-200/60 dark:border-brand-900/50">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-3xl font-black text-brand-900 dark:text-white mb-1">
                  +{hoursSavedPerMonth} h / mois
                </div>
                <p className="text-xs text-brand-700 dark:text-brand-300 font-medium">
                  De temps administratif récupéré pour vous concentrer sur vos clients.
                </p>
              </div>

              {/* Card 2: Cashflow Accelerated */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/50">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-3xl font-black text-emerald-900 dark:text-white mb-1">
                  {formatFCFA(estimatedCashflowAccelerated)}
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  De trésorerie débloquée et encaissée plus rapidement via Mobile Money.
                </p>
              </div>

              {/* Card 3: Days Saved */}
              <div className="bg-amber-50/70 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-200/60 dark:border-amber-900/50">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3">
                  <Calculator className="w-5 h-5" />
                </div>
                <div className="text-3xl font-black text-amber-900 dark:text-white mb-1">
                  -{daysSavedOnPayment} jours
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  Sur les délais moyens de règlement client grâce aux relances WhatsApp.
                </p>
              </div>

              {/* Card 4: Tax Compliance */}
              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-5 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/50 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-black text-indigo-900 dark:text-white mb-1">
                    0 erreur
                  </div>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                    Sur la TVA selon votre pays (18% ou 19%) et les mentions légales obligatoires.
                  </p>
                </div>
              </div>

              {/* Bottom Quick Button spanning 2 cols */}
              <div className="sm:col-span-2 pt-2">
                <Link
                  href="/register"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all"
                >
                  <span>Démarrer dès maintenant avec le Plan Gratuit</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
