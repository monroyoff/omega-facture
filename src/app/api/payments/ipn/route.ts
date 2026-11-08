import { NextRequest, NextResponse } from 'next/server';
import { POST as fedapayPOST, GET as fedapayGET } from '../fedapay/webhook/route';
import { POST as paydunyaPOST } from '../paydunya/ipn/route';

export const dynamic = 'force-dynamic';

/**
 * Endpoint IPN universel pour les passerelles de paiement (FedaPay, PayDunya, Wave, CinetPay)
 * URL de production : https://www.omegafacture.site/api/payments/ipn
 * URL alternative : https://omegafacture.site/api/payments/ipn
 */
export async function POST(req: NextRequest) {
  // Si header FedaPay présent ou détection FedaPay
  const fedaSig = req.headers.get('x-fedapay-signature');
  if (fedaSig) {
    return fedapayPOST(req);
  }

  // Si header PayDunya présent
  const paydunyaHeader = req.headers.get('paydunya-master-key') || req.headers.get('paydunya-token');
  if (paydunyaHeader) {
    return paydunyaPOST(req);
  }

  // Par défaut, délègue à FedaPay
  return fedapayPOST(req);
}

export async function GET() {
  const baseRes = await fedapayGET();
  const data = await baseRes.json();
  return NextResponse.json({
    ...data,
    endpoint: '/api/payments/ipn',
    service: 'OMEGA FACTURE — Universal Payment IPN & Webhook Gateway (FedaPay & PayDunya)',
  });
}
