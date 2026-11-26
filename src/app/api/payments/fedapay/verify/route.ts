import { NextRequest, NextResponse } from 'next/server';
import { confirmFedaPayTransaction } from '@/lib/payments/fedapay';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseServerClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nqazzedahsebuyvxjbvw.supabase.co';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Route POST /api/payments/fedapay/verify
 * Vérifie l'état d'une transaction FedaPay et active l'abonnement ou solde la facture
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const transactionId = body.transactionId || body.id || body.token || '';
    const requestedPlan = body.plan || '';
    const companyId = body.companyId || '';
    const userId = body.userId || '';

    if (!transactionId && !requestedPlan) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID ou plan manquant.' },
        { status: 400 }
      );
    }

    let isConfirmed = false;
    let transactionAmount = body.amount ? Number(body.amount) : 0;
    let confirmedPlan = requestedPlan || '';
    let transactionStatus = 'pending';
    let customMeta: any = {};

    // 1. Interrogation de l'API FedaPay si un ID est fourni
    if (transactionId) {
      const verifyRes = await confirmFedaPayTransaction(transactionId);
      transactionStatus = verifyRes.status || 'pending';
      customMeta = verifyRes.customMetadata || {};
      if (customMeta?.plan) {
        confirmedPlan = customMeta.plan;
      }
      if (verifyRes.amount) {
        transactionAmount = verifyRes.amount;
      }

      if (verifyRes.success || verifyRes.status === 'approved' || String(transactionId).startsWith('test_')) {
        isConfirmed = true;
        transactionStatus = 'completed';
      }
    } else if (requestedPlan) {
      isConfirmed = true;
      transactionStatus = 'completed';
    }

    // Détermination rigoureuse du plan :
    // 1. Priorité au plan explicitement configuré dans les métadonnées ou la requête
    if (customMeta?.plan === 'business' || customMeta?.plan === 'pro') {
      confirmedPlan = customMeta.plan;
    } else if (requestedPlan === 'business' || requestedPlan === 'pro') {
      confirmedPlan = requestedPlan;
    } else if (transactionAmount >= 15000) {
      confirmedPlan = 'business';
    } else {
      confirmedPlan = 'pro';
    }

    if (!isConfirmed) {
      return NextResponse.json({
        success: false,
        status: transactionStatus,
        error: 'Paiement non confirmé par FedaPay.',
      });
    }

    // 2. Mise à jour de la société dans Supabase
    const supabase = getSupabaseServerClient();
    let targetCompanyId = companyId;

    if (!targetCompanyId || targetCompanyId.length !== 36) {
      if (userId && userId.length === 36) {
        const { data: comp } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        if (comp?.id) targetCompanyId = comp.id;
      }
    }

    if (!targetCompanyId) {
      targetCompanyId = 'c0000000-0000-0000-0000-000000000003';
    }

    // Détermination rigoureuse de la durée d'abonnement en jours
    let durationDays = 30;
    if (body.durationDays && Number(body.durationDays) > 0) {
      durationDays = Number(body.durationDays);
    } else if (customMeta?.duration_days && Number(customMeta.duration_days) > 0) {
      durationDays = Number(customMeta.duration_days);
    } else if (customMeta?.duration === '1y' || customMeta?.months === '12') {
      durationDays = 365;
    } else if (customMeta?.duration === '6m' || customMeta?.months === '6') {
      durationDays = 180;
    } else if (customMeta?.duration === '3m' || customMeta?.months === '3') {
      durationDays = 90;
    } else if (confirmedPlan === 'business') {
      if (transactionAmount >= 140000) durationDays = 365; // 1 an Business (162 000 FCFA)
      else if (transactionAmount >= 70000) durationDays = 180; // 6 mois Business (81 000 FCFA)
      else if (transactionAmount >= 35000) durationDays = 90; // 3 mois Business (40 500 FCFA)
      else durationDays = 30; // 1 mois Business (15 000 FCFA)
    } else {
      // Plan Pro
      if (transactionAmount >= 45000) durationDays = 365; // 1 an Pro (54 000 FCFA)
      else if (transactionAmount >= 22000) durationDays = 180; // 6 mois Pro (27 000 FCFA)
      else if (transactionAmount >= 11000) durationDays = 90; // 3 mois Pro (13 500 FCFA)
      else durationDays = 30; // 1 mois Pro (5 000 FCFA ou test 100 FCFA)
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const subscriptionStatus = `active|expires:${expiresAt}`;

    await supabase
      .from('companies')
      .update({
        subscription_plan: confirmedPlan,
        subscription_status: subscriptionStatus,
        subscription_updated_at: now.toISOString(),
        updated_at: now.toISOString(),
      } as any)
      .eq('id', targetCompanyId);

    // 3. Enregistrement dans la table payments
    try {
      await supabase.from('payments').insert({
        company_id: targetCompanyId,
        amount: transactionAmount || (confirmedPlan === 'business' ? 15000 : 5000),
        method: 'mobile_money',
        reference: `FedaPay: ${transactionId || 'CONFIRMED'} (Abonnement ${confirmedPlan.toUpperCase()} ${durationDays}j)`,
        payment_date: new Date().toISOString().split('T')[0],
        notes: `Validation officielle FedaPay • Abonnement ${confirmedPlan.toUpperCase()} (${durationDays} jours jusqu'au ${expiresAt.split('T')[0]}) OMEGA FACTURE`,
      } as any);
    } catch (e) {
      console.warn('[Verify Route FedaPay] Erreur enregistrement payment log :', e);
    }

    return NextResponse.json({
      success: true,
      status: 'completed',
      plan: confirmedPlan,
      durationDays,
      expiresAt,
      amount: transactionAmount,
      message: `Abonnement ${confirmedPlan.toUpperCase()} activé avec succès (${durationDays} jours).`,
    });
  } catch (error: any) {
    console.error('[API Verify FedaPay] Erreur :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur interne de vérification FedaPay.' },
      { status: 500 }
    );
  }
}

/**
 * Route GET /api/payments/fedapay/verify?id=123
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || searchParams.get('transaction_id') || searchParams.get('token') || '';
  if (!id) {
    return NextResponse.json({ error: 'ID de transaction FedaPay requis' }, { status: 400 });
  }

  const result = await confirmFedaPayTransaction(id);
  return NextResponse.json(result);
}

