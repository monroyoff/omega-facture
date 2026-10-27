import { NextRequest, NextResponse } from 'next/server';
import { createPayDunyaInvoice } from '@/lib/payments/paydunya';

export const dynamic = 'force-dynamic';

/**
 * Route POST pour initier un paiement PayDunya (Facture ou Abonnement)
 * Reçoit : amount, description, invoiceId, invoiceNumber, customerName, customerEmail, customerPhone
 * Renvoie : checkoutUrl (lien vers la page de paiement PayDunya Mobile Money / Carte)
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
    } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Montant invalide.' },
        { status: 400 }
      );
    }

    const result = await createPayDunyaInvoice({
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
    });

    if (!result.success || !result.checkoutUrl) {
      return NextResponse.json(
        { success: false, error: result.error || 'Impossible d’initialiser le paiement PayDunya.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      token: result.token,
    });
  } catch (err: any) {
    console.error('[API Create Checkout] Erreur :', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}
