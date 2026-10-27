'use client';

import React, { useState } from 'react';
import { formatFCFA } from '@/lib/money/format';
import {
  Download,
  Plus,
  Trash2,
  Check,
  Send,
} from 'lucide-react';

interface InvoiceLine {
  id: string;
  desc: string;
  qty: number;
  price: number;
}

export const HeroInvoiceSimulator: React.FC = () => {
  const [docKind, setDocKind] = useState<'invoice' | 'quote'>('invoice');
  const [taxRate, setTaxRate] = useState<number>(0.18);
  const [brsRate, setBrsRate] = useState<number>(0);
  const [selectedClient, setSelectedClient] = useState<string>('sotra');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [lines, setLines] = useState<InvoiceLine[]>([
    {
      id: '1',
      desc: 'Refonte Plateforme E-commerce & API',
      qty: 1,
      price: 1200000,
    },
    {
      id: '2',
      desc: 'Configuration Passerelle Wave & Orange Money',
      qty: 1,
      price: 300000,
    },
  ]);

  // Calculations
  const subtotalHT = lines.reduce((acc, line) => acc + (line.qty || 0) * (line.price || 0), 0);
  const taxAmount = Math.round(subtotalHT * taxRate);
  const deductionAmount = Math.round(subtotalHT * brsRate);
  const totalTTC = Math.max(0, subtotalHT + taxAmount - deductionAmount);

  const updateLine = (id: string, updates: Partial<InvoiceLine>) => {
    setLines((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines((prev) => prev.filter((item) => item.id !== id));
    } else {
      setLines([{ id: '1', desc: '', qty: 1, price: 0 }]);
    }
  };

  const addLine = (desc = 'Nouvelle prestation / service', qty = 1, price = 150000) => {
    const newLine: InvoiceLine = {
      id: Date.now().toString(),
      desc,
      qty,
      price,
    };
    setLines((prev) => [...prev, newLine]);
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3800);
  };

  return (
    <div className="relative max-w-5xl mx-auto" id="demo">
      {/* Interactive Quick Hint */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-[#111622]/90 backdrop-blur px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
          </span>
          <span>Simulateur interactif en direct — modifiez les champs ci-dessous !</span>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Devise légale : <strong className="text-slate-900 dark:text-white">FCFA (XOF/XAF)</strong>
        </span>
      </div>

      {/* Floating Badge Top Left: Speed calculation */}
      <div className="hidden sm:flex absolute -top-5 -left-6 z-20 items-center gap-3 bg-white dark:bg-[#111622] px-4 py-3 rounded-2xl shadow-float-card border border-slate-100 dark:border-slate-800 animate-float-top pointer-events-none">
        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm">
          %
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">TVA selon votre pays</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {taxRate > 0 ? formatFCFA(taxAmount) : 'Exonéré'}
          </p>
        </div>
      </div>

      {/* Floating Badge Bottom Right: Payment Notification */}
      <div className="hidden sm:flex absolute -bottom-5 -right-6 z-20 items-center gap-3 bg-white dark:bg-[#111622] px-4 py-3 rounded-2xl shadow-float-card border border-slate-100 dark:border-slate-800 animate-float-bottom pointer-events-none">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 font-bold text-lg">
          ✓
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Paiement instantané</p>
          <p className="text-sm font-bold text-emerald-600">Wave &amp; Orange Money</p>
        </div>
      </div>

      {/* Main Detailed Interactive Invoice / Quote Card Mockup */}
      <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden text-left relative z-10 transition-all duration-300">
        {/* Window header bar */}
        <div className="bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            </div>

            {/* Document Type Switcher Tabs */}
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg ml-2">
              <button
                type="button"
                onClick={() => setDocKind('quote')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  docKind === 'quote'
                    ? 'bg-white dark:bg-[#111622] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Devis PRO
              </button>
              <button
                type="button"
                onClick={() => setDocKind('invoice')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  docKind === 'invoice'
                    ? 'bg-white dark:bg-[#111622] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Facture #FAC-2025-0104
              </button>
            </div>
          </div>

          {/* Document Action Buttons */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                docKind === 'invoice'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  docKind === 'invoice' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
              <span>{docKind === 'invoice' ? 'Payée' : 'En attente validation'}</span>
            </span>

            <button
              type="button"
              onClick={() => showFeedback('📄 Génération du document PDF certifié OHADA réussie !')}
              className="text-xs bg-slate-900 hover:bg-black text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={() => showFeedback('📲 Lien de règlement Wave & Orange Money préparé pour WhatsApp !')}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Invoice Document Body */}
        <div className="p-5 sm:p-8">
          {/* Top Row: Sender & Client Details */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                  Ω
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  Agence Horizon Dakar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Plateau, Immeuble Horizon 4ème étage<br />
                NINEA : 004829102 2V9 • RCCM : SN-DKR-2021-B-1192<br />
                contact@horizon-agency.sn
              </p>
            </div>

            {/* Client Quick Config Box */}
            <div className="sm:text-right w-full sm:w-auto bg-[#F8F9FA] dark:bg-slate-900/60 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200/60 dark:border-slate-800">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                {docKind === 'invoice' ? 'Facturé à (Client) :' : 'Devis établi pour :'}
              </span>
              <div className="flex sm:justify-end items-center gap-2">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 cursor-pointer"
                >
                  <option value="sotra">Société SOTRA SARL (Abidjan)</option>
                  <option value="sonatel">Sonatel Télécom CI (Dakar)</option>
                  <option value="afrikapub">Afrika Pub SA (Cotonou)</option>
                  <option value="custom">Autre client...</option>
                </select>
              </div>
              <div className="mt-1 flex flex-wrap sm:justify-end gap-1.5 text-[11px] text-slate-500 font-mono">
                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                  RCCM : CI-ABJ-2020-B-14
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                  NINEA / CC : 2109403 K
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Date d'émission : 18 Février 2025</p>
            </div>
          </div>

          {/* Interactive Line Items Table */}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[540px]">
              <thead>
                <tr className="text-xs uppercase text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2.5 pr-2">Désignation</th>
                  <th className="py-2.5 px-2 text-center w-20">Qté</th>
                  <th className="py-2.5 px-2 text-right w-36">Prix Unitaire</th>
                  <th className="py-2.5 pl-2 text-right w-36">Total HT</th>
                  <th className="py-2.5 pl-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {lines.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="py-2.5 pr-2">
                      <input
                        type="text"
                        value={item.desc}
                        onChange={(e) => updateLine(item.id, { desc: e.target.value })}
                        placeholder="Description de la prestation"
                        className="w-full text-xs sm:text-sm font-medium text-slate-900 dark:text-white bg-transparent border-0 border-b border-transparent focus:border-brand-500 focus:ring-0 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={item.qty}
                        onChange={(e) => updateLine(item.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-16 text-center text-xs sm:text-sm font-mono font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1 px-1.5 focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <input
                          type="number"
                          min="0"
                          step="25000"
                          value={item.price}
                          onChange={(e) => updateLine(item.id, { price: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-28 text-right text-xs sm:text-sm font-mono font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1 px-2 focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                        />
                        <span className="text-[11px] text-slate-400 font-mono">F</span>
                      </div>
                    </td>
                    <td className="py-2.5 pl-2 text-right font-mono font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {formatFCFA(item.qty * item.price)}
                    </td>
                    <td className="py-2.5 pl-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(item.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                        title="Supprimer la ligne"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Line & Presets Controls */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => addLine('Prestation de conseil technique', 1, 150000)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une ligne</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="text-[11px] font-medium hidden sm:inline">Modèles rapides :</span>
              <button
                type="button"
                onClick={() => addLine('Maintenance trimestrielle Serveurs', 1, 150000)}
                className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                ＋ Maintenance
              </button>
              <button
                type="button"
                onClick={() => addLine('Campagne Marketing Digital & Ads', 1, 250000)}
                className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                ＋ Marketing Ads
              </button>
            </div>
          </div>

          {/* Tax Options, Discount, & Calculations Summary */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start gap-6">
            {/* Left: Payment Modes & Tax Controls */}
            <div className="w-full lg:max-w-md space-y-4">
              {/* Advanced Tax Controls */}
              <div className="bg-slate-50/80 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Options fiscales &amp; Déductions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* TVA Toggle */}
                  <div className="flex items-center justify-between bg-white dark:bg-[#151c2c] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">TVA selon pays</span>
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                      className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-0 focus:ring-0 p-0 text-right cursor-pointer"
                    >
                      <option value="0.18">18% (Standard UEMOA)</option>
                      <option value="0.19">19% (Niger)</option>
                      <option value="0.10">10% (Tourisme SN)</option>
                      <option value="0.09">9% (Réduit CI)</option>
                      <option value="0.05">5% (Solaire ML/NE)</option>
                      <option value="0.00">0% (Exonéré)</option>
                    </select>
                  </div>

                  {/* BRS / Discount option */}
                  <div className="flex items-center justify-between bg-white dark:bg-[#151c2c] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Retenue BRS</span>
                    <select
                      value={brsRate}
                      onChange={(e) => setBrsRate(parseFloat(e.target.value))}
                      className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-0 focus:ring-0 p-0 text-right cursor-pointer"
                    >
                      <option value="0">Aucune (0%)</option>
                      <option value="0.05">BRS 5% (Retenue)</option>
                      <option value="0.02">Acompte 2%</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Gateways */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center">
                    W
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Paiement Mobile direct
                    </span>
                    <span className="text-[11px] text-slate-500">Validation automatique instantanée</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-100 dark:border-sky-800">
                    Wave
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-800">
                    Orange Money
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Calculations Summary */}
            <div className="w-full lg:w-80 space-y-2 bg-[#F8F9FA] dark:bg-slate-900/60 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Sous-total HT</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {formatFCFA(subtotalHT)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span>{taxRate > 0 ? `TVA (${Math.round(taxRate * 100)}% selon pays)` : 'TVA (0% Exonéré)'}</span>
                  <span className="w-3.5 h-3.5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[9px] font-bold">
                    i
                  </span>
                </span>
                <span className="font-mono font-medium text-brand-600 dark:text-brand-400">
                  {taxRate > 0 ? `+ ${formatFCFA(taxAmount)}` : '0 FCFA'}
                </span>
              </div>

              {brsRate > 0 && (
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>{brsRate === 0.05 ? 'Retenue BRS (5%)' : 'Acompte (2%)'}</span>
                  <span className="font-mono font-medium text-amber-600">
                    - {formatFCFA(deductionAmount)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-slate-900 dark:text-white block">
                    Total Net TTC
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600">
                    Prêt pour encaissement
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-brand-600 dark:text-brand-400 font-mono tracking-tight value-pulse">
                  {formatFCFA(totalTTC)}
                </span>
              </div>

              {/* Action confirmation banner */}
              {feedbackMsg && (
                <div className="text-center text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-xl mt-2 animate-in fade-in duration-200 flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{feedbackMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
