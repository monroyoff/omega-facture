import React from 'react';
import { InvoiceStatus } from '@/lib/types';

interface BadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const configs: Record<InvoiceStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
    paid: {
      label: 'Payée',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200/80 dark:border-emerald-800/60',
    },
    sent: {
      label: 'Envoyée',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
      border: 'border-amber-200/80 dark:border-amber-800/60',
    },
    draft: {
      label: 'Brouillon',
      bg: 'bg-slate-100 dark:bg-slate-800/60',
      text: 'text-slate-600 dark:text-slate-300',
      dot: 'bg-slate-400',
      border: 'border-slate-200 dark:border-slate-700',
    },
    overdue: {
      label: 'En retard',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
      border: 'border-rose-200/80 dark:border-rose-800/60',
    },
  };

  const config = configs[status] || configs.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
