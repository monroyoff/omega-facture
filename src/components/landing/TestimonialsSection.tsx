'use client';

import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      stars: 5,
      image: '/images/professionals/cheikh-ndiaye.jpg',
      quote:
        '« Avant, je perdais 4 heures chaque fin de mois sur Excel. Avec OmegaFacture, j’émets mes factures en FCFA en 2 minutes et mes clients règlent 2 fois plus vite. »',
      name: 'Cheikh Ndiaye',
      company: 'Teranga Studio',
      location: 'Dakar, Sénégal',
      flag: '🇸🇳',
      sector: 'Agence Créative & Web',
    },
    {
      stars: 5,
      image: '/images/professionals/aminata-kone.jpg',
      quote:
        '« La gestion automatique de la TVA à 18% m’a sauvée lors de mon dernier contrôle fiscal. Une solution pensée exactement pour nos réalités économiques en Côte d’Ivoire. »',
      name: 'Aminata Koné',
      company: 'K-Logistics SARL',
      location: 'Abidjan, Côte d’Ivoire',
      flag: '🇨🇮',
      sector: 'Transport & Logistique',
    },
    {
      stars: 5,
      image: '/images/professionals/paul-etoo.jpg',
      quote:
        '« La possibilité d’envoyer la facture directement via WhatsApp avec le récapitulatif clair et les liens a transformé la relation avec mes clients à Douala. »',
      name: 'Paul-Alain Eto’o',
      company: 'Bafoussam Tech',
      location: 'Douala, Cameroun',
      flag: '🇨🇲',
      sector: 'Conseil & Cloud IT',
    },
    {
      stars: 5,
      image: '/images/professionals/fatima-diop.jpg',
      quote:
        '« Grâce aux relances WhatsApp automatiques et au suivi en temps réel, nos créances en retard ont chuté de 80%. Un outil indispensable pour toute entreprise UEMOA. »',
      name: 'Fatima Diop',
      company: 'Wari Creative',
      location: 'Cotonou, Bénin',
      flag: '🇧🇯',
      sector: 'Design & Marketing',
    },
  ];

  return (
    <section className="py-24 bg-[#FAFAF9] dark:bg-[#070a0f]" id="temoignages">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
            Ils nous font confiance
          </p>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Ce que les entrepreneurs disent d’<span className="text-brand-600 dark:text-brand-400">OmegaFacture</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Rejoignez plus de 2 500 indépendants, cabinets et PME à travers l’Afrique de l’Ouest et centrale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#111622] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-card-subtle flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:border-brand-500/40 transition-all duration-300 reveal-on-scroll group"
            >
              <div>
                {/* Header inside card: Stars + Sector */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full">
                    {t.flag} {t.location.split(',')[0]}
                  </span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed italic mb-6">
                  {t.quote}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3.5">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/30 shadow-md shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                      {t.name}
                    </h4>
                    <CheckCircle className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                  </div>
                  <p className="text-[11px] font-medium text-brand-600 dark:text-brand-400 truncate">
                    {t.company}
                  </p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate">
                    {t.sector}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
