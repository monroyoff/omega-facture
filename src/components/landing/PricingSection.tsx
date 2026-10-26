'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

export const PricingSection: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-[#0c1017] border-y border-gray-100 dark:border-gray-800" id="tarifs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
            Tarifs simples &amp; transparents
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white tracking-tight">
            Investissez dans la clarté de votre entreprise
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Payez en FCFA en toute flexibilité avec Mobile Money (Wave, Orange Money) ou Carte Bancaire.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Plan Gratuit */}
          <div className="bg-[#FAFAF9] dark:bg-[#111622] rounded-3xl p-8 border border-gray-200/80 dark:border-gray-800 flex flex-col justify-between transition-all duration-300 hover:shadow-card-subtle reveal-on-scroll">
            <div>
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Pour débuter
                </span>
                <h3 className="text-2xl font-bold text-brand-dark dark:text-white mt-1">
                  Plan Gratuit
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Idéal pour tester ou démarrer son activité.
                </p>
              </div>

              <div className="py-6 border-y border-gray-200/70 dark:border-gray-800 mb-6">
                <span className="text-4xl font-extrabold text-brand-dark dark:text-white">0 FCFA</span>
                <span className="text-sm font-semibold text-gray-500"> / mois</span>
              </div>

              <ul className="space-y-3.5 text-sm text-gray-600 dark:text-gray-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 stroke-[2.5] shrink-0" />
                  <span>Jusqu'à 5 factures / mois</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 stroke-[2.5] shrink-0" />
                  <span>1 utilisateur</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 stroke-[2.5] shrink-0" />
                  <span>Modèles de factures standards</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 stroke-[2.5] shrink-0" />
                  <span>Calcul automatique de TVA</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full text-center py-3.5 px-6 rounded-2xl border border-gray-300 dark:border-gray-700 hover:border-brand-dark dark:hover:border-white font-bold text-sm text-brand-dark dark:text-white transition-all duration-200 cursor-pointer block"
            >
              Démarrer gratuitement
            </Link>
          </div>

          {/* Plan Pro (Featured) */}
          <div className="bg-white dark:bg-[#111622] rounded-3xl p-8 border-2 border-brand-600 dark:border-brand-500 shadow-xl shadow-brand-600/10 relative flex flex-col justify-between scale-100 lg:-translate-y-2 reveal-on-scroll">
            {/* Badge Most Popular */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-brand-600/30 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3 h-3" />
              <span>Le Plus Populaire</span>
            </div>

            <div>
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Indépendants &amp; PME
                </span>
                <h3 className="text-2xl font-bold text-brand-dark dark:text-white mt-1">
                  Plan Pro
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Pour les indépendants et freelances établis.
                </p>
              </div>

              <div className="py-6 border-y border-gray-100 dark:border-gray-800 mb-6">
                <span className="text-4xl font-extrabold text-brand-dark dark:text-white">5 000 FCFA</span>
                <span className="text-sm font-semibold text-gray-500"> / mois</span>
              </div>

              <ul className="space-y-3.5 text-sm text-gray-700 dark:text-gray-200 mb-8">
                <li className="flex items-center gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 stroke-[2.5] shrink-0" />
                  <span>Factures &amp; devis illimités</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 stroke-[2.5] shrink-0" />
                  <span>Relances automatiques par WhatsApp &amp; Email</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 stroke-[2.5] shrink-0" />
                  <span>Calcul automatique TVA 18% &amp; retenues</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 stroke-[2.5] shrink-0" />
                  <span>Export comptable Excel / PDF</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 stroke-[2.5] shrink-0" />
                  <span>Personnalisation complète avec logo</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register?plan=pro"
              className="w-full text-center py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 font-bold text-sm text-white shadow-lg shadow-brand-600/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer block"
            >
              Choisir le Plan Pro
            </Link>
          </div>

          {/* Plan Business */}
          <div className="bg-[#FAFAF9] dark:bg-[#111622] rounded-3xl p-8 border border-gray-200/80 dark:border-gray-800 flex flex-col justify-between transition-all duration-300 hover:shadow-card-subtle reveal-on-scroll">
            <div>
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Équipes en essor
                </span>
                <h3 className="text-2xl font-bold text-brand-dark dark:text-white mt-1">
                  Plan Business
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Pour les PME et entreprises en pleine croissance.
                </p>
              </div>

              <div className="py-6 border-y border-gray-200/70 dark:border-gray-800 mb-6">
                <span className="text-4xl font-extrabold text-brand-dark dark:text-white">15 000 FCFA</span>
                <span className="text-sm font-semibold text-gray-500"> / mois</span>
              </div>

              <ul className="space-y-3.5 text-sm text-gray-600 dark:text-gray-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 stroke-[2.5] shrink-0" />
                  <span>Tout le Plan Pro en illimité</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 stroke-[2.5] shrink-0" />
                  <span>Multi-utilisateurs (jusqu'à 10 membres)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 stroke-[2.5] shrink-0" />
                  <span>Rôles et permissions comptables avancés</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 stroke-[2.5] shrink-0" />
                  <span>Support prioritaire WhatsApp 24/7 dédié</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 stroke-[2.5] shrink-0" />
                  <span>Accès API &amp; intégration comptable</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register?plan=business"
              className="w-full text-center py-3.5 px-6 rounded-2xl border border-gray-300 dark:border-gray-700 hover:border-brand-dark dark:hover:border-white font-bold text-sm text-brand-dark dark:text-white transition-all duration-200 cursor-pointer block"
            >
              Passer au Business
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
