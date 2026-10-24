'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  Bell,
  Plus,
  Calendar,
  ChevronDown,
  Check,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  X,
  MessageSquare,
  CreditCard,
  Eye,
  Pencil,
  ArrowLeft,
  FileCheck2,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import { formatFCFA } from '@/lib/money/format';
import { NewPaymentModal } from '@/components/payments/NewPaymentModal';
import { InvoicePreviewModal } from '@/components/dashboard/InvoicePreviewModal';
import { CreateInvoiceModal } from '@/components/invoices/CreateInvoiceModal';
import { Invoice } from '@/lib/types';
import { PeriodPickerDropdown } from '@/components/common/PeriodPickerDropdown';

interface HeaderProps {
  onOpenSidebar: () => void;
  onNewInvoice?: (kind?: 'invoice' | 'quote') => void;
  hidePeriodPicker?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar, onNewInvoice, hidePeriodPicker = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === '/' || pathname === '/dashboard';

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [headerCreateModalKind, setHeaderCreateModalKind] = useState<'invoice' | 'quote' | null>(null);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Dynamic section title based on route
  const getSectionTitle = (path: string) => {
    if (path.startsWith('/invoices/new')) return 'Créer une Facture';
    if (path.startsWith('/invoices')) return 'Factures & Devis';
    if (path.startsWith('/clients')) return 'Répertoire Clients';
    if (path.startsWith('/payments')) return 'Paiements & Flux';
    if (path.startsWith('/reports')) return 'Rapports & KPI';
    if (path.startsWith('/settings')) return 'Paramètres';
    if (path.startsWith('/support')) return 'Assistance & Support';
    if (path.startsWith('/products')) return 'Articles & Prestations';
    return 'Vue d’ensemble';
  };
  const currentSectionTitle = getSectionTitle(pathname);


  const {
    selectedPeriod,
    setSelectedPeriod,
    periodLabel,
    periodOptions,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissNotification,
    unreadNotificationCount,
    invoices,
  } = useInvoices();

