'use client';

import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Inscris-toi gratuitement',
      description:
        'Créez votre compte en 30 secondes avec votre numéro de téléphone ou votre adresse email. Aucune carte bancaire requise.',
      badge: 'Prêt en 30 secondes',
      arrow: true,
    },
    {
      num: '02',
      title: 'Crée ta première facture',
      description:
        'Sélectionnez votre client, ajoutez vos prestations en FCFA, la TVA 18% et les totaux s’appliquent automatiquement sans formule.',
      badge: 'Automatisation 100%',
      arrow: true,
    },
    {
      num: '03',
      title: 'Envoie et suis les paiements',
      description:
        'Partagez le lien direct ou le PDF par WhatsApp/Email et encaissez plus rapidement grâce au suivi de réception en temps réel.',
      badge: 'Encaissement serein',
      arrow: false,
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#0c1017] border-y border-gray-100 dark:border-gray-800" id="comment-ca-marche">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
            Comment ça marche
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white tracking-tight">
            Passez à la vitesse supérieure en 3 minutes chrono
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Une mise en place sans prise de tête conçue pour que vous puissiez envoyer votre première facture aujourd’hui.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="relative bg-[#FAFAF9] dark:bg-[#111622] rounded-3xl p-8 border border-gray-200/80 dark:border-gray-800 reveal-on-scroll flex flex-col justify-between"
            >
              <div>
                <span className="text-5xl font-black text-brand-600/20 dark:text-brand-400/20 block mb-4">
                  {st.num}
                </span>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-2">
                  {st.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  {st.description}
                </p>
              </div>

              <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1.5 pt-2">
                <span>{st.badge}</span>
                {st.arrow ? <ArrowRight className="w-3.5 h-3.5" /> : <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
