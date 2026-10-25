'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, CreditCard, DollarSign, Calendar, Hash, Check } from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import { formatFCFA } from '@/lib/money/format';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInvoiceId?: string;
}

function getTodayDate(): string {
  try {
    const now = new Date();
    const yy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  } catch {
    return '2026-10-24';
  }
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  isOpen,
  onClose,
  initialInvoiceId,
}) => {
  const { invoices, addPayment, showToast } = useInvoices();

  // Seules les véritables FACTURES en attente de règlement avec un solde restant strictement positif (> 0 FCFA)
  // Les devis (DEV-*) et les factures déjà soldées (solde = 0 FCFA ou statut 'paid') sont formellement exclus
  const payableInvoices = useMemo(() => {
    return (invoices || []).filter((inv) => {
      // Si une facture spécifique est visée via initialInvoiceId
      const isTarget = initialInvoiceId && inv.id === initialInvoiceId;

      // 1. Exclure formellement les devis estimatifs
      const isQuote = inv.documentKind === 'quote' || inv.number.startsWith('DEV-');
      if (isQuote && !isTarget) return false;

      // 2. Exclure les factures déjà soldées (statut 'paid')
      if (inv.status === 'paid') return false;

      // 3. Exclure les brouillons purs non émis
      if (inv.status === 'draft' && !isTarget) return false;

      // 4. Calculer le montant restant dû : doit être strictement supérieur à 0 FCFA
      const remainingAmount = inv.total - (inv.amountPaid || 0);
      return remainingAmount > 0;
    });
  }, [invoices, initialInvoiceId]);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<'mobile_money' | 'bank_transfer' | 'cash' | 'check'>('mobile_money');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(() => getTodayDate());

  useEffect(() => {
    if (isOpen) {
      setDate(getTodayDate());
      if (initialInvoiceId) {
        setSelectedInvoiceId(initialInvoiceId);
        const inv = invoices.find((i) => i.id === initialInvoiceId);
        if (inv) {
          const remaining = Math.max(0, inv.total - (inv.amountPaid || 0));
          setAmount(remaining);
        }
      } else {
        setSelectedInvoiceId('');
        setAmount(0);
        setReference('');
      }
    }
  }, [isOpen, initialInvoiceId, invoices]);

  // Fermeture par touche Échap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentInvoice =
    payableInvoices.find((i) => i.id === selectedInvoiceId) ||
    invoices.find((i) => i.id === selectedInvoiceId) ||
    null;

  const currentRemaining = currentInvoice
    ? Math.max(0, currentInvoice.total - (currentInvoice.amountPaid || 0))
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || !currentInvoice) {
      showToast({
        title: 'Sélection requise',
        message: 'Veuillez sélectionner une facture à payer.',
        kind: 'warning',
        duration: 4000,
      });
      return;
    }
    if (amount <= 0) {
      showToast({
        title: 'Montant invalide',
        message: 'Veuillez indiquer un montant supérieur à 0 FCFA.',
        kind: 'warning',
        duration: 4000,
      });
      return;
    }
    if (currentRemaining <= 0) {
      showToast({
        title: 'Facture soldée',
        message: 'Cette facture est déjà intégralement réglée.',
        kind: 'info',
        duration: 4000,
      });
      return;
    }
    if (amount > currentRemaining) {
      showToast({
        title: 'Montant excessif',
        message: `Le montant (${formatFCFA(amount)}) ne peut pas excéder le solde restant dû de ${formatFCFA(currentRemaining)}.`,
        kind: 'warning',
        duration: 4500,
      });
      return;
    }

    addPayment({
      invoiceId: currentInvoice.id,
      invoiceNumber: currentInvoice.number,
      clientName: currentInvoice.client.name,
      amount: Math.max(1, Math.round(amount)),
      method,
      reference: reference.trim() || `PAY-${Date.now().toString().slice(-6)}`,
      date,
    });

    showToast({
      title: 'Paiement enregistré avec succès',
      message: `Règlement de ${formatFCFA(amount)} enregistré pour la facture ${currentInvoice.number}.`,
      kind: 'payment',
      number: currentInvoice.number,
      amount: amount,
      duration: 4500,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#111622] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Enregistrer un Règlement
              </h3>
              <p className="text-xs text-slate-400">
                Factures en attente de paiement (solde &gt; 0 FCFA)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 active:text-slate-900 hover:bg-slate-100 active:bg-slate-200 dark:hover:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 transition-all active:scale-95 cursor-pointer touch-manipulation shrink-0"
            aria-label="Fermer la fenêtre"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Facture à payer *
            </label>
            <select
              value={selectedInvoiceId}
              required
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedInvoiceId(newId);
                const inv = payableInvoices.find((i) => i.id === newId) || invoices.find((i) => i.id === newId);
                if (inv) {
                  const remaining = Math.max(0, inv.total - (inv.amountPaid || 0));
                  setAmount(remaining);
                } else {
                  setAmount(0);
                }
              }}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
            >
              {payableInvoices.length === 0 ? (
                <option value="">-- Aucune facture en attente de paiement (Toutes soldées) --</option>
              ) : (
                <option value="">-- Sélectionner la facture à payer ({payableInvoices.length}) --</option>
              )}
              {payableInvoices.map((inv) => {
                const remaining = Math.max(0, inv.total - (inv.amountPaid || 0));
                return (
                  <option key={inv.id} value={inv.id}>
                    {inv.number} — {inv.client.company || inv.client.name} ({formatFCFA(remaining)} restant)
                  </option>
                );
              })}
            </select>

            {/* Fiche récapitulative de la facture sélectionnée */}
            {currentInvoice && (
              <div className="mt-2.5 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] space-y-1 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500">Client :</span>
                  <strong className="text-slate-900 dark:text-white">{currentInvoice.client.company} ({currentInvoice.client.name})</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-slate-500">Montant total TTC :</span>
                  <span>{formatFCFA(currentInvoice.total)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-slate-500">Déjà réglé :</span>
                  <span>{formatFCFA(currentInvoice.amountPaid || 0)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40 font-bold text-xs">
                  <span className="text-slate-800 dark:text-slate-200">Solde restant à payer :</span>
                  <span className="text-emerald-700 dark:text-emerald-300">
                    {formatFCFA(currentRemaining)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Montant encaissé (FCFA) *
              </label>
              <input
                type="number"
                min="1"
                max={currentRemaining > 0 ? currentRemaining : undefined}
                step="1"
                required
                placeholder="Montant en FCFA"
                value={amount || ''}
                onChange={(e) => setAmount(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-right font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Date de paiement *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Mode de paiement
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold cursor-pointer"
              >
                <option value="mobile_money">Mobile Money (MTN/Moov)</option>
                <option value="bank_transfer">Virement Bancaire</option>
                <option value="cash">Espèces</option>
                <option value="check">Chèque</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                N° de Transaction / Réf.
              </label>
              <input
                type="text"
                placeholder="Ex: MTN-891024"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={payableInvoices.length === 0 && !selectedInvoiceId}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Valider l'Encaissement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

