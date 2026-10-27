'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { StatCards } from '@/components/dashboard/StatCards';
import { RevenueOverview } from '@/components/dashboard/RevenueChart';
import { RecentInvoicesTable, DashboardTableTab } from '@/components/dashboard/RecentInvoicesTable';
import { InvoicePreviewModal } from '@/components/dashboard/InvoicePreviewModal';
import { CreateInvoiceModal } from '@/components/invoices/CreateInvoiceModal';
import { useInvoices } from '@/lib/store/invoice-context';
import { Invoice } from '@/lib/types';
import { formatFCFA } from '@/lib/money/format';
import { Sparkles, ArrowRight, ShieldCheck, Calendar, Plus, FileCheck2, ArrowLeft } from 'lucide-react';
import { PeriodPickerDropdown } from '@/components/common/PeriodPickerDropdown';
import {
  KPICardsSkeleton,
  RevenueChartSkeleton,
  TableSkeleton,
} from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [createModalKind, setCreateModalKind] = useState<'invoice' | 'quote' | null>(null);
  const [createModalKey, setCreateModalKey] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<DashboardTableTab>('all');
  const [activeKind, setActiveKind] = useState<'all' | 'invoice' | 'quote'>('invoice');

  const {
    periodInvoices,
    periodKPIs,
    periodLabel,
    currentUser,
    pendingVerificationUser,
    isDataLoading,
    userPlan,
    realInvoicesCount,
    canCreateInvoice,
    openUpgradeModal,
  } = useInvoices();

  const openCreateModal = (kind: 'invoice' | 'quote') => {
    if (kind === 'invoice' && !canCreateInvoice) {
      openUpgradeModal('pro');
      return;
    }
    setCreateModalKey((prev) => prev + 1);
    setCreateModalKind(kind);
  };
  const userFirstName = currentUser?.firstName || currentUser?.name?.split(' ')[0] || 'Utilisateur';

  // Si une inscription est en attente de confirmation d'email, rediriger vers la page d'instructions de confirmation
  React.useEffect(() => {
    if (pendingVerificationUser && (!currentUser || !currentUser.emailVerified)) {
      router.push(`/verify-email?email=${encodeURIComponent(pendingVerificationUser.email)}`);
    }
  }, [pendingVerificationUser, currentUser, router]);

  // Synchroniser avec un paramètre d'URL éventuel (?create=invoice ou ?create=quote)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const create = params.get('create');
      if (create === 'quote' || create === 'devis') {
        openCreateModal('quote');
      } else if (create === 'invoice' || create === 'facture') {
        openCreateModal('invoice');
      }
    }
  }, []);

  const scrollToInvoices = () => {
    const el = document.getElementById('invoices-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCardClick = (cardType: 'invoiced' | 'paid' | 'pending' | 'overdue') => {
    // Les cartes d'indicateurs financiers affichent exclusivement les opérations de Factures (hors devis)
    setActiveKind('invoice');

    if (cardType === 'invoiced') {
      setActiveTab('all');
      scrollToInvoices();
    } else if (cardType === 'paid') {
      setActiveTab('paid');
      scrollToInvoices();
    } else if (cardType === 'pending') {
      setActiveTab('sent');
      scrollToInvoices();
    } else if (cardType === 'overdue') {
      setActiveTab('overdue');
      scrollToInvoices();
    }
  };

  const handleStatusClick = (status: 'all' | 'paid' | 'sent' | 'overdue') => {
    if (status === 'all') handleCardClick('invoiced');
    else if (status === 'paid') handleCardClick('paid');
    else if (status === 'sent') handleCardClick('pending');
    else if (status === 'overdue') handleCardClick('overdue');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="/dashboard"
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0 w-full overflow-x-hidden">
        {/* Top Header */}
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          onNewInvoice={(kind) => openCreateModal(kind || 'invoice')}
        />

        {/* Dashboard Main Body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto min-w-0">
          {/* Top-Left Action Bar: CTA Retour Landing Page */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white dark:bg-[#111622] hover:bg-brand-50/80 dark:hover:bg-brand-950/50 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-bold shadow-2xs hover:shadow-xs transition-all active:scale-95 group cursor-pointer"
              title="Retourner à la page d'accueil (Landing Page)"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-brand-50 dark:bg-brand-950/80 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
              <span>Retour au site vitrine</span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">• Page d&apos;accueil</span>
            </Link>
          </div>

          {/* Welcome & Context Banner (Sleeker & more compact) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 sm:py-6 text-white shadow-md shadow-brand-600/15 relative overflow-hidden">
            {/* Background decorative circles */}
            <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute right-36 bottom-0 translate-y-10 w-36 h-36 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-1 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-semibold mb-0.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Espace de Facturation Professionnelle — Zone UEMOA</span>
              </div>
              <h1 suppressHydrationWarning className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                Bonjour, {userFirstName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 font-normal leading-relaxed">
                Votre entreprise a généré{' '}
                {isDataLoading ? (
                  <span className="inline-block w-24 h-4 bg-white/20 rounded-md skeleton-shimmer align-middle mx-1" />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCardClick('invoiced')}
                    className="text-white font-bold underline underline-offset-2 hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    {formatFCFA(periodKPIs.totalInvoiced)}
                  </button>
                )}{' '}
                de facturations pour <strong className="text-white font-semibold">{periodLabel}</strong>, dont{' '}
                {isDataLoading ? (
                  <span className="inline-block w-24 h-4 bg-white/20 rounded-md skeleton-shimmer align-middle mx-1" />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCardClick('paid')}
                    className="text-emerald-300 font-bold underline underline-offset-2 hover:text-emerald-100 transition-colors cursor-pointer"
                  >
                    {formatFCFA(periodKPIs.totalPaid)}
                  </button>
                )}{' '}
                déjà encaissés.
              </p>

              {/* Subscription Plan & Quota Pill */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {userPlan === 'free' ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] text-white">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <span>Plan Gratuit : <strong className="text-white">{realInvoicesCount}/5</strong> factures</span>
                    <button
                      type="button"
                      onClick={() => openUpgradeModal('pro')}
                      className="ml-1 px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-[10px] tracking-wide transition-all shadow-xs cursor-pointer"
                    >
                      Passer à Pro (5 000 F) ⚡
                    </button>
                  </div>
                ) : userPlan === 'pro' ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span>Plan Pro : <strong className="text-emerald-300">Factures & Devis illimités</strong></span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] text-white">
                    <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                    <span>Plan Business : <strong className="text-purple-200">Multi-utilisateurs & API</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons (Web & Mobile responsive) */}
            <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto pt-1 sm:pt-0">
              <button
                type="button"
                onClick={() => openCreateModal('invoice')}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-blue-50 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 group whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-brand-600" />
                <span>Créer une Facture</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform hidden sm:inline" />
              </button>
              
              <button
                type="button"
                onClick={() => openCreateModal('quote')}
                className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-2xs backdrop-blur-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                title="Créer un nouveau devis estimatif"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-purple-200" />
                <span>+ Nouveau Devis</span>
              </button>
            </div>
          </div>

          {/* Mobile Period / Calendar Selector Card */}
          <div className="sm:hidden bg-white dark:bg-[#111622] rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-card flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-200/60 dark:border-brand-800/60 shadow-2xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Période active
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {periodLabel}
                </div>
              </div>
            </div>

            <PeriodPickerDropdown
              align="right"
              buttonVariant="card"
              buttonClassName="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all shrink-0 cursor-pointer"
            />
          </div>

          {/* 4 Financial KPI Cards */}
          <section aria-label="Indicateurs clés">
            {isDataLoading ? (
              <KPICardsSkeleton />
            ) : (
              <StatCards
                kpis={periodKPIs}
                onCardClick={handleCardClick}
              />
            )}
          </section>

          {/* Charts: Monthly Revenue & Distribution */}
          <section aria-label="Graphiques financiers">
            {isDataLoading ? (
              <RevenueChartSkeleton />
            ) : (
              <RevenueOverview
                onStatusClick={handleStatusClick}
                onTotalClick={() => handleCardClick('invoiced')}
              />
            )}
          </section>

          {/* Recent Invoices Data Table */}
          <section aria-label="Dernières factures">
            {isDataLoading ? (
              <TableSkeleton rowsCount={5} showHeaderTabs={false} />
            ) : (
              <RecentInvoicesTable
                id="invoices-section"
                invoices={periodInvoices}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                activeKind={activeKind}
                onKindChange={setActiveKind}
                onSelectInvoice={(inv) => setSelectedInvoice(inv)}
              />
            )}
          </section>

          {/* Legal / Security badge footer */}
          <div className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/80 dark:border-slate-800/80 gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Conforme aux normes de facturation UEMOA (Bénin, Côte d’Ivoire, Sénégal, Togo, etc.)</span>
            </div>
            <span>© 2026 OMEGA FACTURE — Par MONROY</span>
          </div>
        </main>
      </div>

      {/* Creation Modal for Invoice & Quote with click-outside on dashboard to exit */}
      <CreateInvoiceModal
        key={`create-modal-${createModalKey}`}
        isOpen={!!createModalKind}
        initialKind={createModalKind || 'invoice'}
        onClose={() => {
          setCreateModalKind(null);
          if (typeof window !== 'undefined' && window.location.search.includes('create=')) {
            const url = new URL(window.location.href);
            url.searchParams.delete('create');
            window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
          }
        }}
      />

      {/* Live A4 Invoice Preview Modal */}
      <InvoicePreviewModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
