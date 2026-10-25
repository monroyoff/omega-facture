import { Client, Invoice, DashboardKPIs } from './types';

export const mockClients: Client[] = [];
export const mockInvoices: Invoice[] = [];

export const mockDashboardKPIs: DashboardKPIs = {
  totalInvoiced: 0,
  totalPaid: 0,
  totalPending: 0,
  totalOverdue: 0,
  invoicesCount: 0,
  paidTrend: 0,
  invoicedTrend: 0,
  pendingTrend: 0,
  overdueTrend: 0,
};

export const monthlyRevenueData = [
  { month: 'Mai', amount: 0 },
  { month: 'Juin', amount: 0 },
  { month: 'Juil', amount: 0 },
  { month: 'Août', amount: 0 },
  { month: 'Sept', amount: 0 },
  { month: 'Oct', amount: 0 },
];
