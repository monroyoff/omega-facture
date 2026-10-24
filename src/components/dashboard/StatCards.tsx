'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { DashboardKPIs } from '@/lib/types';
import { formatFCFA } from '@/lib/money/format';

interface StatCardsProps {
  kpis: DashboardKPIs;
  onCardClick?: (cardType: 'invoiced' | 'paid' | 'pending' | 'overdue') => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ kpis, onCardClick }) => {
  const cards = [
    {
      key: 'invoiced' as const,
      title: 'Montant facturé',
      amount: formatFCFA(kpis.totalInvoiced),
      subtext: `${kpis.invoicesCount} facture${kpis.invoicesCount > 1 ? 's' : ''} émise${kpis.invoicesCount > 1 ? 's' : ''}`,
      trend: kpis.invoicedTrend,
      trendText: 'vs mois dernier',
      isPositive: true,
      icon: FileText,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    },
    {
      key: 'paid' as const,
      title: 'Montant encaissé',
      amount: formatFCFA(kpis.totalPaid),
      subtext: `Factures soldées & acomptes reçus`,
      trend: kpis.paidTrend,
      trendText: 'vs mois dernier',
      isPositive: true,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'pending' as const,
      title: 'En attente',
      amount: formatFCFA(kpis.totalPending),
      subtext: 'Échéance non dépassée',
      trend: kpis.pendingTrend,
      trendText: 'vs mois dernier',
      isPositive: true,
      icon: Clock,
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
    {
      key: 'overdue' as const,
      title: 'En retard',
      amount: formatFCFA(kpis.totalOverdue),
      subtext: kpis.totalOverdue > 0 ? 'Factures échues' : 'Aucun retard',
      trend: kpis.overdueTrend,
      trendText: 'à relancer',
      isPositive: false,
      icon: AlertCircle,
      iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            onClick={() => onCardClick?.(card.key)}
            className="group relative bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card hover:shadow-dropdown hover:border-brand-400/80 dark:hover:border-brand-600/80 transition-all duration-200 cursor-pointer active:scale-[0.98] select-none"
          >
            {/* Header: Title + Icon */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg} transition-transform group-hover:scale-110 shadow-2xs`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Main Value */}
            <div className="mb-3">
              <div className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {card.amount}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {card.subtext}
              </p>
            </div>

            {/* Footer: Trend */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 mt-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    card.isPositive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {card.trend > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {card.trend > 0 ? `+${card.trend}%` : `${card.trend}%`}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {card.trendText}
                </span>
              </div>
            </div>

            {/* Bottom link: voir les factures ou opérations concernées */}
            <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
              <span>voir les factures ou opérations concernées</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
