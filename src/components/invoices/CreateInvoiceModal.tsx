'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Building2,
  Calendar,
  Hash,
  Trash2,
  Plus,
  Send,
  Printer,
  Mail,
  ChevronDown,
  Sparkles,
  Layers,
  X,
  FileCheck2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import { calculateInvoiceTotals, LineItemInput } from '@/lib/invoice/calc';
import { formatFCFA, formatDateFR } from '@/lib/money/format';
import { NewClientModal } from '@/components/clients/NewClientModal';
import { DocumentKind, Invoice } from '@/lib/types';

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

export interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKind?: 'invoice' | 'quote';
  onSuccess?: (newInvoice: Invoice) => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  initialKind = 'invoice',
  onSuccess,
}) => {
  const {
    invoices,
    clients,
    products,
    addInvoice,
    addClient,
    addPayment,
    currentUser,
    showToast,
    userPlan,
    realInvoicesCount,
    canCreateInvoice,
    openUpgradeModal,
  } = useInvoices();

  const [showPreview, setShowPreview] = useState(true);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [documentKind, setDocumentKind] = useState<DocumentKind>(initialKind);
  const [invoiceType, setInvoiceType] = useState<'standard' | 'split' | 'recurring'>('standard');

  // Form states
  const [sellerName, setSellerName] = useState(currentUser?.organization || 'MONROY Business Solutions');
  const [sellerEmail, setSellerEmail] = useState(currentUser?.email || 'contact@monroy-agency.bj');
  const [sellerAddress, setSellerAddress] = useState('Allada, République du Bénin');

  // Split / Acompte state
  const [splitPreset, setSplitPreset] = useState<'30-70' | '40-30-30' | '50-50' | '4x25' | 'custom'>('30-70');
  const [depositPercent, setDepositPercent] = useState(30);
  const [depositPaidAtIssue, setDepositPaidAtIssue] = useState<boolean>(true);

  // Recurrence state
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'monthly' | 'quarterly' | 'semiannual' | 'yearly'>('monthly');
  const [recurrenceDuration, setRecurrenceDuration] = useState<number>(12);
  const [autoSend, setAutoSend] = useState(true);

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

  const [issueDate, setIssueDate] = useState(() => getTodayDate());
  const [dueDate, setDueDate] = useState(() => calculateDateOffset(getTodayDate(), initialKind === 'quote' ? 30 : 15));
  const [invoiceNumber, setInvoiceNumber] = useState('FAC-2026-0001');
  const [currency, setCurrency] = useState('FCFA');

  // Line items state - clean and empty on start
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

  /**
   * Réinitialisation intégrale du formulaire : garantit qu'à chaque ouverture
   * ou création, le formulaire est 100% vierge, sans réutiliser les données précédentes.
   */
  const resetFormToBlank = React.useCallback(
    (targetKind: DocumentKind = initialKind) => {
      const today = getTodayDate();
      const defaultDue = calculateDateOffset(today, targetKind === 'quote' ? 30 : 15);

      setDocumentKind(targetKind);
      setInvoiceType('standard');

      // 1. Articles : strictement 1 seule ligne vide sans montant imposé
      setItems([
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          discountPct: 0,
          vatRate: 18,
        },
      ]);

      // 2. Client : aucun client sélectionné, champs neufs
      setClientMode('existing');
      setSelectedClientId('');
      setNewClientName('');
      setNewClientCompany('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewClientCity('Cotonou');
      setNewClientCountry('Bénin');
      setNewClientTaxId('');

      // 3. Remise commerciale réinitialisée
      setHasDiscount(false);
      setDiscountAmount(0);

      // 4. Modalités de paiement réinitialisées
      setSplitPreset('30-70');
      setDepositPercent(30);
      setDepositPaidAtIssue(true);
      setRecurrenceFrequency('monthly');
      setRecurrenceDuration(12);
      setAutoSend(true);

      // 5. Dates du jour et échéance standard
      setIssueDate(today);
      setDueDate(defaultDue);
      setCurrency('FCFA');

      // 6. Numérotation automatique recalculée
      if (targetKind === 'quote') {
        const numbers = (invoices || [])
          .map((inv) => {
            const m = inv.number.match(/DEV-\d+-(\d+)/);
            return m ? parseInt(m[1], 10) : 0;
          })
          .filter((n) => !isNaN(n));
        const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
        setInvoiceNumber(`DEV-2026-${String(maxNum + 1).padStart(4, '0')}`);
      } else {
        const numbers = (invoices || [])
          .map((inv) => {
            const m = inv.number.match(/FAC-\d+-(\d+)/);
            return m ? parseInt(m[1], 10) : 0;
          })
          .filter((n) => !isNaN(n));
        const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
        setInvoiceNumber(`FAC-2026-${String(maxNum + 1).padStart(4, '0')}`);
      }

      // 7. Émetteur issu du profil de l'utilisateur connecté
      if (currentUser?.organization) setSellerName(currentUser.organization);
      if (currentUser?.email) setSellerEmail(currentUser.email);
    },
    [initialKind, invoices, currentUser]
  );

  // Réinitialiser systématiquement à chaque ouverture de la modale
  useEffect(() => {
    if (isOpen) {
      resetFormToBlank(initialKind);
    }
  }, [isOpen, initialKind, resetFormToBlank]);

  const handleClose = () => {
    resetFormToBlank(initialKind);
    onClose();
  };

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDocumentKindChange = (kind: DocumentKind) => {
    setDocumentKind(kind);
    if (kind === 'quote') {
      setInvoiceType('standard');
      setDueDate(calculateDateOffset(issueDate, 30));
    } else {
      setDueDate(calculateDateOffset(issueDate, 15));
    }
  };

  // Sequential invoice / quote number
  useEffect(() => {
    if (documentKind === 'quote') {
      const numbers = (invoices || [])
        .map((inv) => {
          const m = inv.number.match(/DEV-\d+-(\d+)/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
      setInvoiceNumber(`DEV-2026-${String(maxNum + 1).padStart(4, '0')}`);
    } else {
      const numbers = (invoices || [])
        .map((inv) => {
          const m = inv.number.match(/FAC-\d+-(\d+)/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
      setInvoiceNumber(`FAC-2026-${String(maxNum + 1).padStart(4, '0')}`);
    }
  }, [invoices, documentKind, isOpen]);

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
    // Gating : Si c'est une facture et que le quota du plan gratuit est atteint
    if (documentKind !== 'quote' && !canCreateInvoice) {
      openUpgradeModal('pro');
      showToast({
        title: 'Limite du Plan Gratuit atteinte (5/5 factures)',
        message: 'Vous avez utilisé vos 5 factures gratuites. Passez au Plan Pro pour facturer en illimité.',
        kind: 'warning',
        duration: 4500,
      });
      return;
    }

    let finalClient = currentClient;
    let finalClientId = selectedClientId;

    if (!finalClient) {
      showToast({
        title: 'Client obligatoire',
        message: 'Veuillez sélectionner ou renseigner un client avant d’émettre le document.',
        kind: 'warning',
        duration: 4000,
      });
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

    const newInvId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `inv-${Date.now()}`;
    const newInv: Invoice = {
      id: newInvId,
      number: invoiceNumber,
      documentKind,
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
      amountPaid:
        documentKind === 'invoice' && invoiceType === 'split' && depositPaidAtIssue && splitSchedule.length > 0
          ? splitSchedule[0].amount
          : 0,
      type: documentKind === 'quote' ? 'standard' : invoiceType,
      splitSchedule: documentKind === 'quote' ? undefined : (invoiceType === 'split' ? splitSchedule : undefined),
      recurrence:
        documentKind !== 'quote' && invoiceType === 'recurring'
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

    // Enregistrement synchrone de l'acompte encaissé à la commande
    if (documentKind === 'invoice' && invoiceType === 'split' && depositPaidAtIssue && splitSchedule.length > 0) {
      addPayment({
        invoiceId: newInvId,
        invoiceNumber: invoiceNumber,
        clientName: clientToUse.company || clientToUse.name,
        amount: splitSchedule[0].amount,
        method: 'mobile_money',
        reference: `ACOMPTE-${Date.now().toString().slice(-6)}`,
        date: issueDate,
      });
    }

    const docKindLabel =
      documentKind === 'quote'
        ? 'Devis Estimatif'
        : invoiceType === 'split'
        ? `Facture d'Acompte & Paiement Échelonné (${splitSchedule.length} tranches)`
        : invoiceType === 'recurring'
        ? `Facture Récurrente (${recurrenceFrequency})`
        : 'Facture';

    const isQuote = documentKind === 'quote';
    showToast({
      title: isQuote ? 'Devis émis avec succès' : 'Facture émise avec succès',
      message: isQuote
        ? `Devis généré pour ${clientToUse.company || clientToUse.name} • Offre valable 30 jours`
        : `${docKindLabel} générée pour ${clientToUse.company || clientToUse.name}`,
      kind: isQuote ? 'quote' : 'invoice',
      number: invoiceNumber,
      amount: totals.totalTTC,
      duration: 4500,
    });
    resetFormToBlank(initialKind);
    onClose();
    if (onSuccess) onSuccess(newInv);
  };

  const handleSaveDraft = () => {
    // Gating : Si c'est une facture et que le quota du plan gratuit est atteint
    if (documentKind !== 'quote' && !canCreateInvoice) {
      openUpgradeModal('pro');
      showToast({
        title: 'Limite du Plan Gratuit atteinte (5/5 factures)',
        message: 'Vous avez utilisé vos 5 factures gratuites. Passez au Plan Pro pour continuer.',
        kind: 'warning',
        duration: 4500,
      });
      return;
    }

    let finalClient = currentClient;
    let finalClientId = selectedClientId;

    if (!finalClient) {
      showToast({
        title: 'Client obligatoire',
        message: 'Veuillez sélectionner ou renseigner un client avant d’enregistrer le brouillon.',
        kind: 'warning',
        duration: 4000,
      });
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

    const newDraftId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `inv-${Date.now()}`;
    const newDraft: Invoice = {
      id: newDraftId,
      number: invoiceNumber,
      documentKind,
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
      type: documentKind === 'quote' ? 'standard' : invoiceType,
      splitSchedule: documentKind === 'quote' ? undefined : (invoiceType === 'split' ? splitSchedule : undefined),
      recurrence:
        documentKind !== 'quote' && invoiceType === 'recurring'
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

    const draftKindLabel =
      documentKind === 'quote'
        ? 'Brouillon de devis'
        : invoiceType === 'split'
        ? "Brouillon d'acompte"
        : invoiceType === 'recurring'
        ? `Brouillon récurrent (${recurrenceFrequency})`
        : 'Brouillon standard';

    const isQuote = documentKind === 'quote';
    showToast({
      title: isQuote ? 'Brouillon de devis enregistré' : 'Brouillon de facture enregistré',
      message: `${draftKindLabel} ${invoiceNumber} sauvegardé. Vous pourrez le finaliser à tout moment.`,
      kind: 'draft',
      number: invoiceNumber,
      amount: totals.totalTTC,
      duration: 4000,
    });
    resetFormToBlank(initialKind);
    onClose();
    if (onSuccess) onSuccess(newDraft);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        // En cliquant en dehors de la boîte de dialogue (sur le fond du dashboard), la modale se ferme automatiquement
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-6xl max-h-[92vh] sm:max-h-[90vh] bg-[#F8F9FA] dark:bg-[#0c1017] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#111622]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
          {/* Left: Document Kind Switcher & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${
                documentKind === 'quote'
                  ? 'bg-purple-600 shadow-purple-500/25 ring-1 ring-purple-500'
                  : 'bg-brand-600 shadow-brand-500/25 ring-1 ring-brand-500'
              }`}
            >
              {documentKind === 'quote' ? (
                <FileCheck2 className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {documentKind === 'quote'
                  ? 'Créer un Devis Estimatif'
                  : 'Créer une Facture'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block truncate">
                {documentKind === 'quote'
                  ? 'Proposition commerciale chiffrée avec validité d’offre UEMOA'
                  : 'Facture professionnelle conforme UEMOA et partage instantané'}
              </p>
            </div>
          </div>

          {/* Center/Right Controls: Kind Switcher, Clear, Preview Toggle & Close */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Document Type Switcher (Facture / Devis) */}
            <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleDocumentKindChange('invoice')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  documentKind === 'invoice'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Facture</span>
              </button>
              <button
                type="button"
                onClick={() => handleDocumentKindChange('quote')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  documentKind === 'quote'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Devis</span>
              </button>
            </div>

            {/* Clear / Reset Document button */}
            <button
              type="button"
              onClick={() => resetFormToBlank(documentKind)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Vider et réinitialiser tous les champs pour repartir d'un document 100% vierge"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
              <span className="hidden sm:inline">Vider</span>
            </button>

            {/* Toggle Live Preview switch */}
            <div className="hidden lg:flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500">Aperçu</span>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showPreview ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={showPreview}
                title="Afficher/masquer l'aperçu A4 en direct"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    showPreview ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Close Button - also accessible via outside click on dashboard */}
            <button
              type="button"
              onClick={handleClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer touch-manipulation active:scale-95"
              title="Fermer (ou cliquer n'importe où sur le tableau de bord)"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 pointer-events-none" />
              <span className="hidden sm:inline pointer-events-none">Fermer</span>
            </button>
          </div>
        </header>

        {/* Quota limit warning banner for Free plan */}
        {documentKind === 'invoice' && !canCreateInvoice && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-black text-xs">
                5/5
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                  <span>Limite de facturation atteinte (Plan Gratuit)</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-extrabold uppercase">5 Factures max</span>
                </div>
                <div className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300">
                  Vous avez émis vos 5 factures gratuites. Passez au Plan Pro pour continuer à facturer en illimité.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openUpgradeModal('pro')}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-amber-600/25 transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Passer au Plan Pro (5 000 FCFA)</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Content: Split View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: The Invoice Builder Form */}
            <div className={`${showPreview ? 'lg:col-span-7 xl:col-span-6' : 'lg:col-span-12'} space-y-5`}>
              {/* Segmented Control (Standard, Split, Recurring) - Uniquement actif pour les Factures */}
              {documentKind === 'invoice' ? (
                <div className="bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center max-w-md">
                  <button
                    type="button"
                    onClick={() => setInvoiceType('standard')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
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
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
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
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      invoiceType === 'recurring'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Récurrente
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-semibold shadow-2xs">
                  <FileCheck2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Devis Estimatif (Options d'acompte & récurrence désactivées pour les devis)</span>
                </div>
              )}

              {/* SPLIT / ACOMPTE SETTINGS PANEL */}
              {invoiceType === 'split' && documentKind === 'invoice' && (
                <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/25 dark:to-transparent rounded-3xl border border-amber-300/80 dark:border-amber-800/80 p-5 shadow-card space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
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
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
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

                  {/* Option Encaisser l'acompte immédiatement */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/80 cursor-pointer text-xs font-bold text-amber-950 dark:text-amber-200">
                      <input
                        type="checkbox"
                        checked={depositPaidAtIssue}
                        onChange={(e) => setDepositPaidAtIssue(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600 shrink-0"
                      />
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>Encaisser l'acompte initial ({formatFCFA(splitSchedule[0]?.amount || 0)}) dès l'émission</span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
                          {depositPaidAtIssue ? '✓ Inclus dans "Montant encaissé"' : 'En attente de paiement'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* RECURRING SETTINGS PANEL */}
              {invoiceType === 'recurring' && documentKind === 'invoice' && (
                <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent dark:from-indigo-950/25 dark:to-transparent rounded-3xl border border-indigo-300/80 dark:border-indigo-800/80 p-5 shadow-card space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
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
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
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
              <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-600" />
                  Informations Générales
                </h3>

                {/* Émetteur & Facturé à en 2 colonnes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Émetteur */}
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3.5 bg-white dark:bg-[#111622] px-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 z-10">
                      Émetteur (Votre société) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={sellerName}
                        onChange={(e) => setSellerName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Facturé à */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        {documentKind === 'quote' ? 'Devis établi pour *' : 'Facturé à (Client) *'}
                      </label>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[10px]">
                        <button
                          type="button"
                          onClick={() => setClientMode('existing')}
                          className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
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
                          className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                            clientMode === 'new'
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          + Nouveau
                        </button>
                      </div>
                    </div>

                    {clientMode === 'existing' ? (
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={selectedClientId}
                          onChange={(e) => setSelectedClientId(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none cursor-pointer"
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
                      <div className="space-y-2 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={newClientName}
                            placeholder="Nom du contact client *"
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          <input
                            type="text"
                            value={newClientCompany}
                            placeholder="Société / Raison sociale *"
                            onChange={(e) => setNewClientCompany(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="email"
                            value={newClientEmail}
                            placeholder="Email (ex: contact@client.bj)"
                            onChange={(e) => setNewClientEmail(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          <input
                            type="tel"
                            value={newClientPhone}
                            placeholder="Téléphone / WhatsApp"
                            onChange={(e) => setNewClientPhone(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates & Numéro */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="relative">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Date d’émission *
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      {documentKind === 'quote' ? 'Validité d’offre *' : 'Date d’échéance *'}
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Numéro {documentKind === 'quote' ? 'Devis' : 'Facture'}
                    </label>
                    <div className="relative">
                      <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={invoiceNumber}
                        suppressHydrationWarning
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Invoice Items */}
              <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-600" />
                    Prestations & Lignes de Facture
                  </h3>

                  {/* Devise */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-semibold">Devise :</span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
                    >
                      <option value="FCFA">FCFA (XOF)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const lineTotal = Math.round(
                      (item.quantity || 0) * (item.unitPrice || 0) * (1 - (item.discountPct || 0) / 100)
                    );

                    return (
                      <div
                        key={index}
                        className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            Article {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length <= 1}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 transition-colors cursor-pointer"
                            title="Supprimer cette ligne"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Description */}
                        <div className="relative">
                          <Sparkles className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={item.description}
                            placeholder="Description du produit ou prestation *"
                            onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                        </div>

                        {/* Qté, TVA, Prix */}
                        <div className="grid grid-cols-12 gap-2.5 items-center">
                          <div className="col-span-3 relative">
                            <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
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
                              className="w-full px-2 py-1.5 text-xs sm:text-sm bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-center font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                          </div>

                          <div className="col-span-4 relative">
                            <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                              TVA
                            </label>
                            <select
                              value={item.vatRate}
                              onChange={(e) =>
                                handleUpdateItem(index, 'vatRate', parseInt(e.target.value, 10))
                              }
                              className="w-full px-2 py-1.5 text-xs sm:text-sm bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold cursor-pointer"
                            >
                              <option value={18}>18% (UEMOA)</option>
                              <option value={0}>0% (Exonéré)</option>
                            </select>
                          </div>

                          <div className="col-span-5 relative">
                            <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
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
                              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-right font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                          </div>
                        </div>

                        <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                          Total ligne : <strong className="text-slate-900 dark:text-white font-bold">{formatFCFA(lineTotal)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Item & Catalog pick */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex-1 py-2.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand-600 hover:border-brand-500/50 hover:bg-brand-50/20 dark:hover:bg-brand-950/20 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une ligne vide</span>
                  </button>

                  <div className="relative sm:w-60">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddFromCatalog(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100"
                    >
                      <option value="" disabled>
                        + Choisir du catalogue...
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({formatFCFA(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Commercial Discount */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDiscount}
                      onChange={(e) => setHasDiscount(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <span>Appliquer une remise commerciale</span>
                  </label>

                  {hasDiscount && (
                    <div className="relative w-36">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={discountAmount === 0 ? '' : discountAmount}
                        placeholder="0 FCFA"
                        onChange={(e) =>
                          setDiscountAmount(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-right font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs text-center cursor-pointer active:scale-95"
                  >
                    Enregistrer Brouillon
                  </button>
                  <button
                    type="button"
                    onClick={handleSendInvoice}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {documentKind === 'quote'
                        ? 'Émettre le Devis'
                        : 'Émettre la facture'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Live A4 Document Preview */}
            {showPreview && (
              <div className="lg:col-span-5 xl:col-span-6 sticky top-0 space-y-4">
                {/* Actions Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-[#111622] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      Aperçu direct
                    </span>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Imprimer / PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Envoyer par email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer active:scale-95"
                    >
                      Brouillon
                    </button>
                    <button
                      type="button"
                      onClick={handleSendInvoice}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Émettre</span>
                    </button>
                  </div>
                </div>

                {/* The A4 Canvas Card */}
                <div className="bg-white text-slate-900 rounded-2xl p-5 sm:p-8 shadow-paper border border-slate-200/90 text-xs select-text">
                  {/* Top: Document title & Logo */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-5 mb-5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                          {documentKind === 'quote'
                            ? 'DEVIS ESTIMATIF'
                            : 'FACTURE'}
                        </h3>
                        {documentKind === 'quote' ? (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Devis Estimatif
                          </span>
                        ) : invoiceType === 'split' ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Acompte & Échelonné
                          </span>
                        ) : invoiceType === 'recurring' ? (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Abonnement Récurrent
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Standard
                          </span>
                        )}
                      </div>
                      <p suppressHydrationWarning className="text-xs font-semibold text-slate-500 mt-0.5">
                        N° {invoiceNumber}
                      </p>
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-[#004D38] flex items-center justify-center text-[#25E098] shadow-sm shrink-0">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                      </svg>
                    </div>
                  </div>

                  {/* Billed By & Billed To */}
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        {documentKind === 'quote'
                          ? 'Devis établi pour :'
                          : 'Facturé à :'}
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
                        <div className="py-1 text-[11px] text-slate-400 italic font-medium">
                          Aucun client sélectionné
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates Row */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100">
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
                        {documentKind === 'quote'
                          ? 'Validité de l’offre :'
                          : 'Date d’échéance :'}
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        {formatDateFR(dueDate)}
                      </span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="py-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Prestations & Articles :
                    </span>
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[10px]">
                          <th className="py-1.5 pr-2">Article</th>
                          <th className="py-1.5 px-2 text-center">Qté</th>
                          <th className="py-1.5 px-2 text-right">TVA</th>
                          <th className="py-1.5 pl-2 text-right">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((it, idx) => {
                          const itemTotal = Math.round(
                            (it.quantity || 0) * (it.unitPrice || 0) * (1 - (it.discountPct || 0) / 100)
                          );
                          return (
                            <tr key={idx}>
                              <td className="py-2 pr-2 font-medium text-slate-800">
                                {it.description || (
                                  <span className="text-slate-400 italic">Ligne sans désignation</span>
                                )}
                              </td>
                              <td className="py-2 px-2 text-center text-slate-600">
                                {it.quantity}
                              </td>
                              <td className="py-2 px-2 text-right text-slate-600">
                                {it.vatRate}%
                              </td>
                              <td className="py-2 pl-2 text-right font-bold text-slate-900">
                                {formatFCFA(itemTotal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Modalités d'échelonnement / Acompte */}
                  {invoiceType === 'split' && documentKind === 'invoice' && (
                    <div className="my-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-amber-900 font-bold">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                          <Layers className="w-3.5 h-3.5 text-amber-600" />
                          Échéancier ({splitSchedule.length} Tranches)
                        </span>
                        <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md font-semibold">
                          Acompte : {splitSchedule[0]?.percentage}%
                        </span>
                      </div>

                      <div className="space-y-1 pt-0.5">
                        {splitSchedule.map((tranche, idx) => (
                          <div
                            key={tranche.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/90 border border-amber-100 font-medium"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-amber-500 ring-2 ring-amber-300' : 'bg-slate-300'}`} />
                              <span className="text-slate-800 font-semibold text-[11px]">{tranche.label}</span>
                              <span className="text-[10px] text-slate-500">
                                ({formatDateFR(tranche.dueDate)})
                              </span>
                            </div>
                            <div className="font-extrabold text-slate-900 text-[11px]">
                              {formatFCFA(tranche.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Facturation Récurrente */}
                  {invoiceType === 'recurring' && documentKind === 'invoice' && (
                    <div className="my-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-indigo-900 font-bold">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Conditions d'Abonnement Récurrent
                        </span>
                        <span className="text-[10px] bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded-md font-semibold">
                          {recurrenceFrequency === 'monthly' ? 'Mensuel' : recurrenceFrequency === 'quarterly' ? 'Trimestriel' : recurrenceFrequency === 'semiannual' ? 'Semestriel' : 'Annuel'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-0.5">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Période couverte :</span>
                          <span className="font-semibold text-slate-900 text-[11px]">
                            Du {formatDateFR(issueDate)} au {formatDateFR(nextRenewalDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Prochaine facture :</span>
                          <span className="font-semibold text-indigo-700 text-[11px]">
                            {formatDateFR(nextRenewalDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Totals Summary */}
                  <div className="border-t border-slate-200 pt-3 space-y-1 text-right">
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

                    <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-1.5">
                      <span>Total TTC :</span>
                      <span className="text-brand-600 text-base">
                        {formatFCFA(totals.totalTTC)}
                      </span>
                    </div>

                    {invoiceType === 'split' && splitSchedule[0] && (
                      <div className="pt-1.5 mt-1.5 border-t border-amber-200 space-y-0.5 text-right">
                        <div className="flex justify-between text-amber-800 text-xs font-bold">
                          <span>Acompte exigible ({splitSchedule[0].percentage}%) :</span>
                          <span className="text-amber-900 font-extrabold text-xs">{formatFCFA(splitSchedule[0].amount)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[10px]">
                          <span>Solde restant :</span>
                          <span className="font-semibold">{formatFCFA(totals.totalTTC - splitSchedule[0].amount)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Conditions & Signature */}
                  <div className="mt-5 pt-3 border-t border-slate-100 text-[10px] text-slate-500">
                    <p className="italic">
                      {documentKind === 'quote'
                        ? 'Validité de l’offre : 30 jours à compter de sa date d’émission. Bon pour accord et commande précédé de la mention « Lu et approuvé ».'
                        : 'Note : Tout retard de paiement fera courir un intérêt de pénalité de 10% annuel calculé au prorata temporis.'}
                    </p>
                    <div className="mt-3 flex items-end justify-between">
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
        </div>
      </div>

      <NewClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientCreated={(newCli) => setSelectedClientId(newCli.id)}
      />
    </div>
  );
};
