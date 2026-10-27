'use client';

import React from 'react';
import { FileText, Calculator, Clock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: FileText,
      title: 'Factures Word bricolées & non professionnelles',
      description:
        'Des documents Word mal alignés qui nuisent à votre crédibilité auprès des grands comptes, créant des doutes et retardant vos validations de paiement.',
      impact: 'Perte de crédibilité & délais allongés',
    },
    {
      icon: Calculator,
      title: 'Calculs manuels de TVA hasardeux',
      description:
        'Erreurs de formules sur la TVA selon les pays (18%, 19% au Niger), les acomptes et retenues qui exposent votre entreprise à de lourdes pénalités fiscales.',
      impact: 'Risque direct de redressement fiscal',
    },
    {
      icon: Clock,
      title: 'Suivi des paiements impossible & créances oubliées',
      description:
        'Relances manuelles négligées, impayés accumulés et zéro visibilité sur la trésorerie réelle. Les clients ne paient que ceux qui relancent avec méthode.',
      impact: 'Jusqu’à 28% de factures non recouvrées',
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0c1017] border-y border-slate-100 dark:border-slate-800 scroll-mt-24" id="problemes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Le coût caché des tableurs</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            La facturation traditionnelle freine votre{' '}
            <span className="text-brand-600 dark:text-brand-400">croissance</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Perdre son temps avec des tableurs obsolètes coûte des millions de FCFA chaque année aux créateurs d’entreprises et cabinets en Afrique de l’Ouest.
          </p>
        </div>

        {/* 2-Column Split: Problems on Left, Visual Comparison Mockup on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: 3 Problem Cards */}
          <div className="lg:col-span-6 space-y-4">
            {problems.map((prob, idx) => {
              const Icon = prob.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FAFAF9] dark:bg-[#111622] rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 hover:border-brand-500/40 hover:shadow-md transition-all duration-300 group reveal-on-scroll"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 group-hover:border-blue-400 transition-all">
                      <Icon className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                        {prob.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-3">
                        {prob.description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 px-2.5 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                        <span>{prob.impact}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: High-Res Before vs After Visual Image */}
          <div className="lg:col-span-6">
            <div className="relative bg-[#FAFAF9] dark:bg-[#111622] rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden group">
              {/* Badge Over Image */}
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Comparatif Visuel Direct
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Standard OHADA / UEMOA</span>
                </span>
              </div>

              {/* The Visual Image */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                <img
                  src="/images/landing/excel-vs-omegafacture.jpg"
                  alt="Comparatif avant / après : Excel chaotique contre OmegaFacture"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              {/* Bottom Reassurance Card */}
              <div className="mt-4 p-4 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-brand-900 dark:text-brand-200">
                    Passez de 4 heures de bricolage à 2 minutes de sérénité.
                  </p>
                  <p className="text-brand-700 dark:text-brand-400 mt-0.5">
                    Modèles professionnels prêts à l’emploi aux normes OHADA.
                  </p>
                </div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 font-bold text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-2 rounded-lg shrink-0 transition-colors"
                >
                  <span>Essayer maintenant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
