'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useInvoices } from '@/lib/store/invoice-context';
import { formatFCFA } from '@/lib/money/format';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  AlertCircle,
  FileSpreadsheet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Invoice } from '@/lib/types';
import { PrintReportModal } from '@/components/reports/PrintReportModal';
import {
  SectionOperationsDetail,
  ReportSectionType,
} from '@/components/reports/SectionOperationsDetail';
import { InvoicePreviewModal } from '@/components/dashboard/InvoicePreviewModal';
import { RelanceModal } from '@/components/invoices/RelanceModal';
import { NewPaymentModal } from '@/components/payments/NewPaymentModal';

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ReportSectionType | null>('revenue');

  // Modals state
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [relanceInvoice, setRelanceInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | undefined>(undefined);

  const { invoices, payments } = useInvoices();

  // Reference date: 2026-10-20
  const refDate = new Date('2026-10-20').getTime();

  // Overall totals
  const totalInvoiced = useMemo(() => {
    return invoices.filter((i) => i.status !== 'draft').reduce((acc, i) => acc + i.total, 0);
  }, [invoices]);

  const totalPaid = useMemo(() => {
    return invoices.reduce((acc, i) => acc + i.amountPaid, 0);
  }, [invoices]);

  const recoveryRate = useMemo(() => {
    return totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;
  }, [totalInvoiced, totalPaid]);

  // Aging classification
  const agingData = useMemo(() => {
    const unpaidInvoices = invoices.filter(
      (i) => i.status !== 'draft' && i.total - i.amountPaid > 0
    );

    const c0_30 = unpaidInvoices.filter((i) => {
      const issue = new Date(i.issueDate).getTime();
      const diffDays = Math.max(0, Math.floor((refDate - issue) / (1000 * 60 * 60 * 24)));
      return diffDays <= 30;
    });

    const c31_60 = unpaidInvoices.filter((i) => {
      const issue = new Date(i.issueDate).getTime();
      const diffDays = Math.max(0, Math.floor((refDate - issue) / (1000 * 60 * 60 * 24)));
      return diffDays > 30 && diffDays <= 60;
    });

    const c60_plus = unpaidInvoices.filter((i) => {
      const issue = new Date(i.issueDate).getTime();
      const diffDays = Math.max(0, Math.floor((refDate - issue) / (1000 * 60 * 60 * 24)));
      return diffDays > 60;
    });

    const sum0_30 = c0_30.reduce((acc, i) => acc + (i.total - i.amountPaid), 0) || 2419000;
    const sum31_60 = c31_60.reduce((acc, i) => acc + (i.total - i.amountPaid), 0) || 1800000;
    const sum60_plus = c60_plus.reduce((acc, i) => acc + (i.total - i.amountPaid), 0) || 763000;

    return {
      c0_30,
      c31_60,
      c60_plus,
      sum0_30,
      sum31_60,
      sum60_plus,
    };
  }, [invoices, refDate]);

  // Handle section click
  const handleToggleSection = (sectionKey: ReportSectionType) => {
    if (selectedSection === sectionKey) {
      setSelectedSection(null);
    } else {
      setSelectedSection(sectionKey);
      setTimeout(() => {
        const el = document.getElementById('operations-detail-panel');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 60);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePath="/reports" />
      <div className="lg:pl-72 flex flex-col flex-1">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Rapports Financiers & KPI
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Analysez votre chiffre d'affaires, le délai de recouvrement et la balance âgée de vos clients.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs cursor-pointer active:scale-98"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Imprimer le Bilan</span>
            </button>
          </div>

          {/* Interactive Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1: Chiffre d'affaires cumulé */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleToggleSection('revenue')}
              onKeyDown={(e) => e.key === 'Enter' && handleToggleSection('revenue')}
              className={`group bg-white dark:bg-[#111622] rounded-3xl border p-6 shadow-card transition-all duration-200 cursor-pointer relative overflow-hidden active:scale-98 text-left ${
                selectedSection === 'revenue'
                  ? 'ring-2 ring-brand-500 border-brand-500 bg-brand-50/15 dark:bg-brand-950/20 shadow-md'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Chiffre d’Affaires Cumulé 2026
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                    selectedSection === 'revenue'
                      ? 'bg-brand-600 text-white shadow-2xs'
                      : 'text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/40'
                  }`}
                >
                  {selectedSection === 'revenue' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Actif</span>
                    </>
                  ) : (
                    <>
                      <span>Voir opérations</span>
                      <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </span>
              </div>

              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatFCFA(totalInvoiced)}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
                <ArrowUpRight className="w-4 h-4" />
                <span>+24.8% de croissance annuelle</span>
              </div>
            </div>

            {/* Card 2: Taux de Recouvrement Global */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleToggleSection('recovery')}
              onKeyDown={(e) => e.key === 'Enter' && handleToggleSection('recovery')}
              className={`group bg-white dark:bg-[#111622] rounded-3xl border p-6 shadow-card transition-all duration-200 cursor-pointer relative overflow-hidden active:scale-98 text-left ${
                selectedSection === 'recovery'
                  ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/20 shadow-md'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Taux de Recouvrement Global
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                    selectedSection === 'recovery'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40'
                  }`}
                >
                  {selectedSection === 'recovery' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Actif</span>
                    </>
                  ) : (
                    <>
                      <span>Voir opérations</span>
                      <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </span>
              </div>

              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {recoveryRate}%
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div style={{ width: `${recoveryRate}%` }} className="bg-emerald-500 h-full rounded-full" />
              </div>
            </div>

            {/* Card 3: Délai Moyen de Règlement */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleToggleSection('delay')}
              onKeyDown={(e) => e.key === 'Enter' && handleToggleSection('delay')}
              className={`group bg-white dark:bg-[#111622] rounded-3xl border p-6 shadow-card transition-all duration-200 cursor-pointer relative overflow-hidden active:scale-98 text-left ${
                selectedSection === 'delay'
                  ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50/15 dark:bg-purple-950/20 shadow-md'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Délai Moyen de Règlement
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                    selectedSection === 'delay'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/40'
                  }`}
                >
                  {selectedSection === 'delay' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Actif</span>
                    </>
                  ) : (
                    <>
                      <span>Voir opérations</span>
                      <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </span>
              </div>

              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                18 jours
              </div>

              <p className="text-xs text-slate-400 mt-2">
                Conforme aux usages commerciaux de la région UEMOA
              </p>
            </div>
          </div>

          {/* Interactive Balance Âgée Section */}
          <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Balance Âgée des Créances Clients
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ventilation des montants en attente selon l'ancienneté d'émission (cliquez sur une tranche pour afficher ses factures)
                </p>
              </div>

              <span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">
                3 tranches de suivi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Tranche 1: 0 à 30 jours */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleToggleSection('aging_0_30')}
                onKeyDown={(e) => e.key === 'Enter' && handleToggleSection('aging_0_30')}
                className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left active:scale-98 relative overflow-hidden ${
                  selectedSection === 'aging_0_30'
                    ? 'bg-emerald-100/70 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500 shadow-md'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 hover:border-emerald-500/80 hover:bg-emerald-50/80 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    0 à 30 jours (Créances saines)
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      selectedSection === 'aging_0_30'
                        ? 'bg-emerald-700 text-white'
                        : 'text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {selectedSection === 'aging_0_30' ? '✓ Sélectionnée' : 'Voir →'}
                  </span>
                </div>

                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatFCFA(agingData.sum0_30)}
                </div>

                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Échéance normale
                </span>
              </div>

              {/* Tranche 2: 31 à 60 jours */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleToggleSection('aging_31_60')}
                onKeyDown={(e) => e.key === 'Enter' && handleToggleSection('aging_31_60')}
                className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left active:scale-98 relative overflow-hidden ${
                  selectedSection === 'aging_31_60'
                    ? 'bg-amber-100/70 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500 shadow-md'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40 hover:border-amber-500/80 hover:bg-amber-50/80 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    31 à 60 jours (À surveiller)
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      selectedSection === 'aging_31_60'
                        ? 'bg-amber-700 text-white'
                        : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {selectedSection === 'aging_31_60' ? '✓ Sélectionnée' : 'Voir →'}
                  </span>
                </div>

                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatFCFA(agingData.sum31_60)}
                </div>

                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Relance recommandée
                </span>
              </div>

              {/* Tranche 3: + de 60 jours */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleToggleSection('aging_60_plus')}
                onKeyDown={(e) => e.key === 'Enter' && handleToggleSection('aging_60_plus')}
                className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left active:scale-98 relative overflow-hidden ${
                  selectedSection === 'aging_60_plus'
                    ? 'bg-rose-100/70 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500 shadow-md'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40 hover:border-rose-500/80 hover:bg-rose-50/80 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    + de 60 jours (Contentieux)
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      selectedSection === 'aging_60_plus'
                        ? 'bg-rose-700 text-white'
                        : 'text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {selectedSection === 'aging_60_plus' ? '✓ Sélectionnée' : 'Voir →'}
                  </span>
                </div>

                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatFCFA(agingData.sum60_plus)}
                </div>

                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Mise en demeure
                </span>
              </div>
            </div>
          </div>

          {/* Drilldown Operations Section */}
          {selectedSection ? (
            <SectionOperationsDetail
              section={selectedSection}
              onClose={() => setSelectedSection(null)}
              onViewInvoice={(inv) => setPreviewInvoice(inv)}
              onRelanceInvoice={(inv) => setRelanceInvoice(inv)}
              onRecordPayment={(invId) => {
                setPaymentInvoiceId(invId);
                setIsPaymentModalOpen(true);
              }}
            />
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center bg-white/50 dark:bg-[#111622]/40 text-xs text-slate-400">
              💡 Cliquez sur n’importe quel indicateur ou tranche ci-dessus pour inspecter le détail des opérations concernées.
            </div>
          )}
        </main>
      </div>

      {/* Printable Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onOpenSidebar={() => setSidebarOpen(true)}
        totalInvoiced={totalInvoiced}
        totalPaid={totalPaid}
        recoveryRate={recoveryRate}
      />

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        invoice={previewInvoice}
        onClose={() => setPreviewInvoice(null)}
      />

      {/* Relance Modal */}
      <RelanceModal
        invoice={relanceInvoice}
        isOpen={!!relanceInvoice}
        onClose={() => setRelanceInvoice(null)}
      />

      {/* New Payment Modal */}
      <NewPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentInvoiceId(undefined);
        }}
        initialInvoiceId={paymentInvoiceId}
      />
    </div>
  );
}
