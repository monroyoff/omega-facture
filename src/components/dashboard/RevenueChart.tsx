'use client';

import React from 'react';
import { BarChart3, PieChart, ArrowUpRight, ArrowRight } from 'lucide-react';
import { formatFCFA } from '@/lib/money/format';
import { useInvoices } from '@/lib/store/invoice-context';

interface RevenueOverviewProps {
  onStatusClick?: (status: 'all' | 'paid' | 'sent' | 'overdue') => void;
  onMonthClick?: (monthPeriodId: string) => void;
  onTotalClick?: () => void;
}

export const RevenueOverview: React.FC<RevenueOverviewProps> = ({
  onStatusClick,
  onMonthClick,
  onTotalClick,
}) => {
  const { invoices, selectedPeriod, setSelectedPeriod, periodLabel, periodKPIs } = useInvoices();

  const monthlyRevenueData = React.useMemo(() => {
    const months = [
      { key: '2026-05', month: 'Mai' },
      { key: '2026-06', month: 'Juin' },
      { key: '2026-07', month: 'Juil' },
      { key: '2026-08', month: 'Août' },
      { key: '2026-09', month: 'Sept' },
      { key: '2026-10', month: 'Oct' },
    ];
    return months.map((m) => {
      const monthInvoices = invoices.filter(
        (inv) =>
          (!inv.documentKind || inv.documentKind === 'invoice') &&
          !inv.number.startsWith('DEV-') &&
          inv.status !== 'draft' &&
          inv.issueDate.startsWith(m.key)
      );
      const amount = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
      return { month: m.month, amount, periodKey: m.key };
    });
  }, [invoices]);

  const rawMax = Math.max(...monthlyRevenueData.map((d) => d.amount), 0);
  const maxAmount = rawMax > 0 ? rawMax : 1;

  // Determine active month in chart
  const activeMonthCode = {
    '2026-10': 'Oct',
    '2026-09': 'Sept',
    '2026-08': 'Août',
    '2026-07': 'Juil',
    '2026-06': 'Juin',
    '2026-05': 'Mai',
  }[selectedPeriod] || (selectedPeriod.startsWith('day:2026-10') ? 'Oct' : '');

  const monthToPeriodMap: Record<string, string> = {
    Oct: '2026-10',
    Sept: '2026-09',
    Août: '2026-08',
    Juil: '2026-07',
    Juin: '2026-06',
    Mai: '2026-05',
  };

  const handleBarClick = (month: string) => {
    const periodId = monthToPeriodMap[month];
    if (periodId) {
      setSelectedPeriod(periodId);
      onMonthClick?.(periodId);
      const el = document.getElementById('invoices-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const totalSum = periodKPIs.totalPaid + periodKPIs.totalPending + periodKPIs.totalOverdue;
  const paidPct = totalSum > 0 ? Math.round((periodKPIs.totalPaid / totalSum) * 100) : 100;
  const pendingPct = totalSum > 0 ? Math.round((periodKPIs.totalPending / totalSum) * 100) : 0;
  const overduePct = totalSum > 0 ? Math.max(0, 100 - paidPct - pendingPct) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Revenue Bars (2 columns) */}
      <div className="lg:col-span-2 bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Évolution du Chiffre d’Affaires
              </h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Recettes facturées sur les 6 derniers mois (FCFA)
            </p>
          </div>

          <div
            onClick={() => {
              if (onTotalClick) {
                onTotalClick();
              } else {
                document.getElementById('invoices-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="text-right cursor-pointer group p-1.5 -m-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="text-xs text-slate-400 font-medium group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors flex items-center justify-end gap-1">
              <span>{periodLabel}</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {formatFCFA(periodKPIs.totalInvoiced)}
            </div>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800/60">
          {monthlyRevenueData.map((item) => {
            const heightPercent = rawMax > 0 && item.amount > 0 ? Math.max(Math.round((item.amount / maxAmount) * 100), 6) : 4;
            const isSelected = item.month === activeMonthCode;
            return (
              <div
                key={item.month}
                onClick={() => handleBarClick(item.month)}
                className="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer active:scale-95 transition-all"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-20">
                  {item.month} 2026 : {formatFCFA(item.amount)}
                </div>

                {/* Bar */}
                <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800/60 rounded-xl h-36 flex items-end p-1 overflow-hidden group-hover:ring-2 group-hover:ring-brand-500/40 transition-all">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-lg transition-all duration-500 ${
                      isSelected
                        ? 'bg-brand-600 shadow-md shadow-brand-600/30'
                        : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-brand-500/80'
                    }`}
                  />
                </div>

                {/* Month label */}
                <span
                  className={`text-xs font-medium transition-colors ${
                    isSelected
                      ? 'text-brand-600 dark:text-brand-400 font-bold underline underline-offset-4'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Sub-legend */}
        <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
              Période sélectionnée ({periodLabel})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              Autres mois
            </span>
          </div>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {periodKPIs.invoicedTrend > 0 ? `+${periodKPIs.invoicedTrend}%` : `${periodKPIs.invoicedTrend}%`} tendance
          </span>
        </div>

        {/* Bottom link as requested */}
        <div
          onClick={() => {
            const el = document.getElementById('invoices-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="pt-3.5 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer group"
        >
          <span>voir les factures ou opérations concernées</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Distribution by Status (1 column) */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <PieChart className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Répartition des Créances
            </h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">
            État pour : <strong>{periodLabel}</strong>
          </p>

          {/* Stacked Progress Bar */}
          <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mb-5 p-0.5 cursor-pointer">
            <div
              style={{ width: `${paidPct}%` }}
              onClick={() => onStatusClick?.('paid')}
              className="h-full bg-emerald-500 rounded-l-full hover:brightness-110 active:scale-95 transition-all duration-300"
            />
            <div
              style={{ width: `${pendingPct}%` }}
              onClick={() => onStatusClick?.('sent')}
              className="h-full bg-amber-500 hover:brightness-110 active:scale-95 transition-all duration-300"
            />
            <div
              style={{ width: `${overduePct}%` }}
              onClick={() => onStatusClick?.('overdue')}
              className="h-full bg-rose-500 rounded-r-full hover:brightness-110 active:scale-95 transition-all duration-300"
            />
          </div>

          {/* Breakdown items */}
          <div className="space-y-2">
            {/* Encaissé */}
            <div
              onClick={() => onStatusClick?.('paid')}
              className="flex items-center justify-between text-xs p-2 -mx-2 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs group-hover:scale-125 transition-transform" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  Encaissé (Payé)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">{paidPct}%</span>
                <span className="text-[11px] text-slate-400">({formatFCFA(periodKPIs.totalPaid)})</span>
              </div>
            </div>

            {/* En attente */}
            <div
              onClick={() => onStatusClick?.('sent')}
              className="flex items-center justify-between text-xs p-2 -mx-2 rounded-xl hover:bg-amber-50/70 dark:hover:bg-amber-950/30 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs group-hover:scale-125 transition-transform" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                  En attente (Non échu)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">{pendingPct}%</span>
                <span className="text-[11px] text-slate-400">({formatFCFA(periodKPIs.totalPending)})</span>
              </div>
            </div>

            {/* En retard */}
            <div
              onClick={() => onStatusClick?.('overdue')}
              className="flex items-center justify-between text-xs p-2 -mx-2 rounded-xl hover:bg-rose-50/70 dark:hover:bg-rose-950/30 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs group-hover:scale-125 transition-transform" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors">
                  En retard (Échu)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">{overduePct}%</span>
                <span className="text-[11px] text-slate-400">({formatFCFA(periodKPIs.totalOverdue)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick reminder box */}
        <div
          onClick={() => {
            if (periodKPIs.totalOverdue > 0) {
              onStatusClick?.('overdue');
            } else {
              onStatusClick?.('paid');
            }
          }}
          className="mt-5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 cursor-pointer hover:bg-amber-100/70 dark:hover:bg-amber-950/40 transition-all active:scale-[0.99] flex items-center justify-between group"
        >
          <div className="flex-1 pr-2">
            {periodKPIs.totalOverdue > 0 ? (
              <>
                <strong>Action requise :</strong> {formatFCFA(periodKPIs.totalOverdue)} de factures échues nécessitent une relance.
              </>
            ) : (
              <>
                <strong>Excellent :</strong> Aucun retard de paiement enregistré pour {periodLabel} !
              </>
            )}
          </div>
          <ArrowUpRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>

        {/* Bottom link as requested */}
        <div
          onClick={() => {
            const el = document.getElementById('invoices-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="pt-3.5 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer group"
        >
          <span>voir les factures ou opérations concernées</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
