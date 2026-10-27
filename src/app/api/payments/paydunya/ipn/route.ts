import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Initialisation sécurisée du client Supabase serveur avec la Service Role Key si disponible
function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nqazzedahsebuyvxjbvw.supabase.co';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Endpoint IPN PayDunya (Instant Payment Notification)
 * URL de production : https://www.omegafacture.site/api/payments/paydunya/ipn
 * URL alternative : https://omegafacture.site/api/payments/paydunya/ipn
 *
 * Reçoit les notifications asynchrones de paiement de PayDunya,
 * vérifie l'intégrité de la transaction et réconcilie automatiquement
 * la facture et les encaissements dans OMEGA FACTURE.
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let payload: any = {};

    // 1. Parsing selon le format envoyé par PayDunya (JSON ou Form URL-Encoded)
    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const entries: Record<string, any> = {};
      formData.forEach((value, key) => {
        entries[key] = value;
      });
      // PayDunya peut envoyer un champ 'data' contenant un JSON stringifié
      if (entries.data && typeof entries.data === 'string') {
        try {
          payload = { data: JSON.parse(entries.data) };
        } catch {
          payload = entries;
        }
      } else {
        payload = entries;
      }
    } else {
      const rawText = await req.text();
      try {
        payload = JSON.parse(rawText);
      } catch {
        const params = new URLSearchParams(rawText);
        payload = Object.fromEntries(params.entries());
      }
    }

    console.log('[PayDunya IPN] Notification reçue :', JSON.stringify(payload));

    const data = payload.data || payload;
    const invoiceData = data.invoice || {};
    const customData = data.custom_data || {};
    const status = (data.status || '').toLowerCase();
    const token = invoiceData.token || data.token || '';
    const receivedHash = data.hash || '';

    // 2. Vérification de la signature cryptographique PayDunya (si configurée)
    const masterKey =
      process.env.PAYDUNYA_MASTER_KEY ||
      process.env.PAYDUNYA_PUBLIC_KEY ||
      'CN2QIqsD-0NnK-Nb1H-gRvY-Qvfpv3uupfir';
    if (masterKey && receivedHash && token) {
      const computedHash = crypto
        .createHash('sha512')
        .update(masterKey + token)
        .digest('hex');

      if (computedHash.toLowerCase() !== receivedHash.toLowerCase()) {
        console.warn('[PayDunya IPN] Signature SHA-512 non valide !');
        return NextResponse.json(
          { error: 'Invalid PayDunya Hash Signature' },
          { status: 401 }
        );
      }
    }

    // 3. Traitement uniquement des paiements validés avec succès
    if (status === 'completed' || status === 'success') {
      const amountPaid = Math.round(Number(invoiceData.total_amount || data.total_amount || 0));
      const transactionId =
        invoiceData.palco_transaction_id ||
        invoiceData.transaction_id ||
        token ||
        `PAYDUNYA-${Date.now()}`;
      const customerName = invoiceData.customer?.name || customData.customer_name || 'Client PayDunya';
      const customerPhone = invoiceData.customer?.phone || customData.customer_phone || '';
      const invoiceId = customData.invoice_id || customData.invoiceId || '';
      const invoiceNumber = customData.invoice_number || customData.invoiceNumber || '';
      const companyId = customData.company_id || customData.companyId || 'c0000000-0000-0000-0000-000000000001';

      console.log(`[PayDunya IPN] Validation du paiement de ${amountPaid} FCFA pour la facture ${invoiceNumber || invoiceId}`);

      const supabase = getSupabaseServerClient();

      // A. Recherche de la facture correspondante dans Supabase
      let targetInvoice: any = null;
      if (invoiceId && invoiceId.length === 36) {
        const { data: inv } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .maybeSingle();
        targetInvoice = inv;
      }

      if (!targetInvoice && invoiceNumber) {
        const { data: inv } = await supabase
          .from('invoices')
          .select('*')
          .eq('invoice_number', invoiceNumber)
          .maybeSingle();
        targetInvoice = inv;
      }

      // B. Si la facture existe, enregistrer le règlement et mettre à jour le solde
      if (targetInvoice) {
        const previousPaid = Number(targetInvoice.amount_paid || 0);
        const newTotalPaid = previousPaid + amountPaid;
        const invoiceTotal = Number(targetInvoice.total_amount || 0);
        const isFullyPaid = newTotalPaid >= invoiceTotal;

        // Mise à jour de la facture
        await supabase
          .from('invoices')
          .update({
            amount_paid: newTotalPaid,
            status: isFullyPaid ? 'paid' : 'sent',
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', targetInvoice.id);

        // Enregistrement de la transaction dans la table payments
        await supabase.from('payments').insert({
          company_id: targetInvoice.company_id || companyId,
          invoice_id: targetInvoice.id,
          amount: amountPaid,
          method: 'mobile_money', // Mobile Money / PayDunya
          reference: `PayDunya: ${transactionId}`,
          payment_date: new Date().toISOString().split('T')[0],
          notes: `Règlement automatique par PayDunya IPN • Tél: ${customerPhone} • Client: ${customerName}`,
        } as any);

        console.log(`[PayDunya IPN] Facture ${targetInvoice.invoice_number} mise à jour (Nouveau statut: ${isFullyPaid ? 'Soldée' : 'Partiellement réglée'})`);
      } else {
        // Enregistrement du flux même si la facture n'est pas trouvée (ex: paiement libre ou acompte)
        await supabase.from('payments').insert({
          company_id: companyId,
          amount: amountPaid,
          method: 'mobile_money',
          reference: `PayDunya: ${transactionId}`,
          payment_date: new Date().toISOString().split('T')[0],
          notes: `Encaissement PayDunya non rapproché • Réf: ${invoiceNumber || token} • Client: ${customerName}`,
        } as any);
      }
    }

    // 4. Réponse 200 OK requise par PayDunya pour valider la notification
    return new NextResponse('OK', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error: any) {
    console.error('[PayDunya IPN] Erreur interne :', error);
    // On renvoie quand même 200 avec message d'erreur pour éviter que PayDunya ne boucle si le payload était invalide
    return NextResponse.json(
      { success: false, error: error.message || 'Internal IPN Error' },
      { status: 200 }
    );
  }
}

/**
 * Méthode GET pour vérification de santé (Ping / Healthcheck)
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/payments/paydunya/ipn',
    service: 'OMEGA FACTURE — PayDunya IPN Webhook',
    zone: 'UEMOA (FCFA)',
    ready: true,
    timestamp: new Date().toISOString(),
  });
}
