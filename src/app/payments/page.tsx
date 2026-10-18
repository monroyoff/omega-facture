'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useInvoices } from '@/lib/store/invoice-context';
import { formatFCFA, formatDateFR } from '@/lib/money/format';
import { NewPaymentModal } from '@/components/payments/NewPaymentModal';
import { PeriodPickerDropdown } from '@/components/common/PeriodPickerDropdown';
import {
  CreditCard,
  Plus,
  Search,
  Smartphone,
  Landmark,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';

export default function PaymentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'all' | 'mobile_money' | 'bank_transfer' | 'cash' | 'check'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    payments,
    periodPayments,
    selectedPeriod,
    setSelectedPeriod,
    periodLabel,
  } = useInvoices();

  // Active payments filtered by the period selected in calendar
  const activePayments = periodPayments;

  const totalCollected = activePayments.reduce((acc, p) => acc + p.amount, 0);
  const totalMobileMoney = activePayments.filter((p) => p.method === 'mobile_money').reduce((acc, p) => acc + p.amount, 0);
  const totalBank = activePayments.filter((p) => p.method === 'bank_transfer').reduce((acc, p) => acc + p.amount, 0);
  const totalCash = activePayments.filter((p) => p.method === 'cash').reduce((acc, p) => acc + p.amount, 0);

  const methodCounts = {
    all: activePayments.length,
    mobile_money: activePayments.filter((p) => p.method === 'mobile_money').length,
    bank_transfer: activePayments.filter((p) => p.method === 'bank_transfer').length,
    cash: activePayments.filter((p) => p.method === 'cash').length,
    check: activePayments.filter((p) => p.method === 'check').length,
  };

  const filtered = activePayments
    .filter((p) => {
      // Method filter
      if (selectedMethod !== 'all' && p.method !== selectedMethod) return false;

      // Text search
      const q = searchQuery.toLowerCase();
      return (
        p.invoiceNumber.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'mobile_money':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200">
            <Smartphone className="w-3 h-3" />
            Mobile Money
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200">
            <Landmark className="w-3 h-3" />
            Virement
          </span>
        );
      case 'check':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200">
            <CreditCard className="w-3 h-3" />
            Chèque
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
            <Banknote className="w-3 h-3" />
            Espèces
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePath="/payments" />
      <div className="lg:pl-72 flex flex-col flex-1">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Paiements & Encaissements
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Historique des transactions et règlements par période.
                </p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/40 text-[11px] font-semibold">
                  <Clock className="w-3 h-3 text-brand-600" />
                  <span>{periodLabel} ({activePayments.length} paiements)</span>
                </span>
                {selectedPeriod !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedPeriod('ALL')}
                    className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-700 font-bold hover:underline cursor-pointer"
                    title="Afficher tous les règlements sans filtre de période"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Tout afficher</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dedicated Calendar dropdown for Payments */}
              <PeriodPickerDropdown buttonVariant="card" />

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Enregistrer un Paiement</span>
              </button>
            </div>
          </div>

          {/* 4 KPI stats row including Espèces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Encaissé */}
            <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Total Encaissé
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatFCFA(totalCollected)}
              </div>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {activePayments.length} règlements sur la période
              </span>
            </div>

            {/* Mobile Money */}
            <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Mobile Money
              </span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatFCFA(totalMobileMoney)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">MTN Bénin, Moov & Wave</span>
            </div>

            {/* Virements Bancaires */}
            <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Virements Bancaires
              </span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatFCFA(totalBank)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">BOA, Ecobank, SG</span>
            </div>

            {/* Espèces (Cash) */}
            <div className="bg-white dark:bg-[#111622] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Espèces (Caisse)
              </span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatFCFA(totalCash)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Règlements directs en mains</span>
            </div>
          </div>

          {/* Search bar & Filter Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Payment Method Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { key: 'all', label: 'Tous', count: methodCounts.all },
                { key: 'mobile_money', label: 'Mobile Money', count: methodCounts.mobile_money },
                { key: 'bank_transfer', label: 'Virement', count: methodCounts.bank_transfer },
                { key: 'cash', label: 'Espèces', count: methodCounts.cash },
                { key: 'check', label: 'Chèque', count: methodCounts.check },
              ].map((tab) => {
                const isActive = selectedMethod === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedMethod(tab.key as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
                      isActive
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                        : 'bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Sort Controls */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="N° facture, client, référence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1.5 px-3 text-xs bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="date_desc">📅 Plus récent d’abord</option>
                <option value="date_asc">📅 Plus ancien d’abord</option>
                <option value="amount_desc">💰 Montant le plus élevé</option>
                <option value="amount_asc">💰 Montant le plus faible</option>
              </select>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 uppercase text-[11px] font-semibold">
                    <th className="py-3.5 pl-6 pr-3">Date</th>
                    <th className="py-3.5 px-3">Facture</th>
                    <th className="py-3.5 px-3">Client</th>
                    <th className="py-3.5 px-3">Mode</th>
                    <th className="py-3.5 px-3">Référence / Reçu</th>
                    <th className="py-3.5 pr-6 pl-3 text-right">Montant Encaissé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.length > 0 ? (
                    filtered.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 pl-6 pr-3 font-medium text-slate-600 dark:text-slate-400">
                          {formatDateFR(pay.date)}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                          {pay.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {pay.clientName}
                        </td>
                        <td className="py-3.5 px-3">{getMethodBadge(pay.method)}</td>
                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">
                          {pay.reference}
                        </td>
                        <td className="py-3.5 pr-6 pl-3 text-right font-extrabold text-emerald-600">
                          {formatFCFA(pay.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-14 text-center">
                        <div className="max-w-sm mx-auto flex flex-col items-center">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Aucun encaissement sur cette période
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                            Aucun paiement n’a été enregistré pour la période : <strong>{periodLabel}</strong>.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedPeriod('ALL')}
                              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                            >
                              Afficher toute l'année 2026
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(true)}
                              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                            >
                              + Enregistrer un paiement
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <NewPaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
