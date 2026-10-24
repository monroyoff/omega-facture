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
  Trash2,
  FileText,
  Send,
  CheckCircle2,
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
  activeKind?: 'all' | 'invoice' | 'quote';
  onKindChange?: (kind: 'all' | 'invoice' | 'quote') => void;
  id?: string;
}

export const RecentInvoicesTable: React.FC<RecentInvoicesTableProps> = ({
  invoices,
  onSelectInvoice,
  activeTab,
  onTabChange,
  activeKind,
  onKindChange,
  id = 'invoices-section',
}) => {
  const { periodLabel, selectedPeriod, setSelectedPeriod, deleteInvoice, convertQuoteToInvoice } = useInvoices();
  const [internalTab, setInternalTab] = useState<DashboardTableTab>('all');
  const selectedTab = activeTab !== undefined ? activeTab : internalTab;
  const handleTabChange = (tab: DashboardTableTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [internalKind, setInternalKind] = useState<'all' | 'invoice' | 'quote'>('all');
  const selectedKind = activeKind !== undefined ? activeKind : internalKind;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [relanceInvoice, setRelanceInvoice] = useState<Invoice | null>(null);
  const [relanceToast, setRelanceToast] = useState<string | null>(null);

  // Modal & Toast states for delete and quote conversion
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [quoteToConvert, setQuoteToConvert] = useState<Invoice | null>(null);
  const [actionToast, setActionToast] = useState<{ title: string; message: string } | null>(null);

  const handleConfirmDelete = () => {
    if (!invoiceToDelete) return;
    const isQuote = invoiceToDelete.documentKind === 'quote' || invoiceToDelete.number.startsWith('DEV-');
    const num = invoiceToDelete.number;
    deleteInvoice(invoiceToDelete.id);
    setSelectedIds((prev) => prev.filter((id) => id !== invoiceToDelete.id));
    setInvoiceToDelete(null);
    setActionToast({
      title: `${isQuote ? 'Devis' : 'Facture'} supprimé(e)`,
      message: `Le document ${num} a été supprimé définitivement.`,
    });
    setTimeout(() => setActionToast(null), 4000);
  };

  const handleConfirmConvert = (targetStatus: InvoiceStatus = 'sent') => {
    if (!quoteToConvert) return;
    const oldNum = quoteToConvert.number;
    const converted = convertQuoteToInvoice(quoteToConvert.id, targetStatus);
    setQuoteToConvert(null);
    if (converted) {
      setActionToast({
        title: 'Devis converti en Facture Envoyée !',
        message: `Le devis ${oldNum} a été converti en Facture ${converted.number} (statut : Envoyée). Il figure désormais dans l'onglet Factures !`,
      });
      setTimeout(() => setActionToast(null), 6000);
    }
  };

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

  // Helper to identify quotes vs invoices
  const isQuote = (i: Invoice) => i.documentKind === 'quote' || i.number.startsWith('DEV-');

  // Document kind counts
  const kindCounts = useMemo(() => {
    return {
      all: invoices.length,
      invoice: invoices.filter((i) => !isQuote(i)).length,
      quote: invoices.filter(isQuote).length,
    };
  }, [invoices]);

  // Handle switching document kind (Tous, Factures, Devis):
  // Immediately cancels/resets all active status filters (payé, envoyé, retard, brouillons)
  const handleKindChange = (kind: 'all' | 'invoice' | 'quote') => {
    setInternalKind(kind);
    onKindChange?.(kind);
    handleTabChange('all');
    setSelectedIds([]);
  };

  // Documents matching current kind selection
  const scopedInvoices = useMemo(() => {
    if (selectedKind === 'quote') return invoices.filter(isQuote);
    if (selectedKind === 'invoice') return invoices.filter((i) => !isQuote(i));
    return invoices;
  }, [invoices, selectedKind]);

  // Counts strictly calculated for the active document kind
  const counts = useMemo(() => {
    return {
      all: scopedInvoices.length,
      paid: scopedInvoices.filter((i) => i.status === 'paid').length,
      acompte: scopedInvoices.filter((i) => i.amountPaid > 0 && i.status !== 'paid').length,
      sent: scopedInvoices.filter((i) => i.status === 'sent').length,
      overdue: scopedInvoices.filter((i) => i.status === 'overdue').length,
      draft: scopedInvoices.filter((i) => i.status === 'draft').length,
    };
  }, [scopedInvoices]);

  // Safety safeguard: if on quote and selectedTab is paid or acompte, reset to all
  React.useEffect(() => {
    if (selectedKind === 'quote' && (selectedTab === 'paid' || selectedTab === 'acompte')) {
      handleTabChange('all');
    }
  }, [selectedKind, selectedTab]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return scopedInvoices.filter((inv) => {
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
  }, [scopedInvoices, selectedTab, searchQuery]);

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

  // Tabs tailored specifically to each document type (Devis vs Factures vs Tous)
  const tabs: { key: DashboardTableTab; label: string; count: number }[] = useMemo(() => {
    if (selectedKind === 'quote') {
      const qTabs: { key: DashboardTableTab; label: string; count: number }[] = [
        { key: 'all', label: 'Tous les devis', count: counts.all },
        { key: 'sent', label: 'Devis envoyés', count: counts.sent },
        { key: 'draft', label: 'Brouillons', count: counts.draft },
      ];
      if (counts.overdue > 0) {
        qTabs.push({ key: 'overdue', label: 'Validité expirée', count: counts.overdue });
      }
      return qTabs;
    }

    if (selectedKind === 'invoice') {
      return [
        { key: 'all', label: 'Toutes les factures', count: counts.all },
        { key: 'paid', label: 'Payées', count: counts.paid },
        { key: 'acompte', label: 'Acomptes reçus', count: counts.acompte },
        { key: 'sent', label: 'Factures envoyées', count: counts.sent },
        { key: 'overdue', label: 'En retard', count: counts.overdue },
        { key: 'draft', label: 'Brouillons', count: counts.draft },
      ];
    }

    // Tous les documents
    return [
      { key: 'all', label: 'Tous les documents', count: counts.all },
      { key: 'paid', label: 'Factures payées', count: counts.paid },
      { key: 'acompte', label: 'Acomptes reçus', count: counts.acompte },
      { key: 'sent', label: 'Envoyés', count: counts.sent },
      { key: 'overdue', label: 'En retard / Expirés', count: counts.overdue },
      { key: 'draft', label: 'Brouillons', count: counts.draft },
    ];
  }, [selectedKind, counts]);

  const shareOnWhatsApp = (inv: Invoice) => {
    const k =
      inv.documentKind ||
      (inv.number.startsWith('DEV-') ? 'quote' : 'invoice');
    const docLabel = k === 'quote' ? 'votre devis' : 'votre facture';
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
                {selectedKind === 'quote'
                  ? 'Devis Estimatifs'
                  : selectedKind === 'invoice'
                  ? 'Dernières Factures'
                  : 'Dernières Factures & Devis'}
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
              {selectedKind === 'quote'
                ? `Suivi et gestion de vos devis estimatifs pour ${periodLabel}`
                : selectedKind === 'invoice'
                ? `Suivi de vos factures et encaissements pour ${periodLabel}`
                : `Suivi en temps réel de vos factures et devis pour ${periodLabel}`}
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
                {selectedKind === 'quote' ? (
                  <>
                    <option value="all">Tous les devis ({counts.all})</option>
                    <option value="sent">🟠 Devis envoyés ({counts.sent})</option>
                    <option value="draft">⚪ Brouillons ({counts.draft})</option>
                    {counts.overdue > 0 && (
                      <option value="overdue">🔴 Validité expirée ({counts.overdue})</option>
                    )}
                  </>
                ) : selectedKind === 'invoice' ? (
                  <>
                    <option value="all">Toutes les factures ({counts.all})</option>
                    <option value="paid">🟢 Factures payées ({counts.paid})</option>
                    <option value="acompte">💰 Acomptes reçus ({counts.acompte})</option>
                    <option value="sent">🟠 Factures envoyées ({counts.sent})</option>
                    <option value="overdue">🔴 Factures en retard ({counts.overdue})</option>
                    <option value="draft">⚪ Brouillons ({counts.draft})</option>
                  </>
                ) : (
                  <>
                    <option value="all">Tous les documents ({counts.all})</option>
                    <option value="paid">🟢 Factures payées ({counts.paid})</option>
                    <option value="acompte">💰 Acomptes reçus ({counts.acompte})</option>
                    <option value="sent">🟠 Documents envoyés ({counts.sent})</option>
                    <option value="overdue">🔴 En retard / Expirés ({counts.overdue})</option>
                    <option value="draft">⚪ Brouillons ({counts.draft})</option>
                  </>
                )}
              </select>
            </div>

            <div className="relative flex-1 w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  selectedKind === 'quote'
                    ? 'N° devis, client, société...'
                    : selectedKind === 'invoice'
                    ? 'N° facture, client, société...'
                    : 'N° facture/devis, client...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 sm:py-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            
            {(selectedTab !== 'all' || selectedKind !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  handleKindChange('all');
                  setSearchQuery('');
                }}
                className="px-2.5 py-1.5 sm:py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-colors text-center shrink-0 cursor-pointer"
              >
                ✕ Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Document Kind Tabs (Tous, Factures, Devis) */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 no-scrollbar border-t border-slate-100 dark:border-slate-800/80 pt-3 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Type :
          </span>
          {[
            { key: 'all', label: 'Tous', count: kindCounts.all, color: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' },
            { key: 'invoice', label: '📄 Factures', count: kindCounts.invoice, color: 'bg-brand-600 text-white' },
            { key: 'quote', label: '📝 Devis', count: kindCounts.quote, color: 'bg-purple-600 text-white' },
          ].map((item) => {
            const isSelected = selectedKind === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleKindChange(item.key as any)}
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
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar flex-wrap">
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
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
            {selectedKind === 'quote'
              ? 'Aucun devis trouvé'
              : selectedKind === 'invoice'
              ? 'Aucune facture trouvée'
              : 'Aucun document trouvé'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {searchQuery || selectedTab !== 'all'
              ? `Aucun ${selectedKind === 'quote' ? 'devis' : 'document'} ne correspond à votre filtre ou terme de recherche actuel.`
              : `Aucun ${selectedKind === 'quote' ? 'devis' : 'document'} enregistré pour la période sélectionnée (${periodLabel}).`}
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
                          (inv.number.startsWith('DEV-') ? 'quote' : 'invoice');
                        return (
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase shrink-0 ${
                              k === 'quote'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200'
                                : 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200'
                            }`}
                          >
                            {k === 'quote' ? 'Devis' : 'Facture'}
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
                  <div className="pt-2.5 border-t border-slate-100/80 dark:border-slate-800/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Échéance : <strong className={inv.status === 'overdue' ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>{formatDateFR(inv.dueDate)}</strong>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Émis le {formatDateFR(inv.issueDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {inv.status === 'overdue' && (
                          <button
                            type="button"
                            onClick={() => setRelanceInvoice(inv)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold active:scale-95 transition-all shadow-2xs cursor-pointer"
                          >
                            <BellRing className="w-3 h-3 text-rose-500 animate-pulse" />
                            <span>Relancer</span>
                          </button>
                        )}
                        {(inv.status === 'draft' || inv.documentKind === 'quote' || inv.number.startsWith('DEV-')) && (
                          <Link
                            href={`/invoices/${inv.id}/edit`}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold active:scale-95 transition-all shadow-2xs cursor-pointer"
                            title={inv.documentKind === 'quote' || inv.number.startsWith('DEV-') ? 'Modifier le devis' : 'Modifier le brouillon'}
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Modifier</span>
                          </Link>
                        )}
                        {(inv.documentKind === 'quote' || inv.number.startsWith('DEV-')) && (
                          <button
                            type="button"
                            onClick={() => setQuoteToConvert(inv)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold active:scale-95 transition-all shadow-2xs cursor-pointer"
                            title="Convertir ce devis en Facture émise (statut Envoyée)"
                          >
                            <Send className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Facturer</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">
                        <button
                          type="button"
                          onClick={() => shareOnWhatsApp(inv)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                          title="Partager sur WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectInvoice?.(inv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Aperçu"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoiceToDelete(inv)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title={`Supprimer ce ${inv.documentKind === 'quote' || inv.number.startsWith('DEV-') ? 'devis' : 'facture'}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Imprimer / PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                              (inv.number.startsWith('DEV-') ? 'quote' : 'invoice');
                            return (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                                  k === 'quote'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200'
                                    : 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200'
                                }`}
                              >
                                {k === 'quote' ? 'Devis' : 'Facture'}
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
                          {(inv.status === 'draft' || inv.documentKind === 'quote' || inv.number.startsWith('DEV-')) && (
                            <Link
                              href={`/invoices/${inv.id}/edit`}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs mr-1"
                              title={inv.documentKind === 'quote' || inv.number.startsWith('DEV-') ? 'Modifier le devis' : 'Modifier le brouillon'}
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

                          {(inv.documentKind === 'quote' || inv.number.startsWith('DEV-')) && (
                            <button
                              type="button"
                              onClick={() => setQuoteToConvert(inv)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all shadow-2xs mr-1 active:scale-95 cursor-pointer"
                              title="Convertir ce devis en Facture émise (statut Envoyée)"
                            >
                              <Send className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Facturer</span>
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
                          <button
                            type="button"
                            onClick={() => setInvoiceToDelete(inv)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title={`Supprimer ${inv.documentKind === 'quote' || inv.number.startsWith('DEV-') ? 'le devis' : 'la facture'}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
          Affichage de <strong className="text-slate-700 dark:text-slate-300">1 à {filteredInvoices.length}</strong> sur <strong className="text-slate-700 dark:text-slate-300">{invoices.length}</strong> {selectedKind === 'quote' ? 'devis' : selectedKind === 'invoice' ? 'factures' : 'documents'}
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

      {/* Delete Confirmation Modal */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#111622] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Supprimer {invoiceToDelete.documentKind === 'quote' || invoiceToDelete.number.startsWith('DEV-') ? 'le Devis' : 'la Facture'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Document N° {invoiceToDelete.number}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement ce document pour{' '}
              <strong>{invoiceToDelete.client.company || invoiceToDelete.client.name}</strong> d'un montant de{' '}
              <strong>{formatFCFA(invoiceToDelete.total)}</strong> ? Cette action est irréversible.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmer la suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Quote to Invoice Modal */}
      {quoteToConvert && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#111622] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Convertir le Devis en Facture
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Devis N° {quoteToConvert.number}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Ce devis pour <strong>{quoteToConvert.client.company || quoteToConvert.client.name}</strong> d'un montant de{' '}
              <strong>{formatFCFA(quoteToConvert.total)}</strong> va être transformé en <strong>Facture officielle</strong> avec attribution automatique d'un numéro séquentiel <code>FAC-2026-XXXX</code> et statut <strong>« Facture envoyée »</strong>.
            </p>
            <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-950/40 p-2.5 rounded-xl border border-brand-200/60 dark:border-brand-800/60">
              💡 Le document sortira automatiquement de la liste des Devis pour intégrer la liste officielle de vos Factures.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setQuoteToConvert(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleConfirmConvert('sent')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Convertir en Facture Envoyée</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Toast Feedback */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-[130] max-w-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">{actionToast.title}</div>
            <div className="text-slate-300 dark:text-slate-600 mt-0.5 leading-relaxed">{actionToast.message}</div>
          </div>
          <button
            type="button"
            onClick={() => setActionToast(null)}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 p-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
