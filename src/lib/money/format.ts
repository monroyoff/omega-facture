/**
 * Formats a monetary amount with currency support (FCFA, EUR, USD...).
 * Defaults to FCFA if no currency is specified or if FCFA / XOF.
 * Example: 250000, 'FCFA' -> "250 000 FCFA"
 * Example: 2500, 'EUR' -> "2 500 €"
 * Handles non-breaking spaces safely across all browsers and PDF renderers.
 */
export function formatFCFA(amount: number | bigint, currencyOverride?: string): string {
  const num = typeof amount === 'bigint' ? Number(amount) : Math.round(amount || 0);
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);

  // Replace narrow no-break space (U+202F) or standard no-break space (U+00A0) with standard space for broad compatibility
  const cleanFormatted = formatted.replace(/[\u202F\u00A0]/g, ' ');

  if (currencyOverride) {
    const currUpper = currencyOverride.toUpperCase();
    if (currUpper === 'EUR' || currUpper === '€') {
      return `${cleanFormatted} €`;
    }
    if (currUpper === 'USD' || currUpper === '$') {
      return `${cleanFormatted} $`;
    }
    if (currUpper !== 'FCFA' && currUpper !== 'XOF' && currUpper !== 'XAF') {
      return `${cleanFormatted} ${currencyOverride}`;
    }
  }

  return `${cleanFormatted} FCFA`;
}

/**
 * Formats a monetary amount with an explicit currency code or symbol.
 */
export function formatCurrency(amount: number | bigint, currency: string = 'FCFA'): string {
  return formatFCFA(amount, currency);
}

/**
 * Formats an ISO date string (YYYY-MM-DD) to French day/month/year format: DD/MM/YYYY
 * Example: "2026-10-18" -> "18/10/2026"
 */
export function formatDateFR(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!day || !month || !year) return dateString;
  return `${day}/${month}/${year}`;
}
