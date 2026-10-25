'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  FileText,
  X,
  Sparkles,
  Wallet,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Pencil,
} from 'lucide-react';
import { formatFCFA } from '@/lib/money/format';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  kind?:
    | 'invoice'
    | 'quote'
    | 'draft'
    | 'payment'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'delete'
    | 'update';
  number?: string;
  amount?: number;
  duration?: number; // millisecondes (défaut : 4000)
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const remainingTimeRef = useRef<number>(4000);
  const startTimeRef = useRef<number>(Date.now());

  const duration = toast?.duration || 4000;

  useEffect(() => {
    if (!toast) return;

    remainingTimeRef.current = duration;
    startTimeRef.current = Date.now();
    setIsPaused(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast, duration, onClose]);

  const handleMouseEnter = () => {
    if (!toast) return;
    setIsPaused(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    if (!toast) return;
    setIsPaused(false);
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onClose();
    }, remainingTimeRef.current);
  };

  if (!toast) return null;

  const kind = toast.kind || 'invoice';

  // Thème visuel selon la nature de l'opération
  const theme = {
    invoice: {
      border: 'border-emerald-500/40 dark:border-emerald-500/50',
      glow: 'shadow-[0_15px_40px_-8px_rgba(16,185,129,0.35)]',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      progress: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400',
      Icon: CheckCircle2,
    },
    quote: {
      border: 'border-purple-500/40 dark:border-purple-500/50',
      glow: 'shadow-[0_15px_40px_-8px_rgba(168,85,247,0.35)]',
      iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      progress: 'bg-gradient-to-r from-purple-500 via-fuchsia-400 to-indigo-400',
      Icon: FileText,
    },
    draft: {
      border: 'border-amber-500/40 dark:border-amber-500/50',
      glow: 'shadow-[0_15px_40px_-8px_rgba(245,158,11,0.25)]',
      iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      progress: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400',
      Icon: FileText,
    },
    payment: {
      border: 'border-teal-500/40 dark:border-teal-500/50',
      glow: 'shadow-[0_15px_40px_-8px_rgba(20,184,166,0.35)]',
      iconBg: 'bg-teal-500/15 border-teal-500/30 text-teal-400',
      badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      progress: 'bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400',
      Icon: Wallet,
    },
    update: {
      border: 'border-blue-500/40 dark:border-blue-500/50',
      glow: 'shadow-[0_15px_40px_-8px_rgba(59,130,246,0.35)]',
      iconBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
      badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      progress: 'bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-400',
      Icon: Pencil,
    },
    delete: {
      border: 'border-rose-500/40 dark:border-rose-500/50',
      glow: 'shadow-[0_15px_40px_-8px_rgba(244,63,94,0.35)]',
      iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      progress: 'bg-gradient-to-r from-rose-500 via-pink-400 to-red-400',
      Icon: Trash2,
    },
    warning: {
      border: 'border-amber-500/40 dark:border-amber-500/50',
      glow: 'shadow-[0_15px_40px_-8px_rgba(245,158,11,0.35)]',
      iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      progress: 'bg-gradient-to-r from-amber-500 to-yellow-400',
      Icon: AlertTriangle,
    },
    error: {
      border: 'border-red-500/40 dark:border-red-500/50',
      glow: 'shadow-[0_15px_40px_-8px_rgba(239,68,68,0.35)]',
      iconBg: 'bg-red-500/15 border-red-500/30 text-red-400',
      badge: 'bg-red-500/15 text-red-300 border-red-500/30',
      progress: 'bg-red-500',
      Icon: AlertCircle,
    },
    success: {
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_15px_40px_-8px_rgba(16,185,129,0.3)]',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      progress: 'bg-emerald-500',
      Icon: CheckCircle2,
    },
    info: {
      border: 'border-indigo-500/40',
      glow: 'shadow-[0_15px_40px_-8px_rgba(99,102,241,0.3)]',
      iconBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      progress: 'bg-indigo-500',
      Icon: Sparkles,
    },
  }[kind] || {
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_15px_40px_-8px_rgba(16,185,129,0.3)]',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    progress: 'bg-emerald-500',
    Icon: CheckCircle2,
  };

  const IconComponent = theme.Icon;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed z-[9999] top-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 sm:max-w-md w-auto pointer-events-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border ${theme.border} ${theme.glow} p-4 sm:p-4.5 text-white shadow-2xl transition-all duration-300 animate-toast-in`}
      >
        <div className="flex items-start gap-3.5">
          {/* Badge Icône avec halo */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${theme.iconBg} relative group shadow-sm`}
          >
            <IconComponent className="w-5 h-5 animate-pulse" />
          </div>

          {/* Contenu textuel */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {toast.title}
              </h4>
              {toast.number && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${theme.badge}`}
                >
                  {toast.number}
                </span>
              )}
            </div>

            {toast.message && (
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mt-1">
                {toast.message}
              </p>
            )}

            {toast.amount !== undefined && toast.amount > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Montant total :</span>
                <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {formatFCFA(toast.amount)}
                </span>
              </div>
            )}
          </div>

          {/* Bouton Fermer */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la notification"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barre de progression avec compte à rebours */}
        <div className="absolute left-0 right-0 bottom-0 h-1 bg-white/10 overflow-hidden">
          <div
            className={`h-full ${theme.progress}`}
            style={{
              animation: `progressShrink ${duration}ms linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      </div>
    </div>
  );
};
