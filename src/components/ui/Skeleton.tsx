'use client';

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`skeleton-shimmer bg-slate-200/80 dark:bg-slate-800/60 rounded-xl ${className}`}
      {...props}
    />
  );
};

/**
 * Skeleton pour l'en-tête de bienvenue du Dashboard
 */
export const DashboardHeaderSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div className="space-y-2">
        <Skeleton className="h-7 sm:h-9 w-64 sm:w-80 rounded-2xl" />
        <Skeleton className="h-4 sm:h-5 w-72 sm:w-96 rounded-xl" />
      </div>
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-10 w-28 sm:w-32 rounded-2xl" />
        <Skeleton className="h-10 w-36 sm:w-44 rounded-2xl" />
      </div>
    </div>
  );
};

/**
 * Skeleton pour les 4 cartes KPI du Dashboard et des pages financières
 */
export const KPICardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#111622] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-36 sm:w-44 rounded-xl" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton pour le graphique de chiffre d'affaires (RevenueChart)
 */
export const RevenueChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#111622] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded-lg" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>

      {/* Barres du graphique */}
      <div className="h-64 sm:h-72 flex items-end gap-3 sm:gap-4 pt-8 px-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        {[45, 75, 30, 90, 60, 85, 40, 95, 70, 50, 80, 65].map((h, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <Skeleton
              className="w-full max-w-[36px] rounded-t-xl"
              style={{ height: `${h}%` }}
            />
            <Skeleton className="h-3 w-6 rounded" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-4 w-40 rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Skeleton pour le tableau multi-documents (RecentInvoicesTable)
 */
export const TableSkeleton: React.FC<{ rowsCount?: number; showHeaderTabs?: boolean }> = ({
  rowsCount = 5,
  showHeaderTabs = true,
}) => {
  return (
    <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card overflow-hidden">
      {/* Top filters / tabs skeleton */}
      {showHeaderTabs && (
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
            <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
            <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-full sm:w-64 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
              <th className="py-3 px-4 w-10">
                <Skeleton className="h-4 w-4 rounded" />
              </th>
              <th className="py-3 px-4">
                <Skeleton className="h-4 w-20 rounded" />
              </th>
              <th className="py-3 px-4">
                <Skeleton className="h-4 w-28 rounded" />
              </th>
              <th className="py-3 px-4">
                <Skeleton className="h-4 w-24 rounded" />
              </th>
              <th className="py-3 px-4">
                <Skeleton className="h-4 w-20 rounded" />
              </th>
              <th className="py-3 px-4 text-right">
                <Skeleton className="h-4 w-24 rounded ml-auto" />
              </th>
              <th className="py-3 px-4 text-center">
                <Skeleton className="h-4 w-16 rounded mx-auto" />
              </th>
              <th className="py-3 px-4 text-right">
                <Skeleton className="h-4 w-14 rounded ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {Array.from({ length: rowsCount }).map((_, idx) => (
              <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20">
                <td className="py-4 px-4">
                  <Skeleton className="h-4 w-4 rounded" />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-24 rounded-lg" />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Skeleton className="h-4 w-24 rounded" />
                </td>
                <td className="py-4 px-4">
                  <Skeleton className="h-4 w-20 rounded" />
                </td>
                <td className="py-4 px-4 text-right">
                  <Skeleton className="h-5 w-28 rounded ml-auto" />
                </td>
                <td className="py-4 px-4">
                  <Skeleton className="h-6 w-20 rounded-full mx-auto" />
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Skeletons */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60 p-3 space-y-3">
        {Array.from({ length: rowsCount }).map((_, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl space-y-3 border border-slate-100 dark:border-slate-800/60"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-5 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton pour la grille du répertoire Clients
 */
export const ClientsGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#111622] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3.5 w-36 rounded" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <Skeleton className="h-3.5 w-44 rounded" />
            <Skeleton className="h-3.5 w-32 rounded" />
            <Skeleton className="h-3.5 w-28 rounded" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton pour la grille du catalogue Produits & Services
 */
export const ProductsGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#111622] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-4"
        >
          <div className="flex items-start gap-3.5">
            <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-5 w-28 rounded" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton pour le tableau du catalogue Produits & Services
 */
export const ProductsTableSkeleton: React.FC<{ rowsCount?: number }> = ({ rowsCount = 5 }) => {
  return (
    <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 uppercase text-[11px] font-semibold">
              <th className="py-3.5 pl-6 pr-3"><Skeleton className="h-4 w-32 rounded" /></th>
              <th className="py-3.5 px-3"><Skeleton className="h-4 w-20 rounded" /></th>
              <th className="py-3.5 px-3"><Skeleton className="h-4 w-14 rounded" /></th>
              <th className="py-3.5 px-3"><Skeleton className="h-4 w-12 rounded" /></th>
              <th className="py-3.5 pr-6 pl-3 text-right"><Skeleton className="h-4 w-24 rounded ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: rowsCount }).map((_, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 pl-6 pr-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <Skeleton className="h-5 w-20 rounded-md" />
                </td>
                <td className="py-3.5 px-3">
                  <Skeleton className="h-4 w-12 rounded" />
                </td>
                <td className="py-3.5 px-3">
                  <Skeleton className="h-4 w-10 rounded" />
                </td>
                <td className="py-3.5 pr-6 pl-3 text-right">
                  <Skeleton className="h-5 w-28 rounded ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Skeleton complet pour la page Rapports Financiers & KPI
 */
export const ReportsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 3 Top KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-9 w-44 rounded-xl" />
            <Skeleton className="h-3.5 w-52 rounded" />
          </div>
        ))}
      </div>

      {/* Balance Âgée Card Skeleton */}
      <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-64 rounded" />
            <Skeleton className="h-3.5 w-80 rounded" />
          </div>
          <Skeleton className="h-4 w-28 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-7 w-36 rounded-lg" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Drilldown table skeleton */}
      <TableSkeleton rowsCount={4} showHeaderTabs={false} />
    </div>
  );
};
