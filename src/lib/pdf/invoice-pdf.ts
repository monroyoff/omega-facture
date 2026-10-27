import jsPDF from 'jspdf';
import { Invoice } from '@/lib/types';
import { formatFCFA, formatDateFR } from '@/lib/money/format';

/**
 * Helper sécurisé pour tracer des rectangles à angles arrondis sur Canvas
 * Fonctionne sur tous les navigateurs même anciens sans risquer d'exception.
 */
function safeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
  ctx.closePath();
}

export interface GenerateInvoicePDFOptions {
  invoice: Invoice;
  companyName?: string;
  companyAddress?: string;
  companyTaxId?: string;
  companyPhone?: string;
  companyEmail?: string;
}

/**
 * Générateur officiel de PDF haute résolution pour Factures et Devis OMEGA FACTURE
 * Conforme aux normes graphiques et comptables UEMOA (SYSCOHADA).
 */
export function generateInvoicePDF({
  invoice,
  companyName = 'MONROY Business Solutions',
  companyAddress = 'Allada & Cotonou, République du Bénin',
  companyTaxId = '0202110485960 — RCCM : RB/COT/21 B 1042',
  companyPhone = '+229 01 95 44 44 30',
  companyEmail = 'monmonnroyteam@gmail.com',
}: GenerateInvoicePDFOptions): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      const isQuote =
        invoice.documentKind === 'quote' || invoice.number.startsWith('DEV-');
      const docTitle = isQuote ? 'DEVIS ESTIMATIF' : 'FACTURE OFFICIELLE';

      // Dimensions A4 haute définition (1240 x 1754 px)
      const canvas = document.createElement('canvas');
      canvas.width = 1240;
      canvas.height = 1754;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Impossible d’initialiser le contexte Canvas 2D.');
      }

      // Fond blanc immaculé
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1240, 1754);

      // Barre supérieure institutionnelle
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1240, 140);

      // Logo Ω
      ctx.fillStyle = isQuote ? '#7c3aed' : '#2563eb';
      ctx.beginPath();
      safeRoundRect(ctx, 60, 35, 70, 70, 16);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
      ctx.fillText('Ω', 80, 84);

      // Nom entreprise & sous-titre
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.fillText(companyName, 150, 65);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        'Système de Facturation & Devis Certifié — Zone UEMOA / Afrique Francophone',
        150,
        92
      );

      // Bloc Document Type & Numéro à droite du header
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.fillText(docTitle, 1180, 65);

      ctx.fillStyle = isQuote ? '#d8b4fe' : '#93c5fd';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`N° ${invoice.number}`, 1180, 92);
      ctx.textAlign = 'left';

      // Bande métadonnées & statut
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 140, 1240, 50);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 190);
      ctx.lineTo(1240, 190);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText(`Date d'émission : ${formatDateFR(invoice.issueDate)}`, 60, 171);
      ctx.fillText(
        `${isQuote ? 'Validité offre' : 'Échéance'} : ${formatDateFR(invoice.dueDate)}`,
        420,
        171
      );

      // Badge de statut
      const statusLabel = isQuote
        ? invoice.status === 'sent'
          ? 'DEVIS ÉMIS'
          : 'BROUILLON'
        : invoice.status === 'paid'
        ? 'RÈGLEMENT SOLDÉ'
        : invoice.status === 'sent'
        ? 'ENVOYÉE / EN ATTENTE'
        : invoice.status === 'overdue'
        ? 'EN RETARD'
        : 'BROUILLON';

      const statusBg =
        invoice.status === 'paid'
          ? '#ecfdf5'
          : invoice.status === 'overdue'
          ? '#fff1f2'
          : '#eff6ff';
      const statusText =
        invoice.status === 'paid'
          ? '#059669'
          : invoice.status === 'overdue'
          ? '#e11d48'
          : '#2563eb';

      ctx.fillStyle = statusBg;
      ctx.beginPath();
      safeRoundRect(ctx, 960, 150, 220, 30, 8);
      ctx.fill();
      ctx.fillStyle = statusText;
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(statusLabel, 1070, 170);
      ctx.textAlign = 'left';

      // 2 Colonnes : ÉMETTEUR et DESTINATAIRE
      // Boîte Émetteur
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      safeRoundRect(ctx, 60, 215, 530, 170, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('ÉMETTEUR DU DOCUMENT', 85, 245);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText(companyName, 85, 272);

      ctx.fillStyle = '#475569';
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText(companyAddress, 85, 298);
      ctx.fillText(`IFU : ${companyTaxId}`, 85, 322);
      ctx.fillText(`Email : ${companyEmail} — Tél : ${companyPhone}`, 85, 346);

      // Boîte Client / Destinataire
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = isQuote ? '#ddd6fe' : '#bfdbfe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      safeRoundRect(ctx, 650, 215, 530, 170, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isQuote ? '#7c3aed' : '#2563eb';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText(isQuote ? 'DEVIS ÉTABLI POUR' : 'FACTURÉ À', 675, 245);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px system-ui, sans-serif';
      const clientCompany = invoice.client?.company || invoice.client?.name || 'Client';
      ctx.fillText(clientCompany, 675, 272);

      ctx.fillStyle = '#475569';
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText(`Contact : ${invoice.client?.name || '-'}`, 675, 298);
      ctx.fillText(
        `${invoice.client?.city || 'Cotonou'}, ${invoice.client?.country || 'Bénin'}${
          invoice.client?.taxId ? ` • IFU : ${invoice.client.taxId}` : ''
        }`,
        675,
        322
      );
      ctx.fillText(
        `Email : ${invoice.client?.email || '-'} — Tél : ${invoice.client?.phone || '-'}`,
        675,
        346
      );

      // TABLEAU DES ARTICLES / PRESTATIONS
      let tableY = 415;
      ctx.fillStyle = '#0f172a';
      safeRoundRect(ctx, 60, tableY, 1120, 42, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('DESCRIPTION DES PRESTATIONS / PRODUITS', 80, tableY + 26);
      ctx.fillText('QTÉ', 680, tableY + 26);
      ctx.fillText('PRIX UNIT. HT', 770, tableY + 26);
      ctx.fillText('REMISE', 950, tableY + 26);
      ctx.textAlign = 'right';
      ctx.fillText('TOTAL HT', 1160, tableY + 26);
      ctx.textAlign = 'left';

      tableY += 45;

      const items = invoice.items || [];
      items.forEach((item, index) => {
        const rowHeight = 44;
        ctx.fillStyle = index % 2 === 0 ? '#ffffff' : '#f8fafc';
        ctx.fillRect(60, tableY, 1120, rowHeight);
        ctx.strokeStyle = '#f1f5f9';
        ctx.strokeRect(60, tableY, 1120, rowHeight);

        // Description
        ctx.fillStyle = '#1e293b';
        ctx.font = '13px system-ui, sans-serif';
        const desc = item.description || 'Prestation de services';
        ctx.fillText(
          desc.length > 55 ? desc.substring(0, 53) + '...' : desc,
          80,
          tableY + 27
        );

        // Quantité
        ctx.fillStyle = '#475569';
        ctx.fillText(item.quantity.toString(), 690, tableY + 27);

        // Prix Unitaire
        ctx.fillText(formatFCFA(item.unitPrice), 770, tableY + 27);

        // Remise
        ctx.fillStyle = item.discountPct ? '#059669' : '#94a3b8';
        ctx.fillText(item.discountPct ? `${item.discountPct}%` : '-', 950, tableY + 27);

        // Total Ligne HT
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(formatFCFA(item.total), 1160, tableY + 27);
        ctx.textAlign = 'left';

        tableY += rowHeight;
      });

      // Lignes de séparation sous le tableau
      tableY += 25;

      // BLOC TOTAL & RÈGLEMENTS À DROITE
      const summaryX = 720;
      const summaryW = 460;
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      safeRoundRect(ctx, summaryX, tableY, summaryW, 260, 16);
      ctx.fill();
      ctx.stroke();

      let sY = tableY + 36;
      const drawSummaryLine = (label: string, value: string, bold = false, color = '#1e293b') => {
        ctx.fillStyle = '#64748b';
        ctx.font = bold ? 'bold 13px system-ui, sans-serif' : '13px system-ui, sans-serif';
        ctx.fillText(label, summaryX + 25, sY);

        ctx.fillStyle = color;
        ctx.font = bold ? 'bold 16px system-ui, sans-serif' : '13px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(value, summaryX + summaryW - 25, sY);
        ctx.textAlign = 'left';
        sY += 34;
      };

      // Calcul dynamique du taux de TVA appliqué (ex: 19% Niger, 18% standard, 9% ou 10% taux réduit)
      const nonZeroVatItem = invoice.items?.find((it) => (it.vatRate || 0) > 0);
      const appliedVatRate = invoice.vatAmount > 0 ? (nonZeroVatItem?.vatRate || 18) : 0;
      drawSummaryLine('Sous-total HT :', formatFCFA(invoice.subtotal));
      drawSummaryLine(`TVA (${appliedVatRate}%) :`, formatFCFA(invoice.vatAmount));
      if (invoice.discount && invoice.discount > 0) {
        drawSummaryLine('Remise globale accordée :', `-${formatFCFA(invoice.discount)}`, false, '#059669');
      }

      // Ligne de Total TTC mise en avant
      ctx.fillStyle = isQuote ? '#7c3aed' : '#2563eb';
      ctx.beginPath();
      safeRoundRect(ctx, summaryX + 15, sY - 10, summaryW - 30, 48, 10);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText('TOTAL NET À PAYER TTC :', summaryX + 30, sY + 21);
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(formatFCFA(invoice.total), summaryX + summaryW - 30, sY + 21);
      ctx.textAlign = 'left';
      sY += 60;

      // Montant Payé et Reste à Régler pour les Factures
      if (!isQuote) {
        const remaining = Math.max(0, invoice.total - (invoice.amountPaid || 0));
        drawSummaryLine(
          'Montant déjà encaissé (Acomptes) :',
          formatFCFA(invoice.amountPaid || 0),
          false,
          '#059669'
        );
        drawSummaryLine(
          'Solde Restant Dû :',
          formatFCFA(remaining),
          true,
          remaining > 0 ? '#e11d48' : '#059669'
        );
      }

      // BLOC MODALITÉS DE PAIEMENT & MENTIONS À GAUCHE
      const notesX = 60;
      const notesW = 630;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      safeRoundRect(ctx, notesX, tableY, notesW, 260, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText('MODALITÉS DE RÈGLEMENT & COORDONNÉES', notesX + 25, tableY + 36);

      ctx.fillStyle = '#475569';
      ctx.font = '12px system-ui, sans-serif';
      let nY = tableY + 68;

      ctx.fillText('• Mobile Money Bénin & UEMOA (Paiement instantané recommandé) :', notesX + 25, nY);
      nY += 22;
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('  MTN Mobile Money : +229 01 95 44 44 30  |  Moov Money : +229 01 97 00 00 00', notesX + 25, nY);
      nY += 26;

      ctx.fillStyle = '#475569';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('• Virement Bancaire :', notesX + 25, nY);
      nY += 22;
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('  Banque : BOA Bénin  |  RIB : BJ061 01001 001234567890 45', notesX + 25, nY);
      nY += 28;

      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 11px system-ui, sans-serif';
      if (isQuote) {
        ctx.fillText(
          'Mention à apposer pour validation : « Bon pour accord et commande », daté et signé.',
          notesX + 25,
          nY
        );
      } else {
        ctx.fillText(
          'Pénalités de retard applicables après échéance : 1,5% par mois. Pas d’escompte pour paiement anticipé.',
          notesX + 25,
          nY
        );
      }

      // PIED DE PAGE : CERTIFICATION & SIGNATURE
      const footerY = 1530;
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(60, footerY);
      ctx.lineTo(1180, footerY);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 11px system-ui, sans-serif';
      ctx.fillText(
        'Document financier officiel émis et certifié conforme par le système comptable centralisé OMEGA FACTURE.',
        60,
        footerY + 30
      );
      ctx.fillText(
        'Réglementation fiscale UEMOA (Bénin, Côte d’Ivoire, Sénégal, Togo, Burkina, Mali, Niger, Guinée-Bissau).',
        60,
        footerY + 48
      );

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('Visa & Signature de la Direction :', 880, footerY + 30);

      ctx.fillStyle = isQuote ? '#7c3aed' : '#2563eb';
      ctx.font = 'italic bold 24px serif';
      ctx.fillText('Monroy J.', 880, footerY + 65);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText('Signature électronique authentifiée', 880, footerY + 84);

      // Génération du fichier PDF via jsPDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Format standard A4 : 210mm x 297mm
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      const safeClient = (invoice.client?.company || invoice.client?.name || 'client')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 20);

      const fileName = `${invoice.number}_${safeClient}.pdf`;
      pdf.save(fileName);
      resolve(true);
    } catch (error) {
      console.error('[generateInvoicePDF] Erreur :', error);
      reject(error);
    }
  });
}
