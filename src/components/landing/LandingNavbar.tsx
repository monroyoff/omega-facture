'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useInvoices } from '@/lib/store/invoice-context';
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  ChevronRight,
  Calculator,
  CreditCard,
  Star,
  FileText,
  Zap,
  PlayCircle,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, currentUser } = useInvoices();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Gestion du défilement lors de l'ouverture du menu mobile
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Fermeture automatique lors du redimensionnement vers desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        document.body.style.overflow = '';
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation fluide instantanée et infaillible vers chaque section
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);

      // Fermer le menu mobile s'il était ouvert et débloquer le scroll
      setMobileMenuOpen(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }

      // Défiler de manière fluide vers la section ciblée
      const targetElement = document.getElementById(targetId) || document.querySelector(href);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', href);
        }
      } else {
        if (typeof window !== 'undefined') {
          window.location.hash = href;
        }
      }
    }
  };

  const navLinks = [
    {
      label: 'Pourquoi changer',
      href: '#problemes',
      icon: AlertCircle,
      desc: 'Pertes évitées & gains immédiats',
    },
    {
      label: 'En images',
      href: '#visite',
      icon: ImageIcon,
      desc: 'Les 4 piliers du logiciel en direct',
    },
    {
      label: 'Fonctionnalités',
      href: '#fonctionnalites',
      icon: Zap,
      desc: 'TVA UEMOA, Factures, WhatsApp',
    },
    {
      label: 'Comment ça marche',
      href: '#comment-ca-marche',
      icon: PlayCircle,
      desc: 'Prise en main en 3 étapes simples',
    },
    {
      label: 'Tarifs',
      href: '#tarifs',
      icon: CreditCard,
      desc: 'Gratuit à vie ou Pro à 5 000 FCFA',
    },
    {
      label: 'Témoignages',
      href: '#temoignages',
      icon: Star,
      desc: 'Avis vérifiés de dirigeants UEMOA',
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
    <>
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

          {/* Desktop Navigation Links — Épuré & SANS aucun menu déroulant sur desktop */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-xs lg:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Direct CTA Buttons */}
          <div className="hidden md:flex items-center gap-3" suppressHydrationWarning>
            {mounted && isAuthenticated && currentUser ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Mon Espace ({currentUser.firstName || 'Dashboard'})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : mounted ? (
              <>
                <Link
                  href="/login"
                  className="text-xs lg:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 transition-colors cursor-pointer"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-4 py-2 lg:px-5 lg:py-2.5 rounded-2xl text-xs lg:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  Commencer gratuitement
                </Link>
              </>
            ) : (
              <div className="w-32 h-9" />
            )}
          </div>

          {/* BOUTON MENU HAMBURGER MOBILE UNIQUEMENT (< md) */}
          <div className="flex md:hidden items-center gap-2" suppressHydrationWarning>
            {mounted && isAuthenticated && (
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
              className="p-2.5 rounded-xl text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer touch-manipulation active:scale-95"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-800 dark:text-slate-100" />
              ) : (
                <Menu className="w-6 h-6 text-slate-800 dark:text-slate-100" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* VOLET MOBILE DÉROULANT RESPONSIVE AVEC BACKDROP (z-[70]) */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop semi-transparent avec fermeture immédiate au toucher */}
          <div
            className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => {
              setMobileMenuOpen(false);
              document.body.style.overflow = '';
            }}
            aria-hidden="true"
          />

          {/* Tiroir / Conteneur Déroulant Mobile */}
          <div className="fixed inset-x-3 top-22 z-[70] max-h-[calc(100dvh-6rem)] bg-white dark:bg-[#0c1017] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 overflow-y-auto animate-in slide-in-from-top-4 duration-200 flex flex-col justify-between">
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
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = '';
                  }}
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
                      className="flex items-center justify-between py-2.5 px-3 rounded-2xl text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-brand-600 dark:hover:text-brand-400 transition-colors active:scale-[0.99] touch-manipulation cursor-pointer"
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
                      className="flex items-center justify-between py-2.5 px-3 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 text-slate-800 dark:text-slate-100 hover:text-brand-600 transition-colors active:scale-[0.99] touch-manipulation mb-1 cursor-pointer"
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
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5" suppressHydrationWarning>
              {mounted && isAuthenticated && currentUser ? (
                <Link
                  href="/dashboard"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = '';
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-600/25 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Accéder à mon tableau de bord</span>
                </Link>
              ) : mounted ? (
                <>
                  <Link
                    href="/register"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      document.body.style.overflow = '';
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-600/25 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Commencer gratuitement</span>
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      document.body.style.overflow = '';
                    }}
                    className="w-full py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm text-center block hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Se connecter à mon compte
                  </Link>
                </>
              ) : (
                <div className="w-full h-11" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
