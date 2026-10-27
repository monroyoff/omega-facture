'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useInvoices } from '@/lib/store/invoice-context';
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Calculator,
  CreditCard,
  Star,
  FileText,
  Zap,
  LogIn,
  UserPlus,
  PlayCircle,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, currentUser } = useInvoices();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermeture du menu déroulant desktop au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Raccourci Échap pour fermer les menus déroulants
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Verrouillage du scroll arrière-plan sur mobile lors de l'ouverture
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [mobileMenuOpen]);

  // Fermeture lors du redimensionnement de la fenêtre vers desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Défilement fluide avec décalage de l'en-tête fixe
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 90;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
      setDropdownOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    {
      label: 'Pourquoi changer',
      href: '#problemes',
      icon: AlertCircle,
      desc: 'Pertes évitées & gains immédiats',
      tag: 'Comparatif',
    },
    {
      label: 'En images',
      href: '#visite',
      icon: ImageIcon,
      desc: 'Les 4 piliers du logiciel en direct',
      tag: 'Visite guidée',
    },
    {
      label: 'Fonctionnalités',
      href: '#fonctionnalites',
      icon: Zap,
      desc: 'TVA UEMOA, Factures, WhatsApp',
      tag: 'Outils',
    },
    {
      label: 'Comment ça marche',
      href: '#comment-ca-marche',
      icon: PlayCircle,
      desc: 'Prise en main en 3 étapes simples',
      tag: 'Processus',
    },
    {
      label: 'Tarifs & Forfaits',
      href: '#tarifs',
      icon: CreditCard,
      desc: 'Gratuit à vie ou Pro à 5 000 FCFA',
      tag: 'Tarifs',
    },
    {
      label: 'Témoignages',
      href: '#temoignages',
      icon: Star,
      desc: 'Avis vérifiés de dirigeants UEMOA',
      tag: '4.9/5',
    },
  ];

  const toolsLinks = [
    {
      label: 'Aperçu 3D & Simulateurs',
      href: '#demo',
      icon: FileText,
      desc: 'Testez en direct vos montants et la TVA',
      tag: 'Interactif',
    },
    {
      label: 'Calculateur de Rentabilité ROI',
      href: '#calculateur-roi',
      icon: Calculator,
      desc: 'Estimez vos heures et liquidités gagnées',
      tag: 'Économies',
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#F8F9FA]/95 dark:bg-[#070a0f]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm'
          : 'bg-[#F8F9FA]/85 dark:bg-[#070a0f]/85 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-800/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-600/30 transition-transform duration-300 group-hover:scale-105 shrink-0">
            Ω
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-brand-600 dark:text-brand-400">
              OmegaFacture
            </span>
            <span className="text-[10px] text-slate-400 font-semibold -mt-1 hidden sm:inline">
              Zone UEMOA • FCFA
            </span>
          </div>
        </Link>

        {/* Desktop Direct Links */}
        <nav className="hidden xl:flex items-center gap-6">
          {navLinks.slice(0, 5).map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-xs lg:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop & Tablet Actions & Dropdown Menu */}
        <div className="hidden lg:flex items-center gap-3">
          {/* BOUTON MENU DÉROULANT SUR WEB (DESKTOP) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 bg-white dark:bg-[#111622] hover:bg-brand-50/80 dark:hover:bg-brand-950/60 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer group"
              aria-expanded={dropdownOpen}
              title="Ouvrir le menu déroulant de navigation"
            >
              <div className="w-5 h-5 rounded-lg bg-brand-50 dark:bg-brand-950/80 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Menu className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              </div>
              <span>Menu déroulant</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-brand-600' : ''
                }`}
              />
            </button>

            {/* Volet Flottant Déroulant Desktop */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-xs"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2.5 w-[390px] bg-white dark:bg-[#111622] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-black text-xs">
                        Ω
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Menu OMEGA FACTURE
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold">
                      Zone UEMOA
                    </span>
                  </div>

                  {/* Section Navigation */}
                  <div className="space-y-1 mb-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Sections Principales
                    </div>
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={(e) => handleNavClick(e, link.href)}
                          className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">{link.label}</span>
                              <span className="text-[10px] text-slate-400">{link.desc}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 group-hover:text-brand-600">
                            →
                          </span>
                        </a>
                      );
                    })}
                  </div>

                  {/* Section Simulateurs & Outils */}
                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 mb-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Simulateurs & Outils Interactifs
                    </div>
                    {toolsLinks.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <a
                          key={tool.href}
                          href={tool.href}
                          onClick={(e) => handleNavClick(e, tool.href)}
                          className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-brand-50/70 dark:hover:bg-brand-950/40 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">{tool.label}</span>
                              <span className="text-[10px] text-slate-400">{tool.desc}</span>
                            </div>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold shrink-0">
                            {tool.tag}
                          </span>
                        </a>
                      );
                    })}
                  </div>

                  {/* CTA Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    {isAuthenticated && currentUser ? (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-600/25 transition-all"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Accéder à mon tableau de bord</span>
                      </Link>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/login"
                          onClick={() => setDropdownOpen(false)}
                          className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          Se connecter
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setDropdownOpen(false)}
                          className="py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-center text-xs font-bold text-white shadow-xs transition-colors"
                        >
                          S&apos;inscrire
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Direct CTA Buttons */}
          {isAuthenticated && currentUser ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Mon Espace ({currentUser.firstName || 'Dashboard'})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 transition-colors cursor-pointer"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Commencer gratuitement
              </Link>
            </>
          )}
        </div>

        {/* BOUTON MENU DÉROULANT SUR MOBILE & TABLETTE (< lg) */}
        <div className="flex lg:hidden items-center gap-2">
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 font-bold text-xs flex items-center gap-1"
              title="Tableau de bord"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-extrabold text-slate-800 dark:text-slate-100 bg-white dark:bg-[#111622] hover:bg-brand-50 dark:hover:bg-brand-950/60 border border-slate-200/90 dark:border-slate-800 shadow-xs transition-all active:scale-95 cursor-pointer touch-manipulation"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu déroulant'}
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-rose-500" />
            ) : (
              <Menu className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            )}
            <span>Menu</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                mobileMenuOpen ? 'rotate-180 text-brand-600' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* VOLET MOBILE DÉROULANT RESPONSIVE AVEC BACKDROP */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop semi-transparent avec fermeture au clic */}
          <div
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Conteneur Déroulant Mobile */}
          <div className="fixed inset-x-3 top-20 z-50 max-h-[calc(100dvh-5.5rem)] bg-white dark:bg-[#0c1017] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-5 overflow-y-auto animate-in slide-in-from-top-4 duration-200 flex flex-col justify-between lg:hidden">
            <div>
              {/* En-tête du volet mobile */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    Ω
                  </div>
                  <span className="font-black text-sm text-brand-600 dark:text-brand-400 tracking-tight">
                    OmegaFacture
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Liens de navigation */}
              <div className="space-y-1 mb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Navigation
                </div>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-2xl text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-brand-600 dark:hover:text-brand-400 transition-colors active:scale-[0.99] touch-manipulation"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold">{link.label}</span>
                          <span className="text-[10px] text-slate-400">{link.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    </a>
                  );
                })}
              </div>

              {/* Outils & Simulateurs */}
              <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800 mb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Outils & Démonstrations
                </div>
                {toolsLinks.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <a
                      key={tool.href}
                      href={tool.href}
                      onClick={(e) => handleNavClick(e, tool.href)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 text-slate-800 dark:text-slate-100 hover:text-brand-600 transition-colors active:scale-[0.99] touch-manipulation mb-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/60 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold">{tool.label}</span>
                          <span className="text-[10px] text-slate-400">{tool.desc}</span>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold shrink-0">
                        {tool.tag}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Boutons d'Action Mobile */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              {isAuthenticated && currentUser ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-600/25 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Accéder à mon tableau de bord</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-600/25 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Commencer gratuitement</span>
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm text-center block hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Se connecter à mon compte
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
