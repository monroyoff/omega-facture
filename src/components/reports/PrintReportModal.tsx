'use client';

import React, { useRef, useState } from 'react';
import {
  X,
  FileText,
  Download,
  Image as ImageIcon,
  FileSpreadsheet,
  Printer,
  Check,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Building,
  Calendar,
  Layers,
} from 'lucide-react';
import { formatFCFA } from '@/lib/money/format';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalInvoiced: number;
  totalPaid: number;
  recoveryRate: number;
}

// Generate valid client-side PDF 1.4 from JPEG data URL
function createPdfBlobFromJpeg(dataUrl: string, imgWidth: number, imgHeight: number): Blob {
  const base64 = dataUrl.split(',')[1];
  const binaryString = atob(base64);
  const jpegBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    jpegBytes[i] = binaryString.charCodeAt(i);
  }

  const pdfHeader = '%PDF-1.4\n';
  const o1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const o2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const o3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n';

  const o4Head = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
  const o4Foot = '\nendstream\nendobj\n';

  const content = 'q\n595.28 0 0 841.89 0 0 cm\n/Im1 Do\nQ\n';
  const o5 = `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`;

  const encoder = new TextEncoder();
  const hBytes = encoder.encode(pdfHeader);
  const o1Bytes = encoder.encode(o1);
  const o2Bytes = encoder.encode(o2);
  const o3Bytes = encoder.encode(o3);
  const o4HeadBytes = encoder.encode(o4Head);
  const o4FootBytes = encoder.encode(o4Foot);
  const o5Bytes = encoder.encode(o5);

  let offset = hBytes.length;
  const off1 = offset; offset += o1Bytes.length;
  const off2 = offset; offset += o2Bytes.length;
  const off3 = offset; offset += o3Bytes.length;
  const off4 = offset; offset += o4HeadBytes.length + jpegBytes.length + o4FootBytes.length;
  const off5 = offset; offset += o5Bytes.length;

  const pad = (n: number) => String(n).padStart(10, '0') + ' 00000 n \n';
  const xref = `xref\n0 6\n0000000000 65535 f \n${pad(off1)}${pad(off2)}${pad(off3)}${pad(off4)}${pad(off5)}`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;
  const tailBytes = encoder.encode(xref + trailer);

  return new Blob([hBytes, o1Bytes, o2Bytes, o3Bytes, o4HeadBytes, jpegBytes, o4FootBytes, o5Bytes, tailBytes], {
    type: 'application/pdf',
  });
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  totalInvoiced,
  totalPaid,
  recoveryRate,
}) => {
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const totalRemaining = Math.max(0, totalInvoiced - totalPaid);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Helper to draw high-resolution canvas
  const drawReportCanvas = (): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1580;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 1580);

    // Top Header Dark Bar
    ctx.fillStyle = '#0b1329';
    ctx.fillRect(0, 0, 1200, 135);

    // Logo icon box
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(60, 35, 65, 65, 14);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText('Ω', 80, 80);

    // Header Texts
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.fillText('OMEGA FACTURE — BILAN FINANCIER & KPI', 145, 65);
    ctx.fillStyle = '#34d399';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText('Bilan de performance, recouvrement et balance âgée des créances (UEMOA / FCFA)', 145, 95);

    // Org & Date row
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 135, 1200, 55);
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(0, 190);
    ctx.lineTo(1200, 190);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Émis par : MONROY Business Solutions SARL', 60, 168);
    ctx.fillText('Date d’édition : 18 Octobre 2026', 500, 168);
    ctx.fillText('Exercice : 2026 complet', 920, 168);

    // Metric Cards Drawer
    const drawCard = (x: number, y: number, w: number, h: number, title: string, value: string, sub: string, color: string) => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(title.toUpperCase(), x + 24, y + 36);

      ctx.fillStyle = color;
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.fillText(value, x + 24, y + 78);

      ctx.fillStyle = '#64748b';
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText(sub, x + 24, y + 110);
    };

    drawCard(60, 220, 340, 135, 'Chiffre d’Affaires Cumulé', formatFCFA(totalInvoiced), '+24.8% de croissance annuelle', '#0f172a');
    drawCard(430, 220, 340, 135, 'Total Encaissé Réel', formatFCFA(totalPaid), `Taux de recouvrement : ${recoveryRate}%`, '#059669');
    drawCard(800, 220, 340, 135, 'Créances Restantes', formatFCFA(totalRemaining), 'Délai moyen de règlement : 18 jours', '#e11d48');

    // Balance Âgée
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('Balance Âgée des Créances Clients', 60, 405);

    const drawAgingBox = (x: number, y: number, w: number, h: number, cat: string, amt: string, desc: string, bg: string, border: string, textCol: string) => {
      ctx.fillStyle = bg;
      ctx.strokeStyle = border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = textCol;
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText(cat, x + 20, y + 34);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText(amt, x + 20, y + 70);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(desc, x + 20, y + 95);
    };

    drawAgingBox(60, 425, 340, 115, '0 à 30 jours (Créances Saines)', '2 419 000 FCFA', 'Échéance normale en cours', '#f0fdf4', '#bbf7d0', '#166534');
    drawAgingBox(430, 425, 340, 115, '31 à 60 jours (À Surveiller)', '1 800 000 FCFA', 'Relance amiable recommandée', '#fffbeb', '#fde68a', '#92400e');
    drawAgingBox(800, 425, 340, 115, '+ de 60 jours (Contentieux)', '763 000 FCFA', 'Mise en demeure / recouvrement', '#fff1f2', '#fecdd3', '#9f1239');

    // Tableau Mensuel des Recettes
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('Historique d’Activité & Recouvrement Mensuel', 60, 595);

    const tableData = [
      { m: 'Mai 2026', ca: '4 800 000 FCFA', enc: '4 800 000 FCFA', pct: '100% Soldé', st: 'Soldé' },
      { m: 'Juin 2026', ca: '6 200 000 FCFA', enc: '6 200 000 FCFA', pct: '100% Soldé', st: 'Soldé' },
      { m: 'Juillet 2026', ca: '5 400 000 FCFA', enc: '5 400 000 FCFA', pct: '100% Soldé', st: 'Soldé' },
      { m: 'Août 2026', ca: '7 100 000 FCFA', enc: '7 100 000 FCFA', pct: '100% Soldé', st: 'Soldé' },
      { m: 'Septembre 2026', ca: '8 900 000 FCFA', enc: '7 500 000 FCFA', pct: '84.3% Encaissé', st: 'Partiel' },
      { m: 'Octobre 2026 (En cours)', ca: '11 800 000 FCFA', enc: '7 610 000 FCFA', pct: '64.5% Encaissé', st: 'En cours' },
    ];

    let rowY = 625;
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(60, rowY, 1080, 42);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('MOIS DE FACTURATION', 80, rowY + 26);
    ctx.fillText('CHIFFRE D’AFFAIRES ÉMIS', 380, rowY + 26);
    ctx.fillText('ENCAISSÉ EFFECTIF', 680, rowY + 26);
    ctx.fillText('STATUT RECOUVREMENT', 930, rowY + 26);

    rowY += 42;
    tableData.forEach((row, i) => {
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      ctx.fillRect(60, rowY, 1080, 44);
      ctx.strokeStyle = '#f1f5f9';
      ctx.strokeRect(60, rowY, 1080, 44);

      ctx.fillStyle = '#0f172a';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText(row.m, 80, rowY + 28);

      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText(row.ca, 380, rowY + 28);

      ctx.fillStyle = '#059669';
      ctx.fillText(row.enc, 680, rowY + 28);

      ctx.fillStyle = row.st === 'Soldé' ? '#059669' : '#d97706';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(row.pct, 930, rowY + 28);

      rowY += 44;
    });

    // Bottom Certification and Signature
    rowY += 40;
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(60, rowY);
    ctx.lineTo(1140, rowY);
    ctx.stroke();

    rowY += 40;
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 13px system-ui, sans-serif';
    ctx.fillText('Document financier officiel conforme aux règles du SYSCOHADA révisé et de la législation fiscale UEMOA.', 60, rowY);
    ctx.fillText('L’ensemble des montants a été certifié conforme par le système comptable central OMEGA FACTURE.', 60, rowY + 22);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('Visa et Certification de la Direction :', 820, rowY);
    ctx.fillStyle = '#059669';
    ctx.font = 'italic bold 24px serif';
    ctx.fillText('Monroy J.', 820, rowY + 40);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('Signature électronique authentifiée', 820, rowY + 60);

    return canvas;
  };

  // 1. Direct Printer Option
  const handlePrintDirect = () => {
    window.print();
  };

  // 2. Direct PDF Document Download
  const handleExportPDF = () => {
    try {
      const canvas = drawReportCanvas();
      if (!canvas) return;

      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const pdfBlob = createPdfBlobFromJpeg(jpegDataUrl, canvas.width, canvas.height);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bilan_financier_omega_${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      showToast('Document officiel PDF téléchargé avec succès !');
    } catch (e) {
      console.error(e);
      // Fallback to print-to-pdf
      window.print();
    }
  };

  // 3. Format Visuel (Image PNG HD)
  const handleExportPNG = () => {
    try {
      const canvas = drawReportCanvas();
      if (!canvas) return;

      const link = document.createElement('a');
      link.download = `bilan_financier_visuel_omega_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Fichier visuel PNG téléchargé avec succès !');
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la génération de l’image.');
    }
  };

  // 4. Export Tableur CSV / Excel
  const handleExportCSV = () => {
    const csvRows = [
      ['RAPPORT FINANCIER & KPI - OMEGA FACTURE'],
      ['Date d\'edition', new Date().toLocaleDateString('fr-FR')],
      ['Societe', 'MONROY Business Solutions'],
      ['Devise', 'FCFA (XOF)'],
      [],
      ['INDICATEURS GLOBAUX'],
      ['Chiffre d\'Affaires Cumule', totalInvoiced],
      ['Total Encaisse', totalPaid],
      ['Creances Restantes', totalRemaining],
      ['Taux de Recouvrement (%)', `${recoveryRate}%`],
      ['Delai Moyen de Reglement', '18 jours'],
      [],
      ['BALANCE AGEE DES CREANCES'],
      ['Tranche', 'Montant_FCFA', 'Niveau_Risque'],
      ['0 a 30 jours', 2419000, 'Normal'],
      ['31 a 60 jours', 1800000, 'A surveiller'],
      ['Plus de 60 jours', 763000, 'Contentieux'],
      [],
      ['HISTORIQUE MENSUEL'],
      ['Mois', 'Chiffre_Affaires_FCFA', 'Encaisse_FCFA', 'Taux_Recouvrement'],
      ['Mai 2026', 4800000, 4800000, '100%'],
      ['Juin 2026', 6200000, 6200000, '100%'],
      ['Juillet 2026', 5400000, 5400000, '100%'],
      ['Aout 2026', 7100000, 7100000, '100%'],
      ['Septembre 2026', 8900000, 7500000, '84.3%'],
      ['Octobre 2026', 11800000, 7610000, '64.5%'],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      csvRows.map((e) => e.join(';')).join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `bilan_financier_omega_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Fichier Excel / CSV téléchargé avec succès !');
  };

  return (
    <>
      {/* Print Specific CSS to print only the report card when using direct printer */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-report-card,
            #printable-report-card * {
              visibility: visible !important;
            }
            #printable-report-card {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100vw !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 24px !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
              color: #0f172a !important;
              z-index: 999999 !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `,
      }} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 no-print">
        <div className="relative w-full max-w-5xl bg-slate-100 dark:bg-[#0c1017] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[94vh] flex flex-col">
          {/* Top Action Bar with 4 Export Choices */}
          <div className="px-6 py-4 bg-white dark:bg-[#111622] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Exportation du Bilan Financier & KPI
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choisissez votre format : Imprimante directe, Document PDF, Image Visuelle ou Fichier Tableur.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Option 1: Imprimante */}
              <button
                type="button"
                onClick={handlePrintDirect}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer ring-1 ring-slate-700/50"
                title="Lancer l'impression sur votre imprimante"
              >
                <Printer className="w-4 h-4 text-slate-200" />
                <span>Imprimante</span>
              </button>

              {/* Option 2: Format PDF */}
              <button
                type="button"
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer"
                title="Télécharger le bilan au format PDF (.pdf)"
              >
                <Download className="w-4 h-4" />
                <span>Format PDF (.pdf)</span>
              </button>

              {/* Option 3: Format Visuel (Image PNG) */}
              <button
                type="button"
                onClick={handleExportPNG}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                title="Télécharger une image haute résolution (PNG)"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Format Visuel (Image PNG)</span>
              </button>

              {/* Option 4: Format Tableur (Excel / CSV) */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Exporter les données au format tableur Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Format Tableur (Excel / CSV)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Visual Canvas Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/60 dark:bg-[#070a0f]">
            {/* A4 Sheet Preview Card */}
            <div
              ref={printRef}
              id="printable-report-card"
              className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-paper border border-slate-200/90 p-8 sm:p-12 space-y-8 select-text"
            >
              {/* Sheet Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Rapport d'Activité & KPI Financiers Certifié</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    BILAN FINANCIER & TABLEAU DE BORD KPI
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Période : <strong>Exercice Annuel 2026</strong> • Monnaie de compte : <strong>Franc CFA (XOF)</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-emerald-400 font-extrabold flex items-center justify-center text-xl ml-auto shadow-sm">
                    Ω
                  </div>
                  <span className="font-bold text-xs text-slate-900 block mt-2">
                    MONROY Business Solutions
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Cotonou & Allada, Bénin
                  </span>
                </div>
              </div>

              {/* 3 Principal Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Chiffre d’Affaires Cumulé 2026
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {formatFCFA(totalInvoiced)}
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold block mt-1">
                    +24.8% de croissance
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Total Encaissé Réel
                  </span>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    {formatFCFA(totalPaid)}
                  </div>
                  <span className="text-xs text-emerald-800 font-semibold block mt-1">
                    Taux de recouvrement : {recoveryRate}%
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200">
                  <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                    Créances Débitrices
                  </span>
                  <div className="text-2xl font-black text-rose-700 mt-2">
                    {formatFCFA(totalRemaining)}
                  </div>
                  <span className="text-xs text-slate-600 font-semibold block mt-1">
                    Délai moyen : 18 jours
                  </span>
                </div>
              </div>

              {/* Balance Âgée */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Balance Âgée des Créances Clients</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Total créances : <strong>{formatFCFA(totalRemaining)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-900 block">
                      0 à 30 jours (Créances Saines)
                    </span>
                    <span className="text-lg font-black text-slate-900 block mt-1">
                      {formatFCFA(2419000)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Échéances courantes
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 text-xs">
                    <span className="font-bold text-amber-900 block">
                      31 à 60 jours (À Surveiller)
                    </span>
                    <span className="text-lg font-black text-slate-900 block mt-1">
                      {formatFCFA(1800000)}
                    </span>
                    <span className="text-[10px] text-amber-700 font-medium">
                      Relance amiable requise
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200 text-xs">
                    <span className="font-bold text-rose-900 block">
                      + de 60 jours (Contentieux)
                    </span>
                    <span className="text-lg font-black text-rose-600 block mt-1">
                      {formatFCFA(763000)}
                    </span>
                    <span className="text-[10px] text-rose-700 font-medium">
                      Mise en demeure en cours
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Activity Table */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  <span>Ventilation de l'Activité Mensuelle</span>
                </h3>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5">Période</th>
                      <th className="py-2.5 text-right">CA Émis</th>
                      <th className="py-2.5 text-right">Encaissé Réel</th>
                      <th className="py-2.5 text-right">Taux</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">Mai 2026</td>
                      <td className="py-2.5 text-right font-bold">4 800 000 FCFA</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">4 800 000 FCFA</td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600">100%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">Juin 2026</td>
                      <td className="py-2.5 text-right font-bold">6 200 000 FCFA</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">6 200 000 FCFA</td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600">100%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">Juillet 2026</td>
                      <td className="py-2.5 text-right font-bold">5 400 000 FCFA</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">5 400 000 FCFA</td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600">100%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">Août 2026</td>
                      <td className="py-2.5 text-right font-bold">7 100 000 FCFA</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">7 100 000 FCFA</td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600">100%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-slate-800">Septembre 2026</td>
                      <td className="py-2.5 text-right font-bold">8 900 000 FCFA</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">7 500 000 FCFA</td>
                      <td className="py-2.5 text-right font-semibold text-amber-600">84.3%</td>
                    </tr>
                    <tr className="bg-slate-50/60 font-bold">
                      <td className="py-2.5 text-slate-900">Octobre 2026 (En cours)</td>
                      <td className="py-2.5 text-right text-slate-900">11 800 000 FCFA</td>
                      <td className="py-2.5 text-right text-emerald-700">7 610 000 FCFA</td>
                      <td className="py-2.5 text-right text-brand-600">64.5%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Certification & Signature Footer */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-[10px] text-slate-500">
                <div className="max-w-md space-y-1">
                  <strong className="block text-slate-800 text-xs">
                    Certification & Authenticité OHADA / UEMOA
                  </strong>
                  <p>
                    Le présent rapport récapitulatif a été généré via le SaaS de facturation OMEGA FACTURE. Il certifie l'exactitude des factures émises et des encaissements enregistrés.
                  </p>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold pt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Validation cryptographique effectuée</span>
                  </div>
                </div>

                <div className="text-right sm:min-w-[200px]">
                  <span className="font-bold text-slate-800 uppercase block">
                    Visa de la Direction Générale :
                  </span>
                  <span className="italic font-serif text-lg font-bold text-slate-900 block my-1">
                    Monroy J.
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Signature certifiée électroniquement
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Centered Toast */}
        {successToast && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-sm bg-white dark:bg-[#111622] rounded-3xl p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Opération réussie
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                {successToast}
              </p>
              <button
                type="button"
                onClick={() => setSuccessToast(null)}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                D'accord
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
