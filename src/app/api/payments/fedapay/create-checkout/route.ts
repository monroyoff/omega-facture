import { NextRequest, NextResponse } from 'next/server';
import { createFedaPayTransaction } from '@/lib/payments/fedapay';

export const dynamic = 'force-dynamic';

/**
 * Route POST pour initier un paiement FedaPay (Facture ou Abonnement)
 * Reçoit : amount, description, invoiceId, invoiceNumber, customerName, customerEmail, customerPhone, plan, companyId, userId
 * Renvoie : checkoutUrl (lien vers la page sécurisée FedaPay Mobile Money / Carte)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      description,
      invoiceId,
      invoiceNumber,
      customerName,
      customerEmail,
      customerPhone,
      companyId,
      userId,
      plan,
      duration,
      durationDays,
      months,
    } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Montant invalide.' },
        { status: 400 }
      );
    }

    const result = await createFedaPayTransaction({
      amount: Number(amount),
      description: description || `Règlement facture ${invoiceNumber || ''}`,
      invoiceId,
      invoiceNumber,
      customerName,
      customerEmail,
      customerPhone,
      companyId,
      userId,
      plan,
      duration,
      durationDays: durationDays ? Number(durationDays) : undefined,
      months: months ? Number(months) : undefined,
    });

    if (!result.success || !result.checkoutUrl) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Impossible d’initialiser le paiement sécurisé FedaPay.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      transactionId: result.transactionId,
      token: result.token,
    });
  } catch (err: any) {
    console.error('[API Create Checkout FedaPay] Erreur :', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}

