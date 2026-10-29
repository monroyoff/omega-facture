/**
 * Système Fiscal Multi-Régions : Zone UEMOA, France métropolitaine & Belgique
 * Taux de TVA et spécificités fiscales par pays membre et pays ciblés
 * 
 * Directives Officielles :
 * 
 * 🇧🇯 Bénin : Taux normal de 18 % (IFU)
 * 🇧🇫 Burkina Faso : Taux normal de 18 % (IFU)
 * 🇨🇮 Côte d'Ivoire : Taux normal de 18 %, taux réduit de 9 % (produits de première nécessité : lait, pâtes...) (NCC)
 * 🇬🇼 Guinée-Bissau : Taux normal de 18 % (NIF)
 * 🇲🇱 Mali : Taux normal de 18 %, taux particulier de 5 % (énergie solaire) (NIF)
 * 🇳🇪 Niger : Taux normal spécifique de 19 %, taux particulier de 5 % (énergie solaire) (NIF)
 * 🇸🇳 Sénégal : Taux normal de 18 %, taux réduit de 10 % (tourisme & hébergement) (NINEA)
 * 🇹🇬 Togo : Taux normal de 18 % (NIF)
 * 
 * 🇫🇷 France métropolitaine :
 *   • Taux normal (20 %) : par défaut (quasi-totalité des biens et des services)
 *   • Taux intermédiaire (10 %) : restauration sur place, transports de voyageurs, travaux rénovation logement, hébergements
 *   • Taux réduit (5,5 %) : produits alimentaires de base, livres, abonnements gaz/électricité, équipements handicap
 *   • Taux particulier / super réduit (2,1 %) : médicaments remboursables par la Sécurité sociale, presse, certains spectacles
 *   • Taux de 0 % : franchise en base de TVA, exportations
 * 
 * 🇧🇪 Belgique :
 *   • Taux normal (21 %) : taux standard
 *   • Taux intermédiaire (12 %) : restauration, logements sociaux, margarine, hôtels et campings (depuis le 1er mars 2026)
 *   • Taux réduit (6 %) : produits alimentaires de base, eau, médicaments, livres, transport de personnes, rénovation sous conditions
 *   • Taux de 0 % : publications périodiques (≥ 48/an), matériaux de récupération, franchise petites entreprises (< 25 000 €), professions médicales
 */

export interface VatRateOption {
  rate: number;
  label: string;
  isStandard?: boolean;
  description?: string;
}

export interface UemoaCountry {
  code: string; // BJ, BF, CI, GW, ML, NE, SN, TG, FR, BE
  name: string; // Bénin, Burkina Faso, France métropolitaine, Belgique, etc.
  aliases: string[];
  standardVatRate: number; // 18, 19, 20, 21
  reducedRates?: VatRateOption[];
  fiscalIdLabel: string; // IFU, NCC, NINEA, NIF, SIRET / TVA, BCE / TVA...
  flag: string;
  phoneCode: string;
  currency: string; // FCFA, EUR
  notes?: string;
  isUemoa?: boolean;
  region?: 'uemoa' | 'europe';
}

