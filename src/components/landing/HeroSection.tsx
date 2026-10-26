'use client';

import React from 'react';
import Link from 'next/link';
import { HeroInvoiceSimulator } from './HeroInvoiceSimulator';
import { ArrowRight, Play, Check, ShieldCheck, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const scrollToDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('demo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden" data-purpose="hero-section">
      {/* Background Decorative Glowing Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-brand-500/10 dark:bg-brand-600/10 rounded-full blur-3xl opacity-75 -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl opacity-60 -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Pill Tagline */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200/80 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-semibold tracking-wide shadow-xs">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Le logiciel de facturation n°1 en Afrique francophone</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Fini les factures bricolées sur{' '}
            <span className="relative inline-block line-through text-slate-400 dark:text-slate-500 decoration-rose-500/80 decoration-4">
              Word et Excel.
            </span>
            <br />
            <span className="text-brand-600 dark:text-brand-400">Facturez comme un pro en 2 clics.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            OmegaFacture permet aux entrepreneurs et PME en Afrique de créer des factures conformes en{' '}
            <strong className="text-slate-900 dark:text-white font-semibold">FCFA</strong> avec{' '}
            <strong className="text-slate-900 dark:text-white font-semibold">TVA 18% automatique</strong> et
            encaissement suivi en temps réel.
          </p>
        </div>

        {/* Call To Actions with Hover & Click Micro-Animations */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/register"
            className="hero-cta-button w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base cursor-pointer group bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/30"
          >
            <span>Commencer gratuitement</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <a
            href="#demo"
            onClick={scrollToDemo}
            className="secondary-cta-button w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base cursor-pointer group"
          >
            <Play className="w-4 h-4 text-brand-600 fill-brand-600 transition-transform duration-200 group-hover:scale-110" />
            <span>Voir la démo en 1 min</span>
          </a>
        </div>

        {/* Reassurance Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-12">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
            <span>Gratuit sans carte bancaire</span>
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:inline-block"></span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            <span>Conforme OHADA &amp; UEMOA</span>
          </span>
        </div>

        {/* Interactive Simulator Component */}
        <HeroInvoiceSimulator />
      </div>
    </section>
  );
};
