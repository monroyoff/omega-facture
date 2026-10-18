/**
 * Pure calculation engine for invoices.
 * Adheres strictly to the architectural rules:
 * - FCFA is an integer currency (no cents).
 * - Line total HT = round(quantity * unit_price * (1 - discount%)).
 * - Subtotal HT = sum of line totals.
 * - VAT = sum per rate group of round(group_base * rate / 100).
 * - Total TTC = Subtotal HT - Global Discount + Total VAT.
 */

export interface LineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  vatRate: number; // 0, 18, etc.
}

export interface InvoiceTotals {
  subtotalHT: number;
  discountAmount: number;
  vatGroups: { rate: number; base: number; vat: number }[];
  vatAmount: number;
  totalTTC: number;
  netToPay: number;
}

export function calculateInvoiceTotals(
  items: LineItemInput[],
  globalDiscount: number = 0,
  amountPaid: number = 0
): InvoiceTotals {
  let subtotalHT = 0;
  const vatBases: Record<number, number> = {};

  for (const item of items) {
    const qty = Math.max(0, item.quantity || 0);
    const price = Math.max(0, Math.round(item.unitPrice || 0));
    const disc = Math.min(100, Math.max(0, item.discountPct || 0));

    // Line HT calculation
    const lineTotal = Math.round(qty * price * (1 - disc / 100));
    subtotalHT += lineTotal;

    // Accumulate VAT base per rate
    const rate = item.vatRate || 0;
    vatBases[rate] = (vatBases[rate] || 0) + lineTotal;
  }

  // Calculate VAT per rate group to avoid rounding errors
  let totalVAT = 0;
  const vatGroups = Object.entries(vatBases).map(([rateStr, base]) => {
    const rate = Number(rateStr);
    const vat = rate > 0 ? Math.round((base * rate) / 100) : 0;
    totalVAT += vat;
    return { rate, base, vat };
  });

  const discount = Math.min(subtotalHT, Math.max(0, Math.round(globalDiscount || 0)));
  const totalTTC = Math.max(0, subtotalHT - discount + totalVAT);
  const paid = Math.min(totalTTC, Math.max(0, Math.round(amountPaid || 0)));
  const netToPay = Math.max(0, totalTTC - paid);

  return {
    subtotalHT,
    discountAmount: discount,
    vatGroups,
    vatAmount: totalVAT,
    totalTTC,
    netToPay,
  };
}
