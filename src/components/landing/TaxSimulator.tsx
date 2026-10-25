'use client';

import React, { useState } from 'react';
import { formatFCFA } from '@/lib/money/format';
import { Calculator } from 'lucide-react';

export const TaxSimulator: React.FC = () => {
  const [htAmount, setHtAmount] = useState<number>(1000000);

  const tvaAmount = Math.round(htAmount * 0.18);
  const ttcAmount = htAmount + tvaAmount;

  return (
    <div className="mt-12 bg-white dark:bg-[#111622] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-gray-800 shadow-card-subtle reveal-on-scroll">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-softRed dark:bg-rose-950/40 text-brand-red text-xs font-bold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulateur interactif</span>
          </div>
          <h4 className="text-xl font-bold text-brand-dark dark:text-white mt-1">
            Calculez votre montant TTC avec TVA 18%
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Testez immédiatement la rapidité de conversion conforme aux exigences de l'espace UEMOA.
          </p>
        </div>

        <div className="w-full lg:w-auto flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
          <div className="w-full sm:w-64">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Montant Hors Taxe (FCFA)
            </label>
            <input
              type="number"
              min="0"
              step="50000"
              value={htAmount}
              onChange={(e) => setHtAmount(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="ex: 500000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151c2c] text-brand-dark dark:text-white focus:ring-2 focus:ring-brand-red focus:border-brand-red font-mono text-sm font-semibold"
            />
          </div>

          <div className="bg-[#FAFAF9] dark:bg-slate-900/60 px-5 sm:px-6 py-3 rounded-xl border border-gray-200/80 dark:border-gray-800 text-left shrink-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
              TVA calculée (18%)
            </span>
            <span className="text-sm font-bold text-brand-red font-mono">
              {formatFCFA(tvaAmount)}
            </span>
          </div>

          <div className="bg-brand-softRed dark:bg-rose-950/40 px-5 sm:px-6 py-3 rounded-xl border border-brand-red/20 text-left shrink-0">
            <span className="text-xs text-brand-red font-semibold block">
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
