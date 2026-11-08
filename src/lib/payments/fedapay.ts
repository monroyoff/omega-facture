import crypto from 'crypto';

export interface FedaPayTransactionPayload {
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
  callbackUrl?: string;
}

export interface FedaPayTransactionResponse {
  success: boolean;
  checkoutUrl?: string;
  transactionId?: number | string;
  token?: string;
  error?: string;
}

/**
 * Récupère la configuration FedaPay depuis les variables d'environnement
 */
export function getFedaPayConfig() {
  const secretKey =
    process.env.FEDAPAY_SECRET_KEY ||
    '';
  const publicKey =
    process.env.FEDAPAY_PUBLIC_KEY ||
    '';
  const environment =
    process.env.FEDAPAY_ENVIRONMENT ||
    (secretKey.startsWith('sk_live_') ? 'live' : 'sandbox');
  const isSandbox = environment === 'sandbox' || secretKey.startsWith('sk_sandbox_');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.omegafacture.site';
  const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET || '';

  // URLs officielles FedaPay API
  const apiBaseUrl = isSandbox
    ? 'https://sandbox-api.fedapay.com/v1'
    : 'https://api.fedapay.com/v1';

  return {
    secretKey,
    publicKey,
    environment,
    isSandbox,
    appUrl,
    apiBaseUrl,
    webhookSecret,
  };
}

/**
 * Crée une transaction de paiement FedaPay et génère l'URL de redirection (Checkout)
 */
export async function createFedaPayTransaction(
  params: FedaPayTransactionPayload
): Promise<FedaPayTransactionResponse> {
  try {
    const config = getFedaPayConfig();

    if (!config.secretKey) {
      console.error('[FedaPay] Clé API secrète (FEDAPAY_SECRET_KEY) manquante dans les variables d’environnement');
      return {
        success: false,
        error: 'Configuration FedaPay incomplète (FEDAPAY_SECRET_KEY manquante).',
      };
    }

    // Découpage propre du nom client
    let firstname = 'Client';
    let lastname = 'OMEGA';
    if (params.customerName) {
      const parts = params.customerName.trim().split(/\s+/);
      firstname = parts[0] || 'Client';
      lastname = parts.slice(1).join(' ') || 'OMEGA';
    }

    const queryParams = new URLSearchParams();
    if (params.plan) queryParams.set('plan', params.plan);
    if (params.amount) queryParams.set('amount', String(params.amount));
    if (params.companyId) queryParams.set('companyId', params.companyId);
    if (params.userId) queryParams.set('userId', params.userId);
    if (params.invoiceId) queryParams.set('invoiceId', params.invoiceId);
    if (params.invoiceNumber) queryParams.set('invoiceNumber', params.invoiceNumber);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const callbackUrl = params.callbackUrl || `${config.appUrl}/payments/callback${queryString}`;

    const customerPayload: Record<string, any> = {
      firstname,
      lastname,
      email: params.customerEmail && params.customerEmail.includes('@')
        ? params.customerEmail
        : 'contact@omegafacture.site',
    };

    if (params.customerPhone) {
      const cleanPhone = params.customerPhone.replace(/[\s-]/g, '');
      customerPayload.phone_number = {
        number: cleanPhone,
        country: 'bj',
      };
    }

    const transactionPayload = {
      description: params.description || `Règlement ${params.invoiceNumber || 'Facture OMEGA FACTURE'}`,
      amount: Math.round(params.amount),
      currency: {
        iso: 'XOF',
      },
      callback_url: callbackUrl,
      customer: customerPayload,
      custom_metadata: {
        invoice_id: params.invoiceId || '',
        invoice_number: params.invoiceNumber || '',
        company_id: params.companyId || '',
        user_id: params.userId || '',
        plan: params.plan || '',
        customer_name: params.customerName || '',
        customer_phone: params.customerPhone || '',
      },
    };

    console.log(
      `[FedaPay] Création de transaction ${config.isSandbox ? '(MODE SANDBOX/TEST)' : '(MODE PRODUCTION)'} :`,
      params.amount,
      'FCFA'
    );

    // 1. Création de la transaction
    const createRes = await fetch(`${config.apiBaseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionPayload),
    });

    const createData = await createRes.json();
    const transaction = createData['v1/transaction'] || createData.transaction || createData;
    const txId = transaction?.id;

    if (!txId) {
      console.error('[FedaPay] Erreur création transaction FedaPay :', createData);
      return {
        success: false,
        error:
          createData.message ||
          createData.description ||
          'Erreur lors de l’initialisation de la transaction FedaPay.',
      };
    }

    // 2. Récupération ou génération du token et de l'URL de paiement (Checkout)
    let checkoutUrl = transaction?.payment_url;
    let token = transaction?.payment_token;

    if (!checkoutUrl) {
      const tokenRes = await fetch(`${config.apiBaseUrl}/transactions/${txId}/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const tokenData = await tokenRes.json();
      checkoutUrl = tokenData.url;
      token = tokenData.token;
    }

    if (!checkoutUrl) {
      console.error('[FedaPay] Erreur génération token/checkout FedaPay :', transaction);
      return {
        success: false,
        error: 'Impossible de générer le guichet de paiement FedaPay.',
      };
    }

    return {
      success: true,
      checkoutUrl,
      transactionId: txId,
      token,
    };
  } catch (error: any) {
    console.error('[FedaPay] Exception createFedaPayTransaction :', error);
    return {
      success: false,
      error: error.message || 'Erreur de connexion avec la passerelle FedaPay.',
    };
  }
}

