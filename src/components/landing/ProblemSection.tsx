'use client';

import React from 'react';
import { FileText, Calculator, Clock, AlertTriangle } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: FileText,
      title: 'Factures non professionnelles',
      description:
        'Des documents Word mal alignés qui nuisent à votre crédibilité auprès des grands comptes, créant des doutes et retardant vos validations de paiement.',
    },
    {
      icon: Calculator,
      title: 'Calculs manuels de TVA hasardeux',
      description:
        'Erreurs de calcul sur la TVA à 18%, acomptes BRS et retenues à la source qui compliquent dangereusement votre comptabilité lors des déclarations fiscales.',
    },
    {
      icon: Clock,
      title: 'Suivi des paiements impossible',
      description:
        'Relances manuelles oubliées, impayés accumulés et zéro visibilité sur votre trésorerie réelle. Vos encaissements se dispersent au fil des semaines.',
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0c1017] border-y border-gray-100 dark:border-gray-800" id="problemes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-red mb-3">
            Pourquoi changer ?
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white tracking-tight">
            La facturation traditionnelle freine votre croissance
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Perdre son temps avec des tableurs obsolètes coûte des millions de FCFA chaque année aux créateurs d'entreprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <div
                key={idx}
                className="landing-card bg-[#FAFAF9] dark:bg-[#111622] rounded-3xl p-8 border border-gray-200/70 dark:border-gray-800 hover:border-brand-red/30 transition-all duration-300 group reveal-on-scroll"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-softRed dark:bg-rose-950/40 flex items-center justify-center text-brand-red mb-6 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="w-7 h-7 stroke-[1.8]" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">
                  {prob.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {prob.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