export const SUPPORTED_COUNTRIES: UemoaCountry[] = [
  {
    code: 'BJ',
    name: 'Bénin',
    aliases: ['benin', 'république du bénin', 'republique du benin', 'bj'],
    standardVatRate: 18,
    fiscalIdLabel: 'Numéro IFU (Identifiant Fiscal Unique)',
    flag: '🇧🇯',
    phoneCode: '+229',
    currency: 'FCFA',
    notes: 'Taux normal de 18%',
    isUemoa: true,
    region: 'uemoa',
  },
  {
    code: 'BF',
    name: 'Burkina Faso',
    aliases: ['burkina faso', 'burkina', 'bf'],
    standardVatRate: 18,
    fiscalIdLabel: 'Numéro IFU',
    flag: '🇧🇫',
    phoneCode: '+226',
    currency: 'FCFA',
    notes: 'Taux normal de 18%',
    isUemoa: true,
    region: 'uemoa',
  },
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    aliases: ["cote d'ivoire", "côte d'ivoire", 'ci', 'ivory coast'],
    standardVatRate: 18,
    reducedRates: [
      {
        rate: 9,
        label: '9% (Taux réduit : lait, pâtes alimentaires...)',
        description: 'Produits de première nécessité (lait, pâtes)',
      },
    ],
    fiscalIdLabel: 'Numéro NCC (Compte Contribuable)',
    flag: '🇨🇮',
    phoneCode: '+225',
    currency: 'FCFA',
    notes: 'Taux normal de 18% (taux réduit de 9% produits alimentaires)',
    isUemoa: true,
    region: 'uemoa',
  },
  {
    code: 'GW',
    name: 'Guinée-Bissau',
    aliases: ['guinée-bissau', 'guinee-bissau', 'guinea-bissau', 'gw'],
    standardVatRate: 18,
    fiscalIdLabel: 'Numéro NIF',
    flag: '🇬🇼',
    phoneCode: '+245',
    currency: 'FCFA',
    notes: 'Taux normal de 18%',
    isUemoa: true,
    region: 'uemoa',
  },
  {
    code: 'ML',
    name: 'Mali',
    aliases: ['mali', 'ml', 'république du mali'],
    standardVatRate: 18,
    reducedRates: [
      {
        rate: 5,
        label: '5% (Taux particulier : énergie solaire)',
        description: 'Équipements et matériel solaire',
      },
    ],
    fiscalIdLabel: 'Numéro NIF',
    flag: '🇲🇱',
    phoneCode: '+223',
    currency: 'FCFA',
    notes: 'Taux normal de 18% (5% sur l’énergie solaire)',
    isUemoa: true,
    region: 'uemoa',
  },
  {
    code: 'NE',
    name: 'Niger',
    aliases: ['niger', 'ne', 'république du niger'],
    standardVatRate: 19,
    reducedRates: [
      {
        rate: 5,
        label: '5% (Taux particulier : énergie solaire)',
        description: 'Équipements et matériel solaire',
      },
    ],
    fiscalIdLabel: 'Numéro NIF',
    flag: '🇳🇪',
    phoneCode: '+227',
    currency: 'FCFA',
    notes: 'Taux normal spécifique de 19% (et 5% énergie solaire)',
    isUemoa: true,
    region: 'uemoa',
  },
  {
    code: 'SN',
    name: 'Sénégal',
    aliases: ['sénégal', 'senegal', 'sn'],
    standardVatRate: 18,
    reducedRates: [
      {
        rate: 10,
        label: '10% (Taux réduit : hébergement touristique)',
        description: 'Secteur de l’hôtellerie et du tourisme',
      },
    ],
    fiscalIdLabel: 'Numéro NINEA',
    flag: '🇸🇳',
    phoneCode: '+221',
    currency: 'FCFA',
    notes: 'Taux normal de 18% (taux réduit de 10% tourisme)',
    isUemoa: true,
    region: 'uemoa',
  },
  {
    code: 'TG',
    name: 'Togo',
    aliases: ['togo', 'tg', 'république togolaise'],
    standardVatRate: 18,
    fiscalIdLabel: 'Numéro NIF',
    flag: '🇹🇬',
    phoneCode: '+228',
    currency: 'FCFA',
    notes: 'Taux normal de 18%',
    isUemoa: true,
    region: 'uemoa',
  },
  {
    code: 'FR',
    name: 'France',
    aliases: ['france', 'france métropolitaine', 'france metropolitaine', 'fr', 'république française', 'republique francaise'],
    standardVatRate: 20,
    reducedRates: [
      {
        rate: 10,
        label: '10% (Taux intermédiaire : restauration, transport, hébergement)',
        description: 'Restauration sur place, transports de voyageurs, travaux rénovation logement, hébergements',
      },
      {
        rate: 5.5,
        label: '5,5% (Taux réduit : alimentaire, livres, énergie)',
        description: 'Produits alimentaires de base, livres, abonnements gaz/électricité, équipements handicap',
      },
      {
        rate: 2.1,
        label: '2,1% (Taux particulier : médicaments remboursables, presse, spectacles)',
        description: 'Médicaments remboursés par la Sécurité sociale, presse, certains spectacles',
      },
    ],
    fiscalIdLabel: 'Numéro SIREN / SIRET ou TVA Intracommunautaire',
    flag: '🇫🇷',
    phoneCode: '+33',
    currency: 'EUR',
    notes: 'Taux normal 20%, intermédiaire 10%, réduit 5,5%, particulier 2,1%, exonéré 0%',
    isUemoa: false,
    region: 'europe',
  },
  {
    code: 'BE',
    name: 'Belgique',
    aliases: ['belgique', 'belgium', 'be', 'royaume de belgique'],
    standardVatRate: 21,
    reducedRates: [
      {
        rate: 12,
        label: '12% (Taux intermédiaire : restauration, logements sociaux, campings)',
        description: 'Restauration, logements sociaux, margarine, hôtels et campings (depuis le 1er mars 2026)',
      },
      {
        rate: 6,
        label: '6% (Taux réduit : alimentaire, eau, médicaments, livres, rénovation)',
        description: 'Produits alimentaires de base, eau, médicaments, livres, transport de personnes, rénovation sous conditions',
      },
    ],
    fiscalIdLabel: 'Numéro d’entreprise (BCE / TVA Intracommunautaire)',
    flag: '🇧🇪',
    phoneCode: '+32',
    currency: 'EUR',
    notes: 'Taux normal 21%, intermédiaire 12%, réduit 6%, exonéré/franchise 0%',
    isUemoa: false,
    region: 'europe',
  },
];