  const handleCardClick = (n: typeof notifications[0]) => {
    markNotificationAsRead(n.id);
    setNotificationsOpen(false);

    if (n.type === 'draft' && n.invoiceId) {
      router.push(`/invoices/${n.invoiceId}/edit`);
    } else if (n.type === 'payment') {
      router.push('/payments');
    } else if (n.type === 'overdue' && n.invoiceId) {
      const inv = invoices.find((i) => i.id === n.invoiceId);
      if (inv) setPreviewInvoice(inv);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-8 flex items-center justify-between min-w-0 w-full">
        {/* Left: Mobile Toggle & Blue Brand Logo & Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenSidebar}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-brand-500/20 shrink-0">
              Ω
            </div>
            <span className="font-black text-xs text-slate-900 dark:text-white hidden min-[360px]:inline sm:hidden tracking-tight">
              OMEGA <span className="text-brand-600 dark:text-brand-400">FACTURE</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
            {isDashboard ? (
              <>
                <span className="text-slate-400 font-medium">Dashboard</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  Vue d’ensemble
                </span>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-brand-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {currentSectionTitle}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Period Selector, Notification, and New Invoice CTA */}
        <div className="flex items-center gap-1.5 sm:gap-3 relative shrink-0">
          {/* Interactive Period Selector (Calendar) - Desktop only (moved below hero on mobile) */}
          {!hidePeriodPicker && (
            <div className="hidden sm:block">
              <PeriodPickerDropdown align="right" />
            </div>
          )}

          {/* Interactive Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
              }}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0c1017] animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 bg-white dark:bg-[#111622] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-100">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        Notifications & Alertes
                      </span>
                      {unreadNotificationCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600">
                          {unreadNotificationCount} nouvelle{unreadNotificationCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] font-semibold text-brand-600 hover:underline"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Aucune alerte en attente
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Toutes vos factures et relances sont à jour.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto py-1">
                      {notifications.map((n) => {
                        const isOverdue = n.type === 'overdue';
                        const isPayment = n.type === 'payment';
                        const isDraft = n.type === 'draft';

                        const iconBg = isOverdue
                          ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                          : isPayment
                          ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                          : 'text-amber-500 bg-amber-50 dark:bg-amber-950/40';

                        const Icon = isOverdue ? AlertTriangle : isPayment ? CheckCircle2 : FileText;

                        return (
                          <div
                            key={n.id}
                            onClick={() => handleCardClick(n)}
                            className={`py-3.5 px-2 rounded-2xl transition-all cursor-pointer relative group ${
                              n.unread
                                ? 'bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                                : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                    {n.title}
                                  </p>
                                  <div className="flex items-center gap-1.5">
                                    {n.unread && (
                                      <span className="w-2 h-2 rounded-full bg-brand-600" />
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dismissNotification(n.id);
                                      }}
                                      className="p-1 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                      title="Supprimer la notification"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                  {n.desc}
                                </p>

                                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  {n.time}
                                </span>

                                {/* Dedicated Operational Action Buttons */}
                                {isOverdue && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markNotificationAsRead(n.id);
                                        const phone = n.clientPhone?.replace(/[^0-9]/g, '') || '2290166889911';
                                        const text = `Bonjour ${n.clientName || 'Cher client'}, sauf erreur de notre part, la facture ${n.invoiceNumber} d'un montant restant de ${formatFCFA(n.remainingAmount || 0)} échue le ${n.dueDate || ''} reste impayée. Merci de bien vouloir procéder à la régularisation. OMEGA FACTURE.`;
                                        window.open(
                                          `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
                                          '_blank'
                                        );
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold transition-colors shadow-2xs"
                                    >
                                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                                      <span>Relancer WhatsApp</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markNotificationAsRead(n.id);
                                        setNotificationsOpen(false);
                                        setPaymentInvoiceId(n.invoiceId || null);
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 text-[11px] font-bold transition-colors shadow-2xs"
                                    >
                                      <CreditCard className="w-3 h-3 text-brand-600" />
                                      <span>Encaisser</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markNotificationAsRead(n.id);
                                        setNotificationsOpen(false);
                                        const inv = invoices.find((i) => i.id === n.invoiceId);
                                        if (inv) setPreviewInvoice(inv);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors ml-auto"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Voir</span>
                                    </button>
                                  </div>
                                )}

                                {isDraft && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                                    <Link
                                      href={`/invoices/${n.invoiceId}/edit`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markNotificationAsRead(n.id);
                                        setNotificationsOpen(false);
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-bold transition-colors shadow-2xs"
                                    >
                                      <Pencil className="w-3 h-3 text-amber-600" />
                                      <span>Modifier & Émettre</span>
                                    </Link>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markNotificationAsRead(n.id);
                                        setNotificationsOpen(false);
                                        const inv = invoices.find((i) => i.id === n.invoiceId);
                                        if (inv) setPreviewInvoice(inv);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors ml-auto"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Aperçu</span>
                                    </button>
                                  </div>
                                )}

                                {isPayment && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                                    <Link
                                      href="/payments"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markNotificationAsRead(n.id);
                                        setNotificationsOpen(false);
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold transition-colors shadow-2xs"
                                    >
                                      <FileText className="w-3 h-3 text-emerald-600" />
                                      <span>Voir le Reçu</span>
                                    </Link>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markNotificationAsRead(n.id);
                                        setNotificationsOpen(false);
                                        const inv = invoices.find((i) => i.id === n.invoiceId);
                                        if (inv) setPreviewInvoice(inv);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors ml-auto"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Facture</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer link */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link
                      href="/invoices"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      Voir toutes les factures & créances →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Create Dropdown (Web & Mobile responsive) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all shrink-0 cursor-pointer"
              title="Créer une facture ou un devis"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Créer</span>
              <span className="sm:hidden text-xs font-bold">Créer</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${createMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {createMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCreateMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 sm:w-60 bg-white dark:bg-[#111622] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                    Nouveau document
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateMenuOpen(false);
                        if (onNewInvoice) {
                          onNewInvoice('invoice');
                        } else {
                          setHeaderCreateModalKind('invoice');
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition-colors text-left cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Facture</div>
                        <div className="text-[10px] text-slate-400 font-normal">Facture standard ou échelonnée</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCreateMenuOpen(false);
                        if (onNewInvoice) {
                          onNewInvoice('quote');
                        } else {
                          setHeaderCreateModalKind('quote');
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-400 font-semibold transition-colors text-left cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Devis Estimatif</div>
                        <div className="text-[10px] text-slate-400 font-normal">Proposition commerciale chiffrée</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Close / Return to Dashboard cross button (Visible on Web & Mobile for all non-dashboard sections) */}
          {!isDashboard && (
            <Link
              href="/dashboard"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 dark:active:bg-rose-900/60 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shadow-2xs shrink-0 cursor-pointer touch-manipulation relative z-30 select-none"
              title="Fermer cette section et retourner au Tableau de bord"
              aria-label="Fermer et retourner au Tableau de bord"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300 pointer-events-none shrink-0" />
              <span className="hidden sm:inline font-semibold pointer-events-none">Fermer</span>
            </Link>
          )}
        </div>
      </header>

      {/* Global Quick Action Modals reachable from the Header */}
      <CreateInvoiceModal
        isOpen={!!headerCreateModalKind}
        initialKind={headerCreateModalKind || 'invoice'}
        onClose={() => setHeaderCreateModalKind(null)}
      />

      <NewPaymentModal
        isOpen={!!paymentInvoiceId}
        onClose={() => setPaymentInvoiceId(null)}
        initialInvoiceId={paymentInvoiceId || undefined}
      />

      <InvoicePreviewModal
        invoice={previewInvoice}
        onClose={() => setPreviewInvoice(null)}
      />
    </>
  );
};

