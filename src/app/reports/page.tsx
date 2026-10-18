'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useInvoices } from '@/lib/store/invoice-context';
import { formatFCFA } from '@/lib/money/format';
import { BarChart3, TrendingUp, PieChart, Users, AlertCircle, FileSpreadsheet, ArrowUpRight } from 'lucide-react';
import { monthlyRevenueData } from '@/lib/mock-data';
import { PrintReportModal } from '@/components/reports/PrintReportModal';

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const { invoices, clients } = useInvoices();

  const totalInvoiced = invoices.filter((i) => i.status !== 'draft').reduce((acc, i) => acc + i.total, 0);
  const totalPaid = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const recoveryRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

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

          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Chiffre d’Affaires Cumulé 2026
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatFCFA(totalInvoiced)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
                <ArrowUpRight className="w-4 h-4" />
                <span>+24.8% de croissance annuelle</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Taux de Recouvrement Global
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {recoveryRate}%
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div style={{ width: `${recoveryRate}%` }} className="bg-emerald-500 h-full rounded-full" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Délai Moyen de Règlement
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                18 jours
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Conforme aux usages commerciaux de la région UEMOA
              </p>
            </div>
          </div>

          {/* Balance Âgée (Aging of Receivables) */}
          <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Balance Âgée des Créances Clients
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ventilation des montants en attente selon l'ancienneté d'émission
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  0 à 30 jours (Créances saines)
                </span>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatFCFA(2419000)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Échéance normale</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  31 à 60 jours (À surveiller)
                </span>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatFCFA(1800000)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Relance recommandée</span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                  + de 60 jours (Contentieux)
                </span>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatFCFA(763000)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Mise en demeure</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        totalInvoiced={totalInvoiced}
        totalPaid={totalPaid}
        recoveryRate={recoveryRate}
      />
    </div>
  );
}
