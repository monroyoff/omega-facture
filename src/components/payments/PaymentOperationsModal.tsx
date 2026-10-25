'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Search,
  CheckCircle2,
  Calendar,
  Smartphone,
  Landmark,
  Banknote,
  CreditCard,
  Eye,
  FileText,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Plus,
  Menu,
  ChevronDown,
  LayoutDashboard,
  Users,
  Package,
  ArrowLeftRight,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useInvoices, PaymentRecord } from '@/lib/store/invoice-context';
import { Invoice } from '@/lib/types';
import { formatFCFA, formatDateFR } from '@/lib/money/format';

interface PaymentOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethod?: 'all' | 'mobile_money' | 'bank_transfer' | 'cash' | 'check';
  categoryTitle?: string;
  onSelectInvoice?: (invoice: Invoice) => void;
  onNewPayment?: () => void;
}

export const PaymentOperationsModal: React.FC<PaymentOperationsModalProps> = ({
  isOpen,
  onClose,
  initialMethod = 'all',
  categoryTitle = 'Total Encaissé',
  onSelectInvoice,
  onNewPayment,
}) => {
  const router = useRouter();
  const { periodPayments, invoices, periodLabel } = useInvoices();
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'all' | 'mobile_money' | 'bank_transfer' | 'cash' | 'check'>(initialMethod);

  // Synchronize initialMethod when modal opens
  React.useEffect(() => {
    setSelectedMethod(initialMethod);
    setSearchQuery('');
  }, [initialMethod, isOpen]);

  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (navMenuOpen) {
          setNavMenuOpen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, navMenuOpen, onClose]);

  if (!isOpen) return null;

  // Active payments in the selected period
  const allPeriodPayments = periodPayments;

  // Totals
  const totalAmount = allPeriodPayments.reduce((acc, p) => acc + p.amount, 0);
  const mmAmount = allPeriodPayments.filter((p) => p.method === 'mobile_money').reduce((acc, p) => acc + p.amount, 0);
  const bankAmount = allPeriodPayments.filter((p) => p.method === 'bank_transfer').reduce((acc, p) => acc + p.amount, 0);
  const cashAmount = allPeriodPayments.filter((p) => p.method === 'cash').reduce((acc, p) => acc + p.amount, 0);

  // Filtered payments
  const filteredPayments = allPeriodPayments
    .filter((p) => {
      if (selectedMethod !== 'all' && p.method !== selectedMethod) return false;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.clientName.toLowerCase().includes(q) ||
        p.invoiceNumber.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentFilteredTotal = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'mobile_money':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80">
            <Smartphone className="w-3 h-3" />
            Mobile Money
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80">
            <Landmark className="w-3 h-3" />
            Virement
          </span>
        );
      case 'check':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80">
            <CreditCard className="w-3 h-3" />
            Chèque
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80">
            <Banknote className="w-3 h-3" />
            Espèces
          </span>
        );
    }
  };

  const handleInvoiceClick = (invoiceNumber: string) => {
    const inv = invoices.find(
      (i) => i.number.toLowerCase() === invoiceNumber.toLowerCase() || i.id === invoiceNumber
    );
    if (inv && onSelectInvoice) {
      onSelectInvoice(inv);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-[#111622] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with Navigation Menu in Top-Left */}
        <div className="p-3 sm:p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5 sm:gap-4 bg-slate-50/70 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Quick Navigation Dropdown (Always accessible in top-left) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setNavMenuOpen(!navMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
                title="Menu Principal - Navigation OMEGA"
              >
                <Menu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold hidden min-[380px]:inline">Menu</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${navMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {navMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNavMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-2 w-64 max-w-[calc(100vw-32px)] bg-white dark:bg-[#111622] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                      <span>Navigation OMEGA</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">Accès Direct</span>
                    </div>

                    <div className="space-y-0.5">
                      {[
                        { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
                        { label: 'Factures & Devis', href: '/invoices', icon: FileText },
                        { label: 'Clients & Contacts', href: '/clients', icon: Users },
                        { label: 'Produits & Services', href: '/products', icon: Package },
                        { label: 'Paiements & Flux', href: '/payments', icon: ArrowLeftRight },
                        { label: 'Rapports financiers & KPI', href: '/reports', icon: BarChart3 },
                        { label: 'Paramètres Organisation', href: '/settings', icon: Settings },
                      ].map((m) => {
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.label}
                            type="button"
                            onClick={() => {
                              setNavMenuOpen(false);
                              onClose();
                              router.push(m.href);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left font-medium"
                          >
                            <Icon className="w-4 h-4 text-slate-400" />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      {onNewPayment && (
                        <button
                          type="button"
                          onClick={() => {
                            setNavMenuOpen(false);
                            onClose();
                            onNewPayment();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 transition-colors cursor-pointer text-left text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Enregistrer un Paiement</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setNavMenuOpen(false);
                          onClose();
                          router.push('/dashboard?create=invoice');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold hover:bg-brand-100 transition-colors cursor-pointer text-left text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Nouvelle Facture</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Title & Badge */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                  <Calendar className="w-3 h-3" />
                  <span>{periodLabel}</span>
                </span>
                <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                  {categoryTitle}
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate mt-0.5">
                Détail des règlements et factures associées
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="min-w-[38px] min-h-[38px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 active:bg-slate-200 dark:hover:text-slate-200 dark:active:bg-slate-800 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer touch-manipulation z-20"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Quick KPI summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 p-2.5 sm:p-4 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 shrink-0 text-xs">
          <div
            onClick={() => setSelectedMethod('all')}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer border min-w-0 ${
              selectedMethod === 'all'
                ? 'bg-white dark:bg-[#111622] border-emerald-500 shadow-sm'
                : 'bg-white/60 dark:bg-[#111622]/60 border-transparent hover:bg-white'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Total Période</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block truncate">
              {formatFCFA(totalAmount)}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block truncate">
              {allPeriodPayments.length} opération(s)
            </span>
          </div>

          <div
            onClick={() => setSelectedMethod('mobile_money')}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer border min-w-0 ${
              selectedMethod === 'mobile_money'
                ? 'bg-white dark:bg-[#111622] border-amber-500 shadow-sm'
                : 'bg-white/60 dark:bg-[#111622]/60 border-transparent hover:bg-white'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Mobile Money</span>
            <span className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400 block truncate">
              {formatFCFA(mmAmount)}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">MTN, Moov, Wave</span>
          </div>

          <div
            onClick={() => setSelectedMethod('bank_transfer')}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer border min-w-0 ${
              selectedMethod === 'bank_transfer'
                ? 'bg-white dark:bg-[#111622] border-brand-500 shadow-sm'
                : 'bg-white/60 dark:bg-[#111622]/60 border-transparent hover:bg-white'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Virements</span>
            <span className="text-xs sm:text-sm font-extrabold text-brand-600 dark:text-brand-400 block truncate">
              {formatFCFA(bankAmount)}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Banques UEMOA</span>
          </div>

          <div
            onClick={() => setSelectedMethod('cash')}
            className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer border min-w-0 ${
              selectedMethod === 'cash'
                ? 'bg-white dark:bg-[#111622] border-emerald-500 shadow-sm'
                : 'bg-white/60 dark:bg-[#111622]/60 border-transparent hover:bg-white'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Espèces</span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block truncate">
              {formatFCFA(cashAmount)}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Règlements directs</span>
          </div>
        </div>

        {/* Filters and search row */}
        <div className="p-2.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          {/* Method tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar min-w-0">
            {[
              { key: 'all', label: 'Toutes les opérations' },
              { key: 'mobile_money', label: 'Mobile Money' },
              { key: 'bank_transfer', label: 'Virement' },
              { key: 'cash', label: 'Espèces' },
              { key: 'check', label: 'Chèque' },
            ].map((tab) => {
              const active = selectedMethod === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedMethod(tab.key as any)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    active
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher client, facture, réf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Operations list */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredPayments.length > 0 ? (
            filteredPayments.map((pay) => {
              const linkedInvoice = invoices.find(
                (i) => i.number.toLowerCase() === pay.invoiceNumber.toLowerCase() || i.id === pay.invoiceId
              );

              return (
                <div
                  key={pay.id}
                  className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/70 dark:hover:bg-slate-800/30 rounded-2xl px-2.5 transition-colors"
                >
                  {/* Left: Info */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {pay.clientName}
                      </span>
                      {getMethodBadge(pay.method)}
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        Réf: {pay.reference}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>Règlement perçu le {formatDateFR(pay.date)}</span>
                      <span>•</span>
                      {/* Linked Invoice Badge */}
                      <button
                        type="button"
                        onClick={() => handleInvoiceClick(pay.invoiceNumber)}
                        className="inline-flex items-center gap-1 font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer group-hover:text-brand-700"
                        title="Cliquer pour voir l'aperçu de la facture"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Facture {pay.invoiceNumber}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {formatFCFA(pay.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-0.5">
                        {linkedInvoice ? `Sur un total de ${formatFCFA(linkedInvoice.total)}` : 'Encaissé'}
                      </span>
                    </div>

                    {/* View Invoice Preview button */}
                    <button
                      type="button"
                      onClick={() => handleInvoiceClick(pay.invoiceNumber)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-800 dark:hover:bg-brand-950/60 dark:hover:text-brand-300 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="Ouvrir l'aperçu de la facture concernée"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Aperçu Facture</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Aucune opération trouvée
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Aucun paiement ne correspond à votre filtre actuel pour la période : <strong>{periodLabel}</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('all');
                  setSearchQuery('');
                }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total affiché : <strong className="text-slate-900 dark:text-white font-bold">{formatFCFA(currentFilteredTotal)}</strong> ({filteredPayments.length} règlement{filteredPayments.length > 1 ? 's' : ''})
          </div>

          <div className="flex items-center gap-2">
            {onNewPayment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewPayment();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Enregistrer un Paiement</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
