'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ArrowLeftRight,
  BarChart3,
  HelpCircle,
  Settings,
  Moon,
  Sun,
  Search,
  X,
  ChevronsUpDown,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Check,
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserSessionModal } from '@/components/layout/UserSessionModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePath?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activePath = '/dashboard',
}) => {
  const [isDark, setIsDark] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [authToast, setAuthToast] = useState<string | null>(null);

  const { currentUser, isAuthenticated, login, logout, invoices } = useInvoices();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const pendingCount = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length;

  // Global keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    // Check initial dark mode preference
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    setAuthToast('Vous avez été déconnecté avec succès. Vous êtes désormais en mode invité.');
    setTimeout(() => setAuthToast(null), 3500);
  };

  const navItems = [
    { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Factures & Devis', href: '/invoices', icon: FileText, count: pendingCount > 0 ? pendingCount : undefined },
    { label: 'Clients & Contacts', href: '/clients', icon: Users },
    { label: 'Produits & Services', href: '/products', icon: Package },
    { label: 'Paiements & Flux', href: '/payments', icon: ArrowLeftRight },
    { label: 'Rapports financiers & KPI', href: '/reports', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[65] bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-[70] w-72 bg-white dark:bg-[#0c1017] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header Brand matching screenshot */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-brand-600/25 transition-transform group-hover:scale-105">
                Ω
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-900 dark:text-white tracking-tight text-sm uppercase">
                  OMEGA <span className="text-brand-600 dark:text-brand-400">FACTURE</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Zone UEMOA • FCFA
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 active:text-slate-900 hover:bg-slate-100 active:bg-slate-200 dark:hover:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 lg:hidden cursor-pointer touch-manipulation transition-all active:scale-95 shrink-0"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>
          </div>

          {/* Quick Search Bar */}
          <div className="px-4 pt-4 pb-2">
            <button
              type="button"
              onClick={() => {
                setSearchModalOpen(true);
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full relative flex items-center justify-between px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs group cursor-pointer text-left"
              title="Recherche globale dans toute l'application (⌘K)"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-colors" />
                <span className="font-medium">Recherche globale...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Main Navigation */}
          <div className="px-3 py-2 flex-1">
            <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Menu Principal
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.href || (item.href === '/dashboard' && activePath === '/');
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-slate-700/60'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.count && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section: Help, Settings, Dark Mode, Profile */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          {/* Help & Support */}
          <Link
            href="/support"
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Aide & Support</span>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Paramètres</span>
          </Link>

          {/* Dark Mode Toggle Switch (from screenshot) */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="w-4 h-4 text-brand-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>Mode Sombre</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDark ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={isDark}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isDark ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* User Profile Card (Interactive Auth Switcher) */}
          <div className="pt-2 relative" ref={profileMenuRef}>
            {/* Popover Dropdown (when connected and clicked) */}
            {profileMenuOpen && isAuthenticated && currentUser && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-[#111622] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                {/* User info header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900/40 border border-slate-200 dark:border-slate-700 shrink-0">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate text-left flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.2 mt-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Connecté ({currentUser.role})
                    </span>
                  </div>
                </div>

                {/* Company Organization */}
                <div className="px-2 py-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                  <div className="font-semibold text-slate-700 dark:text-slate-200">
                    {currentUser.organization}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    IFU 1201837492811 • Cotonou, Bénin
                  </div>
                </div>

                {/* Quick links */}
                <div className="space-y-1">
                  <Link
                    href="/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Gérer mon profil & entreprise</span>
                  </Link>

                  <Link
                    href="/support"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Assistance technique</span>
                  </Link>
                </div>

                {/* Log out button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-98 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Se déconnecter</span>
                    </div>
                    <span className="text-[10px] text-rose-400 dark:text-rose-500 font-normal">Quitter</span>
                  </button>
                </div>
              </div>
            )}

            {/* Profile Card Trigger */}
            {isAuthenticated && currentUser ? (
              <div
                onClick={() => setSessionModalOpen(true)}
                className="flex items-center justify-between p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group active:scale-98"
                title="Cliquer pour afficher ma photo, mon prénom et mes informations de session"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900/40 border border-slate-200 dark:border-slate-700 shrink-0">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate text-left">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-600 transition-colors">
                      {currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <ChevronsUpDown
                  className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-brand-600 transition-colors"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50/60 dark:bg-brand-950/30 hover:bg-brand-100/70 dark:hover:bg-brand-900/40 transition-colors cursor-pointer group active:scale-98"
                  title="Cliquer pour vous connecter à votre compte"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <LogIn className="w-4 h-4" />
                    </div>
                    <div className="truncate text-left">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                        <span>Se connecter</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        Accéder à votre espace
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-600 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('register');
                    setAuthModalOpen(true);
                  }}
                  className="w-full py-1.5 px-2 rounded-xl text-center text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  Nouveau ? Créer un compte →
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Global Auth Modal (Login / Register / Forgot Password) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={(msg) => {
          setAuthToast(msg);
          setTimeout(() => setAuthToast(null), 4000);
        }}
      />

      {/* Centered Toast Dialog */}
      {authToast && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#111622] rounded-3xl p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Information de session
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs leading-relaxed">
              {authToast}
            </p>
            <button
              type="button"
              onClick={() => setAuthToast(null)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              D'accord
            </button>
          </div>
        </div>
      )}

      {/* Global Search Modal / Command Palette (⌘K) */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* User Session Modal */}
      <UserSessionModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
      />
    </>
  );
};