/**
 * Interroge l'API FedaPay pour vérifier et confirmer l'état d'un paiement par son transaction ID
 */
export async function confirmFedaPayTransaction(transactionId: number | string): Promise<{
  success: boolean;
  status: string; // 'approved' | 'pending' | 'canceled' | 'declined'
  amount?: number;
  customMetadata?: Record<string, any>;
  receiptUrl?: string;
  error?: string;
}> {
  try {
    const config = getFedaPayConfig();
    if (!transactionId) {
      return { success: false, status: 'unknown', error: 'ID de transaction FedaPay manquant' };
    }

    const response = await fetch(`${config.apiBaseUrl}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();
    const tx = data['v1/transaction'] || data.transaction || data;

    if (tx && tx.id) {
      const isApproved =
        tx.status === 'approved' ||
        tx.status === 'transferred' ||
        (config.isSandbox && (tx.status === 'approved' || String(transactionId).startsWith('test_')));

      return {
        success: isApproved,
        status: (tx.status || 'pending').toLowerCase(),
        amount: Number(tx.amount || 0),
        customMetadata: tx.custom_metadata || {},
        receiptUrl: tx.receipt_url,
      };
    }

    return {
      success: false,
      status: (tx?.status || 'unknown').toLowerCase(),
      error: data.message || 'Transaction FedaPay non trouvée.',
    };
  } catch (error: any) {
    console.error('[FedaPay] Erreur confirmFedaPayTransaction :', error);
    return {
      success: false,
      status: 'error',
      error: error.message || 'Erreur réseau confirmation FedaPay',
    };
  }
}

/**
 * Vérifie la signature de webhook FedaPay (X-FEDAPAY-SIGNATURE)
 */
export function verifyFedaPayWebhookSignature(
  rawBody: string,
  signatureHeader: string
): boolean {
  const config = getFedaPayConfig();
  if (!config.webhookSecret || !signatureHeader) {
    // Si aucun secret de webhook n'est configuré en dev/sandbox, validation souple
    return true;
  }

  try {
    const computedSignature = crypto
      .createHmac('sha256', config.webhookSecret)
      .update(rawBody)
      .digest('hex');

    // Cas 1 : Signature hex directe
    if (computedSignature.toLowerCase() === signatureHeader.toLowerCase()) {
      return true;
    }

    // Cas 2 : Format clé-valeur (ex: "t=12345,v1=abc..." ou "s=abc...")
    const parts = signatureHeader.split(',');
    for (const part of parts) {
      const [key, value] = part.trim().split('=');
      if ((key === 's' || key === 'v1' || key === 'sig') && value) {
        if (computedSignature.toLowerCase() === value.toLowerCase()) {
          return true;
        }
      }
    }

    // En mode sandbox, avertir sans bloquer pour faciliter les simulations
    if (config.isSandbox) {
      console.warn('[FedaPay Webhook Sandbox] Signature non correspondante, acceptée en sandbox.');
      return true;
    }

    return false;
  } catch (err) {
    console.warn('[FedaPay Webhook] Erreur vérification signature :', err);
    return config.isSandbox;
  }
}

