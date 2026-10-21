'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import { formatFCFA } from '@/lib/money/format';
import { NewPaymentModal } from '@/components/payments/NewPaymentModal';
import { InvoicePreviewModal } from '@/components/dashboard/InvoicePreviewModal';
import { Invoice } from '@/lib/types';

interface HeaderProps {
  onOpenSidebar: () => void;
  onNewInvoice?: () => void;
  hidePeriodPicker?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar, onNewInvoice, hidePeriodPicker = false }) => {
  const router = useRouter();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [calendarTab, setCalendarTab] = useState<'month' | 'day' | 'quarter' | 'semester' | 'year'>('month');
  const [customDay, setCustomDay] = useState('2026-10-18');
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const quarters = [
    { id: 'quarter:2026-Q4', label: '4e Trimestre 2026 (Octobre - Décembre)', badge: 'T4' },
    { id: 'quarter:2026-Q3', label: '3e Trimestre 2026 (Juillet - Septembre)', badge: 'T3' },
    { id: 'quarter:2026-Q2', label: '2e Trimestre 2026 (Avril - Juin)', badge: 'T2' },
    { id: 'quarter:2026-Q1', label: '1er Trimestre 2026 (Janvier - Mars)', badge: 'T1' },
  ];

  const semesters = [
    { id: 'semester:2026-S2', label: '2e Semestre 2026 (Juillet - Décembre)', badge: 'S2' },
    { id: 'semester:2026-S1', label: '1er Semestre 2026 (Janvier - Juin)', badge: 'S1' },
  ];

  const months = [
    { id: '2026-10', label: 'Octobre 2026', badge: 'En cours' },
    { id: '2026-09', label: 'Septembre 2026', badge: 'Mois dernier' },
    { id: '2026-08', label: 'Août 2026' },
    { id: '2026-07', label: 'Juillet 2026' },
    { id: '2026-06', label: 'Juin 2026' },
    { id: '2026-05', label: 'Mai 2026' },
  ];

  const quickDays = [
    { id: 'day:2026-10-18', label: 'Aujourd’hui (18 Octobre 2026)' },
    { id: 'day:2026-10-16', label: '16 Octobre 2026' },
    { id: 'day:2026-10-14', label: '14 Octobre 2026' },
    { id: 'day:2026-10-12', label: '12 Octobre 2026' },
    { id: 'day:2026-10-10', label: '10 Octobre 2026' },
    { id: 'day:2026-10-02', label: '02 Octobre 2026' },
  ];

  const years = [
    { id: 'ALL', label: 'Année 2026 complète (Toutes les factures)', badge: '2026' },
    { id: 'year:2025', label: 'Exercice 2025 (Historique)', badge: '2025' },
  ];

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
      <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">Dashboard</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Vue d’ensemble
            </span>
          </div>
        </div>

        {/* Right: Period Selector, Notification, and New Invoice CTA */}
        <div className="flex items-center gap-3 relative">
          {/* Interactive Period Selector (Calendar) */}
          {!hidePeriodPicker && (
            <div className="relative">
            <button
              type="button"
              onClick={() => {
                setCalendarOpen(!calendarOpen);
                setNotificationsOpen(false);
              }}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>{periodLabel}</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  calendarOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Calendar Dropdown Menu */}
            {calendarOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCalendarOpen(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-80 sm:w-96 bg-white dark:bg-[#111622] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-100">
                  {/* Category tabs: Mois, Jour, Trimestre, Semestre, Année */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-2.5 text-xs font-semibold overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setCalendarTab('month')}
                      className={`flex-1 py-1.5 px-2 rounded-xl transition-all whitespace-nowrap ${
                        calendarTab === 'month'
                          ? 'bg-white dark:bg-[#111622] text-brand-600 shadow-sm font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Mois
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarTab('day')}
                      className={`flex-1 py-1.5 px-2 rounded-xl transition-all whitespace-nowrap ${
                        calendarTab === 'day'
                          ? 'bg-white dark:bg-[#111622] text-brand-600 shadow-sm font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Jour
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarTab('quarter')}
                      className={`flex-1 py-1.5 px-2 rounded-xl transition-all whitespace-nowrap ${
                        calendarTab === 'quarter'
                          ? 'bg-white dark:bg-[#111622] text-brand-600 shadow-sm font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Trimestre
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarTab('semester')}
                      className={`flex-1 py-1.5 px-2 rounded-xl transition-all whitespace-nowrap ${
                        calendarTab === 'semester'
                          ? 'bg-white dark:bg-[#111622] text-brand-600 shadow-sm font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Semestre
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarTab('year')}
                      className={`flex-1 py-1.5 px-2 rounded-xl transition-all whitespace-nowrap ${
                        calendarTab === 'year'
                          ? 'bg-white dark:bg-[#111622] text-brand-600 shadow-sm font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Année
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="max-h-72 overflow-y-auto px-1 py-1 space-y-1">
                    {/* TAB: MOIS */}
                    {calendarTab === 'month' &&
                      months.map((m) => {
                        const isSelected = selectedPeriod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSelectedPeriod(m.id);
                              setCalendarOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                              isSelected
                                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-bold border border-brand-200/50 dark:border-brand-800/40'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{m.label}</span>
                              {m.badge && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                                  {m.badge}
                                </span>
                              )}
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                          </button>
                        );
                      })}

                    {/* TAB: JOUR */}
                    {calendarTab === 'day' && (
                      <div className="space-y-3 p-1">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                            Jours Récents & Émissions
                          </span>
                          {quickDays.map((d) => {
                            const isSelected = selectedPeriod === d.id;
                            return (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => {
                                  setSelectedPeriod(d.id);
                                  setCalendarOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                                  isSelected
                                    ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-bold border border-brand-200/50 dark:border-brand-800/40'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                }`}
                              >
                                <span>{d.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Date Picker */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                            Choisir une date exacte :
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={customDay}
                              onChange={(e) => setCustomDay(e.target.value)}
                              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customDay) {
                                  setSelectedPeriod(`day:${customDay}`);
                                  setCalendarOpen(false);
                                }
                              }}
                              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                            >
                              Filtrer
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB: TRIMESTRE */}
                    {calendarTab === 'quarter' &&
                      quarters.map((q) => {
                        const isSelected = selectedPeriod === q.id || selectedPeriod === q.id.replace('quarter:', '');
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => {
                              setSelectedPeriod(q.id);
                              setCalendarOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                              isSelected
                                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-bold border border-brand-200/50 dark:border-brand-800/40'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{q.label}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                                {q.badge}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                          </button>
                        );
                      })}

                    {/* TAB: SEMESTRE */}
                    {calendarTab === 'semester' &&
                      semesters.map((s) => {
                        const isSelected = selectedPeriod === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedPeriod(s.id);
                              setCalendarOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                              isSelected
                                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-bold border border-brand-200/50 dark:border-brand-800/40'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{s.label}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                                {s.badge}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                          </button>
                        );
                      })}

                    {/* TAB: ANNEE */}
                    {calendarTab === 'year' &&
                      years.map((y) => {
                        const isSelected = selectedPeriod === y.id;
                        return (
                          <button
                            key={y.id}
                            type="button"
                            onClick={() => {
                              setSelectedPeriod(y.id);
                              setCalendarOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                              isSelected
                                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-bold border border-brand-200/50 dark:border-brand-800/40'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{y.label}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                                {y.badge}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
            </div>
          )}

          {/* Interactive Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setCalendarOpen(false);
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

          {/* New Invoice Button (styled with royal blue & glow) */}
          <Link
            href="/invoices/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Nouvelle Facture</span>
            <span className="xs:hidden">Créer</span>
          </Link>
        </div>
      </header>

      {/* Global Quick Action Modals reachable from the Header */}
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

