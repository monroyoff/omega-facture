'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useInvoices } from '@/lib/store/invoice-context';
import { NewClientModal } from '@/components/clients/NewClientModal';
import { Plus, Search, Building2, Phone, Mail, MapPin, ExternalLink, ShieldCheck, Pencil, Check, X } from 'lucide-react';
import { Client } from '@/lib/types';

export default function ClientsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { clients } = useInvoices();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('search');
      if (s) setSearchQuery(s);
    }
  }, []);

  const filtered = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
  });

  const handleOpenCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleSuccess = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePath="/clients"
      />

      <div className="lg:pl-72 flex flex-col flex-1">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto min-w-0">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Répertoire Clients
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Gérez vos clients, coordonnées fiscales (IFU/NIF) et historiques d’achats. Cliquez sur une fiche pour la modifier.
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Client</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, société, ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-card"
            />
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((cli) => (
              <div
                key={cli.id}
                onClick={() => handleOpenEdit(cli)}
                className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card hover:shadow-dropdown hover:border-brand-500/50 dark:hover:border-brand-500/40 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl overflow-hidden bg-brand-50 dark:bg-brand-950/40 border border-slate-200 dark:border-slate-700 shrink-0">
                        {cli.avatar ? (
                          <img src={cli.avatar} alt={cli.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-brand-600 text-xs">
                            {cli.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {cli.name}
                        </h2>
                        <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold block mt-0.5">
                          {cli.company}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(cli);
                      }}
                      className="p-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:text-brand-600 group-hover:border-brand-500/30 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                      title="Modifier la fiche client"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Modifier</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cli.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cli.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cli.city}, {cli.country}</span>
                    </div>
                    {cli.taxId && (
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{cli.taxId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Actif</span>
                  </span>
                  <a
                    href={`https://wa.me/${cli.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <NewClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        clientToEdit={editingClient}
        onSuccess={handleSuccess}
      />

      {/* Centered Notification "Modification enregistrée" */}
      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#111622] rounded-3xl p-6 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col items-center">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 active:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700 transition-all active:scale-95 cursor-pointer touch-manipulation"
              title="Fermer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>

            {/* Glowing Success Badge */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            {/* Title & Message */}
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {toastMessage}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs leading-relaxed">
              Le dossier client et ses factures associées ont été actualisés avec succès.
            </p>

            {/* Confirm button */}
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              D'accord
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
