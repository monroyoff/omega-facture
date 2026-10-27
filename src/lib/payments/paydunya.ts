import crypto from 'crypto';

export interface PayDunyaInvoicePayload {
  amount: number;
  description: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  companyId?: string;
  userId?: string;
  plan?: string;
  returnUrl?: string;
  cancelUrl?: string;
  callbackUrl?: string;
}

export interface PayDunyaInvoiceResponse {
  success: boolean;
  checkoutUrl?: string;
  token?: string;
  error?: string;
}

/**
 * Récupère la configuration PayDunya depuis les variables d'environnement
 */
export function getPayDunyaConfig() {
  const masterKey =
    process.env.PAYDUNYA_MASTER_KEY ||
    process.env.PAYDUNYA_PUBLIC_KEY ||
    'CN2QIqsD-0NnK-Nb1H-gRvY-Qvfpv3uupfir';
  const privateKey =
    process.env.PAYDUNYA_PRIVATE_KEY ||
    'test_private_2WHxjYF58S2MKuHhoE18NnwIj84';
  const token =
    process.env.PAYDUNYA_TOKEN ||
    'FPTa6qUzfCkSeSEWdMJl';
  const mode = process.env.PAYDUNYA_MODE || 'test';
  const isTest = mode === 'test' || privateKey.startsWith('test_');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.omegafacture.site';

  // URLs officielles PayDunya Checkout API
  const apiBaseUrl = isTest
    ? 'https://app.paydunya.com/sandbox-api/v1'
    : 'https://app.paydunya.com/api/v1';

  return {
    masterKey,
    privateKey,
    token,
    mode,
    isTest,
    appUrl,
    apiBaseUrl,
  };
}

/**
 * Crée une facture de paiement PayDunya et retourne l'URL de redirection (Checkout)
 */
export async function createPayDunyaInvoice(
  params: PayDunyaInvoicePayload
): Promise<PayDunyaInvoiceResponse> {
  try {
    const config = getPayDunyaConfig();

    if (!config.masterKey || !config.privateKey || !config.token) {
      console.error('[PayDunya] Clés API manquantes dans les variables d’environnement');
      return {
        success: false,
        error: 'Configuration PayDunya incomplète (clés API manquantes).',
      };
    }

    const queryParams = new URLSearchParams();
    if (params.plan) queryParams.set('plan', params.plan);
    if (params.amount) queryParams.set('amount', String(params.amount));
    if (params.companyId) queryParams.set('companyId', params.companyId);
    if (params.userId) queryParams.set('userId', params.userId);
    if (params.invoiceId) queryParams.set('invoiceId', params.invoiceId);
    if (params.invoiceNumber) queryParams.set('invoiceNumber', params.invoiceNumber);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const returnUrl = params.returnUrl || `${config.appUrl}/payments/callback${queryString}`;
    const cancelUrl = params.cancelUrl || `${config.appUrl}/payments/cancel${queryString}`;
    const callbackUrl = params.callbackUrl || `${config.appUrl}/api/payments/paydunya/ipn`;

    const payload = {
      invoice: {
        total_amount: Math.round(params.amount),
        description: params.description || `Règlement ${params.invoiceNumber || 'Facture OMEGA FACTURE'}`,
      },
      store: {
        name: 'OMEGA FACTURE',
        tagline: 'Facturation & Pilotage Financier UEMOA',
        phone: '+2290195444430',
        postal_address: 'Cotonou, Bénin',
        logo_url: `${config.appUrl}/images/logo.png`,
        website_url: config.appUrl,
      },
      actions: {
        cancel_url: cancelUrl,
        return_url: returnUrl,
        callback_url: callbackUrl,
      },
      custom_data: {
        invoice_id: params.invoiceId || '',
        invoice_number: params.invoiceNumber || '',
        company_id: params.companyId || '',
        user_id: params.userId || '',
        plan: params.plan || '',
        customer_name: params.customerName || '',
        customer_phone: params.customerPhone || '',
      },
    };

    console.log(`[PayDunya] Création de facture ${config.isTest ? '(MODE TEST/SANDBOX)' : '(MODE PRODUCTION)'} :`, params.amount, 'FCFA');

    const response = await fetch(`${config.apiBaseUrl}/checkout-invoice/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': config.masterKey,
        'PAYDUNYA-PRIVATE-KEY': config.privateKey,
        'PAYDUNYA-TOKEN': config.token,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.response_code === '00' && data.response_text) {
      return {
        success: true,
        checkoutUrl: data.response_text,
        token: data.token,
      };
    }

    console.error('[PayDunya] Erreur création facture PayDunya :', data);
    return {
      success: false,
      error: data.description || data.response_text || 'Erreur lors de la création de la session PayDunya',
    };
  } catch (error: any) {
    console.error('[PayDunya] Exception createPayDunyaInvoice :', error);
    return {
      success: false,
      error: error.message || 'Erreur de connexion avec PayDunya',
    };
  }
}

/**
 * Interroge l'API officielle PayDunya pour vérifier et confirmer l'état d'un paiement par son token
 */
export async function confirmPayDunyaInvoice(token: string): Promise<{
  success: boolean;
  status: string; // 'completed' | 'pending' | 'cancelled'
  amount?: number;
  customData?: Record<string, any>;
  receiptUrl?: string;
  error?: string;
}> {
  try {
    const config = getPayDunyaConfig();
    if (!token) {
      return { success: false, status: 'unknown', error: 'Token de transaction manquant' };
    }

    const response = await fetch(`${config.apiBaseUrl}/checkout-invoice/confirm/${token}`, {
      method: 'GET',
      headers: {
        'PAYDUNYA-MASTER-KEY': config.masterKey,
        'PAYDUNYA-PRIVATE-KEY': config.privateKey,
        'PAYDUNYA-TOKEN': config.token,
      },
      cache: 'no-store',
    });

    const data = await response.json();
    if (data.response_code === '00') {
      const isCompleted = data.status === 'completed' || (config.isTest && (data.status === 'completed' || data.status === 'success'));
      return {
        success: isCompleted,
        status: (data.status || 'pending').toLowerCase(),
        amount: Number(data.invoice?.total_amount || 0),
        customData: data.custom_data || {},
        receiptUrl: data.receipt_url,
      };
    }

    return {
      success: false,
      status: (data.status || 'unknown').toLowerCase(),
      error: data.response_text || 'Transaction non trouvée',
    };
  } catch (error: any) {
    console.error('[PayDunya] Erreur confirmPayDunyaInvoice :', error);
    return {
      success: false,
      status: 'error',
      error: error.message || 'Erreur réseau confirmation',
    };
  }
}

/**
 * Valide la signature cryptographique SHA-512 transmise sur l'IPN PayDunya
 */
export function verifyPayDunyaHash(token: string, receivedHash: string): boolean {
  const config = getPayDunyaConfig();
  if (!config.masterKey || !receivedHash || !token) {
    return false;
  }
  const computedHash = crypto
    .createHash('sha512')
    .update(config.masterKey + token)
    .digest('hex');

  return computedHash.toLowerCase() === receivedHash.toLowerCase();
}
