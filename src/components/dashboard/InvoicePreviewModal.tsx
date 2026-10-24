'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Menu,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ArrowLeftRight,
  BarChart3,
  Settings,
  Plus,
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
  const router = useRouter();
  const [isRelanceOpen, setIsRelanceOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  if (!invoice) return null;

  const docKind =
    invoice.documentKind ||
    (invoice.number.startsWith('DEV-')
      ? 'quote'
      : invoice.number.startsWith('PRO-')
      ? 'proforma'
      : 'invoice');

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const docLabel =
      docKind === 'quote'
        ? 'votre devis'
        : docKind === 'proforma'
        ? 'votre facture proforma'
        : 'votre facture';
    const text = `Bonjour ${invoice.client.name}, voici ${docLabel} ${invoice.number} d'un montant de ${formatFCFA(invoice.total)} émis(e) par OMEGA FACTURE. Merci de votre confiance !`;
    const cleanPhone = invoice.client.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-100 dark:bg-[#0c1017] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        {/* Top Action & Navigation Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-white dark:bg-[#111622] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Quick Navigation Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNavMenuOpen(!navMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer ring-1 ring-slate-200 dark:ring-slate-700 shadow-2xs active:scale-95"
                title="Navigation rapide"
              >
                <Menu className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span className="hidden sm:inline">Menu</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    navMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {navMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNavMenuOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-[#111622] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                      <span>Navigation OMEGA</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 font-semibold">Accès Direct</span>
                    </div>

                    <div className="space-y-0.5">
                      {[
                        { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
                        { label: 'Factures & Devis', href: '/invoices', icon: FileText },
                        { label: 'Clients & Contacts', href: '/clients', icon: Users },
                        { label: 'Produits & Services', href: '/products', icon: Package },
                        { label: 'Paiements & Flux', href: '/payments', icon: ArrowLeftRight },
                        { label: 'Rapports financiers & KPI', href: '/reports', icon: BarChart3 },
                        { label: 'Paramètres Organisation', href: '/settings', icon: Settings },
                      ].map((m) => {
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.label}
                            type="button"
                            onClick={() => {
                              setNavMenuOpen(false);
                              onClose();
                              router.push(m.href);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left font-medium"
                          >
                            <Icon className="w-4 h-4 text-slate-400" />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setNavMenuOpen(false);
                          onClose();
                          router.push('/invoices/new?kind=invoice');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold hover:bg-brand-100 transition-colors cursor-pointer text-left text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Nouvelle Facture</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNavMenuOpen(false);
                          onClose();
                          router.push('/invoices/new?kind=quote');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-100 transition-colors cursor-pointer text-left text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Nouveau Devis</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNavMenuOpen(false);
                          onClose();
                          router.push('/invoices/new?kind=proforma');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold hover:bg-sky-100 transition-colors cursor-pointer text-left text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Nouvelle Proforma</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  docKind === 'quote'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300'
                    : docKind === 'proforma'
                    ? 'bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300'
                    : 'bg-brand-100 text-brand-800 border border-brand-200 dark:bg-brand-950/60 dark:text-brand-300'
                }`}
              >
                {docKind === 'quote' ? 'Devis' : docKind === 'proforma' ? 'Proforma' : 'Facture'}
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {invoice.number}
              </h3>
              <StatusBadge status={invoice.status} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {invoice.status === 'overdue' && (
              <button
                type="button"
                onClick={() => setIsRelanceOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
                title="Relancer le client"
              >
                <BellRing className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">Relancer</span>
              </button>
            )}
            {invoice.status === 'draft' && (
              <Link
                href={`/invoices/${invoice.id}/edit`}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modifier</span>
              </Link>
            )}
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Envoyer par WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              title="Imprimer ou enregistrer en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 active:bg-slate-200 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer touch-manipulation z-20"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-6 md:p-8 flex justify-center items-start bg-slate-200/70 dark:bg-[#070a0f] min-h-0">
          {/* A4 Sheet Container */}
          <div className="w-full max-w-[800px] h-fit min-h-full bg-white text-slate-900 rounded-2xl p-4 sm:p-8 md:p-12 shadow-paper border border-slate-200/80 select-text font-sans my-0 sm:my-2">
            {/* Header: Title, Number, and Company Logo */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-6 sm:pb-8 mb-6 sm:mb-8">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600 mb-1 block">
                  Document Officiel
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {docKind === 'quote' ? 'DEVIS ESTIMATIF' : docKind === 'proforma' ? 'FACTURE PROFORMA' : 'FACTURE'}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                  N° {invoice.number}
                </p>
              </div>

              {/* Company Logo Badge */}
              <div className="flex items-center gap-3">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 font-bold text-lg">
                  Ω
                </div>
                <div className="text-right hidden sm:block">
                  <div className="font-extrabold text-slate-900 text-sm tracking-tight">
                    OMEGA FACTURE
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Bénin & UEMOA
                  </div>
                </div>
              </div>
            </div>

            {/* Billed By & Billed To columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pb-6 sm:pb-8 border-b border-slate-100 text-xs">
              {/* Emetteur */}
              <div className="p-3 sm:p-0 rounded-xl bg-slate-50/60 sm:bg-transparent border sm:border-0 border-slate-100">
                <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1 sm:mb-2">
                  Émis par :
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  MONROY Business Solutions
                </div>
                <div className="text-slate-600 mt-1 space-y-0.5 leading-relaxed">
                  <p>Allada & Cotonou, République du Bénin</p>
                  <p>IFU : 0202110485960 — RCCM : RB/COT/21 B 1042</p>
                  <p>Email : jobovog@gmail.com</p>
                  <p>Tél : +229 01 95 44 44 30</p>
                </div>
              </div>

              {/* Client */}
              <div className="p-3 sm:p-0 rounded-xl bg-slate-50/60 sm:bg-transparent border sm:border-0 border-slate-100">
                <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1 sm:mb-2">
                  {docKind === 'quote' ? 'Devis établi pour :' : docKind === 'proforma' ? 'Proforma établie pour :' : 'Facturé à :'}
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {invoice.client.company || invoice.client.name}
                </div>
                <div className="text-slate-600 mt-1 space-y-0.5 leading-relaxed">
                  <p>À l’attention de : {invoice.client.name}</p>
                  <p>{invoice.client.city}, {invoice.client.country}</p>
                  {invoice.client.taxId && <p>IFU Client : {invoice.client.taxId}</p>}
                  <p>Email : {invoice.client.email}</p>
                  <p>Tél : {invoice.client.phone}</p>
                </div>
              </div>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-8 py-4 sm:py-5 border-b border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Date d’émission :</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatDateFR(invoice.issueDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">
                  {docKind === 'quote' ? 'Validité de l’offre :' : docKind === 'proforma' ? 'Date d’exigibilité :' : 'Date d’échéance :'}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatDateFR(invoice.dueDate)}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-6 overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[480px]">
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
              <div className="w-full sm:w-80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total HT :</span>
                  <span className="font-semibold text-slate-900">
                    {formatFCFA(invoice.subtotal)}
                  </span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Remise commerciale accordée :</span>
                    <span className="font-semibold">
                      -{formatFCFA(invoice.discount)}
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

            {/* Payment instructions & Signature */}
            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
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
                  {docKind === 'quote'
                    ? `Arrêté le présent devis à la somme de ${formatFCFA(invoice.total)}. Validité : 30 jours à compter de la date d’émission.`
                    : docKind === 'proforma'
                    ? `Arrêtée la présente facture proforma à la somme de ${formatFCFA(invoice.total)}. Délivrée pour formalités préalables.`
                    : `Arrêtée la présente facture à la somme exacte de ${formatFCFA(invoice.total)}.`}
                </p>
              </div>

              {/* Signature block */}
              <div className="text-left sm:text-right flex flex-col items-start sm:items-end justify-between">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Pour OMEGA FACTURE
                  </span>
                  <div className="text-brand-700 italic font-serif text-lg tracking-wider pt-1">
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
