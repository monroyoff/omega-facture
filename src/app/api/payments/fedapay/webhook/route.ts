import { NextRequest, NextResponse } from 'next/server';
import { verifyFedaPayWebhookSignature } from '@/lib/payments/fedapay';
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
 * Endpoint Webhook FedaPay
 * URL de production : https://www.omegafacture.site/api/payments/fedapay/webhook
 * Reçoit les événements asynchrones de FedaPay (ex: transaction.approved)
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-fedapay-signature') || '';

    // 1. Vérification de la signature
    const isValidSignature = verifyFedaPayWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      console.warn('[FedaPay Webhook] Signature invalide !');
      return NextResponse.json({ error: 'Invalid FedaPay Signature' }, { status: 401 });
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = {};
    }

    console.log('[FedaPay Webhook] Événement reçu :', payload.name || payload.event || 'inconnu');

    const eventName = payload.name || payload.event || '';
    const transaction = payload.entity || payload.transaction || payload.data || payload;
    const status = (transaction.status || '').toLowerCase();

    const isApproved =
      eventName === 'transaction.approved' ||
      status === 'approved' ||
      status === 'transferred';

    if (!isApproved) {
      console.log(`[FedaPay Webhook] Événement ignoré (${eventName || status})`);
      return NextResponse.json({ success: true, message: 'Event received but not actionable' });
    }

    const transactionId = transaction.id || `FEDAPAY-${Date.now()}`;
    const amount = Number(transaction.amount || 0);
    const metadata = transaction.custom_metadata || transaction.metadata || {};
    let plan = metadata.plan || '';

    // Détermination stricte et inviolable : si montant >= 15 000 FCFA -> Plan Business garanti
    if (amount >= 15000) {
      plan = 'business';
    } else if (!plan && amount >= 5000) {
      plan = 'pro';
    }

    const companyId = metadata.company_id || metadata.companyId || '';
    const userId = metadata.user_id || metadata.userId || '';
    const invoiceId = metadata.invoice_id || metadata.invoiceId || '';
    const invoiceNumber = metadata.invoice_number || metadata.invoiceNumber || '';
    const customerName =
      (transaction.customer?.firstname ? `${transaction.customer.firstname} ${transaction.customer.lastname || ''}` : '') ||
      metadata.customer_name ||
      'Client FedaPay';
    const customerPhone =
      transaction.customer?.phone_number?.number || metadata.customer_phone || '';

    const supabase = getSupabaseServerClient();

    // A. Cas 1 : Abonnement SaaS (Plan Pro / Business)
    if (plan === 'pro' || plan === 'business') {
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
        if (!targetCompanyId && transaction.customer?.email) {
          const { data: comp } = await supabase
            .from('companies')
            .select('id')
            .eq('email', transaction.customer.email.toLowerCase().trim())
            .maybeSingle();
          if (comp?.id) targetCompanyId = comp.id;
        }
      }
      if (!targetCompanyId) targetCompanyId = 'c0000000-0000-0000-0000-000000000003';

      // Détermination rigoureuse de la durée d'abonnement en jours
      let durationDays = 30;
      if (metadata.duration_days) {
        durationDays = Number(metadata.duration_days);
      } else if (amount >= 160000 || (plan === 'pro' && amount >= 50000)) {
        durationDays = 365; // 1 an
      } else if (amount >= 80000 || (plan === 'pro' && amount >= 25000)) {
        durationDays = 180; // 6 mois
      } else if (amount >= 40000 || (plan === 'pro' && amount >= 13000)) {
        durationDays = 90; // 3 mois
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
      const subscriptionStatus = `active|expires:${expiresAt}`;

      console.log(`[FedaPay Webhook] Activation garantie abonnement ${plan.toUpperCase()} (${durationDays}j) pour société ${targetCompanyId}`);

      await supabase
        .from('companies')
        .update({
          subscription_plan: plan,
          subscription_status: subscriptionStatus,
          subscription_updated_at: now.toISOString(),
          updated_at: now.toISOString(),
        } as any)
        .eq('id', targetCompanyId);

      await supabase.from('payments').insert({
        company_id: targetCompanyId,
        amount: amount || (plan === 'business' ? 15000 : 5000),
        method: 'mobile_money',
        reference: `FedaPay: ${transactionId} (Abonnement ${plan.toUpperCase()} ${durationDays}j)`,
        payment_date: new Date().toISOString().split('T')[0],
        notes: `Validation automatique FedaPay Webhook • ${customerName} (${customerPhone}) • Expire le ${expiresAt.split('T')[0]}`,
      } as any);

      return NextResponse.json({
        success: true,
        action: 'subscription_upgraded',
        plan,
        durationDays,
        expiresAt,
      });
    }

    // B. Cas 2 : Règlement d'une facture client
    if (invoiceId || invoiceNumber) {
      let query = supabase.from('invoices').select('*');
      if (invoiceId) {
        query = query.eq('id', invoiceId);
      } else {
        query = query.eq('invoice_number', invoiceNumber);
      }

      const { data: foundInvoices } = await query;
      const targetInvoice = foundInvoices && foundInvoices.length > 0 ? foundInvoices[0] : null;

      if (targetInvoice) {
        const currentPaid = Number(targetInvoice.amount_paid || 0);
        const newPaid = currentPaid + amount;
        const totalAmount = Number(targetInvoice.total || 0);
        const isFullyPaid = newPaid >= totalAmount;

        await supabase
          .from('invoices')
          .update({
            amount_paid: newPaid,
            status: isFullyPaid ? 'paid' : targetInvoice.status,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', targetInvoice.id);

        await supabase.from('payments').insert({
          invoice_id: targetInvoice.id,
          company_id: targetInvoice.company_id || 'c0000000-0000-0000-0000-000000000001',
          amount,
          payment_date: new Date().toISOString().split('T')[0],
          method: 'mobile_money',
          reference: `FedaPay: ${transactionId}`,
          notes: `Règlement automatique FedaPay Webhook • Tél: ${customerPhone} • Client: ${customerName}`,
        } as any);

        return NextResponse.json({
          success: true,
          action: 'invoice_updated',
          invoice_number: targetInvoice.invoice_number,
          amount_paid: newPaid,
          status: isFullyPaid ? 'paid' : targetInvoice.status,
        });
      }
    }

    // C. Cas 3 : Enregistrement générique
    await supabase.from('payments').insert({
      company_id: companyId || 'c0000000-0000-0000-0000-000000000001',
      amount,
      payment_date: new Date().toISOString().split('T')[0],
      method: 'mobile_money',
      reference: `FedaPay: ${transactionId}`,
      notes: `Encaissement FedaPay • Réf: ${invoiceNumber || transactionId} • Client: ${customerName}`,
    } as any);

    return NextResponse.json({ success: true, action: 'payment_recorded' });
  } catch (error: any) {
    console.error('[FedaPay Webhook] Erreur interne :', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/payments/fedapay/webhook',
    service: 'OMEGA FACTURE — FedaPay Webhook Endpoint',
    description: 'Reçoit les notifications d’encaissement FedaPay Mobile Money & Cartes bancaires',
  });
}

