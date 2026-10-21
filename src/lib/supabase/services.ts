import { createClient } from './client';
import { Client, Invoice, InvoiceItem, InvoiceBillingType } from '@/lib/types';
import { Product, PaymentRecord } from '@/lib/store/invoice-context';

const DEFAULT_COMPANY_ID = 'c0000000-0000-0000-0000-000000000001';

/**
 * Charge l'ensemble des données depuis Supabase
 */
export async function fetchSupabaseData(): Promise<{
  clients: Client[];
  products: Product[];
  invoices: Invoice[];
  payments: PaymentRecord[];
} | null> {
  try {
    const supabase = createClient();

    // 1. Fetch Clients
    const { data: dbClients, error: clientsErr } = await supabase
      .from('clients')
      .select('*')
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

      return {
        id: inv.id,
        number: inv.invoice_number,
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
        type: (inv.type as InvoiceBillingType) || 'standard',
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
export async function supabaseAddClient(client: Omit<Client, 'id'>): Promise<Client | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('clients')
      .insert({
        company_id: DEFAULT_COMPANY_ID,
        name: client.name,
        company: client.company || null,
        email: client.email || null,
        phone: client.phone || null,
        city: client.city || null,
        country: client.country || 'Bénin',
        tax_id: client.taxId || null,
        avatar_url: client.avatar || null,
      })
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
export async function supabaseAddProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .insert({
        company_id: DEFAULT_COMPANY_ID,
        name: product.name,
        price: Math.round(product.price),
        vat_rate: product.vat,
        unit: product.unit || 'prestation',
        category: product.cat || 'Prestations',
        image_url: product.image || null,
      })
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
export async function supabaseAddInvoice(invoice: Invoice): Promise<boolean> {
  try {
    const supabase = createClient();

    // 1. Insert invoice
    const { data: invData, error: invErr } = await supabase
      .from('invoices')
      .insert({
        id: invoice.id.includes('-') && invoice.id.length === 36 ? invoice.id : undefined,
        company_id: DEFAULT_COMPANY_ID,
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
export async function supabaseAddPayment(payment: Omit<PaymentRecord, 'id'>): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('payments').insert({
      company_id: DEFAULT_COMPANY_ID,
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
