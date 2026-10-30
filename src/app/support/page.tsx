'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { HelpCircle, MessageSquare, Phone, Mail, FileText, ExternalLink, ShieldCheck } from 'lucide-react';

export default function SupportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const faqs = [
    {
      q: 'Comment modifier une facture enregistrée en brouillon ?',
      a: 'Dans le tableau des factures, cliquez directement sur le bouton orange "Modifier" situé à droite de la ligne du brouillon, ou ouvrez l\'aperçu et cliquez sur "Modifier ce brouillon".',
    },
    {
      q: 'Comment s\'applique la TVA en fonction de mon pays dans la zone UEMOA ?',
      a: 'Le calcul s\'adapte automatiquement au taux légal de votre pays de facturation : taux normal de 18% (Bénin, Côte d\'Ivoire, Sénégal, Togo, Burkina Faso, Mali, Guinée-Bissau) ou 19% au Niger, avec prise en charge des taux réduits sectoriels (9% en CI, 5% solaire, 10% tourisme). Les articles à 0% restent exonérés.',
    },
    {
      q: 'Les factures générées sont-elles certifiées ?',
      a: 'Oui, chaque facture émise intègre les mentions légales obligatoires (IFU, RCCM), les dates d\'émission/échéance, un numéro séquentiel et les coordonnées de paiement.',
    },
    {
      q: 'Comment envoyer directement une facture via WhatsApp ?',
      a: 'Dans la liste des factures ou l\'aperçu, cliquez sur l\'icône WhatsApp. Un message prérempli avec les détails de la commande s\'ouvrira avec le numéro du client.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePath="/support" />
      <div className="lg:pl-72 flex flex-col flex-1">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-4xl w-full mx-auto min-w-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Centre d’Aide & Assistance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Questions fréquentes, guides et support technique dédié OMEGA FACTURE.
            </p>
          </div>

          {/* Quick contact cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://wa.me/2290195444430?text=Bonjour%20Support%20OMEGA%20FACTURE"
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Assistance WhatsApp Directe
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">+229 01 95 44 44 30</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href="mailto:contact@omegafacture.site?subject=Support%20OMEGA%20FACTURE"
              className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Support par Email
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">contact@omegafacture.site</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-brand-600 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* FAQ */}
          <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-600" />
              Questions Fréquentes
            </h2>

            <div className="space-y-3 pt-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-1.5"
                >
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {faq.q}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
