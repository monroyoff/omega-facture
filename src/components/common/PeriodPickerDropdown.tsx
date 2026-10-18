'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check, X, Clock, Sparkles } from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';

interface PeriodPickerDropdownProps {
  align?: 'left' | 'right';
  className?: string;
  buttonVariant?: 'default' | 'card' | 'outline';
}

export const PeriodPickerDropdown: React.FC<PeriodPickerDropdownProps> = ({
  align = 'right',
  className = '',
  buttonVariant = 'default',
}) => {
  const { selectedPeriod, setSelectedPeriod, periodLabel } = useInvoices();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'month' | 'day' | 'quarter' | 'semester' | 'year'>('month');
  const [customDate, setCustomDate] = useState('2026-10-18');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const months = [
    { id: '2026-10', label: 'Octobre 2026', badge: 'En cours' },
    { id: '2026-09', label: 'Septembre 2026', badge: 'Mois dernier' },
    { id: '2026-08', label: 'Août 2026' },
    { id: '2026-07', label: 'Juillet 2026' },
    { id: '2026-06', label: 'Juin 2026' },
    { id: '2026-05', label: 'Mai 2026' },
  ];

  const quickDays = [
    { id: 'day:2026-10-18', label: 'Aujourd’hui (18 Octobre 2026)' },
    { id: 'day:2026-10-16', label: '16 Octobre 2026' },
    { id: 'day:2026-10-15', label: '15 Octobre 2026' },
    { id: 'day:2026-10-14', label: '14 Octobre 2026' },
    { id: 'day:2026-10-13', label: '13 Octobre 2026' },
    { id: 'day:2026-10-12', label: '12 Octobre 2026' },
    { id: 'day:2026-10-10', label: '10 Octobre 2026' },
    { id: 'day:2026-10-08', label: '08 Octobre 2026' },
    { id: 'day:2026-10-04', label: '04 Octobre 2026' },
    { id: 'day:2026-10-02', label: '02 Octobre 2026' },
  ];

  const quarters = [
    { id: 'quarter:2026-Q4', label: '4e Trimestre 2026 (Octobre - Décembre)', badge: 'T4' },
    { id: 'quarter:2026-Q3', label: '3e Trimestre 2026 (Juillet - Septembre)', badge: 'T3' },
    { id: 'quarter:2026-Q2', label: '2e Trimestre 2026 (Avril - Juin)', badge: 'T2' },
    { id: 'quarter:2026-Q1', label: '1er Trimestre 2026 (Janvier - Mars)', badge: 'T1' },
  ];

  const semesters = [
    { id: 'semester:2026-S2', label: '2e Semestre 2026 (Juillet - Décembre)', badge: 'S2' },
    { id: 'semester:2026-S1', label: '1er Semestre 2026 (Janvier - Juin)', badge: 'S1' },
  ];

  const years = [
    { id: 'ALL', label: 'Année 2026 complète (Toutes les transactions)', badge: '2026' },
    { id: 'year:2025', label: 'Exercice 2025 (Historique)', badge: '2025' },
  ];

  const buttonClasses = () => {
    if (buttonVariant === 'card') {
      return 'flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-2xs';
    }
    return 'flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${buttonClasses()} cursor-pointer active:scale-98`}
        title="Sélectionner la période temporelle"
      >
        <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
        <span className="truncate max-w-[200px] sm:max-w-none">{periodLabel}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-80 sm:w-96 bg-white dark:bg-[#111622] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>Sélection de la période</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Period Mode Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl mb-3 text-[11px] font-semibold">
            {[
              { id: 'month', label: 'Mois' },
              { id: 'day', label: 'Jour' },
              { id: 'quarter', label: 'Trimestre' },
              { id: 'semester', label: 'Semestre' },
              { id: 'year', label: 'Année' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-1 text-center rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-[#111622] text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-h-72 overflow-y-auto px-0.5 space-y-1">
            {/* 1. MOIS */}
            {activeTab === 'month' &&
              months.map((m) => {
                const isSelected = selectedPeriod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(m.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-bold border border-brand-200/50 dark:border-brand-800/40'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{m.label}</span>
                      {m.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                  </button>
                );
              })}

            {/* 2. JOUR */}
            {activeTab === 'day' && (
              <div className="space-y-3 p-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Sélectionner un jour précis dans le calendrier :
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPeriod(`day:${customDate}`);
                        setIsOpen(false);
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Jours récents avec activité :
                  </span>
                  <div className="space-y-1">
                    {quickDays.map((d) => {
                      const isSelected = selectedPeriod === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setSelectedPeriod(d.id);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-colors ${
                            isSelected
                              ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-bold'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <span>{d.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. TRIMESTRE */}
            {activeTab === 'quarter' &&
              quarters.map((q) => {
                const isSelected = selectedPeriod === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(q.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-bold border border-brand-200/50 dark:border-brand-800/40'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-600 font-extrabold text-[10px]">
                        {q.badge}
                      </span>
                      <span>{q.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                  </button>
                );
              })}

            {/* 4. SEMESTRE */}
            {activeTab === 'semester' &&
              semesters.map((s) => {
                const isSelected = selectedPeriod === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(s.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-bold border border-brand-200/50 dark:border-brand-800/40'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 font-extrabold text-[10px]">
                        {s.badge}
                      </span>
                      <span>{s.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                  </button>
                );
              })}

            {/* 5. ANNEE */}
            {activeTab === 'year' &&
              years.map((y) => {
                const isSelected = selectedPeriod === y.id;
                return (
                  <button
                    key={y.id}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(y.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-bold border border-brand-200/50 dark:border-brand-800/40'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-extrabold text-[10px]">
                        {y.badge}
                      </span>
                      <span>{y.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                  </button>
                );
              })}
          </div>

          {/* Quick Footer */}
          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Période : {periodLabel}</span>
            {selectedPeriod !== 'ALL' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPeriod('ALL');
                  setIsOpen(false);
                }}
                className="text-brand-600 hover:underline font-bold"
              >
                Tout afficher
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
