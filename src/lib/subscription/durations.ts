import { SubscriptionPlan } from '@/lib/types';

export type SubscriptionDuration = '1m' | '3m' | '6m' | '1y';

export interface DurationOption {
  id: SubscriptionDuration;
  months: number;
  label: string;
  badge?: string;
  discountPercent: number; // 0% pour 1m, 10% pour 3m, 6m, 1y
}

export const SUBSCRIPTION_DURATIONS: DurationOption[] = [
  { id: '1m', months: 1, label: '1 mois', discountPercent: 0 },
  { id: '3m', months: 3, label: '3 mois', badge: '-10% REMISE', discountPercent: 10 },
  { id: '6m', months: 6, label: '6 mois', badge: '-10% REMISE', discountPercent: 10 },
  { id: '1y', months: 12, label: '1 an', badge: '-10% REMISE', discountPercent: 10 },
];

export interface PlanPricingCalculation {
  plan: SubscriptionPlan;
  duration: SubscriptionDuration;
  months: number;
  durationDays: number;
  baseMonthlyFCFA: number;
  rawTotalFCFA: number;
  discountPercent: number;
  savingsFCFA: number;
  totalFCFA: number;
  monthlyEquivalentFCFA: number;
}

/**
 * Calcule avec rigueur financière le montant total, la remise de 10%
 * et l'équivalent mensuel pour une formule et une durée données.
 */
export function calculatePlanPrice(
  plan: SubscriptionPlan,
  duration: SubscriptionDuration = '1m'
): PlanPricingCalculation {
  const option = SUBSCRIPTION_DURATIONS.find((d) => d.id === duration) || SUBSCRIPTION_DURATIONS[0];
  const months = option.months;
  const baseMonthly = plan === 'business' ? 15000 : plan === 'pro' ? 5000 : 0;
  const rawTotal = baseMonthly * months;
  const discountPercent = option.discountPercent;
  const savings = Math.round((rawTotal * discountPercent) / 100);
  const total = rawTotal - savings;
  const monthlyEquivalent = Math.round(total / months);
  const durationDays = months === 12 ? 365 : months * 30;

  return {
    plan,
    duration,
    months,
    durationDays,
    baseMonthlyFCFA: baseMonthly,
    rawTotalFCFA: rawTotal,
    discountPercent,
    savingsFCFA: savings,
    totalFCFA: total,
    monthlyEquivalentFCFA: monthlyEquivalent,
  };
}

/**
 * Détermine la date d'expiration exacte d'un forfait à compter d'une date de départ
 */
export function computeSubscriptionExpiryDate(
  startDate: Date | string | number = new Date(),
  durationDays: number = 30
): string {
  const start = new Date(startDate);
  const expiry = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
  return expiry.toISOString();
}

/**
 * Calcule le nombre de jours calendaires restant avant l'expiration
 */
export function getDaysRemainingUntilExpiry(expiryIsoDate?: string | null): number {
  if (!expiryIsoDate) return 0;
  try {
    const expiry = new Date(expiryIsoDate).getTime();
    const now = Date.now();
    const diffMs = expiry - now;
    return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  } catch {
    return 0;
  }
}

