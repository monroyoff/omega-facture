'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FinalCTASection: React.FC = () => {
  return (
    <section className="py-20 bg-brand-dark text-white relative overflow-hidden" data-purpose="final-call-to-action">
      {/* Ambient Glow Behind CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600 rounded-full blur-[140px] opacity-25 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-6">
          Rejoins les milliers d’entrepreneurs qui{' '}
          <span className="text-brand-400">facturent comme des pros.</span>
        </h2>
        <p className="text-gray-300 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Prêt à dire adieu aux retards de paiement et aux tracas administratifs ? Commencez gratuitement aujourd’hui sans engagement.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="hero-cta-button w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full font-bold text-base cursor-pointer group"
          >
            <span>Commencer gratuitement</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-5">
          Pas de carte bancaire requise • Configuration en 2 minutes
        </p>
      </div>
    </section>
  );
};
