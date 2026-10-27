'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Crown,
  Building2,
  Lock,
} from 'lucide-react';
import { useInvoices, SUBSCRIPTION_PLANS } from '@/lib/store/invoice-context';
import { SubscriptionPlan } from '@/lib/types';
import { formatFCFA } from '@/lib/money/format';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: SubscriptionPlan;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  defaultPlan = 'pro',
}) => {
  const { currentUser, userPlan, realInvoicesCount, upgradePlan, showToast } = useInvoices();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    defaultPlan === 'free' ? 'pro' : defaultPlan
  );
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money' | 'mtn' | 'moov' | 'card'>('wave');
  const [phoneNumber, setPhoneNumber] = useState('0195444430');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (defaultPlan && defaultPlan !== 'free') {
      setSelectedPlan(defaultPlan);
    }
  }, [defaultPlan]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const proPlan = SUBSCRIPTION_PLANS.pro;
  const businessPlan = SUBSCRIPTION_PLANS.business;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/paydunya/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: SUBSCRIPTION_PLANS[selectedPlan].priceFCFA,
          description: `Abonnement ${SUBSCRIPTION_PLANS[selectedPlan].name} OMEGA FACTURE`,
          plan: selectedPlan,
          customerName: currentUser?.name || 'Abonné OMEGA FACTURE',
          customerEmail: currentUser?.email || '',
          customerPhone: phoneNumber,
          userId: currentUser?.id,
          companyId: currentUser?.companyId,
        }),
      });

      const data = await res.json();

      if (data.success && data.checkoutUrl) {
        try {
          localStorage.setItem(
            'facturo:v1:pending_upgrade',
            JSON.stringify({
              plan: selectedPlan,
              userId: currentUser?.id,
              companyId: currentUser?.companyId,
              timestamp: Date.now(),
            })
          );
        } catch (e) {}

        showToast({
          kind: 'info',
          title: 'Redirection vers PayDunya',
          message: 'Ouverture du guichet officiel (Wave, MTN MoMo, Orange Money, Moov, Carte)...',
          duration: 3500,
        });
        // Redirection immédiate vers le guichet officiel PayDunya
        window.location.assign(data.checkoutUrl);
        return;
      }

      showToast({
        kind: 'warning',
        title: 'Erreur PayDunya',
        message: data.error || 'Impossible d’initialiser le paiement sécurisé.',
        duration: 5000,
      });
      setLoading(false);
    } catch (e: any) {
      console.error('[UpgradePlanModal] Erreur connexion PayDunya :', e);
      showToast({
        kind: 'error',
        title: 'Erreur réseau',
        message: 'Impossible de joindre la passerelle PayDunya. Veuillez réessayer.',
        duration: 5000,
      });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0c1017] rounded-3xl sm:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]">
        {/* Glow Effects */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 text-center border-b border-slate-100 dark:border-slate-800/80 relative">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 animate-pulse" />
            <span>Évoluez vers le niveau supérieur • Zone UEMOA</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Débloquez la facturation illimitée
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {userPlan === 'free' && realInvoicesCount >= 5 ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold block mb-1">
                ⚠️ Vous avez atteint la limite de 5 factures gratuites de votre Plan Gratuit.
              </span>
            ) : null}
            Passez au Plan Pro ou Business pour émettre sans limite, automatiser vos relances WhatsApp et accélérer vos encaissements en FCFA.
          </p>
        </div>

        {/* Modal Body with 2 Upgrade Cards */}
        <div className="px-6 sm:px-8 py-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Plan Pro Card */}
            <div
              onClick={() => setSelectedPlan('pro')}
              className={`relative rounded-3xl p-6 border-2 transition-all duration-200 cursor-pointer text-left flex flex-col justify-between ${
                selectedPlan === 'pro'
                  ? 'border-brand-600 bg-brand-50/30 dark:bg-brand-950/20 shadow-xl shadow-brand-600/15 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-[#FAFAF9] dark:bg-[#111622] hover:border-brand-400'
              }`}
            >
              {/* Badge Most Popular */}
              <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-brand-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md shadow-brand-600/30 flex items-center gap-1.5">
                <Crown className="w-3 h-3 text-amber-300" />
                <span>Recommandé • Le Plus Populaire</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 pt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Indépendants &amp; PME
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'pro'
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {selectedPlan === 'pro' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Plan Pro
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  {proPlan.description}
                </p>

                <div className="py-3 border-y border-slate-200/80 dark:border-slate-800 mb-4">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
                    {formatFCFA(proPlan.priceFCFA)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500"> / mois</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {proPlan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 stroke-[2.5] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-300">
                  ⚡ Activation instantanée après paiement
                </span>
              </div>
            </div>

            {/* 2. Plan Business Card */}
            <div
              onClick={() => setSelectedPlan('business')}
              className={`relative rounded-3xl p-6 border-2 transition-all duration-200 cursor-pointer text-left flex flex-col justify-between ${
                selectedPlan === 'business'
                  ? 'border-purple-600 bg-purple-50/30 dark:bg-purple-950/20 shadow-xl shadow-purple-600/15 ring-2 ring-purple-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-[#FAFAF9] dark:bg-[#111622] hover:border-purple-400'
              }`}
            >
              <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md shadow-purple-600/30 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-white" />
                <span>Pour Équipes &amp; Cabinets</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 pt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Équipes en essor
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'business'
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {selectedPlan === 'business' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Plan Business
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  {businessPlan.description}
                </p>

                <div className="py-3 border-y border-slate-200/80 dark:border-slate-800 mb-4">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
                    {formatFCFA(businessPlan.priceFCFA)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500"> / mois</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {businessPlan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 stroke-[2.5] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                  🚀 Support WhatsApp VIP 24/7 inclus
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-[#FAFAF9] dark:bg-[#111622] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Moyen de règlement en FCFA :
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Paiement direct sécurisé
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
              {[
                { id: 'wave', label: 'Wave', badge: '🌊 Wave', color: 'border-blue-400' },
                { id: 'orange_money', label: 'Orange', badge: '🟧 Orange Money', color: 'border-amber-400' },
                { id: 'mtn', label: 'MTN MoMo', badge: '🟨 MTN MoMo', color: 'border-yellow-400' },
                { id: 'moov', label: 'Moov', badge: '🟦 Moov Money', color: 'border-blue-500' },
                { id: 'card', label: 'Carte', badge: '💳 Carte Visa', color: 'border-slate-400' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    paymentMethod === m.id
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{m.badge}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:flex-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Numéro Mobile Money pour débit instantané :
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+229 01 95 44 44 30"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="w-full sm:w-auto sm:self-end">
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={loading || success}
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl font-black text-sm text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    selectedPlan === 'business'
                      ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                      : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/30'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Redirection vers PayDunya...</span>
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Abonnement activé !</span>
                    </>
                  ) : (
                    <>
                      <span>
                        Payer {formatFCFA(SUBSCRIPTION_PLANS[selectedPlan].priceFCFA)} &amp; Activer
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="px-6 sm:px-8 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Paiement sécurisé en FCFA • Sans engagement • Annulation en 1 clic</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
          >
            Continuer avec le Plan Gratuit
          </button>
        </div>
      </div>
    </div>
  );
};
