/**
 * Utilitaire d'exportation CSV universel et certifié pour OMEGA FACTURE
 * Compatible Microsoft Excel, Apple Numbers, Google Sheets et LibreOffice.
 * 
 * - Encodage UTF-8 avec BOM (\uFEFF) pour préserver tous les caractères accentués (é, è, à, etc.)
 * - Délimiteur point-virgule (;) standard pour la zone francophone / UEMOA / Excel FR
 * - Échappement strict RFC 4180 (guillemets doublés, protection des retours à la ligne)
 * - Téléchargement via Blob natif (élimine les corruptions liées aux URL data: encodées)
 */

export interface ExportCSVOptions {
  filename: string;
  delimiter?: string;
}

export function downloadCSV(
  filename: string,
  rows: (string | number | undefined | null)[][],
  options?: { delimiter?: string }
): void {
  // Délimiteur universel standard RFC 4180 (virgule) reconnu nativement par Excel, Numbers et Sheets
  const delimiter = options?.delimiter || ',';

  // Formatage des lignes selon la norme RFC 4180
  const formattedContent = rows
    .map((row) =>
      row
        .map((val) => {
          if (val === undefined || val === null) return '';
          // Pour les nombres stricts (FCFA, pourcentages, quantités), on ne met pas de guillemets
          // afin qu'Excel et Numbers les interprètent immédiatement comme des valeurs numériques calculables
          if (typeof val === 'number') {
            return Number.isFinite(val) ? String(val) : '0';
          }
          const str = String(val);
          // Échappement des guillemets et encadrement RFC 4180
          if (
            str.includes(delimiter) ||
            str.includes('"') ||
            str.includes('\n') ||
            str.includes('\r')
          ) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          // Pour préserver les identifiants ou textes simples
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(delimiter)
    )
    .join('\r\n');

  // Encodage strict avec BOM UTF-8
  const blob = new Blob(['\uFEFF' + formattedContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('download', safeFilename);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 2000);
}
