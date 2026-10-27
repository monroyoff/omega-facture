/**
 * Système Fiscal UEMOA & Taux de TVA par pays membre
 * 
 * Directives Officielles UEMOA :
 * • Bénin : Taux normal de 18 %
 * • Burkina Faso : Taux normal de 18 %
 * • Côte d'Ivoire : Taux normal de 18 % (taux réduit de 9 % sur certains produits comme le lait et les pâtes alimentaires)
 * • Guinée-Bissau : Taux normal de 18 %
 * • Mali : Taux normal de 18 % (taux particulier de 5 % sur l'énergie solaire)
 * • Niger : Taux normal de 19 % (et 5 % sur l'énergie solaire)
 * • Sénégal : Taux normal de 18 % (taux réduit de 10 % pour le secteur du tourisme)
 * • Togo : Taux normal de 18 %
 */

export interface VatRateOption {
  rate: number;
  label: string;
  isStandard?: boolean;
  description?: string;
}

export interface UemoaCountry {
  code: string; // BJ, BF, CI, GW, ML, NE, SN, TG
  name: string; // Bénin, Burkina Faso, etc.
  aliases: string[];
  standardVatRate: number; // 18 ou 19
  reducedRates?: VatRateOption[];
  fiscalIdLabel: string; // IFU, NCC, NINEA, NIF...
  flag: string;
  phoneCode: string;
  currency: string;
  notes?: string;
}

export const UEMOA_COUNTRIES: UemoaCountry[] = [
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
  },
];

/**
 * Normalise et recherche le pays UEMOA correspondant
 */
export function findUemoaCountry(countryOrCode?: string): UemoaCountry {
  if (!countryOrCode) return UEMOA_COUNTRIES[0]; // Bénin par défaut
  const clean = countryOrCode.trim().toLowerCase();

  const found = UEMOA_COUNTRIES.find((c) => {
    if (c.code.toLowerCase() === clean) return true;
    if (c.name.toLowerCase() === clean) return true;
    return c.aliases.some((a) => a.toLowerCase() === clean || clean.includes(a.toLowerCase()));
  });

  return found || UEMOA_COUNTRIES[0];
}

/**
 * Retourne le taux normal de TVA applicable pour un pays donné (19 pour Niger, 18 pour les autres)
 */
export function getCountryStandardVatRate(countryOrCode?: string): number {
  return findUemoaCountry(countryOrCode).standardVatRate;
}

/**
 * Retourne la liste complète des options de TVA applicables pour un pays (taux normal, réduits et exonération)
 */
export function getCountryVatRates(countryOrCode?: string): VatRateOption[] {
  const country = findUemoaCountry(countryOrCode);
  const list: VatRateOption[] = [
    {
      rate: country.standardVatRate,
      label: `${country.standardVatRate}% (Taux normal ${country.name})`,
      isStandard: true,
      description: `Taux normal officiel de TVA en vigueur au ${country.name}`,
    },
  ];

  if (country.reducedRates && country.reducedRates.length > 0) {
    for (const reduced of country.reducedRates) {
      list.push(reduced);
    }
  }

  list.push({
    rate: 0,
    label: '0% (Exonération)',
    description: 'Ventes hors champ, exportations ou régimes dérogatoires',
  });

  return list;
}

/**
 * Liste exhaustive et standardisée de toutes les options de TVA applicables dans la zone UEMOA.
 * Reproduite fidèlement selon les directives pour sélection directe sur les documents de facturation.
 */
export const UEMOA_ALL_VAT_OPTIONS: VatRateOption[] = [
  {
    rate: 18,
    label: '18% (Standard UEMOA)',
    isStandard: true,
    description: 'Bénin, Côte d\'Ivoire, Sénégal, Togo, Burkina Faso, Mali, Guinée-Bissau',
  },
  {
    rate: 19,
    label: '19% (Niger)',
    description: 'Taux normal spécifique en vigueur au Niger',
  },
  {
    rate: 10,
    label: '10% (Tourisme SN)',
    description: 'Taux réduit tourisme & hébergement au Sénégal',
  },
  {
    rate: 9,
    label: '9% (Réduit CI)',
    description: 'Taux réduit produits de première nécessité en Côte d\'Ivoire',
  },
  {
    rate: 5,
    label: '5% (Solaire ML/NE)',
    description: 'Taux particulier énergie solaire au Mali et au Niger',
  },
  {
    rate: 0,
    label: '0% (Exonéré)',
    description: 'Exonération légale / régimes dérogatoires',
  },
];
