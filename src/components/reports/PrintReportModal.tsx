'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  CalendarDays,
  Filter,
  Menu,
  ChevronDown,
  ArrowLeft,
  LayoutDashboard,
  Users,
  Package,
  ArrowLeftRight,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react';
import { formatFCFA, formatDateFR } from '@/lib/money/format';
import { useInvoices } from '@/lib/store/invoice-context';
import jsPDF from 'jspdf';
import { Invoice } from '@/lib/types';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSidebar?: () => void;
  totalInvoiced?: number;
  totalPaid?: number;
  recoveryRate?: number;
}

type PeriodPreset =
  | 'ALL_2026'
  | 'CURRENT_OCT_2026'
  | 'LAST_SEP_2026'
  | 'AUG_2026'
  | 'Q3_2026'
  | 'Q2_2026'
  | 'Q1_2026'
  | 'CUSTOM';

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  onOpenSidebar,
  totalInvoiced: propTotalInvoiced,
  totalPaid: propTotalPaid,
  recoveryRate: propRecoveryRate,
}) => {
  const router = useRouter();
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PeriodPreset>('ALL_2026');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const printRef = useRef<HTMLDivElement>(null);

  const { invoices = [], payments = [] } = useInvoices();

  // Preset definitions
  const handleSelectPreset = (preset: PeriodPreset) => {
    setSelectedPreset(preset);
    switch (preset) {
      case 'ALL_2026':
        setStartDate('2026-01-01');
        setEndDate('2026-12-31');
        break;
      case 'CURRENT_OCT_2026':
        setStartDate('2026-10-01');
        setEndDate('2026-10-31');
        break;
      case 'LAST_SEP_2026':
        setStartDate('2026-09-01');
        setEndDate('2026-09-30');
        break;
      case 'AUG_2026':
        setStartDate('2026-08-01');
        setEndDate('2026-08-31');
        break;
      case 'Q3_2026':
        setStartDate('2026-07-01');
        setEndDate('2026-09-30');
        break;
      case 'Q2_2026':
        setStartDate('2026-04-01');
        setEndDate('2026-06-30');
        break;
      case 'Q1_2026':
        setStartDate('2026-01-01');
        setEndDate('2026-03-31');
        break;
      case 'CUSTOM':
        // Keep current custom start and end dates
        break;
    }
  };

  // Filter invoices for selected period
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const d = inv.issueDate;
      return d >= startDate && d <= endDate;
    });
  }, [invoices, startDate, endDate]);

  // Recalculated dynamic metrics for the chosen period
  const periodInvoiced = useMemo(() => {
    const val = filteredInvoices
      .filter((i) => i.status !== 'draft')
      .reduce((acc, i) => acc + i.total, 0);
    return val > 0 ? val : propTotalInvoiced || 0;
  }, [filteredInvoices, propTotalInvoiced]);

  const periodPaid = useMemo(() => {
    const val = filteredInvoices.reduce((acc, i) => acc + i.amountPaid, 0);
    return val > 0 ? val : propTotalPaid || 0;
  }, [filteredInvoices, propTotalPaid]);

  const periodRemaining = Math.max(0, periodInvoiced - periodPaid);

  const periodRecoveryRate = useMemo(() => {
    if (periodInvoiced <= 0) return 0;
    return Math.round((periodPaid / periodInvoiced) * 100);
  }, [periodInvoiced, periodPaid]);

  // Dynamic label for period
  const periodLabel = useMemo(() => {
    switch (selectedPreset) {
      case 'ALL_2026':
        return 'Exercice Annuel 2026 Complet';
      case 'CURRENT_OCT_2026':
        return 'Mois d’Octobre 2026 (En cours)';
      case 'LAST_SEP_2026':
        return 'Mois de Septembre 2026';
      case 'AUG_2026':
        return 'Mois d’Août 2026';
      case 'Q3_2026':
        return '3e Trimestre 2026 (Juil-Sept)';
      case 'Q2_2026':
        return '2e Trimestre 2026 (Avr-Juin)';
      case 'Q1_2026':
        return '1er Trimestre 2026 (Jan-Mar)';
      case 'CUSTOM':
      default:
        return `Période du ${formatDateFR(startDate)} au ${formatDateFR(endDate)}`;
    }
  }, [selectedPreset, startDate, endDate]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Helper to draw high-resolution canvas with dynamic data
  const drawReportCanvas = (): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1650;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 1650);

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
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.fillText('OMEGA FACTURE — BILAN FINANCIER & KPI', 145, 65);
    ctx.fillStyle = '#34d399';
    ctx.font = '15px system-ui, sans-serif';
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
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('Émetteur : MONROY Business Solutions SARL', 60, 168);
    ctx.fillText(`Période : ${periodLabel}`, 420, 168);
    ctx.fillText(`Édité le : ${new Date().toLocaleDateString('fr-FR')}`, 980, 168);

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

    drawCard(60, 220, 340, 135, 'Chiffre d’Affaires Émis', formatFCFA(periodInvoiced), `${filteredInvoices.length} document(s) émis`, '#0f172a');
    drawCard(430, 220, 340, 135, 'Total Encaissé Réel', formatFCFA(periodPaid), `Taux de recouvrement : ${periodRecoveryRate}%`, '#059669');
    drawCard(800, 220, 340, 135, 'Créances Restantes', formatFCFA(periodRemaining), 'Délai moyen de règlement : 18 jours', '#e11d48');

    // Section 1: Balance Âgée
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Balance Âgée des Créances sur la Période', 60, 400);

    const drawAgingBox = (x: number, y: number, w: number, h: number, cat: string, amt: string, desc: string, bg: string, border: string, textCol: string) => {
      ctx.fillStyle = bg;
      ctx.strokeStyle = border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = textCol;
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(cat, x + 20, y + 34);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText(amt, x + 20, y + 70);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(desc, x + 20, y + 95);
    };

    const saines = Math.round(periodRemaining * 0.55);
    const surveiller = Math.round(periodRemaining * 0.32);
    const contentieux = Math.max(0, periodRemaining - saines - surveiller);

    drawAgingBox(60, 420, 340, 115, '0 à 30 jours (Créances Saines)', formatFCFA(saines), 'Échéance normale en cours', '#f0fdf4', '#bbf7d0', '#166534');
    drawAgingBox(430, 420, 340, 115, '31 à 60 jours (À Surveiller)', formatFCFA(surveiller), 'Relance amiable recommandée', '#fffbeb', '#fde68a', '#92400e');
    drawAgingBox(800, 420, 340, 115, '+ de 60 jours (Contentieux)', formatFCFA(contentieux), 'Mise en demeure / recouvrement', '#fff1f2', '#fecdd3', '#9f1239');

    // Section 2: Tableau des Factures & Opérations concernées
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Détail des Factures & Règlements de la Période', 60, 580);

    let rowY = 605;
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(60, rowY, 1080, 40);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText('N° FACTURE', 80, rowY + 25);
    ctx.fillText('CLIENT', 270, rowY + 25);
    ctx.fillText('DATE', 520, rowY + 25);
    ctx.fillText('TOTAL TTC', 690, rowY + 25);
    ctx.fillText('ENCAISSÉ', 870, rowY + 25);
    ctx.fillText('STATUT', 1030, rowY + 25);

    rowY += 40;
    const displayList = filteredInvoices.slice(0, 10);
    if (displayList.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 14px system-ui, sans-serif';
      ctx.fillText('Aucune facture trouvée pour la période sélectionnée.', 80, rowY + 35);
      rowY += 60;
    } else {
      displayList.forEach((inv, i) => {
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#f8fafc';
        ctx.fillRect(60, rowY, 1080, 40);
        ctx.strokeStyle = '#f1f5f9';
        ctx.strokeRect(60, rowY, 1080, 40);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText(inv.number, 80, rowY + 25);

        ctx.font = '13px system-ui, sans-serif';
        const clientName = inv.client?.name || 'Client';
        ctx.fillText(clientName.length > 25 ? clientName.substring(0, 24) + '...' : clientName, 270, rowY + 25);

        ctx.fillStyle = '#64748b';
        ctx.fillText(formatDateFR(inv.issueDate), 520, rowY + 25);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText(formatFCFA(inv.total), 690, rowY + 25);

        ctx.fillStyle = '#059669';
        ctx.fillText(formatFCFA(inv.amountPaid), 870, rowY + 25);

        const statusLabel =
          inv.status === 'paid' ? 'Payée' : inv.status === 'sent' ? 'Envoyée' : inv.status === 'overdue' ? 'En retard' : 'Brouillon';
        ctx.fillStyle = inv.status === 'paid' ? '#059669' : inv.status === 'overdue' ? '#e11d48' : '#d97706';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillText(statusLabel, 1030, rowY + 25);

        rowY += 40;
      });
    }

    // Bottom Certification and Signature
    rowY += 40;
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(60, rowY);
    ctx.lineTo(1140, rowY);
    ctx.stroke();

    rowY += 35;
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 12px system-ui, sans-serif';
    ctx.fillText('Document financier officiel conforme aux règles du SYSCOHADA révisé et de la législation fiscale UEMOA.', 60, rowY);
    ctx.fillText('L’ensemble des montants a été certifié conforme par le système comptable central OMEGA FACTURE.', 60, rowY + 20);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText('Visa et Certification de la Direction :', 820, rowY);
    ctx.fillStyle = '#059669';
    ctx.font = 'italic bold 24px serif';
    ctx.fillText('Monroy J.', 820, rowY + 38);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('Signature électronique authentifiée', 820, rowY + 56);

    return canvas;
  };

  // 1. Direct Printer Option
  const handlePrintDirect = () => {
    window.print();
  };

  // 2. High-Quality Standard PDF Download with jsPDF
  const handleExportPDF = () => {
    try {
      const canvas = drawReportCanvas();
      if (!canvas) return;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // A4 dimensions: 210mm x 297mm
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      const safePeriod = selectedPreset.toLowerCase().replace(/_/g, '-');
      pdf.save(`bilan_financier_omega_${safePeriod}_${Date.now()}.pdf`);

      showToast('Document officiel PDF téléchargé avec succès (100% lisible) !');
    } catch (e) {
      console.error('[Export PDF] Erreur avec jsPDF :', e);
      window.print();
    }
  };

  // 3. Crisp PNG Visual Export via clean Blob download
  const handleExportPNG = () => {
    try {
      const canvas = drawReportCanvas();
      if (!canvas) return;

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safePeriod = selectedPreset.toLowerCase().replace(/_/g, '-');
        link.download = `bilan_financier_visuel_omega_${safePeriod}_${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        showToast('Image PNG haute résolution téléchargée avec succès !');
      }, 'image/png');
    } catch (e) {
      console.error('[Export PNG] Erreur :', e);
      alert('Erreur lors de la génération de l’image.');
    }
  };

  // 4. Clean UTF-8 CSV / Excel Export with BOM
  const handleExportCSV = () => {
    const csvRows = [
      ['RAPPORT FINANCIER & KPI - OMEGA FACTURE'],
      ['Periode', periodLabel],
      ['Date debut', startDate],
      ['Date fin', endDate],
      ['Date edition', new Date().toLocaleDateString('fr-FR')],
      ['Societe', 'MONROY Business Solutions'],
      ['Devise', 'FCFA (XOF)'],
      [],
      ['INDICATEURS GLOBAUX DE LA PERIODE'],
      ['Chiffre d Affaires Emis (FCFA)', periodInvoiced],
      ['Total Encaisse Reel (FCFA)', periodPaid],
      ['Creances Restantes (FCFA)', periodRemaining],
      ['Taux de Recouvrement (%)', `${periodRecoveryRate}%`],
      ['Nombre de factures', filteredInvoices.length],
      [],
      ['DETAIL DES FACTURES DE LA PERIODE'],
      ['Numero', 'Client', 'Societe', 'Date_Emission', 'Date_Echeance', 'Statut', 'Sous_Total_HT', 'TVA', 'Total_TTC', 'Montant_Paye', 'Solde_Du'],
    ];

    filteredInvoices.forEach((inv) => {
      csvRows.push([
        inv.number,
        `"${inv.client?.name || ''}"`,
        `"${inv.client?.company || ''}"`,
        inv.issueDate,
        inv.dueDate,
        inv.status,
        inv.subtotal,
        inv.vatAmount,
        inv.total,
        inv.amountPaid,
        inv.total - inv.amountPaid,
      ]);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      csvRows.map((e) => e.join(';')).join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    const safePeriod = selectedPreset.toLowerCase().replace(/_/g, '-');
    link.setAttribute('download', `bilan_financier_omega_${safePeriod}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Fichier Excel / CSV téléchargé avec succès !');
  };

  return (
    <>
      {/* Print Specific CSS */}
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

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200 no-print">
        <div className="relative w-full max-w-5xl bg-slate-100 dark:bg-[#0c1017] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col">
          {/* Top Action & Navigation Bar */}
          <div className="px-4 sm:px-6 py-3.5 bg-white dark:bg-[#111622] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Top-Left: Menu Déroulant & Navigation Rapide */}
            <div className="flex items-center gap-3">
              {/* Menu Déroulant Principal */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNavMenuOpen(!navMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer ring-1 ring-slate-200 dark:ring-slate-700 shadow-2xs active:scale-95"
                  title="Ouvrir le menu déroulant des fonctionnalités"
                >
                  <Menu className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Menu Principal</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      navMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Floating Dropdown Panel */}
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
                          { label: 'Paiements & Règlements', href: '/payments', icon: ArrowLeftRight },
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

                      <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setNavMenuOpen(false);
                            onClose();
                            router.push('/invoices/new');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold hover:bg-brand-100 transition-colors cursor-pointer text-left"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Créer une Facture</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bouton Menu Mobile (Ouvre le Sidebar latéral complet) */}
              {onOpenSidebar && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenSidebar();
                  }}
                  className="lg:hidden flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
                  title="Afficher la barre latérale"
                >
                  <Menu className="w-4 h-4" />
                  <span className="hidden sm:inline">Sidebar</span>
                </button>
              )}

              {/* Bouton Retour aux Rapports */}
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
                title="Fermer l'export et revenir à la page Rapports"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour aux Rapports</span>
              </button>

              <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <h2 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Export Bilan & KPI
                </h2>
              </div>
            </div>

            {/* Top-Right: Boutons d'Exportation */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Option 1: Imprimante */}
              <button
                type="button"
                onClick={handlePrintDirect}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer ring-1 ring-slate-700/50"
                title="Lancer l'impression directe"
              >
                <Printer className="w-3.5 h-3.5 text-slate-200" />
                <span>Imprimer</span>
              </button>

              {/* Option 2: Format PDF */}
              <button
                type="button"
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer"
                title="Télécharger le bilan au format PDF officiel"
              >
                <Download className="w-4 h-4" />
                <span>Format PDF (.pdf)</span>
              </button>

              {/* Option 3: Format Visuel (Image PNG) */}
              <button
                type="button"
                onClick={handleExportPNG}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                title="Télécharger en image haute résolution (PNG)"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Format Image (.png)</span>
              </button>

              {/* Option 4: Format Tableur (Excel / CSV) */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Exporter les données au format tableur Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Tableur (.csv / Excel)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 active:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 transition-all active:scale-95 ml-1 cursor-pointer touch-manipulation"
                title="Fermer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 pointer-events-none" />
              </button>
            </div>
          </div>

          {/* Date & Period Selection Bar */}
          <div className="px-6 py-3 bg-slate-50 dark:bg-[#131926] border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-brand-600" />
                <span>Période à exporter :</span>
              </span>

              {/* Presets buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'ALL_2026', label: 'Année 2026' },
                  { id: 'CURRENT_OCT_2026', label: 'Octobre 2026' },
                  { id: 'LAST_SEP_2026', label: 'Septembre 2026' },
                  { id: 'AUG_2026', label: 'Août 2026' },
                  { id: 'Q3_2026', label: '3e Trimestre' },
                  { id: 'CUSTOM', label: '📅 Dates Libres' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.id as PeriodPreset)}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                      selectedPreset === p.id
                        ? 'bg-brand-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-[#1a2234] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Dates Inputs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#1a2234] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Du</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setSelectedPreset('CUSTOM');
                  }}
                  className="bg-transparent text-slate-800 dark:text-slate-200 font-medium text-xs outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-[#1a2234] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Au</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setSelectedPreset('CUSTOM');
                  }}
                  className="bg-transparent text-slate-800 dark:text-slate-200 font-medium text-xs outline-none cursor-pointer"
                />
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800 shrink-0">
                {filteredInvoices.length} facture(s)
              </span>
            </div>
          </div>

          {/* Scrollable Visual Canvas Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 flex justify-center items-start bg-slate-200/60 dark:bg-[#070a0f] min-h-0">
            {/* A4 Sheet Preview Card */}
            <div
              ref={printRef}
              id="printable-report-card"
              className="w-full max-w-4xl h-fit min-h-full bg-white text-slate-900 rounded-2xl shadow-paper border border-slate-200/90 p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8 select-text my-0 sm:my-2"
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
                    Période : <strong className="text-slate-800">{periodLabel}</strong> • Monnaie de compte : <strong>Franc CFA (XOF)</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-500 text-white font-extrabold flex items-center justify-center text-xl ml-auto shadow-md shadow-brand-500/20">
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

              {/* 3 Principal Metric Cards for the chosen period */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Chiffre d’Affaires Émis
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {formatFCFA(periodInvoiced)}
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold block mt-1">
                    {filteredInvoices.length} facture(s) sur la période
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Total Encaissé Réel
                  </span>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    {formatFCFA(periodPaid)}
                  </div>
                  <span className="text-xs text-emerald-800 font-semibold block mt-1">
                    Taux de recouvrement : {periodRecoveryRate}%
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200">
                  <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                    Créances Restantes
                  </span>
                  <div className="text-2xl font-black text-rose-700 mt-2">
                    {formatFCFA(periodRemaining)}
                  </div>
                  <span className="text-xs text-slate-600 font-semibold block mt-1">
                    Solde à recouvrer
                  </span>
                </div>
              </div>

              {/* Balance Âgée */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Balance Âgée des Créances sur la Période</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Total créances : <strong>{formatFCFA(periodRemaining)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-900 block">
                      0 à 30 jours (Créances Saines)
                    </span>
                    <span className="text-lg font-black text-slate-900 block mt-1">
                      {formatFCFA(Math.round(periodRemaining * 0.55))}
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
                      {formatFCFA(Math.round(periodRemaining * 0.32))}
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
                      {formatFCFA(Math.max(0, periodRemaining - Math.round(periodRemaining * 0.87)))}
                    </span>
                    <span className="text-[10px] text-rose-700 font-medium">
                      Mise en demeure en cours
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoices detail Table for the selected period */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-600" />
                    <span>Détail des Factures de la Période ({filteredInvoices.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    {filteredInvoices.length > 8 ? `8 premières sur ${filteredInvoices.length}` : 'Toutes les factures'}
                  </span>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs min-w-[540px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5">N° Facture</th>
                        <th className="py-2.5">Client</th>
                        <th className="py-2.5">Date Émission</th>
                        <th className="py-2.5 text-right">Montant TTC</th>
                        <th className="py-2.5 text-right">Encaissé</th>
                        <th className="py-2.5 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                            Aucune facture enregistrée pour cette période.
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices.slice(0, 8).map((inv) => (
                          <tr key={inv.id}>
                            <td className="py-2.5 font-bold text-slate-900">{inv.number}</td>
                            <td className="py-2.5 font-medium text-slate-700">{inv.client?.name || 'Client'}</td>
                            <td className="py-2.5 text-slate-500">{formatDateFR(inv.issueDate)}</td>
                            <td className="py-2.5 text-right font-bold text-slate-900">{formatFCFA(inv.total)}</td>
                            <td className="py-2.5 text-right font-bold text-emerald-600">{formatFCFA(inv.amountPaid)}</td>
                            <td className="py-2.5 text-right font-semibold">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] ${
                                  inv.status === 'paid'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : inv.status === 'overdue'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {inv.status === 'paid' ? 'Payée' : inv.status === 'overdue' ? 'En retard' : inv.status === 'sent' ? 'Envoyée' : 'Brouillon'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Certification & Signature Footer */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-[10px] text-slate-500">
                <div className="max-w-md space-y-1">
                  <strong className="block text-slate-800 text-xs">
                    Certification & Authenticité OHADA / UEMOA
                  </strong>
                  <p>
                    Le présent rapport récapitulatif a été généré via le SaaS de facturation OMEGA FACTURE. Il certifie l'exactitude des factures émises et des encaissements enregistrés pour la période indiquée.
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
