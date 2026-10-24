'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  ChevronRight,
  User,
  Building2,
  Calendar,
  Hash,
  Coins,
  Trash2,
  Plus,
  Send,
  Save,
  Printer,
  Mail,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Layers,
  Percent,
  X,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import { calculateInvoiceTotals, LineItemInput } from '@/lib/invoice/calc';
import { formatFCFA, formatDateFR } from '@/lib/money/format';
import { NewClientModal } from '@/components/clients/NewClientModal';

function calculateDateOffset(baseDate: string, days: number): string {
  try {
    const [y, m, d] = baseDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  } catch {
    return baseDate;
  }
}

function calculateMonthOffset(baseDate: string, months: number): string {
  try {
    const [y, m, d] = baseDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setMonth(date.getMonth() + months);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  } catch {
    return baseDate;
  }
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const { invoices, clients, products, addInvoice, addClient } = useInvoices();


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'standard' | 'split' | 'recurring'>('standard');

  // Split / Acompte state
  const [splitPreset, setSplitPreset] = useState<'30-70' | '40-30-30' | '50-50' | '4x25' | 'custom'>('30-70');
  const [depositPercent, setDepositPercent] = useState(30);

  // Recurrence state
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'monthly' | 'quarterly' | 'semiannual' | 'yearly'>('monthly');
  const [recurrenceDuration, setRecurrenceDuration] = useState<number>(12);
  const [autoSend, setAutoSend] = useState(true);

  // Form states
  const [sellerName, setSellerName] = useState('MONROY Business Solutions');
  const [sellerEmail, setSellerEmail] = useState('jobovog@gmail.com');
  const [sellerAddress, setSellerAddress] = useState('Allada, République du Bénin');

  // Client mode: 'existing' | 'new' (both completely empty on start!)
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  // New Client fields (all blank by default)
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientCompany, setNewClientCompany] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newClientCity, setNewClientCity] = useState<string>('Cotonou');
  const [newClientCountry, setNewClientCountry] = useState<string>('Bénin');
  const [newClientTaxId, setNewClientTaxId] = useState<string>('');

  const [issueDate, setIssueDate] = useState('2026-10-18');
  const [dueDate, setDueDate] = useState('2026-11-02');
  const [invoiceNumber, setInvoiceNumber] = useState('FAC-2026-0044');
  const [currency, setCurrency] = useState('FCFA');

  // Compute sequential invoice number safely on client mount without hydration mismatch
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      const numbers = invoices
        .map((inv) => {
          const m = inv.number.match(/FAC-\d+-(\d+)/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const maxNum = numbers.length > 0 ? Math.max(...numbers) : 43;
      setInvoiceNumber(`FAC-2026-${String(maxNum + 1).padStart(4, '0')}`);
    }
  }, [invoices]);

  // Line items state - completely empty on creation
  const [items, setItems] = useState<LineItemInput[]>([
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountPct: 0,
      vatRate: 18,
    },
  ]);

  // Discount - unchecked by default, 0 FCFA
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Selected client object
  const currentClient = useMemo(() => {
    if (clientMode === 'existing') {
      if (!selectedClientId) return null;
      return clients.find((c) => c.id === selectedClientId) || null;
    } else {
      if (!newClientName.trim() && !newClientCompany.trim()) return null;
      return {
        id: 'cli-new-temp',
        name: newClientName.trim() || newClientCompany.trim(),
        company: newClientCompany.trim() || newClientName.trim(),
        email: newClientEmail.trim() || 'contact@client.bj',
        phone: newClientPhone.trim() || '+229 01 00 00 00',
        city: newClientCity.trim() || 'Cotonou',
        country: newClientCountry.trim() || 'Bénin',
        taxId: newClientTaxId.trim() ? `IFU ${newClientTaxId.trim()}` : undefined,
      };
    }
  }, [
    clientMode,
    selectedClientId,
    clients,
    newClientName,
    newClientCompany,
    newClientEmail,
    newClientPhone,
    newClientCity,
    newClientCountry,
    newClientTaxId,
  ]);

  // Real-time financial totals
  const totals = useMemo(() => {
    return calculateInvoiceTotals(items, hasDiscount ? discountAmount : 0);
  }, [items, hasDiscount, discountAmount]);

  // Computed split schedule
  const splitSchedule = useMemo(() => {
    if (invoiceType !== 'split') return [];
    if (splitPreset === '30-70') {
      const d1 = Math.round(totals.totalTTC * 0.30);
      const d2 = totals.totalTTC - d1;
      return [
        { id: 't-1', label: '1ère Tranche (Acompte 30%)', percentage: 30, amount: d1, dueDate: issueDate },
        { id: 't-2', label: '2ème Tranche (Solde 70%)', percentage: 70, amount: d2, dueDate: dueDate },
      ];
    } else if (splitPreset === '40-30-30') {
      const d1 = Math.round(totals.totalTTC * 0.40);
      const d2 = Math.round(totals.totalTTC * 0.30);
      const d3 = totals.totalTTC - d1 - d2;
      return [
        { id: 't-1', label: '1ère Tranche (Acompte 40%)', percentage: 40, amount: d1, dueDate: issueDate },
        { id: 't-2', label: '2ème Tranche (Intermédiaire 30%)', percentage: 30, amount: d2, dueDate: calculateDateOffset(issueDate, 15) },
        { id: 't-3', label: '3ème Tranche (Solde final 30%)', percentage: 30, amount: d3, dueDate: dueDate },
      ];
    } else if (splitPreset === '50-50') {
      const d1 = Math.round(totals.totalTTC * 0.50);
      const d2 = totals.totalTTC - d1;
      return [
        { id: 't-1', label: '1ère Tranche (Acompte 50%)', percentage: 50, amount: d1, dueDate: issueDate },
        { id: 't-2', label: '2ème Tranche (Solde 50%)', percentage: 50, amount: d2, dueDate: dueDate },
      ];
    } else if (splitPreset === '4x25') {
      const q = Math.round(totals.totalTTC * 0.25);
      const remainder = totals.totalTTC - q * 3;
      return [
        { id: 't-1', label: '1ère Échéance (25% à la commande)', percentage: 25, amount: q, dueDate: issueDate },
        { id: 't-2', label: '2ème Échéance (25% à 30 jours)', percentage: 25, amount: q, dueDate: calculateDateOffset(issueDate, 30) },
        { id: 't-3', label: '3ème Échéance (25% à 60 jours)', percentage: 25, amount: q, dueDate: calculateDateOffset(issueDate, 60) },
        { id: 't-4', label: '4ème Échéance (Solde 25% à 90 jours)', percentage: 25, amount: remainder, dueDate: calculateDateOffset(issueDate, 90) },
      ];
    } else {
      const pct = Math.min(95, Math.max(5, depositPercent));
      const d1 = Math.round(totals.totalTTC * (pct / 100));
      const d2 = totals.totalTTC - d1;
      return [
        { id: 't-1', label: `Acompte initial (${pct}%)`, percentage: pct, amount: d1, dueDate: issueDate },
        { id: 't-2', label: `Solde restant (${100 - pct}%)`, percentage: 100 - pct, amount: d2, dueDate: dueDate },
      ];
    }
  }, [invoiceType, splitPreset, depositPercent, totals.totalTTC, issueDate, dueDate]);

  // Computed recurrence renewal date
  const nextRenewalDate = useMemo(() => {
    const interval =
      recurrenceFrequency === 'monthly'
        ? 1
        : recurrenceFrequency === 'quarterly'
        ? 3
        : recurrenceFrequency === 'semiannual'
        ? 6
        : 12;
    return calculateMonthOffset(issueDate, interval);
  }, [issueDate, recurrenceFrequency]);

  // Item handlers
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

  const handleAddFromCatalog = (productName: string) => {
    const prod = products.find((p) => p.name === productName);
    if (!prod) return;
    setItems((prev) => [
      ...prev,
      {
        description: prod.name,
        quantity: 1,
        unitPrice: prod.price,
        discountPct: 0,
        vatRate: prod.vat,
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

  const handleSendInvoice = () => {
    let finalClient = currentClient;
    let finalClientId = selectedClientId;

    if (!finalClient) {
      alert('Veuillez sélectionner ou renseigner un client avant d’émettre la facture.');
      return;
    }

    if (clientMode === 'new') {
      const created = addClient({
        name: newClientName.trim() || newClientCompany.trim(),
        company: newClientCompany.trim() || newClientName.trim(),
        email: newClientEmail.trim() || 'contact@client.bj',
        phone: newClientPhone.trim() || '+229 01 00 00 00',
        city: newClientCity.trim() || 'Cotonou',
        country: 'Bénin',
        taxId: newClientTaxId.trim() ? `IFU ${newClientTaxId.trim()}` : undefined,
      });
      finalClient = created;
      finalClientId = created.id;
    }

    const clientToUse: import('@/lib/types').Client = finalClient as import('@/lib/types').Client;

    const newInv = {
      id: `inv-${Date.now()}`,
      number: invoiceNumber,
      clientId: finalClientId || clientToUse.id,
      client: clientToUse,
      issueDate,
      dueDate,
      status: 'sent' as const,
      currency: currency === 'FCFA' ? 'XOF' : currency,
      subtotal: totals.subtotalHT,
      discount: totals.discountAmount,
      vatAmount: totals.vatAmount,
      total: totals.totalTTC,
      amountPaid: 0,
      type: invoiceType,
      splitSchedule: invoiceType === 'split' ? splitSchedule : undefined,
      recurrence:
        invoiceType === 'recurring'
          ? {
              frequency: recurrenceFrequency,
              intervalMonths:
                recurrenceFrequency === 'monthly'
                  ? 1
                  : recurrenceFrequency === 'quarterly'
                  ? 3
                  : recurrenceFrequency === 'semiannual'
                  ? 6
                  : 12,
              durationMonths: recurrenceDuration,
              nextRenewalDate,
              autoSend,
            }
          : undefined,
      items: items.map((it, idx) => ({
        id: `item-${idx + 1}`,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountPct: it.discountPct || 0,
        vatRate: it.vatRate,
        total: Math.round(it.quantity * it.unitPrice * (1 - (it.discountPct || 0) / 100)),
      })),
    };
    addInvoice(newInv);

    const typeMsg =
      invoiceType === 'split'
        ? `Facture d'Acompte & Paiement Échelonné (${splitSchedule.length} tranches)`
        : invoiceType === 'recurring'
        ? `Facture Récurrente (${recurrenceFrequency})`
        : 'Facture Standard';

    alert(`${typeMsg} ${invoiceNumber} d'un montant de ${formatFCFA(totals.totalTTC)} émise avec succès !`);
    router.push('/invoices');
  };

  const handleSaveDraft = () => {
    let finalClient = currentClient;
    let finalClientId = selectedClientId;

    if (!finalClient) {
      alert('Veuillez sélectionner ou renseigner un client avant d’enregistrer le brouillon.');
      return;
    }

    if (clientMode === 'new') {
      const created = addClient({
        name: newClientName.trim() || newClientCompany.trim(),
        company: newClientCompany.trim() || newClientName.trim(),
        email: newClientEmail.trim() || 'contact@client.bj',
        phone: newClientPhone.trim() || '+229 01 00 00 00',
        city: newClientCity.trim() || 'Cotonou',
        country: 'Bénin',
        taxId: newClientTaxId.trim() ? `IFU ${newClientTaxId.trim()}` : undefined,
      });
      finalClient = created;
      finalClientId = created.id;
    }

    const clientToUse: import('@/lib/types').Client = finalClient as import('@/lib/types').Client;

    const newDraft = {
      id: `inv-${Date.now()}`,
      number: invoiceNumber,
      clientId: finalClientId || clientToUse.id,
      client: clientToUse,
      issueDate,
      dueDate,
      status: 'draft' as const,
      currency: currency === 'FCFA' ? 'XOF' : currency,
      subtotal: totals.subtotalHT,
      discount: totals.discountAmount,
      vatAmount: totals.vatAmount,
      total: totals.totalTTC,
      amountPaid: 0,
      type: invoiceType,
      splitSchedule: invoiceType === 'split' ? splitSchedule : undefined,
      recurrence:
        invoiceType === 'recurring'
          ? {
              frequency: recurrenceFrequency,
              intervalMonths:
                recurrenceFrequency === 'monthly'
                  ? 1
                  : recurrenceFrequency === 'quarterly'
                  ? 3
                  : recurrenceFrequency === 'semiannual'
                  ? 6
                  : 12,
              durationMonths: recurrenceDuration,
              nextRenewalDate,
              autoSend,
            }
          : undefined,
      items: items.map((it, idx) => ({
        id: `item-${idx + 1}`,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountPct: it.discountPct || 0,
        vatRate: it.vatRate,
        total: Math.round(it.quantity * it.unitPrice * (1 - (it.discountPct || 0) / 100)),
      })),
    };
    addInvoice(newDraft);

    const typeMsg =
      invoiceType === 'split'
        ? `Brouillon échelonné (${splitSchedule.length} tranches)`
        : invoiceType === 'recurring'
        ? `Brouillon récurrent (${recurrenceFrequency})`
        : 'Brouillon standard';

    alert(`${typeMsg} ${invoiceNumber} enregistré avec succès ! Vous pourrez le modifier à tout moment.`);
    router.push('/invoices');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="/invoices"
      />

      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Top Header / Breadcrumbs */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Link
              href="/"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            <Link
              href="/"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
            >
              Factures
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Créer une Facture
            </span>
          </div>

          {/* Toggle Live Preview switch & Close button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 hidden sm:inline">
              Afficher l’Aperçu
            </span>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showPreview ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={showPreview}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
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

        {/* Main Content Area: Split View */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: The Invoice Builder Form */}
            <div className={`${showPreview ? 'lg:col-span-7 xl:col-span-6' : 'lg:col-span-12'} space-y-6`}>
              {/* Page Title & Subtitle */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Créer une Facture
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Émettez une facture professionnelle conforme UEMOA et partagez-la instantanément.
                </p>
              </div>

              {/* Segmented Control (Standard, Split, Recurring) */}
              <div className="bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center max-w-md">
                <button
                  type="button"
                  onClick={() => setInvoiceType('standard')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                    invoiceType === 'standard'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceType('split')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                    invoiceType === 'split'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Acompte / Échelonné
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceType('recurring')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                    invoiceType === 'recurring'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Récurrente
                </button>
              </div>

              {/* SPLIT / ACOMPTE SETTINGS PANEL */}
              {invoiceType === 'split' && (
                <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/25 dark:to-transparent rounded-3xl border border-amber-300/80 dark:border-amber-800/80 p-6 shadow-card space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Échéancier & Acompte</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                          Actif
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Répartissez le règlement du montant TTC ({formatFCFA(totals.totalTTC)}) en plusieurs tranches.
                      </p>
                    </div>
                  </div>

                  {/* Formules recommandées */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                      Sélectionnez la formule d'échelonnement :
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: '30-70', label: '30% + 70%', desc: '2 tranches (Standard)' },
                        { id: '40-30-30', label: '40% + 30% + 30%', desc: '3 tranches (Projets IT)' },
                        { id: '50-50', label: '50% + 50%', desc: '2 tranches égales' },
                        { id: '4x25', label: '4 x 25%', desc: '4 échéances mensuelles' },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSplitPreset(preset.id as any)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            splitPreset === preset.id
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <span className="block text-xs font-bold">{preset.label}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{preset.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Option acompte custom */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSplitPreset('custom')}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        splitPreset === 'custom'
                          ? 'border-amber-500 bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      ⚙️ Acompte Personnalisé (%)
                    </button>
                    {splitPreset === 'custom' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="5"
                          max="95"
                          step="5"
                          value={depositPercent}
                          onChange={(e) => setDepositPercent(parseInt(e.target.value, 10) || 30)}
                          className="w-20 px-2 py-1 text-xs border border-amber-300 dark:border-amber-700 rounded-lg text-center font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        <span className="text-xs text-slate-500">
                          % d'acompte (Solde restant : {100 - depositPercent}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tranches calculées en direct */}
                  <div className="space-y-2 pt-3 border-t border-amber-200/60 dark:border-amber-800/40">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Échéances calculées automatiquement :
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {splitSchedule.map((t) => (
                        <div
                          key={t.id}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {t.label}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Échéance : {formatDateFR(t.dueDate)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                              {formatFCFA(t.amount)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {t.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RECURRING SETTINGS PANEL */}
              {invoiceType === 'recurring' && (
                <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent dark:from-indigo-950/25 dark:to-transparent rounded-3xl border border-indigo-300/80 dark:border-indigo-800/80 p-6 shadow-card space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Abonnement & Facturation Récurrente</span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                          Actif
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Automatisez l'émission et l'envoi périodique à votre client.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Fréquence de facturation
                      </label>
                      <select
                        value={recurrenceFrequency}
                        onChange={(e) => setRecurrenceFrequency(e.target.value as any)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
                      >
                        <option value="monthly">Mensuelle (Chaque mois)</option>
                        <option value="quarterly">Trimestrielle (Tous les 3 mois)</option>
                        <option value="semiannual">Semestrielle (Tous les 6 mois)</option>
                        <option value="yearly">Annuelle (Chaque année)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Durée de l'engagement
                      </label>
                      <select
                        value={recurrenceDuration}
                        onChange={(e) => setRecurrenceDuration(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
                      >
                        <option value={12}>12 mois (1 an avec tacite reconduction)</option>
                        <option value={6}>6 mois</option>
                        <option value={3}>3 mois</option>
                        <option value={0}>Sans engagement (Résiliez à tout moment)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-indigo-200/60 dark:border-indigo-800/40">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        Prochaine échéance automatique : <strong className="text-indigo-600 dark:text-indigo-400">{formatDateFR(nextRenewalDate)}</strong>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Montant récurrent : {formatFCFA(totals.totalTTC)} TTC
                      </span>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={autoSend}
                        onChange={(e) => setAutoSend(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span>Envoi automatique email / WhatsApp</span>
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION 1: Invoice Information */}
              <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-600" />
                  Informations de la Facture
                </h2>

                {/* Full Name & Billed To in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name (Émetteur) */}
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3.5 bg-white dark:bg-[#111622] px-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 z-10">
                      Émetteur (Votre société) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={sellerName}
                        onChange={(e) => setSellerName(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Billed To (Client sélectionné ou nouveau) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Facturé à (Client) *
                      </label>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px]">
                        <button
                          type="button"
                          onClick={() => setClientMode('existing')}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            clientMode === 'existing'
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Client existant
                        </button>
                        <button
                          type="button"
                          onClick={() => setClientMode('new')}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            clientMode === 'new'
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          + Nouveau client
                        </button>
                      </div>
                    </div>

                    {clientMode === 'existing' ? (
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={selectedClientId}
                          onChange={(e) => setSelectedClientId(e.target.value)}
                          className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none cursor-pointer"
                        >
                          <option value="" className="text-slate-400">
                            -- Sélectionner un client enregistré ({clients.length}) --
                          </option>
                          {clients.map((cli) => (
                            <option key={cli.id} value={cli.id} className="dark:bg-slate-900">
                              {cli.company} ({cli.name})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="relative">
                            <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                              Nom du contact client *
                            </label>
                            <div className="relative">
                              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                value={newClientName}
                                placeholder="Nom et prénom..."
                                onChange={(e) => setNewClientName(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                              />
                            </div>
                          </div>

                          <div className="relative">
                            <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                              Société / Raison sociale *
                            </label>
                            <div className="relative">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                value={newClientCompany}
                                placeholder="Nom de l'entreprise..."
                                onChange={(e) => setNewClientCompany(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <input
                              type="email"
                              value={newClientEmail}
                              placeholder="Email (ex: contact@client.bj)..."
                              onChange={(e) => setNewClientEmail(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                          </div>
                          <div>
                            <input
                              type="tel"
                              value={newClientPhone}
                              placeholder="Téléphone / WhatsApp..."
                              onChange={(e) => setNewClientPhone(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates Issue & Due Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3.5 bg-white dark:bg-[#111622] px-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 z-10">
                      Date d’émission *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="absolute -top-2.5 left-3.5 bg-white dark:bg-[#111622] px-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 z-10">
                      Date d’échéance *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Invoice Number */}
                <div className="relative">
                  <label className="absolute -top-2.5 left-3.5 bg-white dark:bg-[#111622] px-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 z-10">
                    Numéro de Facture
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={invoiceNumber}
                      suppressHydrationWarning
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Invoice Items/Service */}
              <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-600" />
                    Prestations & Lignes de Facture
                  </h2>

                  {/* Currency selector matching screenshot */}
                  <div className="relative w-44">
                    <label className="absolute -top-2 left-3 bg-white dark:bg-[#111622] px-1 text-[10px] font-semibold text-slate-500 z-10">
                      Devise *
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
                    >
                      <option value="FCFA">FCFA (XOF / XAF)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const lineTotal = Math.round(
                      (item.quantity || 0) * (item.unitPrice || 0) * (1 - (item.discountPct || 0) / 100)
                    );

                    return (
                      <div
                        key={index}
                        className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 relative group"
                      >
                        {/* Item header with trash */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            Article {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length <= 1}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 transition-colors"
                            title="Supprimer cette ligne"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Item Description (matching screenshot floating label) */}
                        <div className="relative">
                          <label className="absolute -top-2.5 left-3 bg-slate-50 dark:bg-slate-900 px-1 text-[10px] font-semibold text-slate-500 z-10">
                            Description de l’article / service *
                          </label>
                          <div className="relative">
                            <Sparkles className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={item.description}
                              placeholder="Ex: Prestation informatique, vente de matériel..."
                              onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                            />
                          </div>
                        </div>

                        {/* Item QTY, Tax, and Unit Price row */}
                        <div className="grid grid-cols-12 gap-3 items-center">
                          {/* QTY */}
                          <div className="col-span-3 relative">
                            <label className="absolute -top-2 left-2.5 bg-slate-50 dark:bg-slate-900 px-1 text-[10px] font-semibold text-slate-500 z-10">
                              Qté
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={item.quantity === 0 ? '' : item.quantity}
                              placeholder="1"
                              onChange={(e) =>
                                handleUpdateItem(
                                  index,
                                  'quantity',
                                  e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-center font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                          </div>

                          {/* Tax */}
                          <div className="col-span-4 relative">
                            <label className="absolute -top-2 left-2.5 bg-slate-50 dark:bg-slate-900 px-1 text-[10px] font-semibold text-slate-500 z-10">
                              TVA
                            </label>
                            <select
                              value={item.vatRate}
                              onChange={(e) =>
                                handleUpdateItem(index, 'vatRate', parseInt(e.target.value, 10))
                              }
                              className="w-full px-2 py-2 text-xs sm:text-sm bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
                            >
                              <option value={18}>18% (UEMOA)</option>
                              <option value={0}>0% (Exonéré)</option>
                            </select>
                          </div>

                          {/* Unit Price & Total */}
                          <div className="col-span-5 relative">
                            <label className="absolute -top-2 left-2.5 bg-slate-50 dark:bg-slate-900 px-1 text-[10px] font-semibold text-slate-500 z-10">
                              Prix unitaire ({currency})
                            </label>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={item.unitPrice === 0 ? '' : item.unitPrice}
                              placeholder="0"
                              onChange={(e) =>
                                handleUpdateItem(
                                  index,
                                  'unitPrice',
                                  e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                                )
                              }
                              className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-right font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                          </div>
                        </div>

                        {/* Calculated Line Subtotal */}
                        <div className="text-right text-xs text-slate-500 dark:text-slate-400 pt-1">
                          Total ligne : <strong className="text-slate-900 dark:text-white font-bold">{formatFCFA(lineTotal)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* + Add Items button with Catalog quick-pick (matching screenshot) */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex-1 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand-600 hover:border-brand-500/50 hover:bg-brand-50/20 dark:hover:bg-brand-950/20 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter une ligne vide</span>
                    </button>

                    <div className="relative sm:w-64">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddFromCatalog(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="w-full py-3 px-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100"
                      >
                        <option value="" disabled>
                          + Choisir depuis le catalogue...
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name} ({formatFCFA(p.price)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Commercial Discount Control */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDiscount}
                      onChange={(e) => setHasDiscount(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <span>Appliquer une remise commerciale</span>
                  </label>

                  {hasDiscount && (
                    <div className="relative w-40">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={discountAmount === 0 ? '' : discountAmount}
                        placeholder="0 FCFA"
                        onChange={(e) =>
                          setDiscountAmount(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-right font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Live A4 Document Preview (matching screenshot layout) */}
            {showPreview && (
              <div className="lg:col-span-5 xl:col-span-6 sticky top-20 space-y-4">
                {/* Action Buttons matching screenshot top header */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 dark:text-white text-base">
                      Aperçu
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Imprimer / PDF"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Envoyer par email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveDraft}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                    >
                      Enregistrer Brouillon
                    </button>
                    <button
                      onClick={handleSendInvoice}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Émettre la facture</span>
                    </button>
                  </div>
                </div>

                {/* The A4 Canvas Card (Pixel-Perfect from screenshot) */}
                <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-paper border border-slate-200/90 text-xs select-text">
                  {/* Top: INVOICE title & Logo */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                          FACTURE
                        </h3>
                        {invoiceType === 'split' && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Acompte & Échelonné
                          </span>
                        )}
                        {invoiceType === 'recurring' && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Abonnement Récurrent
                          </span>
                        )}
                        {invoiceType === 'standard' && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Standard
                          </span>
                        )}
                      </div>
                      <p suppressHydrationWarning className="text-xs font-semibold text-slate-500 mt-0.5">
                        N° {invoiceNumber}
                      </p>
                    </div>

                    {/* Green geometric logo matching screenshot */}
                    <div className="w-10 h-10 rounded-xl bg-[#004D38] flex items-center justify-center text-[#25E098] shadow-sm">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                      </svg>
                    </div>
                  </div>

                  {/* Billed By & Billed To */}
                  <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Émis par :
                      </span>
                      <div className="font-bold text-slate-900 text-xs">
                        {sellerName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <p>{sellerEmail}</p>
                        <p>{sellerAddress}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Facturé à :
                      </span>
                      {currentClient ? (
                        <>
                          <div className="font-bold text-slate-900 text-xs">
                            {currentClient.company}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {currentClient.name && currentClient.name !== currentClient.company && (
                              <p>Attn : {currentClient.name}</p>
                            )}
                            {currentClient.email && <p>{currentClient.email}</p>}
                            <p>{currentClient.city}, {currentClient.country}</p>
                          </div>
                        </>
                      ) : (
                        <div className="py-2 text-[11px] text-slate-400 italic font-medium">
                          Aucun client sélectionné
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates Row */}
                  <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Date d’émission :
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        {formatDateFR(issueDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Date d’échéance :
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        {formatDateFR(dueDate)}
                      </span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="py-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Prestations & Articles :
                    </span>
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[10px]">
                          <th className="py-2 pr-2">Nom de l’article</th>
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
                              <td className="py-2.5 pr-2 font-medium text-slate-800">
                                {it.description || (
                                  <span className="text-slate-400 italic">Ligne sans désignation</span>
                                )}
                              </td>
                              <td className="py-2.5 px-2 text-center text-slate-600">
                                {it.quantity}
                              </td>
                              <td className="py-2.5 px-2 text-right text-slate-600">
                                {it.vatRate}%
                              </td>
                              <td className="py-2.5 pl-2 text-right font-bold text-slate-900">
                                {formatFCFA(itemTotal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Modalités d'échelonnement / Acompte */}
                  {invoiceType === 'split' && (
                    <div className="my-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] space-y-2">
                      <div className="flex items-center justify-between text-amber-900 font-bold">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                          <Layers className="w-3.5 h-3.5 text-amber-600" />
                          Modalités de Règlement : Échéancier ({splitSchedule.length} Tranches)
                        </span>
                        <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md font-semibold">
                          Acompte : {splitSchedule[0]?.percentage}%
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {splitSchedule.map((tranche, idx) => (
                          <div
                            key={tranche.id}
                            className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-white/90 border border-amber-100 font-medium"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-amber-500 ring-2 ring-amber-300' : 'bg-slate-300'}`} />
                              <span className="text-slate-800 font-semibold">{tranche.label}</span>
                              <span className="text-[10px] text-slate-500">
                                (Échéance : {formatDateFR(tranche.dueDate)})
                              </span>
                            </div>
                            <div className="font-extrabold text-slate-900">
                              {formatFCFA(tranche.amount)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] text-amber-800 italic pt-0.5">
                        * Le 1er versement (acompte de {splitSchedule[0]?.percentage}%) conditionne le démarrage effectif de la prestation.
                      </p>
                    </div>
                  )}

                  {/* Facturation Récurrente / Abonnement */}
                  {invoiceType === 'recurring' && (
                    <div className="my-4 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-[11px] space-y-2">
                      <div className="flex items-center justify-between text-indigo-900 font-bold">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Conditions d'Abonnement Récurrent
                        </span>
                        <span className="text-[10px] bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded-md font-semibold">
                          {recurrenceFrequency === 'monthly' ? 'Mensuel' : recurrenceFrequency === 'quarterly' ? 'Trimestriel' : recurrenceFrequency === 'semiannual' ? 'Semestriel' : 'Annuel'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Période couverte :</span>
                          <span className="font-semibold text-slate-900">
                            Du {formatDateFR(issueDate)} au {formatDateFR(nextRenewalDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Prochaine facture automatique :</span>
                          <span className="font-semibold text-indigo-700">
                            {formatDateFR(nextRenewalDate)}
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-indigo-800 italic pt-0.5">
                        * Facturation récurrente {recurrenceDuration ? `sur un engagement de ${recurrenceDuration} mois` : 'sans engagement'}. Envoi automatisé à chaque échéance.
                      </p>
                    </div>
                  )}

                  {/* Totals Summary */}
                  <div className="border-t border-slate-200 pt-4 space-y-1.5 text-right">
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Sous-total :</span>
                      <span className="font-semibold text-slate-900">
                        {formatFCFA(totals.subtotalHT)}
                      </span>
                    </div>

                    {totals.discountAmount > 0 && (
                      <div className="flex justify-between text-rose-600 text-xs">
                        <span>Remise :</span>
                        <span className="font-semibold">
                          - {formatFCFA(totals.discountAmount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>TVA (18% UEMOA) :</span>
                      <span className="font-semibold text-slate-900">
                        {formatFCFA(totals.vatAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                      <span>Total TTC :</span>
                      <span className="text-brand-600 text-base">
                        {formatFCFA(totals.totalTTC)}
                      </span>
                    </div>

                    {invoiceType === 'split' && splitSchedule[0] && (
                      <div className="pt-2 mt-2 border-t border-amber-200 space-y-1 text-right">
                        <div className="flex justify-between text-amber-800 text-xs font-bold">
                          <span>Acompte exigible immédiatement ({splitSchedule[0].percentage}%) :</span>
                          <span className="text-amber-900 font-extrabold text-sm">{formatFCFA(splitSchedule[0].amount)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Solde restant à terme :</span>
                          <span className="font-semibold">{formatFCFA(totals.totalTTC - splitSchedule[0].amount)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Conditions & Signature */}
                  <div className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-slate-500">
                    <p className="italic">
                      Note : Tout retard de paiement fera courir un intérêt de pénalité de 10% annuel calculé au prorata temporis.
                    </p>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <strong className="block text-slate-700">Moyen de règlement :</strong>
                        <span>Mobile Money MTN / Moov : +229 01 95 44 44 30</span>
                      </div>
                      <div className="text-right">
                        <span className="italic font-serif text-sm font-bold text-slate-800 block">
                          Monroy J.
                        </span>
                        <span className="text-slate-400">Signature certifiée</span>
                      </div>
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
        onClientCreated={(newCli) => setSelectedClientId(newCli.id)}
      />
    </div>
  );
}
