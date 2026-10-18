'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Printer,
  Share2,
  Mail,
  CheckCircle2,
  Calendar,
  Building,
  User,
  ShieldCheck,
  Pencil,
  BellRing,
} from 'lucide-react';
import { Invoice } from '@/lib/types';
import { formatFCFA, formatDateFR } from '@/lib/money/format';
import { StatusBadge } from '@/components/ui/Badge';
import { RelanceModal } from '@/components/invoices/RelanceModal';

interface InvoicePreviewModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  onClose,
}) => {
  const [isRelanceOpen, setIsRelanceOpen] = useState(false);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const text = `Bonjour ${invoice.client.name}, voici la facture ${invoice.number} d'un montant de ${formatFCFA(invoice.total)} émise par OMEGA FACTURE.`;
    const cleanPhone = invoice.client.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Action Bar matching screenshot */}
        <div className="px-6 py-4 bg-white dark:bg-[#111622] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Aperçu du Document
            </h3>
            <StatusBadge status={invoice.status} />
          </div>

          <div className="flex items-center gap-2">
            {invoice.status === 'overdue' && (
              <button
                type="button"
                onClick={() => setIsRelanceOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
                title="Relancer le client"
              >
                <BellRing className="w-3.5 h-3.5 animate-pulse" />
                <span>Relancer</span>
              </button>
            )}
            {invoice.status === 'draft' && (
              <Link
                href={`/invoices/${invoice.id}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Modifier ce brouillon</span>
              </Link>
            )}
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-100/80 dark:bg-[#080b11]">
          {/* A4 Sheet Container */}
          <div className="w-full max-w-[760px] bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-paper border border-slate-200/80 select-text font-sans">
            {/* Header: Title, Number, and Company Logo */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-8 mb-8">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600 mb-1 block">
                  Document Officiel
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  FACTURE
                </h1>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                  N° {invoice.number}
                </p>
              </div>

              {/* Company Logo Badge */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3v18" />
                    <path d="M3 12h18" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-slate-900 text-sm tracking-tight">
                    OMEGA FACTURE
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Bénin & UEMOA
                  </div>
                </div>
              </div>
            </div>

            {/* Billed By & Billed To columns (styled from screenshot) */}
            <div className="grid grid-cols-2 gap-8 pb-8 border-b border-slate-100 text-xs">
              {/* Emetteur */}
              <div>
                <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Émis par :
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  MONROY Business Solutions
                </div>
                <div className="text-slate-600 mt-1 space-y-0.5">
                  <p>Allada, République du Bénin</p>
                  <p>IFU : 0202110485960 — RCCM : RB/COT/21 B 1042</p>
                  <p>Email : jobovog@gmail.com</p>
                  <p>Tél : +229 01 95 44 44 30</p>
                </div>
              </div>

              {/* Client */}
              <div>
                <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Facturé à :
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {invoice.client.company}
                </div>
                <div className="text-slate-600 mt-1 space-y-0.5">
                  <p>À l’attention de : {invoice.client.name}</p>
                  <p>{invoice.client.city}, {invoice.client.country}</p>
                  {invoice.client.taxId && <p>{invoice.client.taxId}</p>}
                  <p>Email : {invoice.client.email}</p>
                  <p>Tél : {invoice.client.phone}</p>
                </div>
              </div>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-2 gap-8 py-5 border-b border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Date d’émission :</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatDateFR(invoice.issueDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Date d’échéance :</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatDateFR(invoice.dueDate)}
                </span>
              </div>
            </div>

            {/* Line Items Table (styled exactly from screenshot) */}
            <div className="py-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                    <th className="py-3 pr-4">Description de la prestation</th>
                    <th className="py-3 px-3 text-center">Qté</th>
                    <th className="py-3 px-3 text-right">TVA</th>
                    <th className="py-3 pl-4 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 pr-4 font-semibold text-slate-900">
                        {item.description}
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-600">
                        {item.vatRate}%
                      </td>
                      <td className="py-3.5 pl-4 text-right font-bold text-slate-900">
                        {formatFCFA(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-slate-200 pt-5 flex justify-end">
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total HT :</span>
                  <span className="font-semibold text-slate-900">
                    {formatFCFA(invoice.subtotal)}
                  </span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Remise commerciale :</span>
                    <span className="font-semibold">
                      - {formatFCFA(invoice.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>TVA (18% UEMOA) :</span>
                  <span className="font-semibold text-slate-900">
                    {formatFCFA(invoice.vatAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 border-t-2 border-slate-900 pt-2.5">
                  <span>Total TTC :</span>
                  <span className="text-brand-600">
                    {formatFCFA(invoice.total)}
                  </span>
                </div>

                {invoice.amountPaid > 0 && (
                  <>
                    <div className="flex justify-between text-emerald-600 pt-1 text-xs font-semibold">
                      <span>Acompte déjà réglé :</span>
                      <span>{formatFCFA(invoice.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1">
                      <span>Reste à payer :</span>
                      <span>{formatFCFA(invoice.total - invoice.amountPaid)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment instructions & Signature (matching screenshot) */}
            <div className="mt-10 pt-6 border-t border-slate-100 grid grid-cols-2 gap-6 text-xs">
              <div>
                <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Moyens de Règlement Acceptés :
                </span>
                <p className="font-semibold text-slate-800">
                  Mobile Money (MTN / Moov) : +229 01 95 44 44 30
                </p>
                <p className="text-slate-500 mt-0.5">
                  Virement bancaire : Bank of Africa (BOA) Bénin
                </p>
                <p className="text-[11px] text-slate-400 mt-2 italic">
                  Arrêtée la présente facture à la somme exacte de {formatFCFA(invoice.total)}.
                </p>
              </div>

              {/* Signature block */}
              <div className="text-right flex flex-col items-end justify-between">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Pour OMEGA FACTURE
                  </span>
                  <div className="text-brand-700 italic font-serif text-lg tracking-wider pt-2">
                    Monroy J.
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Signature & Cachet Électronique
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Document certifié conforme UEMOA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Relance Modal */}
      <RelanceModal
        invoice={invoice}
        isOpen={isRelanceOpen}
        onClose={() => setIsRelanceOpen(false)}
      />
    </div>
  );
};
