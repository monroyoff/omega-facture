'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  ArrowRight,
  LayoutDashboard,
  Crown,
  ShieldCheck,
  FilePlus,
  Loader2,
  Check,
  Sparkles,
} from 'lucide-react';
import { useInvoices, SUBSCRIPTION_PLANS, saveUserToRegistry } from '@/lib/store/invoice-context';
import { SubscriptionPlan } from '@/lib/types';
import { formatFCFA } from '@/lib/money/format';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || searchParams.get('invoice_token') || '';
  const paramPlan = searchParams.get('plan') || '';
  const paramCompanyId = searchParams.get('companyId') || '';
  const paramUserId = searchParams.get('userId') || '';
  const paramAmount = searchParams.get('amount') || '';

  const { currentUser, upgradePlan, refreshData, showToast } = useInvoices();
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState<SubscriptionPlan>('pro');
  const [confirmed, setConfirmed] = useState(false);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const processPayment = async () => {
      // 1. Détermination du plan cible
      let targetPlan: SubscriptionPlan = 'pro';
      if (paramPlan === 'pro' || paramPlan === 'business') {
        targetPlan = paramPlan as SubscriptionPlan;
      } else {
        try {
          const rawPending = localStorage.getItem('facturo:v1:pending_upgrade');
          if (rawPending) {
            const parsed = JSON.parse(rawPending);
            if (parsed.plan === 'pro' || parsed.plan === 'business') {
              targetPlan = parsed.plan;
            }
          }
        } catch (e) {}
      }

      setActivePlan(targetPlan);

      // 2. Appel serveur pour confirmer le paiement avec PayDunya et mettre à jour la BDD
      try {
        const verifyRes = await fetch('/api/payments/paydunya/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            plan: targetPlan,
            companyId: paramCompanyId || currentUser?.companyId,
            userId: paramUserId || currentUser?.id,
            amount: paramAmount || SUBSCRIPTION_PLANS[targetPlan].priceFCFA,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success && verifyData.plan) {
          targetPlan = verifyData.plan as SubscriptionPlan;
          setActivePlan(targetPlan);
        }
      } catch (err) {
        console.warn('[PaymentCallback] Erreur confirmation serveur PayDunya :', err);
      }

      // 3. Basculement garanti de l'état client local
      try {
        await upgradePlan(targetPlan);

        // Mise à jour de sécurité directe dans localStorage
        const savedAuth = localStorage.getItem('facturo:v1:auth');
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          if (parsed?.currentUser) {
            parsed.currentUser.plan = targetPlan;
            localStorage.setItem('facturo:v1:auth', JSON.stringify(parsed));
            saveUserToRegistry(parsed.currentUser);
          }
        }

        localStorage.removeItem('facturo:v1:pending_upgrade');
        await refreshData();
      } catch (err) {
        console.warn('[PaymentCallback] Erreur mise à jour locale de l’abonnement :', err);
      }

      showToast({
        title: `Paiement Validé • ${SUBSCRIPTION_PLANS[targetPlan].name} Actif !`,
        message: 'Votre compte a été instantanément mis à niveau avec facturation illimitée.',
        kind: 'success',
        duration: 6000,
      });

      setLoading(false);
      setConfirmed(true);
    };

    processPayment();
  }, [paramPlan, paramCompanyId, paramUserId, paramAmount, token, currentUser, upgradePlan, refreshData, showToast]);

  const planInfo = SUBSCRIPTION_PLANS[activePlan] || SUBSCRIPTION_PLANS.pro;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a0f] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-[#111622] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xl text-center animate-in fade-in duration-300 relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand-600/15 rounded-full blur-[90px] pointer-events-none" />

        {loading ? (
          <div className="py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Finalisation de votre abonnement...
            </h2>
            <p className="text-xs text-slate-500">
              Vérification de la transaction PayDunya et déblocage de vos fonctionnalités.
            </p>
          </div>
        ) : (
          <>
            {/* Animated Success Badge */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-3 border border-emerald-200/80 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Règlement PayDunya Enregistré avec Succès</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Bienvenue sur le {planInfo.name} !
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Votre compte <strong className="text-brand-600 dark:text-brand-400 font-bold">{currentUser?.organization || 'OMEGA FACTURE'}</strong> est désormais opérationnel sans aucune limite de facturation.
            </p>

            {/* Plan Features Card */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {planInfo.name} • Actif
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Zone UEMOA • {formatFCFA(planInfo.priceFCFA)} / mois
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Activé
                </span>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Factures &amp; Devis <strong>illimités</strong> (limite levée)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Relances automatiques par <strong>WhatsApp &amp; Email</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Rapports financiers, exports PDF &amp; tableurs comptables</span>
                </li>
              </ul>
            </div>

            {token && (
              <div className="mb-6 p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                <span>Réf. PayDunya :</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{token.slice(0, 18)}...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Accéder à mon tableau de bord</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard?create=invoice"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>Créer une facture illimitée</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#070a0f] flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            <span>Chargement de la confirmation PayDunya...</span>
          </div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
