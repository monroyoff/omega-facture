'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  BellRing,
  AlertTriangle,
  MessageSquare,
  Mail,
  Phone,
  Send,
  Check,
  Calendar,
  Building,
  User,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { Invoice } from '@/lib/types';
import { formatFCFA, formatDateFR } from '@/lib/money/format';

interface RelanceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onRelanceSent?: (invoice: Invoice, channel: string) => void;
}

export const RelanceModal: React.FC<RelanceModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onRelanceSent,
}) => {
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [relanceSuccess, setRelanceSuccess] = useState<string | null>(null);

  const remainingAmount = useMemo(() => {
    if (!invoice) return 0;
    return Math.max(0, invoice.total - (invoice.amountPaid || 0));
  }, [invoice]);

  const daysOverdue = useMemo(() => {
    if (!invoice?.dueDate) return 0;
    try {
      const due = new Date(invoice.dueDate);
      const now = new Date('2026-10-18');
      const diff = Math.max(0, now.getTime() - due.getTime());
      return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
    } catch {
      return 1;
    }
  }, [invoice]);

  // Sync default message when invoice changes
  useEffect(() => {
    if (invoice) {
      setCustomMessage(
        `Bonjour ${invoice.client.name} (${invoice.client.company}),\n\nSauf erreur de notre part, nous constatons que la facture *${invoice.number}* d'un montant de *${formatFCFA(remainingAmount)}*, échue le ${formatDateFR(invoice.dueDate)} (soit ${daysOverdue} jours de retard), reste impayée à ce jour.\n\nMerci de bien vouloir procéder à son règlement au plus vite par Mobile Money MTN/Moov ou virement bancaire.\n\nNous restons à votre disposition pour toute question.\nCordialement,\nLa Direction Financière`
      );
      setRelanceSuccess(null);
    }
  }, [invoice, remainingAmount, daysOverdue]);

  if (!isOpen || !invoice) return null;

  const cleanPhone = invoice.client.phone.replace(/[^0-9]/g, '');

  const handleWhatsAppRelance = () => {
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`, '_blank');
    onRelanceSent?.(invoice, 'WhatsApp');
    setRelanceSuccess('Relance WhatsApp transmise avec succès !');
  };

  const handleEmailRelance = () => {
    const subject = `[RELANCE ÉCHÉANCE] Facture impayée ${invoice.number} - ${invoice.client.company}`;
    window.open(`mailto:${invoice.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(customMessage)}`, '_blank');
    onRelanceSent?.(invoice, 'Email');
    setRelanceSuccess('Relance par Email transmise avec succès !');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111622] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header with Red Warning Theme */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-b border-rose-100 dark:border-rose-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Relance Facture en Retard
                </h3>
                <span className="text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                  +{daysOverdue} j de retard
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Facture <strong className="text-slate-800 dark:text-slate-200">{invoice.number}</strong> • {invoice.client.company}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 active:text-slate-900 hover:bg-slate-100 active:bg-slate-200 dark:hover:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 transition-all active:scale-95 cursor-pointer touch-manipulation shrink-0"
            aria-label="Fermer la relance"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Success Banner if triggered */}
          {relanceSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>{relanceSuccess}</span>
            </div>
          )}

          {/* Overdue Financial Summary Card */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                Client Débiteur :
              </span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5 truncate">
                {invoice.client.name}
              </span>
              <span className="text-[11px] text-slate-500 truncate block">
                {invoice.client.company}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                Montant en Souffrance :
              </span>
              <span className="font-extrabold text-base text-rose-600 dark:text-rose-400 block mt-0.5">
                {formatFCFA(remainingAmount)}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Échue le {formatDateFR(invoice.dueDate)}
              </span>
            </div>
          </div>

          {/* Channels Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              1. Choisir le canal de relance :
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* WhatsApp direct */}
              <button
                type="button"
                onClick={handleWhatsAppRelance}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 transition-all text-left shadow-2xs group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block flex items-center gap-1">
                    <span>Relance WhatsApp</span>
                    <ExternalLink className="w-3 h-3 text-emerald-600 opacity-60" />
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                    {invoice.client.phone}
                  </span>
                </div>
              </button>

              {/* Email direct */}
              <button
                type="button"
                onClick={handleEmailRelance}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 text-blue-900 dark:text-blue-200 transition-all text-left shadow-2xs group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block flex items-center gap-1">
                    <span>Relance par Email</span>
                    <ExternalLink className="w-3 h-3 text-brand-600 opacity-60" />
                  </span>
                  <span className="text-[10px] text-blue-700 dark:text-blue-400 block truncate max-w-[130px]">
                    {invoice.client.email}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Editable Reminder Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                2. Message de relance (Personnalisable) :
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copié !' : 'Copier le texte'}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-sans leading-relaxed"
            />
          </div>

          {/* Quick Call Phone Row */}
          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-600" />
              <span className="text-amber-900 dark:text-amber-200 font-semibold">
                Contact direct : {invoice.client.phone}
              </span>
            </div>
            <a
              href={`tel:${invoice.client.phone.replace(/[^0-9+]/g, '')}`}
              className="text-[11px] font-bold text-amber-700 dark:text-amber-300 underline"
            >
              Appeler
            </a>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={handleWhatsAppRelance}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Envoyer la Relance Maintenant</span>
          </button>
        </div>
      </div>
    </div>
  );
};
