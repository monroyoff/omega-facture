export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type SubscriptionPlan = 'free' | 'pro' | 'business';
export type { UemoaCountry, VatRateOption } from '@/lib/tax/uemoa-tax';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  vatRate: number; // e.g. 18 or 0
  total: number;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  taxId?: string; // IFU / NIF
  avatar?: string;
}

export type InvoiceBillingType = 'standard' | 'split' | 'recurring';

export interface SplitScheduleItem {
  id: string;
  label: string;
  percentage: number;
  amount: number;
  dueDate: string;
}

export interface RecurrenceConfig {
  frequency: 'monthly' | 'quarterly' | 'semiannual' | 'yearly';
  intervalMonths: number;
  durationMonths?: number;
  nextRenewalDate: string;
  autoSend: boolean;
}

export type DocumentKind = 'invoice' | 'quote';

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client: Client;
  issueDate: string; // ISO date YYYY-MM-DD
  dueDate: string;   // ISO date YYYY-MM-DD
  status: InvoiceStatus;
  currency: string;
  subtotal: number;
  discount: number;
  vatAmount: number;
  total: number;
  amountPaid: number;
  notes?: string;
  type?: InvoiceBillingType;
  documentKind?: DocumentKind;
  splitSchedule?: SplitScheduleItem[];
  recurrence?: RecurrenceConfig;
  items: InvoiceItem[];
}

export interface DashboardKPIs {
  totalInvoiced: number;     // Σ total facturé
  totalPaid: number;         // Σ montant payé
  totalPending: number;      // Σ en attente (non échues)
  totalOverdue: number;      // Σ en retard (échéance dépassée)
  invoicesCount: number;
  paidTrend: number;         // e.g. +14.2%
  invoicedTrend: number;     // e.g. +8.5%
  pendingTrend: number;      // e.g. -2.1%
  overdueTrend: number;      // e.g. +1.4%
}
