'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Settings, Building, ShieldCheck, CreditCard, Save, Check, X, Sparkles, Globe, PenTool, Eraser } from 'lucide-react';
import { useInvoices } from '@/lib/store/invoice-context';
import { UEMOA_COUNTRIES, findUemoaCountry, getCountryStandardVatRate, getCountryVatRates } from '@/lib/tax/uemoa-tax';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const {
    currentUser,
    updateUserProfile,
    showToast,
    userPlan,
    realInvoicesCount,
    openUpgradeModal,
    setUserCountry,
    userCountry,
    defaultVatRate,
  } = useInvoices();

  const settingsStorageKey = currentUser?.companyId ? `facturo:v1:${currentUser.companyId}:settings` : 'facturo:v1:settings';

  // Settings form states
  const [country, setCountry] = useState(currentUser?.country || userCountry || 'Bénin');
  const [companyName, setCompanyName] = useState(currentUser?.organization || currentUser?.name || 'Mon Entreprise');
  const [ifu, setIfu] = useState(currentUser?.ifu || '');
  const [rccm, setRccm] = useState(currentUser?.rccm || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || (currentUser?.country ? `${currentUser.country}` : 'Zone UEMOA'));
  const [defaultVat, setDefaultVat] = useState(currentUser?.defaultVatRate || defaultVatRate || 18);
  const [invoicePrefix, setInvoicePrefix] = useState('FAC');
  const [paymentTerms, setPaymentTerms] = useState(15);
  const [momoNumber, setMomoNumber] = useState(currentUser?.momoNumber || currentUser?.phone || '');
  const [signatoryName, setSignatoryName] = useState(currentUser?.signatoryName || currentUser?.name || currentUser?.organization || 'La Direction');
  const [signatureImage, setSignatureImage] = useState<string>(currentUser?.signatureImage || '');

  // Canvas drawing ref & handlers
  const sigCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignatureImage(dataUrl);
    }
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasDrawn(false);
    setSignatureImage('');
  };

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(settingsStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.country) setCountry(parsed.country);
        if (parsed.companyName) setCompanyName(parsed.companyName);
        if (parsed.ifu !== undefined) setIfu(parsed.ifu);
        if (parsed.rccm !== undefined) setRccm(parsed.rccm);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone !== undefined) setPhone(parsed.phone);
        if (parsed.address !== undefined) setAddress(parsed.address);
        if (parsed.defaultVat !== undefined) setDefaultVat(parsed.defaultVat);
        if (parsed.invoicePrefix) setInvoicePrefix(parsed.invoicePrefix);
        if (parsed.paymentTerms !== undefined) setPaymentTerms(parsed.paymentTerms);
        if (parsed.momoNumber !== undefined) setMomoNumber(parsed.momoNumber);
        if (parsed.signatoryName) setSignatoryName(parsed.signatoryName);
        if (parsed.signatureImage) setSignatureImage(parsed.signatureImage);
      }
    } catch (e) {}

    if (currentUser) {
      if (currentUser.country) setCountry(currentUser.country);
      if (currentUser.organization) setCompanyName(currentUser.organization);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.phone && !phone) setPhone(currentUser.phone);
      if (currentUser.ifu && !ifu) setIfu(currentUser.ifu);
      if (currentUser.rccm && !rccm) setRccm(currentUser.rccm);
      if (currentUser.address && !address) setAddress(currentUser.address);
      if (currentUser.defaultVatRate !== undefined) setDefaultVat(currentUser.defaultVatRate);
      if (currentUser.signatoryName) setSignatoryName(currentUser.signatoryName);
      if (currentUser.signatureImage) setSignatureImage(currentUser.signatureImage);
    }
  }, [currentUser, settingsStorageKey]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCountryChange = (newCountryName: string) => {
    setCountry(newCountryName);
    const standardVat = getCountryStandardVatRate(newCountryName);
    setDefaultVat(standardVat);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      organization: companyName,
      email: email,
      phone: phone,
      country: country,
      defaultVatRate: defaultVat,
      ifu: ifu,
      rccm: rccm,
      address: address,
      momoNumber: momoNumber,
      signatoryName: signatoryName,
      signatureImage: signatureImage,
    });
    setUserCountry(country);
    try {
      localStorage.setItem(
        settingsStorageKey,
        JSON.stringify({
          companyName,
          country,
          ifu,
          rccm,
          email,
          phone,
          address,
          defaultVat,
          invoicePrefix,
          paymentTerms,
          momoNumber,
          signatoryName,
          signatureImage,
        })
      );
    } catch (e) {}

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    showToast({
      title: 'Paramètres enregistrés avec succès !',
      message: `Vos informations pour ${companyName} (${country}) ont été mises à jour.`,
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
                        ? 'Factures & devis illimités, 1 utilisateur, relances WhatsApp & exports comptables.'
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
                    Pays du Siège (Zone UEMOA &amp; Europe) *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold cursor-pointer"
                  >
                    {UEMOA_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name} — TVA légale {c.standardVatRate}%
                      </option>
                    ))}
                  </select>
                </div>

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
                    {findUemoaCountry(country).fiscalIdLabel} *
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

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Nom du Signataire & Titre Officiel
                  </label>
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    placeholder="Ex: Kouamé Koffi — Gérant"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-brand-600" />
                      <span>Signature & Cachet Électronique par Défaut</span>
                    </label>
                    {(hasDrawn || signatureImage) && (
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                      >
                        <Eraser className="w-3 h-3" />
                        <span>Effacer la signature</span>
                      </button>
                    )}
                  </div>

                  <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 p-1 overflow-hidden">
                    <canvas
                      ref={sigCanvasRef}
                      width={600}
                      height={130}
                      onPointerDown={startDrawing}
                      onPointerMove={draw}
                      onPointerUp={stopDrawing}
                      onPointerLeave={stopDrawing}
                      className="w-full h-28 touch-none cursor-crosshair bg-slate-50/50 dark:bg-slate-900/50 rounded-xl"
                    />
                    {!hasDrawn && !signatureImage && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs">
                        ✍️ Dessinez votre signature officielle ici (doigt ou souris)
                      </div>
                    )}
                  </div>
                  {signatureImage && !hasDrawn && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Signature enregistrée et prête à être apposée sur toutes vos futures factures.</span>
                    </div>
                  )}
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
                    Taux de TVA par défaut ({findUemoaCountry(country).name})
                  </label>
                  <select
                    value={defaultVat}
                    onChange={(e) => setDefaultVat(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                  >
                    {getCountryVatRates(country).map((opt) => (
                      <option key={opt.rate} value={opt.rate}>
                        {opt.label}
                      </option>
                    ))}
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
