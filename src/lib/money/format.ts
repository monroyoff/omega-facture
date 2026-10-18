/**
 * Formats a monetary amount into FCFA currency display.
 * Example: 250000 -> "250 000 FCFA"
 * Handles non-breaking spaces safely across all browsers and PDF renderers.
 */
export function formatFCFA(amount: number | bigint): string {
  const num = typeof amount === 'bigint' ? Number(amount) : Math.round(amount || 0);
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);

  // Replace narrow no-break space (U+202F) or standard no-break space (U+00A0) with standard space for broad compatibility
  const cleanFormatted = formatted.replace(/[\u202F\u00A0]/g, ' ');

  return `${cleanFormatted} FCFA`;
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
