'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { RecentInvoicesTable } from '@/components/dashboard/RecentInvoicesTable';
import { InvoicePreviewModal } from '@/components/dashboard/InvoicePreviewModal';
import { useInvoices } from '@/lib/store/invoice-context';
import { Invoice } from '@/lib/types';
import { Plus, Download, FileSpreadsheet, FileCheck2, FileText } from 'lucide-react';

export default function InvoicesListPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { invoices, periodInvoices } = useInvoices();

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        'Type_Document,Numero,Client,Societe,Date_Emission,Date_Echeance,Total_FCFA,Statut',
        ...periodInvoices.map((i) => {
          const k =
            i.documentKind === 'quote' || i.number.startsWith('DEV-')
              ? 'Devis'
              : 'Facture';
          return `"${k}",${i.number},"${i.client.name}","${i.client.company}",${i.issueDate},${i.dueDate},${i.total},${i.status}`;
        }),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `documents_omega_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="/invoices"
      />

      <div className="lg:pl-72 flex flex-col flex-1">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto min-w-0">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Gestion des Factures & Devis
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Consultez, filtrez et émettez vos factures et devis estimatifs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                title="Exporter la liste en CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Exporter CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>

              <Link
                href="/invoices/new?kind=invoice"
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Facture</span>
              </Link>

              <Link
                href="/invoices/new?kind=quote"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold active:scale-95 transition-all"
                title="Créer un devis estimatif"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>+ Devis</span>
              </Link>
            </div>
          </div>

          {/* Table */}
          <RecentInvoicesTable
            invoices={periodInvoices}
            onSelectInvoice={(inv) => setSelectedInvoice(inv)}
          />
        </main>
      </div>

      <InvoicePreviewModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