// Alias pour compatibilité ascendante et descendante avec l'ensemble du projet
export const UEMOA_COUNTRIES: UemoaCountry[] = SUPPORTED_COUNTRIES;

/**
 * Normalise et recherche le pays correspondant (zone UEMOA ou Europe)
 */
export function findUemoaCountry(countryOrCode?: string): UemoaCountry {
  if (!countryOrCode) return SUPPORTED_COUNTRIES[0]; // Bénin par défaut
  const clean = countryOrCode.trim().toLowerCase();

  const found = SUPPORTED_COUNTRIES.find((c) => {
    if (c.code.toLowerCase() === clean) return true;
    if (c.name.toLowerCase() === clean) return true;
    if (clean.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(clean)) return true;
    return c.aliases.some((a) => {
      const aLower = a.toLowerCase();
      return aLower === clean || clean.includes(aLower) || aLower.includes(clean);
    });
  });

  return found || SUPPORTED_COUNTRIES[0];
}

/**
 * Retourne le taux normal de TVA applicable pour un pays donné
 * (21% Belgique, 20% France, 19% Niger, 18% autres pays UEMOA)
 */
export function getCountryStandardVatRate(countryOrCode?: string): number {
  return findUemoaCountry(countryOrCode).standardVatRate;
}

/**
 * Retourne la liste complète des options de TVA applicables pour un pays donné
 * (taux normal, taux intermédiaires, réduits, particuliers et exonération/franchise)
 */
export function getCountryVatRates(countryOrCode?: string): VatRateOption[] {
  const country = findUemoaCountry(countryOrCode);
  const list: VatRateOption[] = [
    {
      rate: country.standardVatRate,
      label: `${country.standardVatRate}% (Taux normal ${country.name})`,
      isStandard: true,
      description: `Taux normal officiel de TVA en vigueur en ${country.name}`,
    },
  ];

  if (country.reducedRates && country.reducedRates.length > 0) {
    for (const reduced of country.reducedRates) {
      list.push(reduced);
    }
  }

  if (country.code === 'FR') {
    list.push({
      rate: 0,
      label: '0% (Exonération / Franchise en base)',
      description: 'Franchise en base de TVA (art. 293 B du CGI), exportations ou opérations exonérées',
    });
  } else if (country.code === 'BE') {
    list.push({
      rate: 0,
      label: '0% (Exonération / Franchise < 25 000 €)',
      description: 'Régime de franchise petites entreprises (< 25 000 €), publications périodiques ou régimes dérogatoires',
    });
  } else {
    list.push({
      rate: 0,
      label: '0% (Exonération)',
      description: 'Ventes hors champ, exportations ou régimes dérogatoires',
    });
  }

  return list;
}

/**
 * Liste exhaustive et standardisée de toutes les options de TVA applicables
 * dans l'ensemble des pays ciblés (Zone UEMOA, France métropolitaine et Belgique).
 */
export const UEMOA_ALL_VAT_OPTIONS: VatRateOption[] = [
  {
    rate: 21,
    label: '21% (Normal Belgique)',
    description: 'Taux normal standard en vigueur en Belgique',
  },
  {
    rate: 20,
    label: '20% (Normal France)',
    description: 'Taux normal en vigueur en France métropolitaine',
  },
  {
    rate: 19,
    label: '19% (Niger)',
    description: 'Taux normal spécifique en vigueur au Niger',
  },
  {
    rate: 18,
    label: '18% (Standard UEMOA)',
    isStandard: true,
    description: 'Bénin, Côte d\'Ivoire, Sénégal, Togo, Burkina Faso, Mali, Guinée-Bissau',
  },
  {
    rate: 12,
    label: '12% (Intermédiaire Belgique)',
    description: 'Restauration, logements sociaux, campings en Belgique',
  },
  {
    rate: 10,
    label: '10% (Tourisme SN / Intermédiaire FR)',
    description: 'Tourisme au Sénégal / Restauration et transports en France',
  },
  {
    rate: 9,
    label: '9% (Réduit Côte d\'Ivoire)',
    description: 'Produits de première nécessité (lait, pâtes) en Côte d\'Ivoire',
  },
  {
    rate: 6,
    label: '6% (Réduit Belgique)',
    description: 'Alimentation, eau, médicaments, livres, rénovation en Belgique',
  },
  {
    rate: 5.5,
    label: '5,5% (Réduit France)',
    description: 'Produits alimentaires, livres, énergie en France',
  },
  {
    rate: 5,
    label: '5% (Solaire Mali / Niger)',
    description: 'Équipements solaires au Mali et au Niger',
  },
  {
    rate: 2.1,
    label: '2,1% (Super Réduit France)',
    description: 'Médicaments remboursables, presse et spectacles en France',
  },
  {
    rate: 0,
    label: '0% (Exonéré / Franchise)',
    description: 'Exonération légale, franchise en base ou régimes dérogatoires',
  },
];
