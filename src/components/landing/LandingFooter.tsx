'use client';

import React from 'react';
import Link from 'next/link';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#111113] text-gray-400 border-t border-gray-800 text-sm" data-purpose="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand Summary Column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-brand-600/30 transition-transform group-hover:scale-105">
                Ω
              </div>
              <span className="text-xl font-black text-brand-400">
                OmegaFacture
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              La facturation moderne conçue pour l’Afrique francophone. Conforme OHADA, TVA en fonction de votre pays automatique et encaissements suivis en temps réel.
            </p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-2 text-xs text-gray-300 bg-gray-800/80 px-3.5 py-1.5 rounded-full border border-gray-700">
                <span>Fait avec fierté en Afrique 🌍</span>
              </span>
            </div>
          </div>

          {/* Links Column 1: Produit */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Produit</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a className="hover:text-white transition-colors" href="#fonctionnalites">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#comment-ca-marche">
                  Modèles conformes
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#tarifs">
                  Tarifs &amp; Plans
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#fonctionnalites">
                  Suivi des encaissements
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Ressources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Ressources</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a className="hover:text-white transition-colors" href="#problemes">
                  Guide Fiscal OHADA
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#demo">
                  Modèles de Devis
                </a>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/login">
                  Espace Entreprise
                </Link>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#tarifs">
                  Modes de règlement UEMOA
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Légal & Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Légal &amp; Contact</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link className="hover:text-white transition-colors" href="/register">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/login">
                  Connexion sécurisée
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/politique-de-confidentialite">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <span className="text-gray-500">Mentions OHADA &amp; UEMOA</span>
              </li>
              <li>
                <a
                  className="hover:text-brand-300 transition-colors text-brand-400 font-medium"
                  href="mailto:contact@omegafacture.site"
                >
                  contact@omegafacture.site
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Bottom Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 OmegaFacture Technologies. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 transition-colors">Abidjan • Cotonou • Dakar • Douala</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
