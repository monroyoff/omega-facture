'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useInvoices } from '@/lib/store/invoice-context';
import { Menu, X, ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, currentUser } = useInvoices();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  const navLinks = [
    { label: 'Pourquoi changer', href: '#problemes' },
    { label: 'Fonctionnalités', href: '#fonctionnalites' },
    { label: 'Comment ça marche', href: '#comment-ca-marche' },
    { label: 'Tarifs', href: '#tarifs' },
    { label: 'Témoignages', href: '#temoignages' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAFAF9]/95 dark:bg-[#111113]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 shadow-xs'
          : 'bg-[#FAFAF9]/80 dark:bg-[#111113]/80 backdrop-blur-sm border-b border-gray-200/40 dark:border-gray-800/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center text-white font-extrabold text-xl shadow-glow-red transition-transform duration-300 group-hover:scale-105 shrink-0">
            Ω
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-extrabold tracking-tight text-brand-dark dark:text-white">Omega</span>
            <span className="text-xl font-extrabold tracking-tight text-brand-red">Facture</span>
          </div>
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-red dark:hover:text-brand-red transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-3.5">
          {isAuthenticated && currentUser ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-brand-red hover:bg-brand-redHover shadow-glow-red transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Mon Espace ({currentUser.firstName || 'Dashboard'})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-red px-3 py-2 transition-colors cursor-pointer"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-brand-red hover:bg-brand-redHover shadow-glow-red transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Commencer gratuitement
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-brand-softRed text-brand-red font-bold text-xs flex items-center gap-1"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Menu principal"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Responsive, Accessible & Smooth) */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-20 bottom-0 z-40 bg-[#FAFAF9]/98 dark:bg-[#111113]/98 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 px-6 py-6 overflow-y-auto animate-in slide-in-from-top-4 duration-200 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Navigation
            </div>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center justify-between py-3 text-base font-semibold text-gray-800 dark:text-gray-100 hover:text-brand-red border-b border-gray-100 dark:border-gray-800 transition-colors"
              >
                <span>{link.label}</span>
                <span className="text-gray-400">→</span>
              </a>
            ))}
          </div>

          <div className="pt-6 pb-8 space-y-3 border-t border-gray-200/80 dark:border-gray-800/80">
            {isAuthenticated && currentUser ? (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="w-full py-3.5 px-4 rounded-2xl bg-brand-red text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow-red"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Accéder à mon tableau de bord</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="w-full py-3.5 px-4 rounded-2xl bg-brand-red text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow-red"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Commencer gratuitement</span>
                </Link>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="w-full py-3 px-4 rounded-2xl border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-bold text-sm text-center block"
                >
                  Se connecter à mon compte
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
