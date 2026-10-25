'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Filter,
  Eye,
  BellRing,
  CreditCard,
  Calendar,
  Building,
  User,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  FileText,
  DollarSign,
  Download,
  Smartphone,
  Landmark,
  Banknote,
  Receipt,
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/lib/types';
import { PaymentRecord, useInvoices } from '@/lib/store/invoice-context';
import { formatFCFA, formatDateFR } from '@/lib/money/format';
import { StatusBadge } from '@/components/ui/Badge';

export type ReportSectionType =
  | 'revenue'
  | 'recovery'
  | 'delay'
  | 'aging_0_30'
  | 'aging_31_60'
  | 'aging_60_plus';

interface SectionOperationsDetailProps {
  section: ReportSectionType | null;
  onClose: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onRelanceInvoice: (invoice: Invoice) => void;
  onRecordPayment: (invoiceId?: string) => void;
}

export const SectionOperationsDetail: React.FC<SectionOperationsDetailProps> = ({
  section,
  onClose,
  onViewInvoice,
  onRelanceInvoice,
  onRecordPayment,
}) => {
  const { invoices, payments } = useInvoices();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<string>('all');

  // Reset tab and search when section changes
  React.useEffect(() => {
    setSearchQuery('');
    setActiveSubTab('all');
  }, [section]);

  // Section meta information
  const sectionMeta = useMemo(() => {
    switch (section) {
      case 'revenue':
        return {
          title: "Opérations du Chiffre d'Affaires Cumulé 2026",
          subtitle:
            "Ensemble des factures émises et validées au cours de l'exercice (hors brouillons en cours d'élaboration).",
          icon: TrendingUp,
          iconBg: 'bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400',
          badgeText: 'Chiffre d’affaires',
          badgeBg: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
        };
      case 'recovery':
        return {
          title: 'Détail du Recouvrement & Encaissements',
          subtitle:
            'Suivi des flux perçus (Mobile Money, Virements, Chèques, Espèces) et solde restant à collecter.',
          icon: CheckCircle2,
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
          badgeText: 'Recouvrement',
          badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        };
      case 'delay':
        return {
          title: 'Analyse du Délai Moyen de Règlement',
          subtitle:
            "Factures réglées et délai réel constaté entre la date d'émission et la date d'encaissement effectif.",
          icon: Clock,
          iconBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
          badgeText: 'Délai moyen : 18 jours',
          badgeBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        };
      case 'aging_0_30':
        return {
          title: 'Balance Âgée : 0 à 30 jours (Créances saines)',
          subtitle:
            'Créances récentes à échéance normale, n’exigeant aucune procédure de recouvrement contentieux.',
          icon: AlertCircle,
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
          badgeText: 'Créances saines',
          badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        };
      case 'aging_31_60':
        return {
          title: 'Balance Âgée : 31 à 60 jours (À surveiller)',
          subtitle:
            'Factures émises entre 31 et 60 jours avec solde en attente. Une relance commerciale amiable est recommandée.',
          icon: AlertTriangle,
          iconBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
          badgeText: 'Relance recommandée',
          badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        };
      case 'aging_60_plus':
        return {
          title: 'Balance Âgée : + de 60 jours (Contentieux)',
          subtitle:
            'Factures en souffrance critique émises il y a plus de 60 jours. Procédure de mise en demeure formelle.',
          icon: ShieldAlert,
          iconBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400',
          badgeText: 'Contentieux / Mise en demeure',
          badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        };
      default:
        return null;
    }
  }, [section]);

  // Aging calculation based on reference date (2026-10-20)
  const getInvoiceAgeDays = (issueDate: string) => {
    const ref = new Date('2026-10-20').getTime();
    const issue = new Date(issueDate).getTime();
    return Math.max(0, Math.floor((ref - issue) / (1000 * 60 * 60 * 24)));
  };

  // Payment delay calculation for paid invoices
  const getPaymentDelay = (invoice: Invoice): { days: number; paymentDate: string; label: string; badgeColor: string } => {
    const matchingPayment = payments.find(
      (p) => p.invoiceId === invoice.id || p.invoiceNumber === invoice.number
    );
    const paymentDate = matchingPayment?.date || invoice.dueDate;
    const issueTime = new Date(invoice.issueDate).getTime();
    const payTime = new Date(paymentDate).getTime();
    const days = Math.max(1, Math.round((payTime - issueTime) / (1000 * 60 * 60 * 24)));

    if (days <= 7) {
      return { days, paymentDate, label: '⚡ Règlement rapide (≤ 7j)', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' };
    }
    if (days <= 20) {
      return { days, paymentDate, label: '✓ Conforme UEMOA (8-20j)', badgeColor: 'bg-blue-50 text-brand-700 border-brand-200 dark:bg-brand-950/40 dark:text-brand-300' };
    }
    return { days, paymentDate, label: '⏳ Règlement différé (> 20j)', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300' };
  };

  // Filtered invoices for the selected section (uniquement les factures réelles, hors devis)
  const isRealInvoice = (i: Invoice) => (!i.documentKind || i.documentKind === 'invoice') && !i.number.startsWith('DEV-');

  const sectionInvoices = useMemo(() => {
    if (!section) return [];
    const realInvoices = invoices.filter(isRealInvoice);

    switch (section) {
      case 'revenue':
        // All non-draft invoices
        return realInvoices.filter((i) => i.status !== 'draft');

      case 'delay':
        // Paid invoices with recorded payment
        return realInvoices.filter((i) => i.amountPaid > 0);

      case 'aging_0_30':
        // Unpaid or partially paid with age <= 30 days
        return realInvoices.filter((i) => {
          if (i.status === 'draft') return false;
          const remaining = i.total - i.amountPaid;
          if (remaining <= 0) return false;
          const age = getInvoiceAgeDays(i.issueDate);
          return age <= 30;
        });

      case 'aging_31_60':
        // Unpaid or partially paid with 31 <= age <= 60 days
        return realInvoices.filter((i) => {
          if (i.status === 'draft') return false;
          const remaining = i.total - i.amountPaid;
          if (remaining <= 0) return false;
          const age = getInvoiceAgeDays(i.issueDate);
          return age > 30 && age <= 60;
        });

      case 'aging_60_plus':
        // Unpaid or partially paid with age > 60 days
        return realInvoices.filter((i) => {
          if (i.status === 'draft') return false;
          const remaining = i.total - i.amountPaid;
          if (remaining <= 0) return false;
          const age = getInvoiceAgeDays(i.issueDate);
          return age > 60;
        });

      default:
        return [];
    }
  }, [section, invoices]);

  // Specific for recovery section: either payments or invoices with remaining balance
  const recoveryPayments = useMemo(() => {
    return payments;
  }, [payments]);

  const recoveryPendingInvoices = useMemo(() => {
    return invoices
      .filter(isRealInvoice)
      .filter((i) => i.status !== 'draft' && i.total - (i.amountPaid || 0) > 0);
  }, [invoices]);

  // Search filtered items
  const displayedInvoices = useMemo(() => {
    if (!searchQuery.trim()) {
      if (activeSubTab === 'all') return sectionInvoices;
      return sectionInvoices.filter((i) => i.status === activeSubTab);
    }
    const q = searchQuery.toLowerCase();
    return sectionInvoices.filter((i) => {
      const matchText = `${i.number} ${i.client.name} ${i.client.company} ${i.client.city} ${i.total}`.toLowerCase();
      const matchSearch = matchText.includes(q);
      const matchTab = activeSubTab === 'all' || i.status === activeSubTab;
      return matchSearch && matchTab;
    });
  }, [sectionInvoices, searchQuery, activeSubTab]);

  const displayedPayments = useMemo(() => {
    if (!searchQuery.trim()) {
      if (activeSubTab === 'all') return recoveryPayments;
      return recoveryPayments.filter((p) => p.method === activeSubTab);
    }
    const q = searchQuery.toLowerCase();
    return recoveryPayments.filter((p) => {
      const matchText = `${p.invoiceNumber} ${p.clientName} ${p.reference} ${p.method} ${p.amount}`.toLowerCase();
      const matchSearch = matchText.includes(q);
      const matchTab = activeSubTab === 'all' || p.method === activeSubTab;
      return matchSearch && matchTab;
    });
  }, [recoveryPayments, searchQuery, activeSubTab]);

  if (!section || !sectionMeta) return null;

  const IconComponent = sectionMeta.icon;

  // Summary figures
  const totalAmount = sectionInvoices.reduce((acc, i) => acc + i.total, 0);
  const totalPaid = sectionInvoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalRemaining = sectionInvoices.reduce(
    (acc, i) => acc + Math.max(0, i.total - i.amountPaid),
    0
  );

  return (
    <div
      id="operations-detail-panel"
      className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${sectionMeta.iconBg}`}
          >
            <IconComponent className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {sectionMeta.title}
              </h2>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${sectionMeta.badgeBg}`}
              >
                {sectionMeta.badgeText}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              {sectionMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Fermer le détail</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip for this Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            {section === 'recovery' ? 'Total Encaissé' : 'Montant Total'}
          </span>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {section === 'recovery'
              ? formatFCFA(payments.reduce((acc, p) => acc + p.amount, 0))
              : formatFCFA(totalAmount)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
            Déjà Perçu
          </span>
          <div className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
            {section === 'recovery'
              ? `${Math.round(
                  (payments.reduce((acc, p) => acc + p.amount, 0) /
                    Math.max(1, invoices.reduce((acc, i) => acc + (i.status !== 'draft' ? i.total : 0), 0))) *
                    100
                )}% du CA`
              : formatFCFA(totalPaid)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
            Reste à Recouvrer
          </span>
          <div className="text-base sm:text-lg font-bold text-amber-700 dark:text-amber-300 mt-0.5">
            {section === 'recovery'
              ? formatFCFA(
                  recoveryPendingInvoices.reduce((acc, i) => acc + (i.total - i.amountPaid), 0)
                )
              : formatFCFA(totalRemaining)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            {section === 'recovery' ? 'Transactions' : 'Factures'}
          </span>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {section === 'recovery' ? `${payments.length} reçus` : `${sectionInvoices.length} pièces`}
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par numéro, client, référence..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {section === 'recovery' ? (
            <>
              {[
                { id: 'all', label: 'Toutes les transactions' },
                { id: 'mobile_money', label: 'Mobile Money' },
                { id: 'bank_transfer', label: 'Virements' },
                { id: 'cash', label: 'Espèces' },
                { id: 'check', label: 'Chèques' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeSubTab === tab.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          ) : (
            <>
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'paid', label: 'Payées' },
                { id: 'sent', label: 'Envoyées' },
                { id: 'overdue', label: 'En retard' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeSubTab === tab.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          {section === 'recovery' ? (
            /* Table for Payment Records */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Réf</th>
                  <th className="py-3 px-4">Facture Liée</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Canal de Règlement</th>
                  <th className="py-3 px-4 text-right">Montant Encaissé</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {displayedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Aucun encaissement ne correspond à votre filtre.
                    </td>
                  </tr>
                ) : (
                  displayedPayments.map((p) => {
                    const linkedInvoice = invoices.find(
                      (i) => i.id === p.invoiceId || i.number === p.invoiceNumber
                    );
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                          <div className="font-semibold">{formatDateFR(p.date)}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {p.reference}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-brand-600 dark:text-brand-400">
                          {p.invoiceNumber}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {p.clientName}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {p.method === 'mobile_money' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                              <Smartphone className="w-3 h-3 text-amber-500" />
                              Mobile Money
                            </span>
                          )}
                          {p.method === 'bank_transfer' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900">
                              <Landmark className="w-3 h-3 text-brand-500" />
                              Virement bancaire
                            </span>
                          )}
                          {p.method === 'cash' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                              <Banknote className="w-3 h-3 text-emerald-500" />
                              Espèces
                            </span>
                          )}
                          {p.method === 'check' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                              <Receipt className="w-3 h-3 text-purple-500" />
                              Chèque
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatFCFA(p.amount)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {linkedInvoice && (
                            <button
                              type="button"
                              onClick={() => onViewInvoice(linkedInvoice)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Voir</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* Table for Invoices */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">N° Pièce</th>
                  <th className="py-3 px-4">Client & Société</th>
                  <th className="py-3 px-4">Dates</th>
                  {section === 'delay' ? (
                    <th className="py-3 px-4">Délai Constaté</th>
                  ) : (
                    <th className="py-3 px-4">Ancienneté / Échéance</th>
                  )}
                  <th className="py-3 px-4 text-right">Montant TTC</th>
                  <th className="py-3 px-4 text-right">Reste Dû</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {displayedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Aucune opération ne correspond à votre recherche.
                    </td>
                  </tr>
                ) : (
                  displayedInvoices.map((inv) => {
                    const remaining = Math.max(0, inv.total - inv.amountPaid);
                    const ageDays = getInvoiceAgeDays(inv.issueDate);
                    const delayInfo = section === 'delay' ? getPaymentDelay(inv) : null;

                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          <button
                            type="button"
                            onClick={() => onViewInvoice(inv)}
                            className="hover:text-brand-600 transition-colors cursor-pointer text-left"
                          >
                            {inv.number}
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {inv.client.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3" />
                            <span>{inv.client.company}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          <div>Émise : {formatDateFR(inv.issueDate)}</div>
                          <div className="text-[11px] text-slate-400">
                            Échéance : {formatDateFR(inv.dueDate)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {section === 'delay' && delayInfo ? (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${delayInfo.badgeColor}`}
                            >
                              {delayInfo.days} {delayInfo.days > 1 ? 'jours' : 'jour'}
                            </span>
                          ) : (
                            <div className="text-slate-600 dark:text-slate-400">
                              <span className="font-medium text-slate-900 dark:text-white">
                                {ageDays} {ageDays > 1 ? 'jours' : 'jour'}
                              </span>
                              <span className="text-[11px] text-slate-400 block">
                                depuis l’émission
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {formatFCFA(inv.total)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                          {remaining > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400">
                              {formatFCFA(remaining)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                              Soldée ✓
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={inv.status} />
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onViewInvoice(inv)}
                              title="Voir la facture"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {remaining > 0 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onRelanceInvoice(inv)}
                                  title="Envoyer une relance"
                                  className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all cursor-pointer"
                                >
                                  <BellRing className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onRecordPayment(inv.id)}
                                  title="Enregistrer un encaissement"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Summary Bar */}
        <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <span>
            Affichage de{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {section === 'recovery' ? displayedPayments.length : displayedInvoices.length}
            </strong>{' '}
            opérations sur{' '}
            {section === 'recovery' ? recoveryPayments.length : sectionInvoices.length} au total
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              Cliquez sur une facture pour afficher son aperçu certifié UEMOA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
