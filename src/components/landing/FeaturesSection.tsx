'use client';

import React from 'react';
import { TaxSimulator } from './TaxSimulator';
import { Zap, Calculator, BellRing, Users, Check } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'Factures professionnelles en 2 clics',
      description:
        'Modèles conformes aux normes OHADA, personnalisés avec votre logo officiel, vos mentions légales, vos devises FCFA (XOF/XAF) et export PDF instantané en haute définition.',
      tagLeft: '✓ Devises XOF & XAF supportées',
      tagRight: 'Génération PDF < 2s',
      highlightRight: true,
    },
    {
      icon: Calculator,
      title: 'TVA 18% calculée automatiquement',
      description:
        'Finies les erreurs de saisie : le système gère les taux de TVA standard de l’espace UEMOA/CEMAC, les exonérations légales et les retenues d’acompte sans gymnastique mathématique.',
      tagLeft: '✓ Taux 18% préconfiguré',
      tagRight: 'Zéro erreur fiscale',
      highlightRight: true,
    },
    {
      icon: BellRing,
      title: 'Suivi des paiements en temps réel',
      description:
        'Notifications instantanées dès qu’une facture est consultée ou réglée. Programmation d’alertes automatiques et relances courtoises par WhatsApp et Email d’un simple clic.',
      tagLeft: '✓ Relances WhatsApp & Email',
      tagRight: 'Paiements 2x plus rapides',
      emeraldRight: true,
    },
    {
      icon: Users,
      title: 'Gestion de clients intégrée',
      description:
        'Répertoire centralisé, historique complet des devis et paiements, fiches clients détaillées (NINEA, RCCM, adresses) et suivi clair du chiffre d’affaires généré par chaque compte.',
      tagLeft: '✓ Historique complet & NINEA',
      tagRight: 'Visualisation CA direct',
      highlightRight: true,
    },
  ];

  return (
    <section className="py-24 bg-[#FAFAF9] dark:bg-[#070a0f]" id="fonctionnalites">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
            Fonctionnalités Clés
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white tracking-tight">
            Tout ce dont vous avez besoin pour facturer en toute sérénité
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Une interface intuitive conçue expressément pour répondre aux normes africaines et accélérer vos flux de cash.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#111622] rounded-3xl p-8 sm:p-10 border border-gray-200/80 dark:border-gray-800 hover:shadow-card-subtle transition-all duration-300 reveal-on-scroll flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200/60 dark:border-brand-800/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-dark dark:text-white mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 text-sm sm:text-base">
                    {feat.description}
                  </p>
                </div>

                <div className="bg-[#FAFAF9] dark:bg-slate-900/60 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span>{feat.tagLeft}</span>
                  <span
                    className={`font-semibold ${
                      feat.emeraldRight ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-600 dark:text-brand-400'
                    }`}
                  >
                    {feat.tagRight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Tax Simulator Box */}
        <TaxSimulator />
      </div>
    </section>
  );
};
