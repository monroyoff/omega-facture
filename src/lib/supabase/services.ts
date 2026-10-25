import { createClient } from './client';
import { Client, Invoice, InvoiceItem, InvoiceBillingType } from '@/lib/types';
import { Product, PaymentRecord } from '@/lib/store/invoice-context';

export const DEFAULT_COMPANY_ID = 'c0000000-0000-0000-0000-000000000001';

/**
 * Récupère ou crée la société dédiée à un utilisateur authentifié
 */
export async function getOrCreateUserCompany(
  userId?: string,
  userOrg?: string,
  userEmail?: string
): Promise<string> {
  const supabase = createClient();

  // 1. Recherche par user_id
  if (userId && userId.length === 36) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (data?.id) return data.id;
    } catch (e) {
      console.warn('[getOrCreateUserCompany] lookup by user_id error:', e);
    }
  }

  // 2. Recherche par email
  if (userEmail) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, user_id')
        .eq('email', userEmail.toLowerCase().trim())
        .maybeSingle();

      if (data?.id) {
        if (userId && userId.length === 36 && !data.user_id) {
          await supabase.from('companies').update({ user_id: userId } as any).eq('id', data.id);
        }
        return data.id;
      }
    } catch (e) {
      console.warn('[getOrCreateUserCompany] lookup by email error:', e);
    }
  }

  // 3. Création automatique de l'espace société pour ce nouvel utilisateur
  const newCompanyId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
  try {
    const { data: newComp, error } = await supabase
      .from('companies')
      .insert({
        id: newCompanyId,
        user_id: userId && userId.length === 36 ? userId : null,
        name: userOrg || 'Mon Entreprise OMEGA',
        email: userEmail ? userEmail.toLowerCase().trim() : null,
        currency: 'XOF',
        default_vat: 18,
        invoice_prefix: 'FAC',
        payment_terms: 15,
      } as any)
      .select('id')
      .single();

    if (newComp?.id) return newComp.id;
  } catch (e) {
    console.warn('[getOrCreateUserCompany] insert company error:', e);
  }

  return DEFAULT_COMPANY_ID;
}

/**
 * Charge l'ensemble des données depuis Supabase
 */
