'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  FileText,
  Users,
  Package,
  CreditCard,
  LayoutDashboard,
  BarChart3,
  Settings,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Smartphone,
  Landmark,
  Banknote,
  CornerDownLeft,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import { formatFCFA } from '@/lib/money/format';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

type SearchCategory = 'all' | 'invoices' | 'clients' | 'products' | 'payments' | 'navigation';

interface SearchResultItem {
  id: string;
  category: 'invoice' | 'client' | 'product' | 'payment' | 'navigation';
  title: string;
  subtitle: string;
  meta?: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  };
  icon: React.ElementType;
  href: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const router = useRouter();
  const { invoices, clients, products, payments } = useInvoices();
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Sync initial query when opened
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Handle global Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Static navigation routes
  const navigationItems: SearchResultItem[] = [
    {
      id: 'nav-dashboard',
      category: 'navigation',
      title: 'Tableau de bord',
      subtitle: 'Vue d’ensemble des indicateurs de performance & métriques clés',
      meta: '/dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'nav-new-invoice',
      category: 'navigation',
      title: 'Créer une Nouvelle Facture',
      subtitle: 'Émettre une facture normalisée UEMOA / Acompte',
      meta: '/invoices/new?kind=invoice',
      badge: { text: 'Facture', variant: 'info' },
      icon: Plus,
      href: '/invoices/new?kind=invoice',
    },
    {
      id: 'nav-new-quote',
      category: 'navigation',
      title: 'Créer un Nouveau Devis',
      subtitle: 'Établir une proposition commerciale chiffrée avec validité',
      meta: '/invoices/new?kind=quote',
      badge: { text: 'Devis', variant: 'warning' },
      icon: Plus,
      href: '/invoices/new?kind=quote',
    },
    {
      id: 'nav-new-proforma',
      category: 'navigation',
      title: 'Créer une Facture Proforma',
      subtitle: 'Émettre une proforma pour formalités bancaires ou de dédouanement',
      meta: '/invoices/new?kind=proforma',
      badge: { text: 'Proforma', variant: 'neutral' },
      icon: Plus,
      href: '/invoices/new?kind=proforma',
    },
    {
      id: 'nav-invoices',
      category: 'navigation',
      title: 'Factures, Devis & Proformas',
      subtitle: 'Gérer vos factures d’avoir, devis estimatifs et proformas',
      meta: '/invoices',
      icon: FileText,
      href: '/invoices',
    },
    {
      id: 'nav-clients',
      category: 'navigation',
      title: 'Clients & Entreprises',
      subtitle: 'Répertoire des entreprises, IFU et contacts clients',
      meta: '/clients',
      icon: Users,
      href: '/clients',
    },
    {
      id: 'nav-products',
      category: 'navigation',
      title: 'Catalogue Produits & Services',
      subtitle: 'Articles, prestations, taux de TVA et unités de vente',
      meta: '/products',
      icon: Package,
      href: '/products',
    },
    {
      id: 'nav-payments',
      category: 'navigation',
      title: 'Paiements & Encaissements',
      subtitle: 'Historique des règlements Mobile Money, virements et espèces',
      meta: '/payments',
      icon: CreditCard,
      href: '/payments',
    },
    {
      id: 'nav-reports',
      category: 'navigation',
      title: 'Rapports financiers & KPI',
      subtitle: 'Statistiques avancées de chiffre d’affaires, trésorerie et créances',
      meta: '/reports',
      badge: { text: 'Analytics', variant: 'success' },
      icon: BarChart3,
      href: '/reports',
    },
    {
      id: 'nav-settings',
      category: 'navigation',
      title: 'Paramètres & Configuration',
      subtitle: 'Informations de l’entreprise, TVA 18%, coordonnées bancaires & logo',
      meta: '/settings',
      icon: Settings,
      href: '/settings',
    },
  ];

  // Dynamic search computation
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items: SearchResultItem[] = [];

    // 1. FACTURES, DEVIS & PROFORMAS
    if (activeCategory === 'all' || activeCategory === 'invoices') {
      invoices.forEach((inv) => {
        const k =
          inv.documentKind ||
          (inv.number.startsWith('DEV-')
            ? 'quote'
            : inv.number.startsWith('PRO-')
            ? 'proforma'
            : 'invoice');
        const kindLabel = k === 'quote' ? 'Devis' : k === 'proforma' ? 'Proforma' : 'Facture';

        const statusMap: Record<string, { text: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
          paid: { text: 'Payée', variant: 'success' },
          sent: { text: 'Envoyée', variant: 'warning' },
          overdue: { text: 'En retard', variant: 'danger' },
          draft: { text: 'Brouillon', variant: 'neutral' },
        };
        const badge = statusMap[inv.status] || { text: inv.status, variant: 'neutral' };

        const matches =
          !q ||
          inv.number.toLowerCase().includes(q) ||
          kindLabel.toLowerCase().includes(q) ||
          inv.client.name.toLowerCase().includes(q) ||
          inv.client.company.toLowerCase().includes(q) ||
          inv.total.toString().includes(q) ||
          badge.text.toLowerCase().includes(q);

        if (matches) {
          items.push({
            id: `inv-${inv.id}`,
            category: 'invoice',
            title: `[${kindLabel}] ${inv.number} — ${inv.client.company || inv.client.name}`,
            subtitle: `Émis le ${inv.issueDate} • Échéance : ${inv.dueDate}`,
            meta: formatFCFA(inv.total),
            badge,
            icon: FileText,
            href: `/invoices?search=${encodeURIComponent(inv.number)}`,
          });
        }
      });
    }

    // 2. CLIENTS
    if (activeCategory === 'all' || activeCategory === 'clients') {
      clients.forEach((c) => {
        const matches =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.city && c.city.toLowerCase().includes(q));

        if (matches) {
          items.push({
            id: `cli-${c.id}`,
            category: 'client',
            title: c.company || c.name,
            subtitle: `Contact : ${c.name} • ${c.phone || c.email}`,
            meta: c.city ? `${c.city}, ${c.country}` : c.country,
            icon: Users,
            href: `/clients?search=${encodeURIComponent(c.company || c.name)}`,
          });
        }
      });
    }

    // 3. PRODUITS & SERVICES
    if (activeCategory === 'all' || activeCategory === 'products') {
      products.forEach((prod) => {
        const matches =
          !q ||
          prod.name.toLowerCase().includes(q) ||
          prod.cat.toLowerCase().includes(q) ||
          prod.unit.toLowerCase().includes(q) ||
          prod.price.toString().includes(q);

        if (matches) {
          items.push({
            id: `prod-${prod.id}`,
            category: 'product',
            title: prod.name,
            subtitle: `Catégorie : ${prod.cat} • Unité : ${prod.unit}`,
            meta: formatFCFA(prod.price),
            badge: { text: `TVA ${prod.vat}%`, variant: 'neutral' },
            icon: Package,
            href: `/products?search=${encodeURIComponent(prod.name)}`,
          });
        }
      });
    }

    // 4. PAIEMENTS
    if (activeCategory === 'all' || activeCategory === 'payments') {
      payments.forEach((pay) => {
        const methodIcons: Record<string, { label: string; icon: React.ElementType }> = {
          mobile_money: { label: 'Mobile Money', icon: Smartphone },
          bank_transfer: { label: 'Virement', icon: Landmark },
          cash: { label: 'Espèces', icon: Banknote },
          check: { label: 'Chèque', icon: CreditCard },
        };
        const methodInfo = methodIcons[pay.method] || { label: pay.method, icon: CreditCard };

        const matches =
          !q ||
          pay.reference.toLowerCase().includes(q) ||
          pay.invoiceNumber.toLowerCase().includes(q) ||
          pay.clientName.toLowerCase().includes(q) ||
          methodInfo.label.toLowerCase().includes(q) ||
          pay.amount.toString().includes(q);

        if (matches) {
          items.push({
            id: `pay-${pay.id}`,
            category: 'payment',
            title: `Règlement ${pay.reference} (${pay.invoiceNumber})`,
            subtitle: `${pay.clientName} • ${pay.date}`,
            meta: formatFCFA(pay.amount),
            badge: { text: methodInfo.label, variant: 'success' },
            icon: methodInfo.icon,
            href: `/payments?search=${encodeURIComponent(pay.reference)}`,
          });
        }
      });
    }

    // 5. NAVIGATION & PAGES
    if (activeCategory === 'all' || activeCategory === 'navigation') {
      navigationItems.forEach((nav) => {
        const matches =
          !q ||
          nav.title.toLowerCase().includes(q) ||
          nav.subtitle.toLowerCase().includes(q) ||
          (nav.meta && nav.meta.toLowerCase().includes(q));

        if (matches) {
          items.push(nav);
        }
      });
    }

    return items;
  }, [query, activeCategory, invoices, clients, products, payments]);

  // Keep selected index in bound
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = results[selectedIndex];
      if (target) handleSelect(target);
    }
  };

  const getBadgeClasses = (variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral') => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'danger':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'info':
        return 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'invoice':
        return 'Facture';
      case 'client':
        return 'Client';
      case 'product':
        return 'Produit / Service';
      case 'payment':
        return 'Paiement';
      case 'navigation':
        return 'Raccourci';
      default:
        return category;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-14 sm:pt-20 px-3 pb-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#0c1017] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une facture, un client, un produit, un paiement..."
            className="flex-1 text-sm sm:text-base font-medium bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Échap
          </kbd>
        </div>

        {/* Filter Categories Pills */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: 'Tout' },
            { id: 'invoices', label: `Factures (${invoices.length})` },
            { id: 'clients', label: `Clients (${clients.length})` },
            { id: 'products', label: `Produits (${products.length})` },
            { id: 'payments', label: `Paiements (${payments.length})` },
            { id: 'navigation', label: 'Navigation' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as SearchCategory)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
          {results.length > 0 ? (
            results.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/50 shadow-2xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-brand-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isSelected
                              ? 'text-brand-700 dark:text-brand-300'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
                          {getCategoryLabel(item.category)}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeClasses(
                              item.badge.variant
                            )}`}
                          >
                            {item.badge.text}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right Meta / Action */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {item.meta && (
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        {item.meta}
                      </span>
                    )}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300'
                          : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Aucun résultat pour « {query} »
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Vérifiez l’orthographe ou essayez un numéro de facture (ex: FAC-2026-0042), un nom de client (Fadila, MTN) ou une commande de menu.
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↑↓
              </kbd>
              Naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                ↵
              </kbd>
              Ouvrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                Échap
              </kbd>
              Fermer
            </span>
          </div>

          <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{results.length} résultat{results.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
