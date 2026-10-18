'use client';

import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Calendar, Hash, Check } from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import { formatFCFA } from '@/lib/money/format';

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInvoiceId?: string;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  isOpen,
  onClose,
  initialInvoiceId,
}) => {
  const { invoices, addPayment } = useInvoices();

  const unpaidInvoices = invoices.filter((i) => i.status !== 'paid' && i.status !== 'draft');

  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<'mobile_money' | 'bank_transfer' | 'cash' | 'check'>('mobile_money');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState('2026-10-18');

  React.useEffect(() => {
    if (isOpen) {
      const targetId = initialInvoiceId || unpaidInvoices[0]?.id || invoices[0]?.id || '';
      setSelectedInvoiceId(targetId);
      const inv = invoices.find((i) => i.id === targetId);
      if (inv) {
        setAmount(Math.max(1, inv.total - inv.amountPaid));
      }
    }
  }, [isOpen, initialInvoiceId]);

  if (!isOpen) return null;

  const currentInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInvoice) return;

    addPayment({
      invoiceId: currentInvoice.id,
      invoiceNumber: currentInvoice.number,
      clientName: currentInvoice.client.name,
      amount: Math.max(1, Math.round(amount)),
      method,
      reference: reference.trim() || `PAY-${Date.now().toString().slice(-6)}`,
      date,
    });

    alert(`Paiement de ${formatFCFA(amount)} enregistré avec succès pour la facture ${currentInvoice.number} !`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-[#111622] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
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
                Encaissement par Mobile Money, virement ou espèces
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Facture concernée *
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => {
                setSelectedInvoiceId(e.target.value);
                const inv = invoices.find((i) => i.id === e.target.value);
                if (inv) setAmount(inv.total - inv.amountPaid);
              }}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
            >
              {invoices
                .filter((i) => i.status !== 'draft')
                .map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.number} — {inv.client.company} ({formatFCFA(inv.total - inv.amountPaid)} restant)
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Montant encaissé (FCFA) *
              </label>
              <input
                type="number"
                min="1"
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
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
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
