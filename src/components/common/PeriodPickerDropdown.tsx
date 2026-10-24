'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  Check,
  X,
  Clock,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';

interface PeriodPickerDropdownProps {
  align?: 'left' | 'right';
  className?: string;
  buttonVariant?: 'default' | 'card' | 'outline';
  buttonClassName?: string;
}

export const PeriodPickerDropdown: React.FC<PeriodPickerDropdownProps> = ({
  align = 'right',
  className = '',
  buttonVariant = 'default',
  buttonClassName = '',
}) => {
  const { selectedPeriod, setSelectedPeriod, periodLabel } = useInvoices();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'month' | 'range' | 'day' | 'quarter' | 'semester' | 'year'>('month');

  // Custom single day
  const [customDate, setCustomDate] = useState('2026-10-18');

  // Date range state (start & end)
  const [rangeStart, setRangeStart] = useState('2026-10-01');
  const [rangeEnd, setRangeEnd] = useState('2026-10-18');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state with selectedPeriod whenever it changes or dropdown opens
  useEffect(() => {
    if (selectedPeriod.startsWith('range:')) {
      const parts = selectedPeriod.split(':');
      if (parts.length === 3) {
        setRangeStart(parts[1]);
        setRangeEnd(parts[2]);
        setActiveTab('range');
      }
    } else if (selectedPeriod.startsWith('day:')) {
      const d = selectedPeriod.replace('day:', '');
      setCustomDate(d);
      setActiveTab('day');
    } else if (selectedPeriod.startsWith('quarter:')) {
      setActiveTab('quarter');
    } else if (selectedPeriod.startsWith('semester:')) {
      setActiveTab('semester');
    } else if (selectedPeriod === 'ALL' || selectedPeriod.startsWith('year:')) {
      setActiveTab('year');
    } else {
      setActiveTab('month');
    }
  }, [selectedPeriod, isOpen]);

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

  // Helper date calculations
  const formatDateFR = (iso: string) => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return iso;
  };

  const diffDays = useMemo(() => {
    if (!rangeStart || !rangeEnd) return 0;
    const s = new Date(rangeStart + 'T00:00:00');
    const e = new Date(rangeEnd + 'T00:00:00');
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    if (s.getTime() > e.getTime()) return -1;
    return Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1;
  }, [rangeStart, rangeEnd]);

  const handleApplyRange = () => {
    if (!rangeStart || !rangeEnd) return;
    let s = rangeStart;
    let e = rangeEnd;
    if (s > e) {
      // auto-swap if start is after end
      const temp = s;
      s = e;
      e = temp;
      setRangeStart(s);
      setRangeEnd(e);
    }
    setSelectedPeriod(`range:${s}:${e}`);
    setIsOpen(false);
  };

  const buttonClasses = () => {
    if (buttonClassName) return buttonClassName;
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
        title="Filtrer les données par date ou plage personnalisée"
      >
        <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
        <span className="truncate max-w-[95px] xs:max-w-[130px] sm:max-w-none">{periodLabel}</span>
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
          } mt-2 w-[calc(100vw-24px)] sm:w-[380px] max-w-[390px] bg-white dark:bg-[#111622] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600">
                <Clock className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Filtrage Temporel
                </span>
                <span className="text-[10px] text-slate-400">
                  Sélectionnez des jours, une plage ou une période
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 active:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 transition-all active:scale-95 cursor-pointer touch-manipulation"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 pointer-events-none" />
            </button>
          </div>

          {/* Period Mode Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/70 rounded-2xl mb-3 text-[11px] font-semibold overflow-x-auto no-scrollbar">
            {[
              { id: 'month', label: 'Mois' },
              { id: 'range', label: 'Plage (Début/Fin)', badge: 'Nouveau' },
              { id: 'day', label: 'Jour précis' },
              { id: 'quarter', label: 'Trimestre' },
              { id: 'semester', label: 'Semestre' },
              { id: 'year', label: 'Année' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1.5 px-2 text-center rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 ${
                    isActive
                      ? 'bg-white dark:bg-[#111622] text-brand-600 dark:text-brand-400 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="max-h-[460px] overflow-y-auto px-0.5 space-y-2">
            {/* 1. PLAGE PERSONNALISEE (START & END DATES) */}
            {activeTab === 'range' && (
              <div className="space-y-2.5 p-1">
                {/* Inputs Row: Date de Début & Date de Fin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      1. Date de début
                    </label>
                    <input
                      type="date"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111622] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      2. Date de fin
                    </label>
                    <input
                      type="date"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111622] text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                {/* Duration / Validation info badge */}
                {diffDays > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/40">
                    <div className="flex items-center gap-1.5 text-xs text-brand-800 dark:text-brand-300 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>
                        Du <strong className="font-bold">{formatDateFR(rangeStart)}</strong> au{' '}
                        <strong className="font-bold">{formatDateFR(rangeEnd)}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-600 text-white">
                      {diffDays} jour{diffDays > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {diffDays < 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>La date de fin est antérieure à la date de début. Elles seront automatiquement permutées.</span>
                  </div>
                )}

                {/* Quick Presets for multi-day ranges */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Raccourcis de sélection rapide :
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRangeStart('2026-10-12');
                        setRangeEnd('2026-10-18');
                      }}
                      className="py-1.5 px-2 text-[10px] font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-center cursor-pointer"
                    >
                      7 derniers jours
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRangeStart('2026-10-04');
                        setRangeEnd('2026-10-18');
                      }}
                      className="py-1.5 px-2 text-[10px] font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-center cursor-pointer"
                    >
                      15 derniers jours
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRangeStart('2026-09-19');
                        setRangeEnd('2026-10-18');
                      }}
                      className="py-1.5 px-2 text-[10px] font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-center cursor-pointer"
                    >
                      30 derniers jours
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRangeStart('2026-10-01');
                        setRangeEnd('2026-10-31');
                      }}
                      className="py-1.5 px-2 text-[10px] font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-center cursor-pointer"
                    >
                      Mois complet (Octobre)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRangeStart('2026-09-01');
                        setRangeEnd('2026-09-30');
                      }}
                      className="py-1.5 px-2 text-[10px] font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-center cursor-pointer"
                    >
                      Mois dernier (Septembre)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRangeStart('2026-10-01');
                        setRangeEnd('2026-10-18');
                      }}
                      className="py-1.5 px-2 text-[10px] font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-center cursor-pointer"
                    >
                      Du 1er à aujourd’hui
                    </button>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  type="button"
                  onClick={handleApplyRange}
                  disabled={!rangeStart || !rangeEnd}
                  className="w-full mt-1 py-2.5 px-3 text-xs font-bold rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    Appliquer le filtre sur cette plage {diffDays > 0 ? `(${diffDays} jours)` : ''}
                  </span>
                </button>
              </div>
            )}

            {/* 2. MOIS COMPLET */}
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-medium text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 font-bold border border-brand-200/50 dark:border-brand-800/40'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{m.label}</span>
                      {m.badge && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                  </button>
                );
              })}

            {/* 3. JOUR UNIQUE */}
            {activeTab === 'day' && (
              <div className="space-y-3 p-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Sélectionner une date précise :
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPeriod(`day:${customDate}`);
                        setIsOpen(false);
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors cursor-pointer"
                    >
                      Filtrer
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
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

            {/* 4. TRIMESTRE */}
            {activeTab === 'quarter' &&
              quarters.map((q) => {
                const isSelected = selectedPeriod === q.id || selectedPeriod === q.id.replace('quarter:', '');
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(q.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-medium text-left transition-colors cursor-pointer ${
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

            {/* 5. SEMESTRE */}
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-medium text-left transition-colors cursor-pointer ${
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

            {/* 6. ANNEE */}
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-medium text-left transition-colors cursor-pointer ${
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
          <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium truncate max-w-[240px]">
              Filtre actif : <strong className="text-slate-700 dark:text-slate-300">{periodLabel}</strong>
            </span>
            {selectedPeriod !== 'ALL' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPeriod('ALL');
                  setIsOpen(false);
                }}
                className="inline-flex items-center gap-1 text-brand-600 hover:underline font-bold shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
