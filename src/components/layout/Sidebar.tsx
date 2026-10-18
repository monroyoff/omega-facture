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
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';

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
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('jobovog@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [authToast, setAuthToast] = useState<string | null>(null);

  const { currentUser, isAuthenticated, login, logout, invoices } = useInvoices();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const pendingCount = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length;

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

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    login(loginEmail, 'MONROY Business');
    setLoginModalOpen(false);
    setProfileMenuOpen(false);
    setAuthToast(`Connexion réussie ! Bienvenue MONROY Business (${loginEmail}).`);
    setTimeout(() => setAuthToast(null), 3500);
  };

  const navItems = [
    { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Factures & Devis', href: '/invoices', icon: FileText, count: pendingCount > 0 ? pendingCount : undefined },
    { label: 'Clients & Contacts', href: '/clients', icon: Users },
    { label: 'Produits & Services', href: '/products', icon: Package },
    { label: 'Paiements & Flux', href: '/payments', icon: ArrowLeftRight },
    { label: 'Rapports & KPI', href: '/reports', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-[#0c1017] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header Brand matching screenshot */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-slate-950 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 font-black text-sm shadow-sm transition-transform group-hover:scale-105">
                Ω
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-900 dark:text-white tracking-tight text-sm uppercase">
                  OMEGA FACTURE
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Zone UEMOA • FCFA
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search Bar */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
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
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center justify-between p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group active:scale-98"
                title="Gérer la session ou se déconnecter"
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
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-600 transition-colors">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <ChevronsUpDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    profileMenuOpen ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </div>
            ) : (
              <div
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center justify-between p-2 rounded-2xl border border-amber-300/80 dark:border-amber-700/80 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 transition-colors cursor-pointer group active:scale-98"
                title="Cliquer pour vous connecter à votre compte"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div className="truncate text-left">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                      <span>Se connecter</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-200/70 dark:bg-amber-800 text-amber-800 dark:text-amber-200 font-semibold">
                        Déconnecté
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Cliquez pour vous identifier
                    </div>
                  </div>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-amber-600 shrink-0" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Login Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#111622] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 stroke-[2]" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Connexion à OMEGA FACTURE
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Accédez à votre espace entreprise et synchronisez vos factures en toute sécurité.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Adresse Email Professionnelle
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ex: contact@entreprise.bj"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Mot de Passe
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter à mon compte</span>
                </button>
              </div>
            </form>

            {/* Quick 1-click login button for ease of use */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-2">
                Ou connexion de démonstration :
              </span>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('jobovog@gmail.com');
                  login('jobovog@gmail.com', 'MONROY Business');
                  setLoginModalOpen(false);
                  setAuthToast('Connexion réussie ! Bienvenue MONROY Business.');
                  setTimeout(() => setAuthToast(null), 3500);
                }}
                className="w-full py-2 px-3 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/60 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-semibold hover:bg-brand-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Connexion rapide (MONROY Business)</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
};
