/**
 * Utilitaires d'authentification et de normalisation des numéros de téléphone
 * Spécifique UEMOA & Europe (Bénin, CI, Sénégal, Togo, Burkina, Mali, Niger, Guinée-Bissau, France, Belgique)
 */

export interface CountryPhonePrefix {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  example: string;
}

export const PHONE_PREFIXES: CountryPhonePrefix[] = [
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯', example: '01 95 44 44 30' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮', example: '07 12 34 56 78' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳', example: '77 123 45 67' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬', example: '90 12 34 56' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫', example: '70 12 34 56' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱', example: '76 12 34 56' },
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪', example: '96 12 34 56' },
  { code: 'GW', name: 'Guinée-Bissau', dialCode: '+245', flag: '🇬🇼', example: '955 12 34' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', example: '06 12 34 56 78' },
  { code: 'BE', name: 'Belgique', dialCode: '+32', flag: '🇧🇪', example: '0470 12 34 56' },
];

/**
 * Nettoie et extrait les chiffres uniquement
 */
export function cleanPhoneDigits(raw: string): string {
  if (!raw) return '';
  return raw.replace(/\D/g, '');
}

/**
 * Détecte si l'identifiant saisi est un numéro de téléphone (au lieu d'un email)
 */
export function isPhoneIdentifier(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.includes('@')) return false;
  const digits = cleanPhoneDigits(trimmed);
  return digits.length >= 6;
}

/**
 * Normalise un numéro de téléphone au format international standard E.164 (ex: +22997000000)
 */
export function normalizePhone(raw: string, defaultDialCode = '+229'): string {
  if (!raw) return '';
  let cleaned = raw.trim().replace(/[\s\-\.\(\)]/g, '');

  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }

  // Déjà au format international avec '+'
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  const dialClean = defaultDialCode.startsWith('+') ? defaultDialCode : `+${defaultDialCode}`;

  // Si commence par un 0 (ex: 0195444430 au Bénin ou 0612345678 en France)
  if (cleaned.startsWith('0') && cleaned.length >= 9) {
    if (dialClean === '+33' || dialClean === '+32') {
      // France / Belgique : enlever le 0 initial
      return dialClean + cleaned.substring(1);
    }
    // Bénin (nouvelle numérotation à 10 chiffres débutant par 01)
    if (dialClean === '+229' && cleaned.startsWith('01')) {
      return dialClean + cleaned;
    }
    return dialClean + cleaned;
  }

  return dialClean + cleaned;
}

/**
 * Génère un email proxy déterministe pour l'authentification Supabase si inscription par téléphone
 */
export function getPhoneAuthEmail(phone: string): string {
  const digits = cleanPhoneDigits(phone);
  return `phone_${digits}@phone.omegafacture.site`;
}

/**
 * Trouve le préfixe téléphonique d'un pays
 */
export function getCountryPhonePrefix(countryNameOrCode: string): CountryPhonePrefix {
  const norm = (countryNameOrCode || '').toLowerCase().trim();
  const found = PHONE_PREFIXES.find(
    (p) =>
      p.code.toLowerCase() === norm ||
      p.name.toLowerCase() === norm ||
      p.dialCode === norm
  );
  return found || PHONE_PREFIXES[0]; // Bénin par défaut
}

