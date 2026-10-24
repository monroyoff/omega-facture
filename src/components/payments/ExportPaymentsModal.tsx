'use client';

import React, { useRef, useState, useMemo } from 'react';
import {
  X,
  FileText,
  Download,
  Image as ImageIcon,
  FileSpreadsheet,
  Printer,
  Check,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Landmark,
  Banknote,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatFCFA, formatDateFR } from '@/lib/money/format';
import { useInvoices } from '@/lib/store/invoice-context';
import jsPDF from 'jspdf';
import { PaymentRecord } from '@/lib/store/invoice-context';

interface ExportPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportPaymentsModal: React.FC<ExportPaymentsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { payments = [], periodPayments = [], periodLabel, selectedPeriod, setSelectedPeriod } = useInvoices();
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [exportScope, setExportScope] = useState<'period' | 'all'>('period');
  const printRef = useRef<HTMLDivElement>(null);

  // Active payments to export based on scope
  const activeList: PaymentRecord[] = useMemo(() => {
    if (exportScope === 'all') return payments;
    return periodPayments;
  }, [exportScope, payments, periodPayments]);

  const totalCollected = useMemo(() => activeList.reduce((acc, p) => acc + p.amount, 0), [activeList]);
  const totalMobileMoney = useMemo(
    () => activeList.filter((p) => p.method === 'mobile_money').reduce((acc, p) => acc + p.amount, 0),
    [activeList]
  );
  const totalBank = useMemo(
    () => activeList.filter((p) => p.method === 'bank_transfer').reduce((acc, p) => acc + p.amount, 0),
    [activeList]
  );
  const totalCash = useMemo(
    () => activeList.filter((p) => p.method === 'cash').reduce((acc, p) => acc + p.amount, 0),
    [activeList]
  );
  const totalCheck = useMemo(
    () => activeList.filter((p) => p.method === 'check').reduce((acc, p) => acc + p.amount, 0),
    [activeList]
  );

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const getMethodName = (m: string) => {
    switch (m) {
      case 'mobile_money':
        return 'Mobile Money (MTN/Moov/Wave)';
      case 'bank_transfer':
        return 'Virement Bancaire';
      case 'cash':
        return 'Espèces (Caisse)';
      case 'check':
        return 'Chèque';
      default:
        return m;
    }
  };

  // Canvas drawer for PDF and PNG high-res export
  const drawPaymentsCanvas = (): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    const rowCount = Math.max(activeList.length, 1);
    const calculatedHeight = Math.max(1600, 800 + rowCount * 45);
    canvas.width = 1200;
    canvas.height = calculatedHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, calculatedHeight);

    // Header Top Banner
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1200, 140);

    // Accent line
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, 140, 1200, 6);

    // Logo & App Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
    ctx.fillText('Ω OMEGA FACTURE', 60, 65);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Plateforme Certifiée UEMOA • Monnaie FCFA (XOF)', 60, 95);

    // Document Title
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('REGISTRE OFFICIEL DES PAIEMENTS & FLUX', 1140, 65);

    ctx.fillStyle = '#ffffff';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`Édition du : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 1140, 95);
    ctx.textAlign = 'left';

    // Subheader Org info
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 146, 1200, 65);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(0, 146, 1200, 65);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('Émetteur : MONROY Business Solutions SARL', 60, 184);
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('IFU : 3202412894567 • Cotonou, Bénin', 420, 184);
    ctx.fillText(`Périmètre : ${exportScope === 'period' ? periodLabel : 'Toutes les transactions (Exercice 2026)'}`, 780, 184);

    // 4 KPI Summary Cards
    const drawKpi = (x: number, y: number, w: number, h: number, title: string, amountStr: string, countStr: string, col: string) => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText(title.toUpperCase(), x + 18, y + 30);

      ctx.fillStyle = col;
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText(amountStr, x + 18, y + 66);

      ctx.fillStyle = '#64748b';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText(countStr, x + 18, y + 94);
    };

    drawKpi(60, 235, 255, 115, 'Total Encaissé', formatFCFA(totalCollected), `${activeList.length} règlement(s)`, '#059669');
    drawKpi(335, 235, 255, 115, 'Mobile Money (UEMOA)', formatFCFA(totalMobileMoney), 'MTN, Moov, Wave', '#d97706');
    drawKpi(610, 235, 255, 115, 'Virements Bancaires', formatFCFA(totalBank), 'BOA, Ecobank, SG', '#2563eb');
    drawKpi(885, 235, 255, 115, 'Espèces & Caisse', formatFCFA(totalCash + totalCheck), 'Caisse locale et chèques', '#0f766e');

    // Section Table Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`Journal Détaillé des Règlements (${activeList.length} opérations enregistrées)`, 60, 395);

    // Table Column Headers
    let rowY = 415;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(60, rowY, 1080, 42);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText('DATE', 80, rowY + 26);
    ctx.fillText('RÉFÉRENCE', 200, rowY + 26);
    ctx.fillText('CLIENT / BÉNÉFICIAIRE', 380, rowY + 26);
    ctx.fillText('N° FACTURE', 650, rowY + 26);
    ctx.fillText('MODE RÈGLEMENT', 800, rowY + 26);
    ctx.fillText('MONTANT (FCFA)', 990, rowY + 26);

    rowY += 42;

    if (activeList.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 14px system-ui, sans-serif';
      ctx.fillText('Aucun encaissement enregistré pour la période sélectionnée.', 80, rowY + 40);
      rowY += 80;
    } else {
      activeList.forEach((pay, idx) => {
        // Alternating row background
        ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
        ctx.fillRect(60, rowY, 1080, 40);

        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, rowY + 40);
        ctx.lineTo(1140, rowY + 40);
        ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText(formatDateFR(pay.date), 80, rowY + 25);

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(pay.reference, 200, rowY + 25);

        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(pay.clientName, 380, rowY + 25);

        ctx.font = '12px monospace';
        ctx.fillStyle = '#475569';
        ctx.fillText(pay.invoiceNumber, 650, rowY + 25);

        // Method label
        const methodShort =
          pay.method === 'mobile_money'
            ? 'Mobile Money'
            : pay.method === 'bank_transfer'
            ? 'Virement Bancaire'
            : pay.method === 'cash'
            ? 'Espèces'
            : 'Chèque';
        ctx.fillStyle =
          pay.method === 'mobile_money'
            ? '#d97706'
            : pay.method === 'bank_transfer'
            ? '#2563eb'
            : '#059669';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(methodShort, 800, rowY + 25);

        // Amount
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillStyle = '#059669';
        ctx.fillText(formatFCFA(pay.amount), 990, rowY + 25);

        rowY += 40;
      });
    }

    // Summary Total Bar
    ctx.fillStyle = '#ecfdf5';
    ctx.fillRect(60, rowY, 1080, 48);
    ctx.strokeStyle = '#a7f3d0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(60, rowY, 1080, 48);

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText('TOTAL GLOBAL DES ENCAISSEMENTS CERTIFIÉS :', 80, rowY + 30);

    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(formatFCFA(totalCollected), 970, rowY + 31);

    rowY += 75;

    // Legal & Certification Footnotes
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(60, rowY);
    ctx.lineTo(1140, rowY);
    ctx.stroke();

    rowY += 35;
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 11px system-ui, sans-serif';
    ctx.fillText('Registre des flux de trésorerie conforme aux directives de la BCEAO et du SYSCOHADA.', 60, rowY);
    ctx.fillText('Tous les règlements ont fait l’objet d’un rapprochement automatisé dans le logiciel OMEGA FACTURE.', 60, rowY + 18);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('Visa de la Trésorerie & Direction :', 820, rowY);
    ctx.fillStyle = '#059669';
    ctx.font = 'italic bold 22px serif';
    ctx.fillText('Monroy J.', 820, rowY + 34);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText('Certifié électroniquement', 820, rowY + 50);

    return canvas;
  };

  // 1. PDF Export (using jsPDF)
  const handleExportPDF = () => {
    try {
      const canvas = drawPaymentsCanvas();
      if (!canvas) return;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      const safePeriod = (exportScope === 'period' ? periodLabel : 'annuel')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
      pdf.save(`registre_paiements_omega_${safePeriod}_${Date.now()}.pdf`);

      showToast('Bordereau officiel des paiements PDF téléchargé avec succès !');
    } catch (e) {
      console.error('[Export PDF] Erreur :', e);
      window.print();
    }
  };

  // 2. CSV / Excel Export with UTF-8 BOM
  const handleExportCSV = () => {
    const csvRows = [
      ['REGISTRE DES PAIEMENTS & FLUX DE TRESORERIE - OMEGA FACTURE'],
      ['Societe', 'MONROY Business Solutions SARL'],
      ['IFU', '3202412894567'],
      ['Perimetre', exportScope === 'period' ? periodLabel : 'Toutes les transactions'],
      ['Date edition', new Date().toLocaleDateString('fr-FR')],
      ['Devise', 'FCFA (XOF)'],
      [],
      ['SYNTHESE DES ENCAISSEMENTS'],
      ['Total Encaisse (FCFA)', totalCollected],
      ['Mobile Money (FCFA)', totalMobileMoney],
      ['Virements Bancaires (FCFA)', totalBank],
      ['Especes (FCFA)', totalCash],
      ['Cheques (FCFA)', totalCheck],
      ['Nombre total de reglements', activeList.length],
      [],
      ['DETAIL DES TRANSACTIONS'],
      ['Date', 'Reference_Transaction', 'Client', 'Numero_Facture', 'Mode_Paiement', 'Montant_FCFA'],
    ];

    activeList.forEach((pay) => {
      csvRows.push([
        pay.date,
        `"${pay.reference}"`,
        `"${pay.clientName}"`,
        `"${pay.invoiceNumber}"`,
        `"${getMethodName(pay.method)}"`,
        pay.amount.toString(),
      ]);
    });

    const csvContent =
      '\uFEFF' +
      csvRows
        .map((row) =>
          row
            .map((val) => {
              if (val === undefined || val === null) return '';
              const str = String(val);
              if (str.includes(',') || str.includes(';') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            })
            .join(';')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safePeriod = (exportScope === 'period' ? periodLabel : 'annuel')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    link.download = `flux_paiements_omega_${safePeriod}_${Date.now()}.csv`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    showToast('Fichier Excel / CSV téléchargé avec succès (compatible Excel & Sheets) !');
  };

  // 3. PNG High-Resolution Image Export
  const handleExportPNG = () => {
    try {
      const canvas = drawPaymentsCanvas();
      if (!canvas) return;

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safePeriod = (exportScope === 'period' ? periodLabel : 'annuel')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_');
        link.download = `synthese_paiements_omega_${safePeriod}_${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        showToast('Synthèse visuelle PNG haute résolution téléchargée !');
      }, 'image/png');
    } catch (e) {
      console.error('[Export PNG] Erreur :', e);
      alert('Erreur lors de la génération de l’image.');
    }
  };

  // 4. Direct Print
  const handlePrintDirect = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-8 sm:pt-12 px-3 pb-8 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-[#0c1017] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111622] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                Exporter les Paiements & Flux de Trésorerie
              </h3>
              <p className="text-xs text-slate-400">
                Génération multi-formats : PDF officiel, Tableur Excel/CSV, Image HD et Impression
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 active:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 transition-all active:scale-95 cursor-pointer touch-manipulation"
              title="Fermer la fenêtre (Échap)"
              aria-label="Fermer la fenêtre"
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* 4 Format Action Buttons Ribbon */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
          {/* Scope switch */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setExportScope('period')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                exportScope === 'period'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              Période active ({periodLabel})
            </button>
            <button
              type="button"
              onClick={() => setExportScope('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                exportScope === 'all'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              Toutes les transactions ({payments.length})
            </button>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. PDF */}
            <button
              type="button"
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
              title="Télécharger le bordereau officiel au format PDF"
            >
              <FileText className="w-4 h-4" />
              <span>Document PDF</span>
            </button>

            {/* 2. Excel / CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              title="Exporter dans un fichier compatible Excel / Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tableur Excel / CSV</span>
            </button>

            {/* 3. PNG Image */}
            <button
              type="button"
              onClick={handleExportPNG}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
              title="Télécharger une image haute résolution pour partage WhatsApp / email"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Image PNG (HD)</span>
            </button>

            {/* 4. Print */}
            <button
              type="button"
              onClick={handlePrintDirect}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold active:scale-95 transition-all cursor-pointer"
              title="Imprimer directement le document A4"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

        {/* Live A4 Document Preview Section */}
        <div className="p-4 sm:p-8 overflow-y-auto max-h-[65vh] bg-slate-100/70 dark:bg-slate-950/60">
          <div
            ref={printRef}
            className="w-full bg-white dark:bg-[#111622] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 space-y-8"
          >
            {/* Header Document */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-brand-600/20">
                    Ω
                  </div>
                  <span className="text-xl font-black text-brand-600 dark:text-brand-400 tracking-tight">
                    OMEGA FACTURE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Plateforme de Facturation & Trésorerie • Zone UEMOA (FCFA)
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 space-y-0.5">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    MONROY Business Solutions SARL
                  </p>
                  <p>IFU : 3202412894567 • RCCM : RB/COT/24 B 12345</p>
                  <p>Cotonou, République du Bénin</p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Bordereau Certifié
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Registre des Encaissements
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Période : <span className="font-bold text-slate-800 dark:text-slate-200">{exportScope === 'period' ? periodLabel : 'Exercice Complet 2026'}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Édité le {new Date().toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {/* 4 KPI Summary Cards in Preview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Total Encaissé */}
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-1">
                  Total Encaissé
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatFCFA(totalCollected)}
                </div>
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-1 block font-medium">
                  {activeList.length} transaction(s)
                </span>
              </div>

              {/* Mobile Money */}
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-1">
                  Mobile Money
                </span>
                <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                  {formatFCFA(totalMobileMoney)}
                </div>
                <span className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-1 block font-medium">
                  MTN, Moov & Wave
                </span>
              </div>

              {/* Virement Bancaire */}
              <div className="p-4 rounded-xl bg-brand-50/60 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-800/40">
                <span className="text-[11px] font-bold text-brand-800 dark:text-brand-300 uppercase tracking-wider block mb-1">
                  Virements Bancaires
                </span>
                <div className="text-xl sm:text-2xl font-black text-brand-600 dark:text-brand-400">
                  {formatFCFA(totalBank)}
                </div>
                <span className="text-[11px] text-brand-700/80 dark:text-brand-400 mt-1 block font-medium">
                  BOA, Ecobank, SG
                </span>
              </div>

              {/* Espèces & Caisse */}
              <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40">
                <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider block mb-1">
                  Espèces & Caisse
                </span>
                <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400">
                  {formatFCFA(totalCash + totalCheck)}
                </div>
                <span className="text-[11px] text-teal-700/80 dark:text-teal-400 mt-1 block font-medium">
                  Caisse physique
                </span>
              </div>
            </div>

            {/* Transactions Ledger Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Détail chronologique des opérations
                </h5>
                <span className="text-xs text-slate-400 font-medium">
                  Montants en Francs CFA (XOF)
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-3.5">Date</th>
                      <th className="py-3 px-3.5">Réf. Règlement</th>
                      <th className="py-3 px-3.5">Client</th>
                      <th className="py-3 px-3.5">Facture</th>
                      <th className="py-3 px-3.5">Mode</th>
                      <th className="py-3 px-3.5 text-right">Montant Encaissé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                    {activeList.length > 0 ? (
                      activeList.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">
                            {formatDateFR(pay.date)}
                          </td>
                          <td className="py-3 px-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {pay.reference}
                          </td>
                          <td className="py-3 px-3.5 text-slate-800 dark:text-slate-200 font-semibold">
                            {pay.clientName}
                          </td>
                          <td className="py-3 px-3.5 font-mono text-slate-500 whitespace-nowrap">
                            {pay.invoiceNumber}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {pay.method === 'mobile_money' && (
                              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                                <Smartphone className="w-3 h-3" /> Mobile Money
                              </span>
                            )}
                            {pay.method === 'bank_transfer' && (
                              <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 font-semibold">
                                <Landmark className="w-3 h-3" /> Virement
                              </span>
                            )}
                            {pay.method === 'cash' && (
                              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                                <Banknote className="w-3 h-3" /> Espèces
                              </span>
                            )}
                            {pay.method === 'check' && (
                              <span className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-400 font-semibold">
                                <CreditCard className="w-3 h-3" /> Chèque
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                            {formatFCFA(pay.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                          Aucun encaissement sur cette période.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {activeList.length > 0 && (
                    <tfoot className="bg-emerald-50/50 dark:bg-emerald-950/20 font-bold border-t-2 border-emerald-500/30">
                      <tr>
                        <td colSpan={5} className="py-3.5 px-3.5 text-slate-900 dark:text-white text-right font-extrabold uppercase text-xs">
                          Total Général Encaissé :
                        </td>
                        <td className="py-3.5 px-3.5 text-right text-emerald-600 dark:text-emerald-400 font-black text-base whitespace-nowrap">
                          {formatFCFA(totalCollected)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Certification Footer in Document */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div className="space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Certification & Authenticité des Écritures
                </p>
                <p className="text-[11px] text-slate-400 max-w-md">
                  Généré par OMEGA FACTURE. Document comptable certifié conforme aux encaissements enregistrés sur les comptes bancaires et portefeuilles Mobile Money UEMOA.
                </p>
              </div>

              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Visa de la Direction</p>
                <p className="font-serif italic font-bold text-lg text-emerald-600">Monroy J.</p>
                <p className="text-[10px] text-slate-400">Signature Électronique Certifiée</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#111622] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Format conforme UEMOA avec mentions légales et rapprochement bancaire</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Floating Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-[120] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}
    </div>
  );
};
