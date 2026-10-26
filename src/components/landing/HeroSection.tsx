'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HeroInvoiceSimulator } from './HeroInvoiceSimulator';
import {
  ArrowRight,
  Play,
  Check,
  ShieldCheck,
  Sparkles,
  Star,
  Calculator,
  LayoutDashboard,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Zap,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'preview' | 'simulator'>('preview');

  const scrollToVisite = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('visite');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const partnerLogos = [
    { name: 'Wave', badge: '🌊 Wave Mobile Money' },
    { name: 'Orange Money', badge: '🟧 Orange Money' },
    { name: 'MTN MoMo', badge: '🟨 MTN MoMo' },
    { name: 'Moov Money', badge: '🟦 Moov Money' },
    { name: 'Ecobank', badge: '🏦 Ecobank UEMOA' },
    { name: 'Coris Bank', badge: '🏛️ Coris Bank' },
    { name: 'Bank of Africa', badge: '🌍 Bank of Africa' },
    { name: 'Carte Bancaire', badge: '💳 Carte UEMOA / Visa' },
  ];

  return (
    <section className="relative pt-36 sm:pt-44 md:pt-48 pb-20 md:pb-28 overflow-hidden bg-white/50 dark:bg-slate-950/50" data-purpose="hero-section">
      {/* Background Dot Grid Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-60 -z-20 pointer-events-none" />

      {/* Radiant Glowing Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[650px] bg-gradient-to-tr from-brand-600/15 via-indigo-600/12 to-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Pill Tagline with Pulse */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-brand-200/90 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-bold shadow-xs hover:border-brand-400 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>N°1 de la Facturation en Afrique de l'Ouest • Conforme OHADA &amp; Directives UEMOA</span>
          </div>
        </div>

        {/* Magnetic Headline */}
        <div className="max-w-5xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08] mb-6">
            Facturez en{' '}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              FCFA
            </span>
            .<br className="hidden sm:inline" />{' '}
            Encaissez par{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Mobile Money
            </span>{' '}
            en 2 clics.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Adieu aux factures bricolées sur Excel et aux retards de paiement. <strong className="text-brand-600 dark:text-brand-400 font-black">OmegaFacture</strong> calcule automatiquement votre{' '}
            <strong className="text-slate-900 dark:text-white font-bold">TVA 18%</strong>, génère vos reçus officiels OHADA et permet à vos clients de régler instantanément par{' '}
            <strong className="text-slate-900 dark:text-white font-bold">Wave, Orange Money ou Virement</strong>.
          </p>
        </div>

        {/* Call To Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/register"
            className="hero-cta-button w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full font-extrabold text-base cursor-pointer group bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Créer ma première facture gratuite</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <a
            href="#visite"
            onClick={scrollToVisite}
            className="secondary-cta-button w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-bold text-base cursor-pointer group bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-xs"
          >
            <Play className="w-4 h-4 text-brand-600 fill-brand-600 transition-transform duration-200 group-hover:scale-110" />
            <span>Découvrir la plateforme en images</span>
          </a>
        </div>

        {/* Reassurance Micro-Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
            <span>Gratuit à vie sans carte bancaire</span>
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:inline-block"></span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            <span>TVA 18% &amp; Mentions OHADA vérifiées</span>
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:inline-block"></span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-brand-600 stroke-[2.5]" />
            <span>Prêt en 30 secondes</span>
          </span>
        </div>

        {/* Social Proof with Avatars & Star Rating */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
          <div className="flex items-center -space-x-3">
            <img
              src="/images/professionals/aminata-kone.jpg"
              alt="Aminata Koné"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-md"
            />
            <img
              src="/images/professionals/cheikh-ndiaye.jpg"
              alt="Cheikh Ndiaye"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-md"
            />
            <img
              src="/images/professionals/fatima-diop.jpg"
              alt="Fatima Diop"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-md"
            />
            <img
              src="/images/professionals/paul-etoo.jpg"
              alt="Paul-Alain Eto'o"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-md"
            />
          </div>
          <div className="flex flex-col sm:items-start text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">4.9 / 5</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Rejoint par <strong className="text-slate-900 dark:text-white font-bold">+2 500 entrepreneurs</strong> à Dakar, Abidjan, Cotonou, Lomé &amp; Douala
            </p>
          </div>
        </div>

        {/* View Mode Segmented Control: 3D Showcase vs Live Interactive Simulator */}
        <div className="flex items-center justify-center gap-2 mb-8" id="demo">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-300/60 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Aperçu du Logiciel Pro (3D)</span>
            </button>
            <button
              onClick={() => setViewMode('simulator')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                viewMode === 'simulator'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Simulateur en direct (Testez vos montants)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Display Area */}
        {viewMode === 'preview' ? (
          /* 3D Showcase with Floating Contextual Cards */
          <div className="relative max-w-5xl mx-auto">
            {/* Ambient Lighting Behind Visual */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-3/5 bg-gradient-to-tr from-brand-600/20 via-indigo-600/25 to-emerald-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Floating Live Card Top-Left: Wave Payment */}
            <div className="hidden lg:flex absolute -top-6 -left-8 z-20 items-center gap-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 animate-float-top pointer-events-none text-left">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-black text-lg">
                🌊
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">+ 450 000 FCFA</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Wave Encaissé
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Facture FAC-2026-084 soldée
                </p>
              </div>
            </div>

            {/* Floating Live Card Top-Right: TVA 18% & OHADA */}
            <div className="hidden lg:flex absolute -top-6 -right-8 z-20 items-center gap-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 animate-float-bottom pointer-events-none text-left">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">TVA 18% Automatique</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Zéro formule Excel • Mentions IFU / NINEA
                </p>
              </div>
            </div>

            {/* Floating Live Card Bottom-Left: WhatsApp Recovery */}
            <div className="hidden lg:flex absolute -bottom-6 -left-6 z-20 items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 animate-float-bottom pointer-events-none text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Relance WhatsApp en 1 Clic</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Règlements perçus 2x plus vite</p>
              </div>
            </div>

            {/* Floating Live Card Bottom-Right: Recovery Rate */}
            <div className="hidden lg:flex absolute -bottom-6 -right-6 z-20 items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 animate-float-top pointer-events-none text-left">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Taux de Recouvrement 94.8%</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">+18% de rapidité ce mois</p>
              </div>
            </div>

            {/* Main Center Mockup Frame */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-[#090d16] group">
              {/* Window Controls Header */}
              <div className="bg-slate-900/95 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                  <span className="ml-2 font-mono text-[11px] text-slate-400">omegafacture.site/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fintech Pro • Zone UEMOA &amp; CEMAC</span>
                </div>
              </div>

              {/* Masterpiece 3D Image */}
              <div className="relative">
                <img
                  src="/images/landing/hero-saas-showcase.jpg"
                  alt="Interface professionnelle Omega Facture en 3D"
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Live Interactive Simulator Mode */
          <div className="transition-opacity duration-300">
            <HeroInvoiceSimulator />
          </div>
        )}

        {/* Regional Ecosystem & Banking Strip */}
        <div className="mt-16 pt-10 border-t border-slate-200/70 dark:border-slate-800/80">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">
            Intégré aux réseaux de paiement &amp; banques leaders en Afrique de l'Ouest
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
            {partnerLogos.map((partner, idx) => (
              <div
                key={idx}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-xs hover:border-brand-500/40 hover:-translate-y-0.5 transition-all"
              >
                {partner.badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
