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
  Calendar,
  Clock,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/lib/types';
import { formatFCFA, formatDateFR, getDueDateDiffDays } from '@/lib/money/format';
import { StatusBadge } from '@/components/ui/Badge';
import { useInvoices, getCurrentMonthPeriodId } from '@/lib/store/invoice-context';
import { RelanceModal } from '@/components/invoices/RelanceModal';
import { ShareDocumentModal } from '@/components/invoices/ShareDocumentModal';
import { generateInvoicePDF } from '@/lib/pdf/invoice-pdf';
import { downloadCSV } from '@/lib/export/csv-export';

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
  const {
    invoices: allGlobalInvoices,
    periodLabel,
    selectedPeriod,
    setSelectedPeriod,
    deleteInvoice,
    convertQuoteToInvoice,
    showToast,
    currentUser,
  } = useInvoices();
  const [internalTab, setInternalTab] = useState<DashboardTableTab>('all');
  const selectedTab = activeTab !== undefined ? activeTab : internalTab;

  // Filtre de mois local pour l'onglet En attente (isolé, ne contamine jamais les autres boutons)
  const [pendingMonthFilter, setPendingMonthFilter] = useState<string>('ALL');

  const handleTabChange = (tab: DashboardTableTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
    // Dès qu'on quitte un bouton/onglet pour aller sur un autre, le filtre de mois s'annule
    // pour revenir aux données réelles du mois en cours
    setPendingMonthFilter('ALL');
    setSelectedPeriod(getCurrentMonthPeriodId());
    setSelectedIds([]);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [internalKind, setInternalKind] = useState<'all' | 'invoice' | 'quote'>('all');
  const selectedKind = activeKind !== undefined ? activeKind : internalKind;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [relanceInvoice, setRelanceInvoice] = useState<Invoice | null>(null);
  const [relanceToast, setRelanceToast] = useState<string | null>(null);

  // Modal & Toast states for delete, share, and quote conversion
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [quoteToConvert, setQuoteToConvert] = useState<Invoice | null>(null);
  const [shareInvoice, setShareInvoice] = useState<Invoice | null>(null);
  const [actionToast, setActionToast] = useState<{ title: string; message: string } | null>(null);

  const handleConfirmDelete = () => {
    if (!invoiceToDelete) return;
    const isQuote = invoiceToDelete.documentKind === 'quote' || invoiceToDelete.number.startsWith('DEV-');
    const num = invoiceToDelete.number;
    deleteInvoice(invoiceToDelete.id);
    setSelectedIds((prev) => prev.filter((id) => id !== invoiceToDelete.id));
    setInvoiceToDelete(null);
    showToast({
      title: `${isQuote ? 'Devis' : 'Facture'} supprimé(e)`,
      message: `Le document ${num} a été supprimé définitivement.`,
      kind: 'delete',
      number: num,
      duration: 4000,
    });
  };

  const handleDownloadInvoicePDF = async (inv: Invoice, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      setActionToast({
        title: 'Téléchargement PDF en cours...',
        message: `Génération haute résolution du fichier ${inv.number}.pdf...`,
      });
      const compName = inv.sellerName || currentUser?.organization || currentUser?.name || 'Mon Entreprise';
      await generateInvoicePDF({
        invoice: inv,
        companyName: compName,
        companyEmail: inv.sellerEmail || currentUser?.email || '',
        companyPhone: inv.sellerPhone || currentUser?.phone || '',
        companyAddress: inv.sellerAddress || (currentUser?.country ? `${currentUser.country}` : 'Zone UEMOA'),
        companyTaxId: inv.sellerTaxId || currentUser?.ifu || '',
        signatoryName: inv.signatoryName || compName,
        signatureImage: inv.signatureImage || currentUser?.signatureImage,
      });
      showToast({
        title: 'Document PDF officiel téléchargé !',
        message: `Le fichier officiel ${inv.number}.pdf est prêt et téléchargé sur votre appareil.`,
        kind: 'success',
        number: inv.number,
        duration: 4000,
      });
    } catch (err) {
      console.error('Erreur PDF:', err);
      window.print();
    }
  };

  const handleConfirmConvert = (targetStatus: InvoiceStatus = 'sent') => {
    if (!quoteToConvert) return;
    const oldNum = quoteToConvert.number;
    const converted = convertQuoteToInvoice(quoteToConvert.id, targetStatus);
    setQuoteToConvert(null);
    if (converted) {
      showToast({
        title: 'Devis converti en Facture Envoyée !',
        message: `Le devis ${oldNum} a été converti en Facture ${converted.number} (statut : Envoyée). Il figure désormais dans l'onglet Factures !`,
        kind: 'invoice',
        number: converted.number,
        amount: converted.total,
        duration: 4500,
      });
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
    showToast({
      title: 'Relance transmise avec succès',
      message: `Relance ${channel} effectuée pour ${inv.client.name} (${inv.number}).`,
      kind: 'info',
      number: inv.number,
      duration: 4000,
    });
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
    setPendingMonthFilter('ALL');
    setSelectedPeriod(getCurrentMonthPeriodId());
    setSelectedIds([]);
  };

  // Annuler automatiquement le filtre de mois local et vider la sélection dès que l'onglet ou le type change
  React.useEffect(() => {
    setPendingMonthFilter('ALL');
    setSelectedIds([]);
  }, [selectedTab, selectedKind]);

  // Source invoices depending on the active tab:
  // - Pour 'sent' (en attente) et 'overdue' (en retard) : source depuis allGlobalInvoices (tous les mois)
  //   pour voir l'ensemble des créances réelles sans masquer les créances des mois passés.
  // - Pour les autres onglets ('all', 'paid', 'acompte', 'draft') : source depuis `invoices` (données réelles du mois en cours).
  const sourceInvoices = useMemo(() => {
    if (selectedTab === 'sent' || selectedTab === 'overdue') {
      return allGlobalInvoices || [];
    }
    return invoices;
  }, [selectedTab, allGlobalInvoices, invoices]);

  // Documents matching current kind selection
  const scopedInvoices = useMemo(() => {
    if (selectedKind === 'quote') return sourceInvoices.filter(isQuote);
    if (selectedKind === 'invoice') return sourceInvoices.filter((i) => !isQuote(i));
    return sourceInvoices;
  }, [sourceInvoices, selectedKind]);

  // Helper to identify overdue invoices (dueDate in the past and unpaid)
  const isInvoiceOverdue = (inv: Invoice): boolean => {
    if (inv.status === 'paid' || inv.status === 'draft') return false;
    if (inv.status === 'overdue') return true;
    if (inv.dueDate) {
      const diff = getDueDateDiffDays(inv.dueDate);
      const remaining = Math.max(0, inv.total - (inv.amountPaid || 0));
      return diff < 0 && remaining > 0;
    }
    return false;
  };

  // Counts strictly calculated for the active document kind
  const counts = useMemo(() => {
    const targetAll = (allGlobalInvoices || []).filter((i) => (selectedKind === 'quote' ? isQuote(i) : !isQuote(i)));
    const targetPeriod = (invoices || []).filter((i) => (selectedKind === 'quote' ? isQuote(i) : !isQuote(i)));

    return {
      all: targetPeriod.length,
      paid: targetPeriod.filter((i) => i.status === 'paid').length,
      acompte: targetPeriod.filter((i) => i.amountPaid > 0 && i.status !== 'paid').length,
      sent: targetAll.filter((i) => (i.status === 'sent' || isInvoiceOverdue(i)) && i.status !== 'paid').length,
      overdue: targetAll.filter(isInvoiceOverdue).length,
      draft: targetPeriod.filter((i) => i.status === 'draft').length,
    };
  }, [invoices, allGlobalInvoices, selectedKind]);

  // Safety safeguard: if on quote and selectedTab is paid or acompte, reset to all
  React.useEffect(() => {
    if (selectedKind === 'quote' && (selectedTab === 'paid' || selectedTab === 'acompte')) {
      handleTabChange('all');
    }
  }, [selectedKind, selectedTab]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    const list = scopedInvoices.filter((inv) => {
      // Tab filter
      if (selectedTab === 'paid') {
        if (inv.status !== 'paid') return false;
      } else if (selectedTab === 'acompte') {
        if (!(inv.amountPaid > 0 && inv.status !== 'paid')) return false;
      } else if (selectedTab === 'overdue') {
        // Factures en retard : échéance dépassée (J+1 et plus) ou statut overdue
        if (!isInvoiceOverdue(inv)) return false;
      } else if (selectedTab === 'sent') {
        // Factures en attente : statut envoyé OU échéance dépassée non soldée
        if (inv.status !== 'sent' && !isInvoiceOverdue(inv)) return false;

        // Filtre spécifique de mois pour l'onglet En attente (strictement isolé, n'affecte aucun autre bouton)
        if (pendingMonthFilter !== 'ALL') {
          if (!inv.issueDate?.startsWith(pendingMonthFilter)) return false;
        }
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

    // Tri pour les factures en attente :
    // 1. Factures du mois en cours EN PREMIER
    // 2. Factures des mois précédents SUIVRONT
    if (selectedTab === 'sent') {
      const now = new Date();
      const curMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      return list.sort((a, b) => {
        const aIsCurrent = Boolean(a.issueDate?.startsWith(curMonthKey));
        const bIsCurrent = Boolean(b.issueDate?.startsWith(curMonthKey));

        if (aIsCurrent && !bIsCurrent) return -1;
        if (!aIsCurrent && bIsCurrent) return 1;

        return (b.issueDate || '').localeCompare(a.issueDate || '');
      });
    }

    return list;
  }, [scopedInvoices, selectedTab, searchQuery, pendingMonthFilter]);

  // Dynamic calculation of months and pending stats for pending invoices filtering
  const { allMonthsOptions, availablePendingMonths, totalPendingAllMonthsCount } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const monthNamesFull = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
    ];
    const monthNamesShort = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc',
    ];

    const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    // Collect all unique months from all global invoices
    const invoiceMonths = new Set<string>();
    (allGlobalInvoices || []).forEach((inv) => {
      if (inv.issueDate && inv.issueDate.length >= 7) {
        invoiceMonths.add(inv.issueDate.substring(0, 7));
      }
    });

    // Ensure the last 6 months of current year exist in the set
    for (let i = 0; i < 6; i++) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      invoiceMonths.add(`${y}-${m}`);
    }

    const sortedMonthKeys = Array.from(invoiceMonths).sort((a, b) => b.localeCompare(a));

    // Calculate pending stats per month
    const monthStatsMap: Record<string, { count: number; totalPending: number }> = {};
    let totalPendingAll = 0;

    (allGlobalInvoices || []).forEach((inv) => {
      const isQuoteDoc = inv.documentKind === 'quote' || inv.number.startsWith('DEV-');
      const isTarget = selectedKind === 'quote' ? isQuoteDoc : !isQuoteDoc;
      if (isTarget && (inv.status === 'sent' || isInvoiceOverdue(inv)) && inv.status !== 'paid') {
        const remaining = Math.max(0, inv.total - (inv.amountPaid || 0));
        totalPendingAll += 1;

        const mKey = inv.issueDate ? inv.issueDate.substring(0, 7) : '';
        if (mKey) {
          if (!monthStatsMap[mKey]) {
            monthStatsMap[mKey] = { count: 0, totalPending: 0 };
          }
          monthStatsMap[mKey].count += 1;
          monthStatsMap[mKey].totalPending += remaining;
        }
      }
    });

    const options = sortedMonthKeys.map((mKey) => {
      const [yr, mo] = mKey.split('-');
      const moIdx = parseInt(mo, 10) - 1;
      const moName = monthNamesFull[moIdx] || mo;
      const isCurrent = mKey === currentMonthKey;
      return {
        id: mKey,
        label: `${moName} ${yr}${isCurrent ? ' (Mois en cours)' : ''}`,
        shortLabel: `${monthNamesShort[moIdx] || mo} ${yr}`,
        count: monthStatsMap[mKey]?.count || 0,
        amount: monthStatsMap[mKey]?.totalPending || 0,
        isCurrent,
      };
    });

    // Pills for quick filter: take the top 4 recent months PLUS any month with pending count > 0 (max 7)
    const pillsList = options.filter((opt, index) => index < 4 || opt.count > 0).slice(0, 7);

    return {
      allMonthsOptions: options,
      availablePendingMonths: pillsList,
      totalPendingAllMonthsCount: totalPendingAll,
    };
  }, [allGlobalInvoices, selectedKind]);

  const pendingTotalForCurrentPeriod = useMemo(() => {
    return filteredInvoices
      .filter((inv) => {
        const isQuoteDoc = inv.documentKind === 'quote' || inv.number.startsWith('DEV-');
        const isTarget = selectedKind === 'quote' ? isQuoteDoc : !isQuoteDoc;
        return isTarget && (inv.status === 'sent' || isInvoiceOverdue(inv)) && inv.status !== 'paid';
      })
      .reduce((sum, inv) => sum + Math.max(0, inv.total - (inv.amountPaid || 0)), 0);
  }, [filteredInvoices, selectedKind]);

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

  // Calculateur automatique de somme pour les factures sélectionnées
  const selectedInvoices = useMemo(() => {
    if (selectedIds.length === 0) return [];
    const idSet = new Set(selectedIds);
    return (allGlobalInvoices || []).filter((inv) => idSet.has(inv.id));
  }, [selectedIds, allGlobalInvoices]);

  const selectedStats = useMemo(() => {
    const count = selectedInvoices.length;
    if (count === 0) {
      return {
        count: 0,
        totalTTC: 0,
        amountPaid: 0,
        remaining: 0,
        quotesCount: 0,
        invoicesCount: 0,
      };
    }

    let totalTTC = 0;
    let amountPaid = 0;
    let quotesCount = 0;
    let invoicesCount = 0;

    selectedInvoices.forEach((inv) => {
      totalTTC += Number(inv.total) || 0;
      amountPaid += Number(inv.amountPaid) || 0;
      if (inv.documentKind === 'quote' || inv.number.startsWith('DEV-')) {
        quotesCount += 1;
      } else {
        invoicesCount += 1;
      }
    });

    const remaining = Math.max(0, totalTTC - amountPaid);

    return {
      count,
      totalTTC,
      amountPaid,
      remaining,
      quotesCount,
      invoicesCount,
    };
  }, [selectedInvoices]);

  const handleExportSelectedCSV = () => {
    if (selectedInvoices.length === 0) return;
    const rows: (string | number)[][] = [
      [
        'Type_Document',
        'Numero',
        'Client',
        'Societe',
        'Date_Emission',
        'Date_Echeance',
        'Total_TTC_FCFA',
        'Montant_Paye_FCFA',
        'Solde_Restant_FCFA',
        'Statut',
      ],
      ...selectedInvoices.map((i) => {
        const k = i.documentKind === 'quote' || i.number.startsWith('DEV-') ? 'Devis' : 'Facture';
        const remaining = Math.max(0, i.total - (i.amountPaid || 0));
        const statusLabel =
          i.status === 'paid'
            ? 'Soldée'
            : i.status === 'sent'
            ? 'Envoyée'
            : i.status === 'overdue'
            ? 'En retard'
            : 'Brouillon';
        return [
          k,
          i.number,
          i.client?.name || '',
          i.client?.company || '',
          i.issueDate,
          i.dueDate,
          i.total,
          i.amountPaid || 0,
          remaining,
          statusLabel,
        ];
      }),
      // Ligne de récapitulation & somme totale
      [
        'TOTAL_SELECTION',
        `Somme de ${selectedStats.count} documents sélectionnés`,
        '',
        '',
        '',
        '',
        selectedStats.totalTTC,
        selectedStats.amountPaid,
        selectedStats.remaining,
        '',
      ],
    ];

    downloadCSV(`selection_${selectedStats.count}_factures_omega_${Date.now()}.csv`, rows);
    showToast({
      title: 'Sélection exportée en CSV',
      message: `Bordereau avec la somme de ${formatFCFA(selectedStats.totalTTC)} exporté avec succès.`,
      kind: 'info',
      duration: 3500,
    });
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
        { key: 'sent', label: 'Factures en attente', count: counts.sent },
        { key: 'overdue', label: 'En retard', count: counts.overdue },
        { key: 'draft', label: 'Brouillons', count: counts.draft },
      ];
    }

    // Tous les documents
    return [
      { key: 'all', label: 'Tous les documents', count: counts.all },
      { key: 'paid', label: 'Factures payées', count: counts.paid },
      { key: 'acompte', label: 'Acomptes reçus', count: counts.acompte },
      { key: 'sent', label: 'En attente', count: counts.sent },
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
            {/* Month Dropdown Filter */}
            <div className="relative w-full sm:w-auto">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full sm:w-auto py-2 sm:py-1.5 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                title="Filtrer les documents par mois"
              >
                <option value="ALL">📅 Tous les mois (Année complète)</option>
                {allMonthsOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    📅 {opt.label}
                  </option>
                ))}
                {selectedPeriod !== 'ALL' &&
                  !allMonthsOptions.some((o) => o.id === selectedPeriod) && (
                    <option value={selectedPeriod}>
                      📅 {periodLabel}
                    </option>
                  )}
              </select>
            </div>

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
                    <option value="sent">🟠 Factures en attente ({counts.sent})</option>
                    <option value="overdue">🔴 Factures en retard ({counts.overdue})</option>
                    <option value="draft">⚪ Brouillons ({counts.draft})</option>
                  </>
                ) : (
                  <>
                    <option value="all">Tous les documents ({counts.all})</option>
                    <option value="paid">🟢 Factures payées ({counts.paid})</option>
                    <option value="acompte">💰 Acomptes reçus ({counts.acompte})</option>
                    <option value="sent">🟠 En attente ({counts.sent})</option>
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

        {/* Dedicated Month Filter Bar for Pending Invoices / Quotes */}
        {selectedTab === 'sent' && (
          <div
            id="pending-month-filter"
            className="mt-3.5 p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/80 shadow-2xs transition-all animate-fadeIn"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Title & context */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-2xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-100 uppercase tracking-wider">
                      {selectedKind === 'quote' ? 'Devis en attente de validation' : 'Factures en attente de règlement'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200 text-[10px] font-black">
                      {filteredInvoices.length} pièce{filteredInvoices.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                    Sélectionnez un mois pour afficher les {selectedKind === 'quote' ? 'devis' : 'créances en attente'} correspondantes :
                  </p>
                </div>
              </div>

              {/* Financial remaining balance */}
              {selectedKind !== 'quote' && (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-100 shrink-0 self-start sm:self-auto">
                  <span className="text-amber-800 dark:text-amber-300 font-semibold">Solde en attente :</span>
                  <span className="text-sm font-extrabold px-2.5 py-1 rounded-xl bg-white dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700/80 text-amber-800 dark:text-amber-200 shadow-2xs">
                    {formatFCFA(pendingTotalForCurrentPeriod)}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Month Filter Pills (strictement isolées pour l'onglet En attente) */}
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar flex-wrap">
              {/* Button: Tous les mois */}
              <button
                type="button"
                onClick={() => setPendingMonthFilter('ALL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  pendingMonthFilter === 'ALL'
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30 ring-2 ring-amber-500/50 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-amber-200/90 dark:border-amber-900 hover:bg-amber-100/60'
                }`}
                title="Afficher toutes les factures en attente de tous les mois"
              >
                <span>✨ Tous les mois</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    pendingMonthFilter === 'ALL'
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                  }`}
                >
                  {totalPendingAllMonthsCount}
                </span>
              </button>

              {/* Dynamic Month Pills */}
              {availablePendingMonths.map((m) => {
                const isSelected = pendingMonthFilter === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPendingMonthFilter(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30 ring-2 ring-amber-500/50 scale-[1.02]'
                        : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-amber-200/90 dark:border-amber-900 hover:bg-amber-100/60'
                    }`}
                  >
                    <span>{m.shortLabel}</span>
                    {m.isCurrent && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold">
                        En cours
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : m.count > 0
                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {m.count}
                    </span>
                  </button>
                );
              })}

              {/* Selector for other months */}
              <div className="relative shrink-0">
                <select
                  value={pendingMonthFilter}
                  onChange={(e) => setPendingMonthFilter(e.target.value)}
                  className="text-xs font-bold py-1.5 pl-2.5 pr-6 bg-white dark:bg-slate-900/90 border border-amber-200/90 dark:border-amber-900 rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="ALL">📅 Autre mois...</option>
                  {allMonthsOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calculateur automatique de sélection (calcul en direct dès 2 factures sélectionnées) */}
      {selectedStats.count >= 2 && (
        <div className="mx-4 sm:mx-5 mb-4 p-4 rounded-2xl bg-gradient-to-r from-brand-50 via-indigo-50 to-purple-50 dark:from-brand-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-brand-200/90 dark:border-brand-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/25 shrink-0 ring-4 ring-brand-100 dark:ring-brand-950">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                  Calculateur de sélection automatique
                </span>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-600 text-white shadow-2xs">
                  {selectedStats.count} {selectedStats.quotesCount > 0 && selectedStats.invoicesCount === 0 ? 'devis sélectionnés' : 'factures sélectionnées'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Somme Totale TTC :</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatFCFA(selectedStats.totalTTC)}
                </span>
                {selectedStats.amountPaid > 0 && (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    Encaissé : {formatFCFA(selectedStats.amountPaid)}
                  </span>
                )}
                {selectedStats.remaining > 0 && selectedStats.amountPaid > 0 && (
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                    Reste à payer : {formatFCFA(selectedStats.remaining)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions rapides sur la sélection */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleExportSelectedCSV}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Télécharger un tableau CSV récapitulatif de cette sélection avec le total"
            >
              <Download className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Exporter CSV ({selectedStats.count})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 rounded-xl bg-slate-200/90 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Désélectionner toutes les factures"
            >
              <X className="w-3.5 h-3.5" />
              <span>Vider</span>
            </button>
          </div>
        </div>
      )}

      {/* Content Area: Centered Empty State vs Invoices (Mobile Cards + Desktop Table) */}
      {filteredInvoices.length === 0 ? (
        <div className="py-12 sm:py-16 px-4 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3 ring-8 ring-slate-100/50 dark:ring-slate-800/30">
            {selectedTab === 'sent' ? (
              <Clock className="w-7 h-7 text-amber-500 dark:text-amber-400" />
            ) : (
              <FileCheck2 className="w-7 h-7 text-slate-400 dark:text-slate-500" />
            )}
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {selectedTab === 'sent'
              ? selectedKind === 'quote'
                ? 'Aucun devis en attente pour cette période'
                : 'Aucune facture en attente pour cette période'
              : selectedKind === 'quote'
              ? 'Aucun devis trouvé'
              : selectedKind === 'invoice'
              ? 'Aucune facture trouvée'
              : 'Aucun document trouvé'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {selectedTab === 'sent'
              ? `Toutes les ${selectedKind === 'quote' ? 'offres de devis' : 'factures'} de ${periodLabel} ont été traitées ou sont soldées.`
              : searchQuery || selectedTab !== 'all'
              ? `Aucun ${selectedKind === 'quote' ? 'devis' : 'document'} ne correspond à votre filtre ou terme de recherche actuel.`
              : `Aucun ${selectedKind === 'quote' ? 'devis' : 'document'} enregistré pour la période sélectionnée (${periodLabel}).`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {selectedTab === 'sent' && pendingMonthFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setPendingMonthFilter('ALL')}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>✨ Voir les factures en attente de tous les mois ({totalPendingAllMonthsCount})</span>
              </button>
            )}
            {selectedTab !== 'sent' && selectedPeriod !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedPeriod('ALL')}
                className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Voir toute l'année</span>
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
          {/* Mobile Selection Action Bar */}
          <div className="md:hidden px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={filteredInvoices.length > 0 && selectedIds.length === filteredInvoices.length}
                onChange={handleSelectAll}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
              />
              <span>Tout cocher ({filteredInvoices.length})</span>
            </label>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
              >
                Désélectionner ({selectedIds.length})
              </button>
            )}
          </div>

          {/* Mobile Card List (md:hidden) */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredInvoices.map((inv) => {
              const isSelected = selectedIds.includes(inv.id);
              const isQuoteDoc = inv.documentKind === 'quote' || inv.number.startsWith('DEV-');
              const isUnpaid = !isQuoteDoc && inv.status !== 'paid' && inv.status !== 'draft';
              const diffDays = inv.dueDate ? getDueDateDiffDays(inv.dueDate) : 999;
              const shouldShowRelance = isUnpaid && diffDays <= 1;

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
                    <div className="flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>
                          Échéance : <strong className={diffDays < 0 ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>{formatDateFR(inv.dueDate)}</strong>
                        </span>
                        {isUnpaid && (
                          diffDays === 1 ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              ⏰ Demain (J-1)
                            </span>
                          ) : diffDays === 0 ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                              ⚠️ Aujourd'hui (Jour J)
                            </span>
                          ) : diffDays < 0 ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              🔴 Retard (+{Math.abs(diffDays)}j)
                            </span>
                          ) : null
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Émis le {formatDateFR(inv.issueDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {shouldShowRelance && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRelanceInvoice(inv);
                            }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold active:scale-95 transition-all shadow-2xs cursor-pointer ${
                              diffDays === 1
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : diffDays === 0
                                ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                            title={
                              diffDays === 1
                                ? 'Rappel préventif d\'échéance (J-1)'
                                : diffDays === 0
                                ? "Exigible aujourd'hui (Jour J)"
                                : `Relancer le client (+${Math.abs(diffDays)}j de retard)`
                            }
                          >
                            <BellRing className={`w-3 h-3 ${diffDays <= 0 ? 'text-rose-500 animate-pulse' : 'text-amber-600'}`} />
                            <span>{diffDays === 1 ? 'Rappel J-1' : diffDays === 0 ? 'Relance Jour J' : 'Relancer'}</span>
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
                          onClick={() => setShareInvoice(inv)}
                          className="p-1.5 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors cursor-pointer"
                          title="Partager (WhatsApp ou Email)"
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
                          onClick={(e) => handleDownloadInvoicePDF(inv, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors cursor-pointer"
                          title="Télécharger le PDF officiel (.pdf)"
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
                  const isQuoteDoc = inv.documentKind === 'quote' || inv.number.startsWith('DEV-');
                  const isUnpaid = !isQuoteDoc && inv.status !== 'paid' && inv.status !== 'draft';
                  const diffDays = inv.dueDate ? getDueDateDiffDays(inv.dueDate) : 999;
                  const shouldShowRelance = isUnpaid && diffDays <= 1;

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
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={
                              diffDays < 0
                                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                : ''
                            }
                          >
                            {formatDateFR(inv.dueDate)}
                          </span>
                          {isUnpaid && (
                            diffDays === 1 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                ⏰ Demain (J-1)
                              </span>
                            ) : diffDays === 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 dark:text-orange-400">
                                ⚠️ Aujourd'hui (Jour J)
                              </span>
                            ) : diffDays < 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                🔴 Retard (+{Math.abs(diffDays)}j)
                              </span>
                            ) : null
                          )}
                        </div>
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
                          {shouldShowRelance && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRelanceInvoice(inv);
                              }}
                              className={`xl:hidden flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-2xs transition-colors cursor-pointer ${
                                diffDays === 1
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : diffDays === 0
                                  ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              }`}
                              title={
                                diffDays === 1
                                  ? "Rappel préventif d'échéance (J-1)"
                                  : diffDays === 0
                                  ? "Exigible aujourd'hui (Jour J)"
                                  : `Relancer cette facture (+${Math.abs(diffDays)}j de retard)`
                              }
                            >
                              <BellRing className={`w-3 h-3 ${diffDays <= 0 ? 'text-rose-500 animate-pulse' : 'text-amber-600'}`} />
                              <span>{diffDays === 1 ? 'J-1' : diffDays === 0 ? 'Jour J' : 'Relancer'}</span>
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

                          {/* Bouton Relance pour les factures en attente échues ou proches (J-1, J, J+1+) */}
                          {shouldShowRelance && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRelanceInvoice(inv);
                              }}
                              className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs mr-1 active:scale-95 cursor-pointer group ${
                                diffDays === 1
                                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                                  : diffDays === 0
                                  ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40'
                                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                              }`}
                              title={
                                diffDays === 1
                                  ? "Rappel préventif d'échéance (J-1)"
                                  : diffDays === 0
                                  ? "Exigible aujourd'hui (Jour J)"
                                  : `Relancer le client pour cette facture (+${Math.abs(diffDays)}j de retard)`
                              }
                            >
                              <BellRing className={`w-3.5 h-3.5 ${diffDays <= 0 ? 'text-rose-500 animate-pulse' : 'text-amber-600'}`} />
                              <span>{diffDays === 1 ? 'Rappel J-1' : diffDays === 0 ? 'Relance Jour J' : 'Relancer'}</span>
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
                            type="button"
                            onClick={() => setShareInvoice(inv)}
                            className="p-1.5 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors cursor-pointer"
                            title="Partager (WhatsApp ou Email)"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDownloadInvoicePDF(inv, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors cursor-pointer"
                            title="Télécharger le PDF officiel (.pdf)"
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

      {/* Share Document Modal (WhatsApp or Email) */}
      <ShareDocumentModal
        isOpen={!!shareInvoice}
        invoice={shareInvoice}
        onClose={() => setShareInvoice(null)}
      />

      {/* Barre Flottante Fixe en bas de page pour le Calculateur de sélection (dès 2 factures sélectionnées) */}
      {selectedStats.count >= 2 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto max-w-2xl bg-slate-950/95 dark:bg-[#0c1017]/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6 ring-1 ring-white/10 animate-slideUp">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-600/30">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-semibold truncate">
                <span>{selectedStats.count} sélectionné{selectedStats.count > 1 ? 's' : ''}</span>
                {selectedStats.remaining > 0 && selectedStats.amountPaid > 0 && (
                  <span className="hidden sm:inline text-amber-400">• Reste dû : {formatFCFA(selectedStats.remaining)}</span>
                )}
              </div>
              <div className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                Total : <span className="text-brand-300">{formatFCFA(selectedStats.totalTTC)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportSelectedCSV}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all active:scale-95 border border-white/15 cursor-pointer"
              title="Télécharger le fichier CSV récapitulatif de cette sélection avec le total"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Désélectionner tout"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Désélectionner</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
