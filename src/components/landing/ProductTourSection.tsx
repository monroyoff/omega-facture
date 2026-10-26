'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  Smartphone,
  TrendingUp,
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export const ProductTourSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      title: 'Tableau de bord financier',
      subtitle: 'Vue d’ensemble en FCFA en temps réel',
      description:
        'Visualisez instantanément votre chiffre d’affaires facturé, le montant réellement encaissé, vos créances en attente et l’évolution mensuelle de votre activité commerciale en Afrique de l’Ouest.',
      image: '/images/landing/dashboard-preview.jpg',
      badge: 'Pilotage en direct',
      benefits: [
        'Total facturé vs encaissé calculé au franc près (FCFA)',
        'Suivi des devis, factures d’acompte et factures soldées',
        'Graphique d’évolution des revenus et raccourcis 1-clic',
      ],
    },
    {
      id: 'whatsapp',
      icon: MessageSquareText,
      title: 'Relances WhatsApp en 1 Clic',
      subtitle: 'Le canal n°1 des affaires en Afrique',
      description:
        'Envoyez directement vos factures et rappels de paiement sur WhatsApp avec un message professionnel pré-formaté, le récapitulatif du solde et les boutons de règlement immédiat.',
      image: '/images/landing/whatsapp-invoice-flow.jpg',
      badge: 'Règlement 2x plus rapide',
      benefits: [
        'Message courtois avec détails du montant et échéance',
        'Lien sécurisé pour consulter le document officiel en ligne',
        'Réduction drastique des créances oubliées ou contestées',
      ],
    },
    {
      id: 'mobile-money',
      icon: Smartphone,
      title: 'Encaissements Mobile Money',
      subtitle: 'Wave, Orange Money, MTN & Moov',
      description:
        'Offrez à vos clients la liberté de régler immédiatement par leur moyen de paiement préféré : Mobile Money, carte bancaire ou virement bancaire UEMOA avec rapprochement comptable direct.',
      image: '/images/landing/mobile-money-ecosystem.jpg',
      badge: 'Multi-moyens UEMOA',
      benefits: [
        'Support complet Wave, Orange Money, MTN MoMo, Moov Money',
        'Options virements bancaires (Ecobank, Coris, BOA, NSIA)',
        'Attribution automatique de l’acompte et mise à jour du solde',
      ],
    },
    {
      id: 'analytics',
      icon: TrendingUp,
      title: 'Balance Âgée & Trésorerie',
      subtitle: 'Anticipez les risques d’impayés',
      description:
        'Classez vos créances selon leur maturité (0-30 jours saines, 31-60 jours à surveiller, +60 jours contentieux) et suivez votre taux de recouvrement global pour sécuriser votre trésorerie.',
      image: '/images/landing/financial-reports-analytics.jpg',
      badge: 'Contrôle & Visibilité',
      benefits: [
        'Taux de recouvrement en direct et délai moyen de règlement',
        'Ventilation des flux perçus par opérateur et canal',
        'Export officiel certifié en PDF haute définition et tableur CSV',
      ],
    },
  ];

  const currentTab = tabs[activeTab];

  return (
    <section className="py-24 bg-white dark:bg-[#0c1017] border-y border-slate-100 dark:border-slate-800" id="visite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Découvrez la plateforme en images</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Une expérience pensée pour propulser{' '}
            <span className="text-brand-600 dark:text-brand-400">vos finances</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Naviguez entre les 4 piliers d’Omega Facture : du premier devis jusqu’au recouvrement effectif sur votre compte.
          </p>
        </div>

        {/* Tab Navigation Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2.5 px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer border ${
                  isActive
                    ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-600/25 scale-105'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="bg-[#FAFAF9] dark:bg-[#111622] rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden">
          {/* Subtle Glow behind image */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Feature Highlights */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/70 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 text-xs font-bold mb-4">
                  <span>{currentTab.badge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
                  {currentTab.title}
                </h3>
                <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-4">
                  {currentTab.subtitle}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  {currentTab.description}
                </p>

                {/* Benefits List */}
                <div className="space-y-3 mb-8">
                  {currentTab.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                        {b}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick CTA */}
              <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 group"
                >
                  <span>Tester cette fonctionnalité en direct</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right Column: High Definition Mockup Image */}
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700 shadow-2xl group">
                <img
                  src={currentTab.image}
                  alt={currentTab.title}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                {/* Overlay Badge Bottom */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-slate-900/85 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-medium text-slate-200">
                      Normes OHADA &amp; Monnaie FCFA (XOF/XAF)
                    </span>
                  </div>
                  <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-400 font-bold">
                    ✓ 100% Conforme
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
