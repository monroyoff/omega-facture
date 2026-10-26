'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Settings, Building, ShieldCheck, CreditCard, Save, Check, X, Sparkles } from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { currentUser, updateUserProfile, showToast, userPlan, realInvoicesCount, openUpgradeModal } = useInvoices();

  // Settings form states
  const [companyName, setCompanyName] = useState(currentUser?.organization || 'MONROY Business Solutions');
  const [ifu, setIfu] = useState('0202110485960');
  const [rccm, setRccm] = useState('RB/COT/21 B 1042');
  const [email, setEmail] = useState(currentUser?.email || 'monmonnroyteam@gmail.com');
  const [phone, setPhone] = useState('+229 01 95 44 44 30');
  const [address, setAddress] = useState('Allada, République du Bénin');
  const [defaultVat, setDefaultVat] = useState(18);
  const [invoicePrefix, setInvoicePrefix] = useState('FAC');
  const [paymentTerms, setPaymentTerms] = useState(15);
  const [momoNumber, setMomoNumber] = useState('+229 01 95 44 44 30');

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('facturo:v1:settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.companyName) setCompanyName(parsed.companyName);
        if (parsed.ifu) setIfu(parsed.ifu);
        if (parsed.rccm) setRccm(parsed.rccm);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.defaultVat !== undefined) setDefaultVat(parsed.defaultVat);
        if (parsed.invoicePrefix) setInvoicePrefix(parsed.invoicePrefix);
        if (parsed.paymentTerms !== undefined) setPaymentTerms(parsed.paymentTerms);
        if (parsed.momoNumber) setMomoNumber(parsed.momoNumber);
      }
    } catch (e) {}

    if (currentUser) {
      if (currentUser.organization) setCompanyName(currentUser.organization);
      if (currentUser.email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      organization: companyName,
      email: email,
    });
    try {
      localStorage.setItem(
        'facturo:v1:settings',
        JSON.stringify({
          companyName,
          ifu,
          rccm,
          email,
          phone,
          address,
          defaultVat,
          invoicePrefix,
          paymentTerms,
          momoNumber,
        })
      );
    } catch (e) {}

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    showToast({
      title: 'Paramètres enregistrés avec succès !',
      message: 'Vos informations d’entreprise et mentions fiscales ont été mises à jour.',
      kind: 'success',
      duration: 3500,
    });
    setSaved(true);
    timerRef.current = setTimeout(() => {
      setSaved(false);
    }, 3200);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#070a0f] flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePath="/settings" />
      <div className="lg:pl-72 flex flex-col flex-1">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-5xl w-full mx-auto min-w-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Paramètres de l’Organisation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configurez vos informations légales, mentions fiscales et coordonnées de règlement.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Subscription & Plan Status Card */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/25">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Formule d’Abonnement
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Gérez votre forfait, quota de facturation et options d’équipe.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    userPlan === 'business'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                      : userPlan === 'pro'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  }`}>
                    {userPlan === 'business' ? 'Plan Business (15 000 F)' : userPlan === 'pro' ? 'Plan Pro (5 000 F)' : 'Plan Gratuit (0 F)'}
                  </span>
                </div>
              </div>

              {/* Quota Progress Bar for Free Plan */}
              {userPlan === 'free' ? (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span>Consommation du quota mensuel</span>
                    <span className="text-amber-700 dark:text-amber-400 font-extrabold">{realInvoicesCount} / 5 factures</span>
                  </div>
                  <div className="w-full h-2.5 bg-amber-100 dark:bg-amber-950/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (realInvoicesCount / 5) * 100)}%` }}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {5 - realInvoicesCount > 0
                        ? `Il vous reste ${5 - realInvoicesCount} facture(s) gratuite(s).`
                        : 'Limite atteinte (5/5). Mettez à niveau pour facturer sans restriction.'}
                    </span>
                    <button
                      type="button"
                      onClick={() => openUpgradeModal('pro')}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all cursor-pointer self-start sm:self-auto"
                    >
                      Mettre à niveau (5 000 FCFA/mois)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {userPlan === 'pro' ? 'Abonnement Pro Actif' : 'Abonnement Business Actif'}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {userPlan === 'pro'
                        ? 'Factures & devis illimités, jusqu’à 3 utilisateurs, relances WhatsApp & exports comptables.'
                        : 'Illimité total, jusqu’à 10 utilisateurs, rôles comptables avancés et intégration API.'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openUpgradeModal(userPlan === 'pro' ? 'business' : 'pro')}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white hover:opacity-90 active:scale-95 text-white dark:text-slate-900 font-bold text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    {userPlan === 'pro' ? 'Passer au Business (15 000 F)' : 'Gérer la formule'}
                  </button>
                </div>
              )}
            </div>

            {/* Identity & Fiscal */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-brand-600" />
                Identité de l’Émetteur & Données Fiscales
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Raison Sociale / Nom commercial *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Numéro IFU (Identifiant Fiscal Unique) *
                  </label>
                  <input
                    type="text"
                    value={ifu}
                    onChange={(e) => setIfu(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Registre de Commerce (RCCM)
                  </label>
                  <input
                    type="text"
                    value={rccm}
                    onChange={(e) => setRccm(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Email Officiel
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Téléphone Principal
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Adresse & Siège Social
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Invoicing rules */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Règles de Facturation & Taux par Défaut
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Préfixe des factures
                  </label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Taux de TVA par défaut
                  </label>
                  <select
                    value={defaultVat}
                    onChange={(e) => setDefaultVat(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                  >
                    <option value={18}>18% (Taux standard UEMOA)</option>
                    <option value={0}>0% (Exonération)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Délai de paiement par défaut
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                  >
                    <option value={15}>15 jours</option>
                    <option value={30}>30 jours</option>
                    <option value={45}>45 jours</option>
                    <option value={60}>60 jours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Numéro Mobile Money affiché sur les factures
                </label>
                <input
                  type="text"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les Modifications</span>
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* ============================================================== */}
      {/* NOTIFICATION MODALE CENTRÉE AU MILIEU DE L'ÉCRAN              */}
      {/* ============================================================== */}
      {saved && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm transition-all"
          onClick={() => setSaved(false)}
        >
          <div 
            className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-[#111622] border border-emerald-500/30 dark:border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 text-center animate-pop-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Halo lumineux décoratif */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full blur-2xl pointer-events-none" />

            {/* Bouton de fermeture d'urgence (X) */}
            <button
              type="button"
              onClick={() => setSaved(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Badge circulaire émeraude avec check icon */}
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 sm:mb-5">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.5]" />
            </div>

            {/* Titre & Message demandés par l'utilisateur */}
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Paramètres enregistrés avec succès !
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Vos modifications ont été sauvegardées et sont immédiatement prises en compte sur l'ensemble de vos factures et devis.
            </p>

            {/* Bouton de confirmation manuelle */}
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setSaved(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
              >
                Parfait, merci
              </button>
            </div>

            {/* Barre de défilement dégressive (compte à rebours automatique ~3s) */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-emerald-100 dark:bg-emerald-950/60">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-progress-shrink" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
