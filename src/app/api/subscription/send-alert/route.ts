import { NextRequest, NextResponse } from 'next/server';
import { sendSubscriptionAlertEmail } from '@/lib/email/subscription-alerts';

export const dynamic = 'force-dynamic';

/**
 * Route POST /api/subscription/send-alert
 * Reçoit : { email, name, planName, daysRemaining, expiresAtFormatted, companyId }
 * Envoie l'email d'alerte officiel (J-2, J-1 ou Jour J)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, name, planName, daysRemaining, expiresAtFormatted } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Email manquant ou invalide.' },
        { status: 400 }
      );
    }

    const result = await sendSubscriptionAlertEmail({
      to: email,
      recipientName: name || 'Abonné OMEGA FACTURE',
      planName: planName || 'Plan Business',
      daysRemaining: typeof daysRemaining === 'number' ? daysRemaining : 1,
      expiresAtFormatted: expiresAtFormatted || 'prochainement',
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API Send Subscription Alert] Erreur :', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur envoi alerte email' },
      { status: 500 }
    );
  }
}

