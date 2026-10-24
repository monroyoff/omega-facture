'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Pencil,
  MoreVertical,
  ArrowUpDown,
  FileCheck2,
  BellRing,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/lib/types';
import { formatFCFA, formatDateFR } from '@/lib/money/format';
import { StatusBadge } from '@/components/ui/Badge';
import { useInvoices } from '@/lib/store/invoice-context';
import { RelanceModal } from '@/components/invoices/RelanceModal';

export type DashboardTableTab = 'all' | 'paid' | 'acompte' | 'sent' | 'overdue' | 'draft';

export interface RecentInvoicesTableProps {
  invoices: Invoice[];
  onSelectInvoice?: (invoice: Invoice) => void;
  activeTab?: DashboardTableTab;
  onTabChange?: (tab: DashboardTableTab) => void;
  id?: string;
}

export const RecentInvoicesTable: React.FC<RecentInvoicesTableProps> = ({
  invoices,
  onSelectInvoice,
  activeTab,
  onTabChange,
  id = 'invoices-section',
}) => {
  const { periodLabel, selectedPeriod, setSelectedPeriod } = useInvoices();
  const [internalTab, setInternalTab] = useState<DashboardTableTab>('all');
  const selectedTab = activeTab !== undefined ? activeTab : internalTab;
  const handleTabChange = (tab: DashboardTableTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKind, setSelectedKind] = useState<'all' | 'invoice' | 'quote' | 'proforma'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [relanceInvoice, setRelanceInvoice] = useState<Invoice | null>(null);
  const [relanceToast, setRelanceToast] = useState<string | null>(null);

  // If navigated from global search with a query param, pre-fill search and switch to ALL
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('search');
      if (s) {
        setSearchQuery(s);
        setSelectedPeriod('ALL');
      }
    }
  }, [setSelectedPeriod]);

  const handleRelanceSent = (inv: Invoice, channel: string) => {
    setRelanceToast(`Relance ${channel} transmise pour ${inv.client.name} (${inv.number})`);
    setTimeout(() => setRelanceToast(null), 4000);
  };

  // Document kind counts
  const kindCounts = useMemo(() => {
    return {
      all: invoices.length,
      invoice: invoices.filter(
        (i) => (!i.documentKind || i.documentKind === 'invoice') && !i.number.startsWith('DEV-') && !i.number.startsWith('PRO-')
      ).length,
      quote: invoices.filter(
        (i) => i.documentKind === 'quote' || i.number.startsWith('DEV-')
      ).length,
      proforma: invoices.filter(
        (i) => i.documentKind === 'proforma' || i.number.startsWith('PRO-')
      ).length,
    };
  }, [invoices]);

  // Count per status & acomptes
  const counts = useMemo(() => {
    return {
      all: invoices.length,
      paid: invoices.filter((i) => i.status === 'paid').length,
      acompte: invoices.filter((i) => i.amountPaid > 0 && i.status !== 'paid').length,
      sent: invoices.filter((i) => i.status === 'sent').length,
      overdue: invoices.filter((i) => i.status === 'overdue').length,
      draft: invoices.filter((i) => i.status === 'draft').length,
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Document Kind filter
      const k =
        inv.documentKind ||
        (inv.number.startsWith('DEV-')
          ? 'quote'
          : inv.number.startsWith('PRO-')
          ? 'proforma'
          : 'invoice');
      if (selectedKind !== 'all' && k !== selectedKind) return false;

      // Tab filter
      if (selectedTab === 'paid') {
        if (inv.status !== 'paid') return false;
      } else if (selectedTab === 'acompte') {
        if (!(inv.amountPaid > 0 && inv.status !== 'paid')) return false;
      } else if (selectedTab !== 'all') {
        if (inv.status !== selectedTab) return false;
      }

      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchNumber = inv.number.toLowerCase().includes(q);
        const matchClient = inv.client.name.toLowerCase().includes(q);
        const matchCompany = inv.client.company.toLowerCase().includes(q);
        if (!matchNumber && !matchClient && !matchCompany) return false;
      }

      return true;
    });
  }, [invoices, selectedTab, selectedKind, searchQuery]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredInvoices.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const tabs: { key: DashboardTableTab; label: string; count: number }[] = [
    { key: 'all', label: 'Toutes', count: counts.all },
    { key: 'paid', label: 'Payées', count: counts.paid },
    { key: 'acompte', label: 'Acomptes reçus', count: counts.acompte },
    { key: 'sent', label: 'Envoyées', count: counts.sent },
    { key: 'overdue', label: 'En retard', count: counts.overdue },
    { key: 'draft', label: 'Brouillons', count: counts.draft },
  ];

  const shareOnWhatsApp = (inv: Invoice) => {
    const k =
      inv.documentKind ||
      (inv.number.startsWith('DEV-')
        ? 'quote'
        : inv.number.startsWith('PRO-')
        ? 'proforma'
        : 'invoice');
    const docLabel =
      k === 'quote'
        ? 'votre devis'
        : k === 'proforma'
        ? 'votre facture proforma'
        : 'votre facture';
    const message = `Bonjour ${inv.client.name}, voici ${docLabel} ${inv.number} d'un montant de ${formatFCFA(inv.total)} émis(e) par OMEGA FACTURE. Merci de votre confiance !`;
    const cleanPhone = inv.client.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div id={id} className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden scroll-mt-6">
      {/* Header & Tabs */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Dernières Factures & Devis
              </h2>
              <span className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60 truncate max-w-[200px]">
                📅 {periodLabel}
              </span>
              <span className="text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {filteredInvoices.length} affiché{filteredInvoices.length > 1 ? 's' : ''}
              </span>
              {selectedPeriod !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('ALL')}
                  className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  (Voir toute l'année)
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Suivi en temps réel de vos factures, devis et proformas pour {periodLabel}
            </p>
          </div>

          {/* Search & Filter tools */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
            {/* Status Dropdown Filter */}
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedTab}
                onChange={(e) => handleTabChange(e.target.value as any)}
                className="w-full sm:w-auto py-2 sm:py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="all">Tous les statuts ({counts.all})</option>
                <option value="paid">🟢 Factures payées ({counts.paid})</option>
                <option value="acompte">💰 Acomptes reçus ({counts.acompte})</option>
                <option value="sent">🟠 Factures envoyées ({counts.sent})</option>
                <option value="overdue">🔴 Factures en retard ({counts.overdue})</option>
                <option value="draft">⚪ Brouillons ({counts.draft})</option>
              </select>
            </div>

            <div className="relative flex-1 w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="N° facture, client, société..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 sm:py-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            
            {(selectedTab !== 'all' || selectedKind !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  handleTabChange('all');
                  setSelectedKind('all');
                  setSearchQuery('');
                }}
                className="px-2.5 py-1.5 sm:py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-colors text-center shrink-0 cursor-pointer"
              >
                ✕ Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Document Kind Tabs (Tous, Factures, Devis, Proformas) */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 no-scrollbar border-t border-slate-100 dark:border-slate-800/80 pt-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Type :
          </span>
          {[
            { key: 'all', label: 'Tous', count: kindCounts.all, color: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' },
            { key: 'invoice', label: '📄 Factures', count: kindCounts.invoice, color: 'bg-brand-600 text-white' },
            { key: 'quote', label: '📝 Devis', count: kindCounts.quote, color: 'bg-purple-600 text-white' },
            { key: 'proforma', label: '📑 Proformas', count: kindCounts.proforma, color: 'bg-sky-600 text-white' },
          ].map((item) => {
            const isSelected = selectedKind === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedKind(item.key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? `${item.color} shadow-sm scale-100`
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-black/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Tabs with Acomptes reçus */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.key;
            
            const activeColor = {
              all: 'bg-brand-600 text-white shadow-brand-500/25',
              paid: 'bg-emerald-600 text-white shadow-emerald-500/20',
              acompte: 'bg-teal-600 text-white shadow-teal-500/20',
              sent: 'bg-amber-600 text-white shadow-amber-500/20',
              overdue: 'bg-rose-600 text-white shadow-rose-500/20',
              draft: 'bg-slate-700 text-white shadow-slate-500/20',
            }[tab.key];

            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
                  isActive
                    ? `${activeColor} shadow-md`
                    : 'bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area: Centered Empty State vs Invoices (Mobile Cards + Desktop Table) */}
      {filteredInvoices.length === 0 ? (
        <div className="py-12 sm:py-16 px-4 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3 ring-8 ring-slate-100/50 dark:ring-slate-800/30">
            <FileCheck2 className="w-7 h-7 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Aucune facture trouvée
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {searchQuery || selectedTab !== 'all'
              ? 'Aucune facture ne correspond à votre filtre ou terme de recherche actuel.'
              : `Aucune facture enregistrée pour la période sélectionnée (${periodLabel}).`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {selectedPeriod !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedPeriod('ALL')}
                className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Voir toute l'année 2026</span>
              </button>
            )}
            {(searchQuery || selectedTab !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  handleTabChange('all');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Card List (md:hidden) */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredInvoices.map((inv) => {
              const isSelected = selectedIds.includes(inv.id);
              return (
                <div
                  key={inv.id}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('button, input, a, select')) return;
                    onSelectInvoice?.(inv);
                  }}
                  className={`p-4 transition-colors cursor-pointer space-y-3 ${
                    isSelected ? 'bg-brand-50/40 dark:bg-brand-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {/* Top row: Checkbox, Number, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(inv.id)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4 shrink-0"
                      />
                      {(() => {
                        const k =
                          inv.documentKind ||
                          (inv.number.startsWith('DEV-')
                            ? 'quote'
                            : inv.number.startsWith('PRO-')
                            ? 'proforma'
                            : 'invoice');
                        return (
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase shrink-0 ${
                              k === 'quote'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200'
                                : k === 'proforma'
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200'
                                : 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200'
                            }`}
                          >
                            {k === 'quote' ? 'Devis' : k === 'proforma' ? 'Proforma' : 'Facture'}
                          </span>
                        );
                      })()}
                      <button
                        onClick={() => onSelectInvoice?.(inv)}
                        className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 hover:underline truncate"
                      >
                        {inv.number}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                      <StatusBadge status={inv.status} />
                      {inv.amountPaid > 0 && inv.status !== 'paid' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {Math.round((inv.amountPaid / inv.total) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Client info & Amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                        {inv.client.avatar ? (
                          <img
                            src={inv.client.avatar}
                            alt={inv.client.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {inv.client.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                          {inv.client.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {inv.client.company}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {formatFCFA(inv.total)}
                      </div>
                      {inv.amountPaid > 0 && inv.amountPaid < inv.total && (
                        <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                          Payé : {formatFCFA(inv.amountPaid)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates & Quick Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 dark:border-slate-800/60 text-xs">
                    <div className="text-[11px] text-slate-400">
                      Échéance : <span className={inv.status === 'overdue' ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-300'}>{formatDateFR(inv.dueDate)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {inv.status === 'overdue' && (
                        <button
                          type="button"
                          onClick={() => setRelanceInvoice(inv)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold"
                        >
                          <BellRing className="w-3 h-3 text-rose-500 animate-pulse" />
                          <span>Relancer</span>
                        </button>
                      )}
                      {inv.status === 'draft' && (
                        <Link
                          href={`/invoices/${inv.id}/edit`}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Modifier</span>
                        </Link>
                      )}
                      <button
                        onClick={() => shareOnWhatsApp(inv)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        title="Partager sur WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSelectInvoice?.(inv)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Aperçu"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Imprimer / PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 pl-5 pr-2 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        filteredInvoices.length > 0 &&
                        selectedIds.length === filteredInvoices.length
                      }
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                    />
                  </th>
                  <th className="py-3.5 px-3">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                      <span>Facture</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Client</th>
                  <th className="py-3.5 px-3">Émission</th>
                  <th className="py-3.5 px-3">Échéance</th>
                  <th className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                      <span>Total TTC</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 pr-5 pl-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredInvoices.map((inv) => {
                  const isSelected = selectedIds.includes(inv.id);
                  return (
                    <tr
                      key={inv.id}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('button, input, a, select')) return;
                        onSelectInvoice?.(inv);
                      }}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-5 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(inv.id)}
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                        />
                      </td>

                      {/* Invoice Number */}
                      <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const k =
                              inv.documentKind ||
                              (inv.number.startsWith('DEV-')
                                ? 'quote'
                                : inv.number.startsWith('PRO-')
                                ? 'proforma'
                                : 'invoice');
                            return (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                                  k === 'quote'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200'
                                    : k === 'proforma'
                                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200'
                                    : 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200'
                                }`}
                              >
                                {k === 'quote' ? 'Devis' : k === 'proforma' ? 'Proforma' : 'Facture'}
                              </span>
                            );
                          })()}
                          <button
                            onClick={() => onSelectInvoice?.(inv)}
                            className="hover:text-brand-600 hover:underline flex items-center gap-1.5"
                          >
                            {inv.number}
                          </button>
                        </div>
                      </td>

                      {/* Client Information */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                            {inv.client.avatar ? (
                              <img
                                src={inv.client.avatar}
                                alt={inv.client.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {inv.client.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="truncate max-w-[160px] sm:max-w-xs">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {inv.client.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {inv.client.company}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDateFR(inv.issueDate)}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <span
                          className={
                            inv.status === 'overdue'
                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                              : ''
                          }
                        >
                          {formatDateFR(inv.dueDate)}
                        </span>
                      </td>

                      {/* Total Amount & Acomptes in FCFA */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatFCFA(inv.total)}
                        </div>
                        {inv.amountPaid > 0 && inv.amountPaid < inv.total && (
                          <>
                            <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                              Acompte : {formatFCFA(inv.amountPaid)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Reste : {formatFCFA(inv.total - inv.amountPaid)}
                            </div>
                          </>
                        )}
                        {inv.amountPaid >= inv.total && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Soldée (100%)
                          </div>
                        )}
                      </td>

                      {/* Status Badge & Acompte Tag */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <StatusBadge status={inv.status} />
                          {inv.amountPaid > 0 && inv.status !== 'paid' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-2xs">
                              Acompte {Math.round((inv.amountPaid / inv.total) * 100)}%
                            </span>
                          )}
                          {inv.status === 'overdue' && (
                            <button
                              type="button"
                              onClick={() => setRelanceInvoice(inv)}
                              className="xl:hidden flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold shadow-2xs hover:bg-rose-100 transition-colors"
                              title="Relancer cette facture en retard"
                            >
                              <BellRing className="w-3 h-3 text-rose-500 animate-pulse" />
                              <span>Relancer</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions Menu */}
                      <td className="py-3.5 pr-5 pl-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {inv.status === 'draft' && (
                            <Link
                              href={`/invoices/${inv.id}/edit`}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs mr-1"
                              title="Modifier le brouillon"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Modifier</span>
                            </Link>
                          )}

                          {/* Bouton Relance pour les factures en retard */}
                          {inv.status === 'overdue' && (
                            <button
                              type="button"
                              onClick={() => setRelanceInvoice(inv)}
                              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold transition-all shadow-2xs mr-1 active:scale-95 cursor-pointer group"
                              title="Relancer le client pour cette facture en retard"
                            >
                              <BellRing className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                              <span>Relancer</span>
                            </button>
                          )}

                          <button
                            onClick={() => onSelectInvoice?.(inv)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Aperçu du document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => shareOnWhatsApp(inv)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Partager sur WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Imprimer / PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer Pagination */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <span className="text-center sm:text-left">
          Affichage de <strong className="text-slate-700 dark:text-slate-300">1 à {filteredInvoices.length}</strong> sur <strong className="text-slate-700 dark:text-slate-300">{invoices.length}</strong> factures
        </span>

        <div className="flex items-center gap-1.5">
          <button
            disabled
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 disabled:opacity-50 text-xs font-medium"
          >
            Précédent
          </button>
          <button className="px-2.5 py-1 rounded-lg bg-brand-600 text-white text-xs font-bold shadow-xs">
            1
          </button>
          <button
            disabled
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 disabled:opacity-50 text-xs font-medium"
          >
            Suivant
          </button>
        </div>
      </div>

      {/* Relance Modal */}
      <RelanceModal
        invoice={relanceInvoice}
        isOpen={!!relanceInvoice}
        onClose={() => setRelanceInvoice(null)}
        onRelanceSent={handleRelanceSent}
      />

      {/* Centered Confirmation Notification if relance sent */}
      {relanceToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#111622] rounded-3xl p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setRelanceToast(null)}
              className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 active:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 transition-all active:scale-95 cursor-pointer touch-manipulation"
              title="Fermer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Relance transmise avec succès
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs leading-relaxed">
              {relanceToast}
            </p>
            <button
              type="button"
              onClick={() => setRelanceToast(null)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              D'accord
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
