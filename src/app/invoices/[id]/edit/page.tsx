'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  ChevronRight,
  User,
  Building2,
  Calendar,
  Hash,
  Trash2,
  Plus,
  Send,
  Save,
  Printer,
  Mail,
  ChevronDown,
  Sparkles,
  Layers,
  Percent,
  AlertCircle,
  X,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import { calculateInvoiceTotals, LineItemInput } from '@/lib/invoice/calc';
import { formatFCFA, formatDateFR } from '@/lib/money/format';
import { NewClientModal } from '@/components/clients/NewClientModal';
import { DocumentKind } from '@/lib/types';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id as string;


  const { getInvoice, updateInvoice, clients } = useInvoices();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [documentKind, setDocumentKind] = useState<DocumentKind>('invoice');

  // Form states
  const [sellerName, setSellerName] = useState('MONROY Business Solutions');
  const [sellerEmail, setSellerEmail] = useState('jobovog@gmail.com');
  const [sellerAddress, setSellerAddress] = useState('Allada, République du Bénin');

  const [selectedClientId, setSelectedClientId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [currency, setCurrency] = useState('FCFA');

  const [items, setItems] = useState<LineItemInput[]>([]);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Load existing invoice data
  useEffect(() => {
    if (!invoiceId) return;
    const inv = getInvoice(invoiceId);
    if (inv) {
      if (inv.documentKind) {
        setDocumentKind(inv.documentKind);
      } else if (inv.number.startsWith('DEV-')) {
        setDocumentKind('quote');
      } else if (inv.number.startsWith('PRO-')) {
        setDocumentKind('proforma');
      } else {
        setDocumentKind('invoice');
      }
      setSelectedClientId(inv.clientId || inv.client.id);
      setIssueDate(inv.issueDate);
      setDueDate(inv.dueDate);
      setInvoiceNumber(inv.number);
      setCurrency(inv.currency === 'XOF' ? 'FCFA' : inv.currency);
      setItems(
        inv.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discountPct: it.discountPct || 0,
          vatRate: it.vatRate,
        }))
      );
      if (inv.discount && inv.discount > 0) {
        setHasDiscount(true);
        setDiscountAmount(inv.discount);
      }
    }
  }, [invoiceId, getInvoice]);

  const currentClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || clients[0];
  }, [clients, selectedClientId]);

  const totals = useMemo(() => {
    return calculateInvoiceTotals(items, hasDiscount ? discountAmount : 0);
  }, [items, hasDiscount, discountAmount]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountPct: 0,
        vatRate: 18,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof LineItemInput, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    if (!invoiceId) return;
    updateInvoice(invoiceId, {
      clientId: selectedClientId,
      client: currentClient,
      documentKind,
      issueDate,
      dueDate,
      number: invoiceNumber,
      currency: currency === 'FCFA' ? 'XOF' : currency,
      subtotal: totals.subtotalHT,
      discount: totals.discountAmount,
      vatAmount: totals.vatAmount,
      total: totals.totalTTC,
      items: items.map((it, idx) => ({
        id: `item-${idx + 1}`,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountPct: it.discountPct || 0,
        vatRate: it.vatRate,
        total: Math.round(it.quantity * it.unitPrice * (1 - (it.discountPct || 0) / 100)),
      })),
      status: 'draft',
    });
    const label = documentKind === 'quote' ? 'Brouillon devis' : documentKind === 'proforma' ? 'Brouillon proforma' : 'Brouillon facture';
    alert(`${label} ${invoiceNumber} mis à jour avec succès !`);
    router.push('/invoices');
  };

  const handleFinalizeAndSend = () => {
    if (!invoiceId) return;
    updateInvoice(invoiceId, {
      clientId: selectedClientId,
      client: currentClient,
      documentKind,
      issueDate,
      dueDate,
      number: invoiceNumber,
      currency: currency === 'FCFA' ? 'XOF' : currency,
      subtotal: totals.subtotalHT,
      discount: totals.discountAmount,
      vatAmount: totals.vatAmount,
      total: totals.totalTTC,
      items: items.map((it, idx) => ({
        id: `item-${idx + 1}`,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountPct: it.discountPct || 0,
        vatRate: it.vatRate,
        total: Math.round(it.quantity * it.unitPrice * (1 - (it.discountPct || 0) / 100)),
      })),
      status: 'sent',
    });
    const label = documentKind === 'quote' ? 'Devis' : documentKind === 'proforma' ? 'Facture Proforma' : 'Facture';
    alert(`${label} ${invoiceNumber} émis et passé en statut 'Envoyée' !`);
    router.push('/invoices');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePath="/invoices" />

      <div className="lg:pl-72 flex flex-col flex-1">
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link href="/" className="text-slate-400 hover:text-slate-600 font-medium">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link href="/invoices" className="text-slate-400 hover:text-slate-600 font-medium">Factures</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Modifier le Brouillon ({invoiceNumber})
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 hidden sm:inline">
              Afficher l’Aperçu
            </span>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                showPreview ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={showPreview}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ${
                  showPreview ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            {/* Close / Return to Dashboard cross button */}
            <Link
              href="/dashboard"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 dark:active:bg-rose-900/60 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shadow-2xs shrink-0 cursor-pointer touch-manipulation relative z-30 select-none"
              title="Fermer et retourner au Tableau de bord"
              aria-label="Fermer et retourner au Tableau de bord"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300 pointer-events-none shrink-0" />
              <span className="hidden sm:inline font-semibold pointer-events-none">Fermer</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto min-w-0">
          {/* Alert: Editing Draft */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-amber-800 dark:text-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                Vous modifiez actuellement le <strong>brouillon {invoiceNumber}</strong>. Les modifications ne figeront le document que lors de son émission finale.
              </span>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              Brouillon
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Left Column */}
            <div className={`${showPreview ? 'lg:col-span-7 xl:col-span-6' : 'lg:col-span-12'} space-y-6`}>
              <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-600" />
                  Informations de la Facture
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Émetteur *
                    </label>
                    <input
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium"
                    />
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Facturé à (Client) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsClientModalOpen(true)}
                        className="text-[11px] font-bold text-brand-600 hover:underline"
                      >
                        + Nouveau client
                      </button>
                    </div>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium cursor-pointer"
                    >
                      {clients.map((cli) => (
                        <option key={cli.id} value={cli.id}>
                          {cli.company} ({cli.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Date d’émission *
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Date d’échéance *
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Numéro de Facture
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-600" />
                    Lignes de Facturation
                  </h2>
                  <span className="text-xs font-semibold text-slate-500">Devise : {currency}</span>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => {
                    const lineTotal = Math.round(
                      (item.quantity || 0) * (item.unitPrice || 0) * (1 - (item.discountPct || 0) / 100)
                    );
                    return (
                      <div
                        key={index}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            Article {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length <= 1}
                            className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl font-medium"
                        />

                        <div className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-3">
                            <label className="text-[10px] text-slate-400 block mb-0.5">Qté</label>
                            <input
                              type="number"
                              min="0.1"
                              step="0.5"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-2 py-1.5 text-xs text-center font-bold bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-lg"
                            />
                          </div>

                          <div className="col-span-4">
                            <label className="text-[10px] text-slate-400 block mb-0.5">TVA</label>
                            <select
                              value={item.vatRate}
                              onChange={(e) =>
                                handleUpdateItem(index, 'vatRate', parseInt(e.target.value, 10))
                              }
                              className="w-full px-2 py-1.5 text-xs font-semibold bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
                            >
                              <option value={18}>18% (UEMOA)</option>
                              <option value={0}>0% (Exonéré)</option>
                            </select>
                          </div>

                          <div className="col-span-5">
                            <label className="text-[10px] text-slate-400 block mb-0.5">Prix (FCFA)</label>
                            <input
                              type="number"
                              step="1"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUpdateItem(index, 'unitPrice', parseInt(e.target.value, 10) || 0)
                              }
                              className="w-full px-2 py-1.5 text-xs text-right font-bold bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="text-right text-xs text-slate-500">
                          Total ligne : <strong className="text-slate-900 dark:text-white font-bold">{formatFCFA(lineTotal)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand-600 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une ligne</span>
                </button>

                {/* Discount */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDiscount}
                      onChange={(e) => setHasDiscount(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600"
                    />
                    <span>Remise commerciale</span>
                  </label>
                  {hasDiscount && (
                    <input
                      type="number"
                      step="1"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseInt(e.target.value, 10) || 0)}
                      className="w-36 px-2.5 py-1 text-xs text-right font-bold text-rose-600 border border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Preview */}
            {showPreview && (
              <div className="lg:col-span-5 xl:col-span-6 sticky top-20 space-y-4">
                <div className="flex items-center justify-between bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card">
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">
                    Aperçu
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveDraft}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Sauvegarder</span>
                    </button>
                    <button
                      onClick={handleFinalizeAndSend}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Émettre la facture</span>
                    </button>
                  </div>
                </div>

                {/* A4 Sheet */}
                <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-paper border border-slate-200/90 text-xs select-text">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block mb-1">
                        Brouillon en cours de modification
                      </span>
                      <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {documentKind === 'quote' ? 'DEVIS ESTIMATIF' : documentKind === 'proforma' ? 'FACTURE PROFORMA' : 'FACTURE'}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">N° {invoiceNumber}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#004D38] flex items-center justify-center text-[#25E098]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Émis par :</span>
                      <div className="font-bold text-slate-900 text-xs">{sellerName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5"><p>{sellerEmail}</p><p>{sellerAddress}</p></div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        {documentKind === 'quote' ? 'Devis établi pour :' : documentKind === 'proforma' ? 'Proforma établie pour :' : 'Facturé à :'}
                      </span>
                      <div className="font-bold text-slate-900 text-xs">{currentClient?.company}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5"><p>{currentClient?.email}</p><p>{currentClient?.city}, {currentClient?.country}</p></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Date d’émission :</span>
                      <span className="font-bold text-slate-800 text-xs">{formatDateFR(issueDate)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {documentKind === 'quote' ? 'Validité de l’offre :' : documentKind === 'proforma' ? 'Date d’exigibilité :' : 'Date d’échéance :'}
                      </span>
                      <span className="font-bold text-slate-800 text-xs">{formatDateFR(dueDate)}</span>
                    </div>
                  </div>

                  <div className="py-4">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[10px]">
                          <th className="py-2 pr-2">Article</th>
                          <th className="py-2 px-2 text-center">Qté</th>
                          <th className="py-2 px-2 text-right">TVA</th>
                          <th className="py-2 pl-2 text-right">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((it, idx) => {
                          const itemTotal = Math.round(
                            (it.quantity || 0) * (it.unitPrice || 0) * (1 - (it.discountPct || 0) / 100)
                          );
                          return (
                            <tr key={idx}>
                              <td className="py-2.5 pr-2 font-medium text-slate-800">{it.description}</td>
                              <td className="py-2.5 px-2 text-center text-slate-600">{it.quantity}</td>
                              <td className="py-2.5 px-2 text-right text-slate-600">{it.vatRate}%</td>
                              <td className="py-2.5 pl-2 text-right font-bold text-slate-900">{formatFCFA(itemTotal)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-1.5 text-right">
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Sous-total :</span>
                      <span className="font-semibold text-slate-900">{formatFCFA(totals.subtotalHT)}</span>
                    </div>
                    {totals.discountAmount > 0 && (
                      <div className="flex justify-between text-rose-600 text-xs">
                        <span>Remise :</span>
                        <span className="font-semibold">- {formatFCFA(totals.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>TVA (18%) :</span>
                      <span className="font-semibold text-slate-900">{formatFCFA(totals.vatAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                      <span>Total TTC :</span>
                      <span className="text-brand-600 text-base">{formatFCFA(totals.totalTTC)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <NewClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientCreated={(created) => setSelectedClientId(created.id)}
      />
    </div>
  );
}
