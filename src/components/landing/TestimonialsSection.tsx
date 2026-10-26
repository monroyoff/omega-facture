'use client';

import React from 'react';
import { Star } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      stars: 5,
      image: '/images/professionals/cheikh-ndiaye.jpg',
      quote:
        '« Avant, je perdais 4 heures chaque fin de mois sur Excel. Avec OmegaFacture, j’émets mes factures en FCFA en 2 minutes et mes clients règlent 2 fois plus vite. »',
      name: 'Cheikh Ndiaye',
      role: 'Fondateur de Teranga Studio • Dakar, Sénégal',
    },
    {
      stars: 5,
      image: '/images/professionals/aminata-kone.jpg',
      quote:
        '« La gestion automatique de la TVA à 18% m’a sauvée lors de mon dernier contrôle fiscal. Une solution pensée exactement pour nos réalités économiques en Côte d’Ivoire. »',
      name: 'Aminata Koné',
      role: 'Directrice de K-Logistics • Abidjan, Côte d’Ivoire',
    },
    {
      stars: 5,
      image: '/images/professionals/paul-etoo.jpg',
      quote:
        '« La possibilité d’envoyer la facture directement via WhatsApp avec le récapitulatif clair et les liens a transformé la relation avec mes clients à Douala. »',
      name: 'Paul-Alain Eto’o',
      role: 'Consultant IT chez Bafoussam Tech • Cameroun',
    },
    {
      stars: 5,
      image: '/images/professionals/fatima-diop.jpg',
      quote:
        '« Grâce aux relances WhatsApp automatiques et au suivi en temps réel, nos créances en retard ont chuté de 80%. Un outil indispensable pour toute entreprise UEMOA. »',
      name: 'Fatima Diop',
      role: 'Fondatrice de Wari Creative • Cotonou, Bénin',
    },
  ];

  return (
    <section className="py-24 bg-[#FAFAF9] dark:bg-[#070a0f]" id="temoignages">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
            Ils nous font confiance
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white tracking-tight">
            Ce que les entrepreneurs disent d’<span className="text-brand-600 dark:text-brand-400">OmegaFacture</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400">
            Rejoignez plus de 2 500 indépendants, agences et PME à travers l’Afrique francophone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#111622] rounded-3xl p-6 sm:p-7 border border-gray-200/80 dark:border-gray-800 shadow-card-subtle flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg hover:border-brand-500/30 transition-all duration-300 reveal-on-scroll"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex text-amber-400 mb-4 gap-0.5">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic mb-6">
                  {t.quote}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3.5">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-brand-500/30 shadow-md shrink-0"
                />
                <div>
                  <h4 className="font-bold text-brand-dark dark:text-white text-sm">
                    {t.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {t.role}
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
