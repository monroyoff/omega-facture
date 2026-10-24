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
import { useInvoices } from '@/lib/store/invoice-context';
import { Invoice } from '@/lib/types';
import { formatFCFA } from '@/lib/money/format';
import { Sparkles, ArrowRight, ShieldCheck, Calendar, Plus, FileCheck2 } from 'lucide-react';
import { PeriodPickerDropdown } from '@/components/common/PeriodPickerDropdown';

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTableTab>('all');
  const [activeKind, setActiveKind] = useState<'all' | 'invoice' | 'quote'>('invoice');
  const { periodInvoices, periodKPIs, periodLabel, currentUser } = useInvoices();
  const userFirstName = currentUser?.firstName || currentUser?.name?.split(' ')[0] || 'MONROY';

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
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Dashboard Main Body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto min-w-0">
          {/* Welcome & Context Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-brand-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-brand-500/15 relative overflow-hidden">
            {/* Background decorative circles */}
            <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute right-48 bottom-0 translate-y-12 w-48 h-48 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Espace de Facturation Professionnelle — Zone UEMOA</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                Bonjour, {userFirstName} 👋
              </h1>
              <p className="text-sm text-blue-100 font-normal leading-relaxed">
                Votre entreprise a généré{' '}
                <button
                  type="button"
                  onClick={() => handleCardClick('invoiced')}
                  className="text-white font-bold underline underline-offset-2 hover:text-amber-200 transition-colors cursor-pointer"
                >
                  {formatFCFA(periodKPIs.totalInvoiced)}
                </button>{' '}
                de facturations pour <strong className="text-white font-semibold">{periodLabel}</strong>, dont{' '}
                <button
                  type="button"
                  onClick={() => handleCardClick('paid')}
                  className="text-emerald-300 font-bold underline underline-offset-2 hover:text-emerald-100 transition-colors cursor-pointer"
                >
                  {formatFCFA(periodKPIs.totalPaid)}
                </button>{' '}
                déjà encaissés.
              </p>
            </div>

            {/* Action buttons (Web & Mobile responsive) */}
            <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto pt-2 sm:pt-0">
              <Link
                href="/invoices/new?kind=invoice"
                className="px-4 sm:px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-blue-50 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 group whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4 text-brand-600" />
                <span>Créer une Facture</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform hidden sm:inline" />
              </Link>
              
              <Link
                href="/invoices/new?kind=quote"
                className="px-3.5 sm:px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-2xs backdrop-blur-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                title="Créer un nouveau devis estimatif"
              >
                <FileCheck2 className="w-4 h-4 text-purple-200" />
                <span>+ Nouveau Devis</span>
              </Link>
            </div>
          </div>

          {/* Mobile Period / Calendar Selector Card (Moved below Hero section on mobile) */}
          <div className="sm:hidden bg-white dark:bg-[#111622] rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-200/60 dark:border-brand-800/60 shadow-2xs">
                <Calendar className="w-5 h-5" />
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
              buttonClassName="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all shrink-0 cursor-pointer"
            />
          </div>

          {/* 4 Financial KPI Cards */}
          <section aria-label="Indicateurs clés">
            <StatCards
              kpis={periodKPIs}
              onCardClick={handleCardClick}
            />
          </section>

          {/* Charts: Monthly Revenue & Distribution */}
          <section aria-label="Graphiques financiers">
            <RevenueOverview
              onStatusClick={handleStatusClick}
              onTotalClick={() => handleCardClick('invoiced')}
            />
          </section>

          {/* Recent Invoices Data Table */}
          <section aria-label="Dernières factures">
            <RecentInvoicesTable
              id="invoices-section"
              invoices={periodInvoices}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              activeKind={activeKind}
              onKindChange={setActiveKind}
              onSelectInvoice={(inv) => setSelectedInvoice(inv)}
            />
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

      {/* Live A4 Invoice Preview Modal */}
      <InvoicePreviewModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
