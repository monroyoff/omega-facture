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
  Layers,
  Calculator,
  LayoutDashboard,
  CheckCircle2,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'simulator' | 'preview'>('simulator');

  const scrollToDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('demo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const partnerLogos = [
    { name: 'Wave Mobile Money', badge: '🌊 Wave' },
    { name: 'Orange Money', badge: '🟧 Orange Money' },
    { name: 'MTN Mobile Money', badge: '🟨 MTN MoMo' },
    { name: 'Moov Money', badge: '🟦 Moov Money' },
    { name: 'Ecobank', badge: '🏦 Ecobank' },
    { name: 'Coris Bank', badge: '🏛️ Coris Bank' },
    { name: 'Bank of Africa', badge: '🌍 BOA' },
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden" data-purpose="hero-section">
      {/* Background Decorative Glowing Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-500/12 dark:bg-brand-600/15 rounded-full blur-3xl opacity-80 -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl opacity-60 -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Pill Tagline */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-semibold tracking-wide shadow-xs">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Le logiciel de facturation &amp; pilotage n°1 en Afrique francophone</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Fini les factures bricolées sur{' '}
            <span className="relative inline-block line-through text-slate-400 dark:text-slate-500 decoration-rose-500/80 decoration-4">
              Word et Excel.
            </span>
            <br />
            <span className="text-brand-600 dark:text-brand-400">Facturez comme un pro en 2 clics.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-brand-600 dark:text-brand-400 font-black">OmegaFacture</strong> permet aux entrepreneurs, agences et PME en Afrique de créer des factures conformes en{' '}
            <strong className="text-slate-900 dark:text-white font-bold">FCFA</strong> avec{' '}
            <strong className="text-slate-900 dark:text-white font-bold">TVA 18% automatique</strong> et encaissement suivi en temps réel.
          </p>
        </div>

        {/* Call To Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/register"
            className="hero-cta-button w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base cursor-pointer group bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 transition-all transform hover:-translate-y-0.5"
          >
            <span>Commencer gratuitement</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <a
            href="#visite"
            className="secondary-cta-button w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base cursor-pointer group bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all"
          >
            <Play className="w-4 h-4 text-brand-600 fill-brand-600 transition-transform duration-200 group-hover:scale-110" />
            <span>Découvrir en images</span>
          </a>
        </div>

        {/* Reassurance Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
            <span>Gratuit sans carte bancaire</span>
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:inline-block"></span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            <span>Conforme OHADA, TVA 18% &amp; UEMOA</span>
          </span>
        </div>

        {/* Social Proof with Real African Professional Avatars */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <div className="flex items-center -space-x-3">
            <img
              src="/images/professionals/aminata-kone.jpg"
              alt="Aminata Koné"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm"
            />
            <img
              src="/images/professionals/cheikh-ndiaye.jpg"
              alt="Cheikh Ndiaye"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm"
            />
            <img
              src="/images/professionals/fatima-diop.jpg"
              alt="Fatima Diop"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm"
            />
            <img
              src="/images/professionals/paul-etoo.jpg"
              alt="Paul-Alain Eto'o"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm"
            />
          </div>
          <div className="flex flex-col sm:items-start text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-1">4.9/5</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Rejoint par <strong className="text-slate-900 dark:text-white font-semibold">+2 500 entrepreneurs</strong> à Dakar, Abidjan, Cotonou, Lomé &amp; Douala
            </p>
          </div>
        </div>

        {/* View Mode Switcher: Interactive Simulator vs Live Dashboard Preview */}
        <div className="flex items-center justify-center gap-2 mb-6" id="demo">
          <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur border border-slate-300/60 dark:border-slate-700">
            <button
              onClick={() => setViewMode('simulator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === 'simulator'
                  ? 'bg-white dark:bg-[#111622] text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Simulateur en direct</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-[#111622] text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tableau de bord Pro (Capture)</span>
            </button>
          </div>
        </div>

        {/* Displaying either Simulator or Pro Mockup */}
        {viewMode === 'simulator' ? (
          <HeroInvoiceSimulator />
        ) : (
          <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-[#0b101b] group">
            {/* Top Window Bar */}
            <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="ml-2 font-mono text-[11px] text-slate-400">omegafacture.site/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Session Sécurisée • Zone UEMOA</span>
              </div>
            </div>

            {/* The Image */}
            <div className="relative">
              <img
                src="/images/landing/dashboard-preview.jpg"
                alt="Tableau de bord professionnel Omega Facture"
                className="w-full h-auto object-cover"
              />
              {/* Floating Reassurance Badges on Image */}
              <div className="absolute top-4 left-4 hidden sm:flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-white text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold">3 450 000 FCFA facturés ce mois</span>
              </div>
              <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-2 bg-brand-600/90 backdrop-blur-md px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-lg">
                <span>Wave &amp; Orange Money connectés</span>
              </div>
            </div>
          </div>
        )}

        {/* Ecosystem & Payment Partners Strip */}
        <div className="mt-16 pt-10 border-t border-slate-200/70 dark:border-slate-800/80">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">
            Intégré aux réseaux de paiement &amp; banques de référence en Afrique de l'Ouest
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {partnerLogos.map((partner, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-xs hover:border-brand-500/40 hover:-translate-y-0.5 transition-all"
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