export async function fetchSupabaseData(companyId?: string): Promise<{
  clients: Client[];
  products: Product[];
  invoices: Invoice[];
  payments: PaymentRecord[];
} | null> {
  try {
    const targetCompanyId = companyId || DEFAULT_COMPANY_ID;
    const supabase = createClient();

    // 1. Fetch Clients
    const { data: dbClients, error: clientsErr } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', targetCompanyId)
      .order('name');

    if (clientsErr) throw clientsErr;

    const clients: Client[] = (dbClients || []).map((c) => ({
      id: c.id,
      name: c.name,
      company: c.company || '',
      email: c.email || '',
      phone: c.phone || '',
      city: c.city || '',
      country: c.country || 'Bénin',
      taxId: c.tax_id || undefined,
      avatar: c.avatar_url || undefined,
    }));

    const clientMap = new Map<string, Client>(clients.map((c) => [c.id, c]));

    // 2. Fetch Products
    const { data: dbProducts, error: productsErr } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', targetCompanyId)
      .order('name');

    if (productsErr) throw productsErr;

    const products: Product[] = (dbProducts || []).map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      vat: Number(p.vat_rate),
      unit: p.unit,
      cat: p.category,
      image: p.image_url || undefined,
    }));

    // 3. Fetch Invoices with items & installments
    const { data: dbInvoices, error: invoicesErr } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*),
        invoice_installments (*)
      `)
      .eq('company_id', targetCompanyId)
      .order('issue_date', { ascending: false });

    if (invoicesErr) throw invoicesErr;

    const invoices: Invoice[] = (dbInvoices || []).map((inv) => {
      const client = (inv.client_id ? clientMap.get(inv.client_id) : undefined) || {
        id: inv.client_id || 'unknown',
        name: 'Client Inconnu',
        company: 'Société',
        email: '',
        phone: '',
        city: 'Cotonou',
        country: 'Bénin',
      };

      const items: InvoiceItem[] = (inv.invoice_items || []).map((it) => ({
        id: it.id,
        description: it.description,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unit_price),
        discountPct: Number(it.discount_pct),
        vatRate: Number(it.vat_rate),
        total: Number(it.total),
      }));

      const splitSchedule = (inv.invoice_installments || []).map((s) => ({
        id: s.id,
        label: s.label,
        percentage: Number(s.percentage),
        amount: Number(s.amount),
        dueDate: s.due_date,
      }));

      const isQuote = (inv.invoice_number || '').startsWith('DEV-') || inv.type === 'quote';

      return {
        id: inv.id,
        number: inv.invoice_number,
        documentKind: isQuote ? 'quote' : 'invoice',
        clientId: inv.client_id || '',
        client,
        issueDate: inv.issue_date,
        dueDate: inv.due_date,
        status: inv.status as any,
        currency: inv.currency,
        subtotal: Number(inv.subtotal),
        discount: Number(inv.discount),
        vatAmount: Number(inv.vat_amount),
        total: Number(inv.total),
        amountPaid: Number(inv.amount_paid),
        notes: inv.notes || undefined,
        type: isQuote ? 'standard' : ((inv.type as InvoiceBillingType) || 'standard'),
        splitSchedule: splitSchedule.length > 0 ? splitSchedule : undefined,
        recurrence: (inv.recurrence_config as any) || undefined,
        items,
      };
    });

    // 4. Fetch Payments
    const { data: dbPayments, error: paymentsErr } = await supabase
      .from('payments')
      .select(`
        *,
        invoices (invoice_number, client_id)
      `)
      .eq('company_id', targetCompanyId)
      .order('payment_date', { ascending: false });

    if (paymentsErr) throw paymentsErr;

    const payments: PaymentRecord[] = (dbPayments || []).map((pay) => {
      const linkedInvoice = pay.invoices as any;
      const linkedClient = linkedInvoice?.client_id ? clientMap.get(linkedInvoice.client_id) : undefined;

      return {
        id: pay.id,
        invoiceId: pay.invoice_id || '',
        invoiceNumber: linkedInvoice?.invoice_number || 'N/A',
        clientName: linkedClient?.name || 'Client',
        amount: Number(pay.amount),
        method: pay.method as any,
        reference: pay.reference || 'REF-N/A',
        date: pay.payment_date,
      };
    });

    return { clients, products, invoices, payments };
  } catch (err) {
    console.warn('[Supabase Services] Échec du chargement distant, bascule sur cache/mock :', err);
    return null;
  }
}

/**
 * Enregistre un nouveau client dans Supabase
 */
export async function supabaseAddClient(
  client: Omit<Client, 'id'> & { id?: string },
  companyId?: string
): Promise<Client | null> {
  try {
    const supabase = createClient();
    const effectiveCompanyId = companyId || DEFAULT_COMPANY_ID;
    const insertPayload: Record<string, any> = {
      company_id: effectiveCompanyId,
      name: client.name,
      company: client.company || null,
      email: client.email || null,
      phone: client.phone || null,
      city: client.city || null,
      country: client.country || 'Bénin',
      tax_id: client.taxId || null,
      avatar_url: client.avatar || null,
    };
    if (client.id && client.id.length === 36) {
      insertPayload.id = client.id;
    }

    const { data, error } = await supabase
      .from('clients')
      .insert(insertPayload as any)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      company: data.company || '',
      email: data.email || '',
      phone: data.phone || '',
      city: data.city || '',
      country: data.country || 'Bénin',
      taxId: data.tax_id || undefined,
      avatar: data.avatar_url || undefined,
    };
  } catch (err) {
    console.error('[Supabase Services] Erreur création client :', err);
    return null;
  }
}

/**
 * Enregistre un nouvel article dans Supabase
 */
export async function supabaseAddProduct(
  product: Omit<Product, 'id'> & { id?: string },
  companyId?: string
): Promise<Product | null> {
  try {
    const supabase = createClient();
    const effectiveCompanyId = companyId || DEFAULT_COMPANY_ID;
    const insertPayload: Record<string, any> = {
      company_id: effectiveCompanyId,
      name: product.name,
      price: Math.round(product.price),
      vat_rate: product.vat,
      unit: product.unit || 'prestation',
      category: product.cat || 'Prestations',
      image_url: product.image || null,
    };
    if (product.id && product.id.length === 36) {
      insertPayload.id = product.id;
    }

    const { data, error } = await supabase
      .from('products')
      .insert(insertPayload as any)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      price: Number(data.price),
      vat: Number(data.vat_rate),
      unit: data.unit,
      cat: data.category,
      image: data.image_url || undefined,
    };
  } catch (err) {
    console.error('[Supabase Services] Erreur création produit :', err);
    return null;
  }
}

/**
 * Enregistre une nouvelle facture avec ses lignes et échéancier
 */
export async function supabaseAddInvoice(
  invoice: Invoice,
  companyId?: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    const effectiveCompanyId = companyId || DEFAULT_COMPANY_ID;

    // 1. Insert invoice
    const { data: invData, error: invErr } = await supabase
      .from('invoices')
      .insert({
        id: invoice.id.includes('-') && invoice.id.length === 36 ? invoice.id : undefined,
        company_id: effectiveCompanyId,
        client_id: invoice.clientId && invoice.clientId.length === 36 ? invoice.clientId : null,
        invoice_number: invoice.number,
        type: invoice.type || 'standard',
        status: invoice.status || 'draft',
        currency: invoice.currency || 'XOF',
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
        subtotal: Math.round(invoice.subtotal),
        discount: Math.round(invoice.discount || 0),
        vat_amount: Math.round(invoice.vatAmount),
        total: Math.round(invoice.total),
        amount_paid: Math.round(invoice.amountPaid || 0),
        notes: invoice.notes || null,
        recurrence_config: (invoice.recurrence as any) || null,
      })
      .select()
      .single();

    if (invErr) throw invErr;

    const invoiceId = invData.id;

    // 2. Insert line items
    if (invoice.items && invoice.items.length > 0) {
      const itemsToInsert = invoice.items.map((item, idx) => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price: Math.round(item.unitPrice),
        discount_pct: item.discountPct || 0,
        vat_rate: item.vatRate || 18,
        total: Math.round(item.total),
        sort_order: idx + 1,
      }));

      const { error: itemsErr } = await supabase.from('invoice_items').insert(itemsToInsert);
      if (itemsErr) console.warn('[Supabase Services] Erreur insertion items :', itemsErr);
    }

    // 3. Insert installments if any
    if (invoice.splitSchedule && invoice.splitSchedule.length > 0) {
      const installmentsToInsert = invoice.splitSchedule.map((s) => ({
        invoice_id: invoiceId,
        label: s.label,
        percentage: s.percentage,
        amount: Math.round(s.amount),
        due_date: s.dueDate,
        status: 'pending',
      }));

      const { error: instErr } = await supabase.from('invoice_installments').insert(installmentsToInsert);
      if (instErr) console.warn('[Supabase Services] Erreur insertion échéances :', instErr);
    }

    return true;
  } catch (err) {
    console.error('[Supabase Services] Erreur création facture :', err);
    return false;
  }
}

/**
 * Enregistre un règlement dans Supabase
 */
export async function supabaseAddPayment(
  payment: Omit<PaymentRecord, 'id'>,
  companyId?: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    const effectiveCompanyId = companyId || DEFAULT_COMPANY_ID;
    const { error } = await supabase.from('payments').insert({
      company_id: effectiveCompanyId,
      invoice_id: payment.invoiceId && payment.invoiceId.length === 36 ? payment.invoiceId : null,
      amount: Math.round(payment.amount),
      method: payment.method,
      reference: payment.reference,
      payment_date: payment.date,
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Services] Erreur enregistrement paiement :', err);
    return false;
  }
}

/**
 * Met à jour une facture dans Supabase
 */
export async function supabaseUpdateInvoice(
  id: string,
  updates: Partial<Invoice>,
  previousInvoiceNumber?: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    const updatePayload: Record<string, any> = {};

    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.amountPaid !== undefined) updatePayload.amount_paid = Math.round(updates.amountPaid);
    if (updates.total !== undefined) updatePayload.total = Math.round(updates.total);
    if (updates.subtotal !== undefined) updatePayload.subtotal = Math.round(updates.subtotal);
    if (updates.discount !== undefined) updatePayload.discount = Math.round(updates.discount);
    if (updates.vatAmount !== undefined) updatePayload.vat_amount = Math.round(updates.vatAmount);
    if (updates.dueDate !== undefined) updatePayload.due_date = updates.dueDate;
    if (updates.issueDate !== undefined) updatePayload.issue_date = updates.issueDate;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes;
    if (updates.number !== undefined) updatePayload.invoice_number = updates.number;
    if (updates.documentKind !== undefined) {
      updatePayload.type = updates.type || (updates.documentKind === 'quote' ? 'quote' : 'standard');
    }

    if (Object.keys(updatePayload).length === 0) return true;

    let query = supabase.from('invoices').update(updatePayload as any);
    if (id.includes('-') && id.length === 36) {
      query = query.eq('id', id);
    } else if (previousInvoiceNumber) {
      query = query.eq('invoice_number', previousInvoiceNumber);
    } else if (updates.number) {
      query = query.eq('invoice_number', updates.number);
    } else {
      return false;
    }

    const { error } = await query;
    if (error) throw error;

    // Mise à jour des articles si fournis
    if (updates.items && updates.items.length > 0 && id.includes('-') && id.length === 36) {
      try {
        await supabase.from('invoice_items').delete().eq('invoice_id', id);
        const itemsToInsert = updates.items.map((item, idx) => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: Math.round(item.unitPrice),
          discount_pct: item.discountPct || 0,
          vat_rate: item.vatRate || 18,
          total: Math.round(item.total),
          sort_order: idx + 1,
        }));
        await supabase.from('invoice_items').insert(itemsToInsert);
      } catch (itemErr) {
        console.warn('[Supabase Services] Erreur mise à jour articles facture :', itemErr);
      }
    }

    return true;
  } catch (err) {
    console.error('[Supabase Services] Erreur mise à jour facture :', err);
    return false;
  }
}

/**
 * Supprime une facture dans Supabase (cascade les lignes et règlements)
 */
export async function supabaseDeleteInvoice(id: string, invoiceNumber?: string): Promise<boolean> {
  try {
    const supabase = createClient();
    let query = supabase.from('invoices').delete();
    if (id.includes('-') && id.length === 36) {
      query = query.eq('id', id);
    } else if (invoiceNumber) {
      query = query.eq('invoice_number', invoiceNumber);
    } else {
      return false;
    }

    const { error } = await query;
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Services] Erreur suppression facture :', err);
    return false;
  }
}

/**
 * Met à jour un client dans Supabase
 */
export async function supabaseUpdateClient(
  id: string,
  updates: Partial<Client>
): Promise<boolean> {
  try {
    const supabase = createClient();
    const payload: Record<string, any> = {};

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.company !== undefined) payload.company = updates.company;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.country !== undefined) payload.country = updates.country;
    if (updates.taxId !== undefined) payload.tax_id = updates.taxId;
    if (updates.avatar !== undefined) payload.avatar_url = updates.avatar;

    if (Object.keys(payload).length === 0) return true;

    const { error } = await supabase.from('clients').update(payload as any).eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Services] Erreur mise à jour client :', err);
    return false;
  }
}

/**
 * Supprime un client dans Supabase
 */
export async function supabaseDeleteClient(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Services] Erreur suppression client :', err);
    return false;
  }
}

/**
 * Met à jour un produit/service dans Supabase
 */
export async function supabaseUpdateProduct(
  id: string,
  updates: Partial<Product>
): Promise<boolean> {
  try {
    const supabase = createClient();
    const payload: Record<string, any> = {};

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.price !== undefined) payload.price = Math.round(updates.price);
    if (updates.vat !== undefined) payload.vat_rate = updates.vat;
    if (updates.unit !== undefined) payload.unit = updates.unit;
    if (updates.cat !== undefined) payload.category = updates.cat;
    if (updates.image !== undefined) payload.image_url = updates.image;

    if (Object.keys(payload).length === 0) return true;

    const { error } = await supabase.from('products').update(payload as any).eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Services] Erreur mise à jour produit :', err);
    return false;
  }
}

/**
 * Supprime un produit dans Supabase
 */
export async function supabaseDeleteProduct(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Services] Erreur suppression produit :', err);
    return false;
  }
}

