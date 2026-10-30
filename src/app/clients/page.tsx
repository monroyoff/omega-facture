'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useInvoices } from '@/lib/store/invoice-context';
import { NewClientModal } from '@/components/clients/NewClientModal';
import { Plus, Search, Building2, Phone, Mail, MapPin, ExternalLink, ShieldCheck, Pencil, Check, X, Trash2 } from 'lucide-react';
import { Client } from '@/lib/types';
import { ClientsGridSkeleton } from '@/components/ui/Skeleton';

export default function ClientsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const { clients, isDataLoading, deleteClient, showToast } = useInvoices();

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

  const handleConfirmDelete = () => {
    if (!clientToDelete) return;
    const clientName = clientToDelete.company || clientToDelete.name;
    deleteClient?.(clientToDelete.id);
    showToast({
      title: 'Client supprimé !',
      message: `La fiche client de "${clientName}" a été définitivement supprimée.`,
      kind: 'delete',
      duration: 4000,
    });
    setClientToDelete(null);
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

          {/* Clients Grid, Skeleton or Empty State */}
          {isDataLoading ? (
            <ClientsGridSkeleton />
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-card max-w-xl mx-auto space-y-4 my-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {searchQuery ? 'Aucun client trouvé' : 'Aucun client enregistré'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  {searchQuery
                    ? `Aucun contact ne correspond à "${searchQuery}".`
                    : 'Votre répertoire client est actuellement vide. Enregistrez vos clients réels pour émettre des factures et devis.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter votre premier client</span>
              </button>
            </div>
          ) : (
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

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(cli);
                        }}
                        className="p-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-brand-600 group-hover:border-brand-500/30 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer active:scale-95"
                        title="Modifier la fiche client"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Modifier</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClientToDelete(cli);
                        }}
                        className="p-1.5 px-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer active:scale-95"
                        title="Supprimer ce client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </button>
                    </div>
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
        )}
        </main>
      </div>

      <NewClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        clientToEdit={editingClient}
      />

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#111622] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Supprimer ce client
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {clientToDelete.company || clientToDelete.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement la fiche client de{' '}
              <strong>{clientToDelete.company || clientToDelete.name}</strong> ({clientToDelete.city}, {clientToDelete.country}) ?
              Cette action retirera ce contact de votre répertoire.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmer la suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
