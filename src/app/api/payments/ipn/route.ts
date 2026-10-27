import { NextRequest, NextResponse } from 'next/server';
import { POST as paydunyaPOST, GET as paydunyaGET } from '../paydunya/ipn/route';

export const dynamic = 'force-dynamic';

/**
 * Endpoint IPN universel pour les passerelles de paiement (PayDunya, Wave, FedaPay, CinetPay)
 * URL de production : https://www.omegafacture.site/api/payments/ipn
 * URL alternative : https://omegafacture.site/api/payments/ipn
 */
export async function POST(req: NextRequest) {
  return paydunyaPOST(req);
}

export async function GET() {
  const baseRes = await paydunyaGET();
  const data = await baseRes.json();
  return NextResponse.json({
    ...data,
    endpoint: '/api/payments/ipn',
    service: 'OMEGA FACTURE — Universal Payment IPN Webhook',
  });
}
