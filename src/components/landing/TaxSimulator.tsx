'use client';

import React, { useState } from 'react';
import { formatFCFA } from '@/lib/money/format';
import { Calculator, Globe2 } from 'lucide-react';
import { UEMOA_COUNTRIES, getCountryVatRates } from '@/lib/tax/uemoa-tax';

export const TaxSimulator: React.FC = () => {
  const [htAmount, setHtAmount] = useState<number>(1000000);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('BJ');
  
  const currentCountry = UEMOA_COUNTRIES.find((c) => c.code === selectedCountryCode) || UEMOA_COUNTRIES[0];
  const countryRates = getCountryVatRates(currentCountry.name);
  const [selectedRate, setSelectedRate] = useState<number>(currentCountry.standardVatRate);

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const country = UEMOA_COUNTRIES.find((c) => c.code === code);
    if (country) {
      setSelectedRate(country.standardVatRate);
    }
  };

  const tvaAmount = Math.round(htAmount * (selectedRate / 100));
  const ttcAmount = htAmount + tvaAmount;

  return (
    <div className="mt-12 bg-white dark:bg-[#111622] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-gray-800 shadow-card-subtle reveal-on-scroll">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200/60 dark:border-brand-800/60 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulateur fiscal UEMOA &amp; Europe</span>
          </div>
          <h4 className="text-xl font-bold text-brand-dark dark:text-white mt-1">
            Calculez votre montant TTC avec TVA selon votre pays
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Testez immédiatement le calcul conforme aux exigences fiscales de votre pays de facturation (20% en France, 21% en Belgique, 18% zone UEMOA, 19% au Niger, taux réduits).
          </p>
        </div>

        <div className="w-full lg:w-auto flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 flex-wrap">
          {/* Country Selector */}
          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-brand-600" />
              <span>Votre pays</span>
            </label>
            <select
              value={selectedCountryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151c2c] text-brand-dark dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs font-semibold cursor-pointer"
            >
              {UEMOA_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.standardVatRate}%)
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Montant Hors Taxe (FCFA)
            </label>
            <input
              type="number"
              min="0"
              step="50000"
              value={htAmount}
              onChange={(e) => setHtAmount(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="ex: 1000000"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151c2c] text-brand-dark dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono text-xs font-semibold"
            />
          </div>

          {/* Rate Select if country has multiple */}
          {countryRates.length > 2 && (
            <div className="w-full sm:w-40">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Taux appliqué
              </label>
              <select
                value={selectedRate}
                onChange={(e) => setSelectedRate(parseFloat(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151c2c] text-brand-dark dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs font-semibold cursor-pointer"
              >
                {countryRates.map((r) => (
                  <option key={r.rate} value={r.rate}>
                    {r.rate}% - {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Calculated VAT */}
          <div className="bg-[#FAFAF9] dark:bg-slate-900/60 px-4 sm:px-5 py-2.5 rounded-xl border border-gray-200/80 dark:border-gray-800 text-left shrink-0">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">
              TVA selon pays ({selectedRate}%)
            </span>
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400 font-mono">
              {formatFCFA(tvaAmount)}
            </span>
          </div>

          {/* Total TTC */}
          <div className="bg-brand-50 dark:bg-brand-950/60 px-4 sm:px-5 py-2.5 rounded-xl border border-brand-200 dark:border-brand-800 text-left shrink-0">
            <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold block">
              Total TTC à facturer
            </span>
            <span className="text-base font-extrabold text-brand-dark dark:text-white font-mono">
              {formatFCFA(ttcAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
