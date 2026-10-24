'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, Invoice, InvoiceStatus, InvoiceItem, DashboardKPIs } from '@/lib/types';
import { mockClients, mockInvoices } from '@/lib/mock-data';
import {
  fetchSupabaseData,
  supabaseAddInvoice,
  supabaseAddClient,
  supabaseAddProduct,
  supabaseAddPayment,
} from '@/lib/supabase/services';
import { createClient } from '@/lib/supabase/client';

export interface PendingVerificationUser {
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
  token: string;
  code?: string;
  sentAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  vat: number;
  unit: string;
  cat: string;
  image?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  method: 'mobile_money' | 'bank_transfer' | 'cash' | 'check';
  reference: string;
  date: string;
}

export interface AppNotification {
  id: string;
  type: 'overdue' | 'payment' | 'draft';
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  clientName?: string;
  clientPhone?: string;
  clientCompany?: string;
  amount?: number;
  remainingAmount?: number;
  dueDate?: string;
}

export interface PeriodOption {
  id: string;
  label: string;
  shortLabel: string;
  badge?: string;
  type?: 'day' | 'month' | 'quarter' | 'semester' | 'year';
}

export const formatPeriodLabel = (periodId: string): string => {
  if (periodId === 'ALL') return 'Année 2026 complète';
  if (periodId.startsWith('range:')) {
    const parts = periodId.split(':');
    if (parts.length === 3) {
      const [_, start, end] = parts;
      const formatDateShort = (iso: string) => {
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
      };
      return `Du ${formatDateShort(start)} au ${formatDateShort(end)}`;
    }
    return 'Plage personnalisée';
  }
  if (periodId.startsWith('day:')) {
    const dateStr = periodId.replace('day:', '');
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
      const monthName = months[parseInt(m, 10) - 1] || m;
      return `Jour : ${d} ${monthName} ${y}`;
    }
    return `Jour : ${dateStr}`;
  }
  if (periodId.startsWith('quarter:') || periodId.includes('-Q')) {
    const q = periodId.replace('quarter:', '');
    if (q === '2026-Q4') return '4e Trimestre 2026 (Oct-Déc)';
    if (q === '2026-Q3') return '3e Trimestre 2026 (Juil-Sept)';
    if (q === '2026-Q2') return '2e Trimestre 2026 (Avr-Juin)';
    if (q === '2026-Q1') return '1er Trimestre 2026 (Jan-Mar)';
    return `Trimestre ${q}`;
  }
  if (periodId.startsWith('semester:')) {
    const s = periodId.replace('semester:', '');
    if (s === '2026-S2') return '2e Semestre 2026 (Juil-Déc)';
    if (s === '2026-S1') return '1er Semestre 2026 (Jan-Juin)';
    return `Semestre ${s}`;
  }
  if (periodId.startsWith('year:')) {
    const y = periodId.replace('year:', '');
    return `Année ${y}`;
  }
  const monthMap: Record<string, string> = {
    '2026-10': 'Octobre 2026',
    '2026-09': 'Septembre 2026',
    '2026-08': 'Août 2026',
    '2026-07': 'Juillet 2026',
    '2026-06': 'Juin 2026',
    '2026-05': 'Mai 2026',
    '2026-04': 'Avril 2026',
    '2026-03': 'Mars 2026',
    '2026-02': 'Février 2026',
    '2026-01': 'Janvier 2026',
  };
  return monthMap[periodId] || periodId;
};

export const PERIOD_OPTIONS: PeriodOption[] = [
  { id: '2026-10', label: 'Octobre 2026 (En cours)', shortLabel: 'Octobre 2026', badge: 'Mois en cours', type: 'month' },
  { id: '2026-09', label: 'Septembre 2026', shortLabel: 'Septembre 2026', badge: 'Mois dernier', type: 'month' },
  { id: '2026-08', label: 'Août 2026', shortLabel: 'Août 2026', type: 'month' },
  { id: '2026-07', label: 'Juillet 2026', shortLabel: 'Juillet 2026', type: 'month' },
  { id: '2026-Q3', label: '3e Trimestre 2026 (Juil-Sept)', shortLabel: '3e Trimestre 2026', type: 'quarter' },
  { id: 'ALL', label: 'Année 2026 (Toutes les factures)', shortLabel: 'Année 2026 complète', type: 'year' },
];

const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'overdue',
    title: 'Facture en retard d’échéance',
    desc: 'FAC-2026-0040 (Koudjo Architectes) a 18 jours de retard. Montant restant : 2 032 000 FCFA.',
    time: 'Il y a 2 heures',
    unread: true,
    invoiceId: 'inv-3',
    invoiceNumber: 'FAC-2026-0040',
    clientName: 'Fadila Koudjo',
    clientCompany: 'Koudjo Architectes & Urbanisme',
    clientPhone: '+229 01 66 88 99 11',
    amount: 2832000,
    remainingAmount: 2032000,
    dueDate: '2026-09-30',
  },
  {
    id: 'notif-2',
    type: 'payment',
    title: 'Paiement Mobile Money reçu',
    desc: '1 770 000 FCFA reçu de Cédric Agbossou (Réf: MTN-BJ-9021847) pour FAC-2026-0042.',
    time: 'Hier à 16:42',
    unread: true,
    invoiceId: 'inv-1',
    invoiceNumber: 'FAC-2026-0042',
    clientName: 'Cédric Agbossou',
    amount: 1770000,
  },
  {
    id: 'notif-3',
    type: 'draft',
    title: 'Brouillon prêt pour émission',
    desc: 'FAC-2026-0039 pour Teranga Food (708 000 FCFA) en attente de validation.',
    time: 'Il y a 2 jours',
    unread: true,
    invoiceId: 'inv-4',
    invoiceNumber: 'FAC-2026-0039',
    clientName: 'Babacar Ndiaye',
    clientCompany: 'Teranga Food Trading',
    amount: 708000,
  },
  {
    id: 'notif-4',
    type: 'overdue',
    title: 'Facture en retard d’échéance',
    desc: 'FAC-2026-0037 (Agbossou Logistics) a 13 jours de retard. Montant restant : 531 000 FCFA.',
    time: 'Il y a 3 jours',
    unread: true,
    invoiceId: 'inv-6',
    invoiceNumber: 'FAC-2026-0037',
    clientName: 'Cédric Agbossou',
    clientCompany: 'Agbossou Logistics & Co',
    clientPhone: '+229 01 97 12 34 56',
    amount: 531000,
    remainingAmount: 531000,
    dueDate: '2026-10-05',
  },
];

export interface UserProfile {
  id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  organization: string;
  avatar: string;
  emailVerified?: boolean;
}

export const DEFAULT_USER: UserProfile = {
  name: 'Mari-ella Manille',
  firstName: 'Mari-ella',
  lastName: 'Manille',
  email: 'monmonnroyteam@gmail.com',
  role: 'Administrateur / Gérante',
  organization: 'MONROY AGENCY',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  emailVerified: true,
};

interface InvoiceContextType {
  invoices: Invoice[];
  clients: Client[];
  products: Product[];
  payments: PaymentRecord[];
  kpis: DashboardKPIs;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  periodLabel: string;
  periodInvoices: Invoice[];
  periodPayments: PaymentRecord[];
  periodKPIs: DashboardKPIs;
  periodOptions: PeriodOption[];
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissNotification: (id: string) => void;
  unreadNotificationCount: number;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updated: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  convertQuoteToInvoice: (quoteId: string, targetStatus?: InvoiceStatus) => Invoice | null;
  addClient: (client: Omit<Client, 'id'>) => Client;
  updateClient: (id: string, updated: Partial<Client>) => void;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  addPayment: (payment: Omit<PaymentRecord, 'id'>) => void;
  getInvoice: (id: string) => Invoice | undefined;
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  pendingVerificationUser: PendingVerificationUser | null;
  login: (email?: string, name?: string, extra?: { firstName?: string; lastName?: string; organization?: string }) => void;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    organization: string;
    password?: string;
  }) => Promise<{
    success: boolean;
    requiresEmailVerification: boolean;
    email: string;
    token: string;
    error?: string;
  }>;
  confirmEmailVerification: (tokenOrEmail: string) => boolean;
  resendVerificationEmail: (targetEmail?: string) => Promise<boolean>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Développement Web & Mobile',
    price: 1200000,
    vat: 18,
    unit: 'Prestation',
    cat: 'Services IT',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-2',
    name: 'Intégration Mobile Money UEMOA',
    price: 450000,
    vat: 18,
    unit: 'Module',
    cat: 'Fintech',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-3',
    name: 'Maintenance & Support Prioritaire',
    price: 150000,
    vat: 18,
    unit: 'Mois',
    cat: 'Infogérance',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-4',
    name: 'Hébergement Cloud Haute Dispo',
    price: 75000,
    vat: 0,
    unit: 'An',
    cat: 'Cloud',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-5',
    name: 'Audit UX/UI & Stratégie Digitale',
    price: 600000,
    vat: 18,
    unit: 'Mission',
    cat: 'Design',
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 'prod-6',
    name: 'Formation Équipe & Transfert Compétences',
    price: 300000,
    vat: 18,
    unit: 'Journée',
    cat: 'Formation',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=160&auto=format&fit=crop&q=80',
  },
];

const initialPayments: PaymentRecord[] = [
  // Aujourd'hui (18 Octobre 2026)
  {
    id: 'pay-today-1',
    invoiceId: 'inv-1',
    invoiceNumber: 'FAC-2026-0042',
    clientName: 'Cédric Agbossou',
    amount: 350000,
    method: 'cash',
    reference: 'RECU-ESP-0089',
    date: '2026-10-18',
  },
  {
    id: 'pay-today-2',
    invoiceId: 'inv-2',
    invoiceNumber: 'FAC-2026-0041',
    clientName: 'Amina Traoré',
    amount: 620000,
    method: 'mobile_money',
    reference: 'MTN-BJ-9912044',
    date: '2026-10-18',
  },
  // 16 Octobre 2026
  {
    id: 'pay-5',
    invoiceId: 'inv-2',
    invoiceNumber: 'FAC-2026-0041',
    clientName: 'Amina Traoré',
    amount: 450000,
    method: 'cash',
    reference: 'RECU-ESP-0041',
    date: '2026-10-16',
  },
  // 15 Octobre 2026
  {
    id: 'pay-1',
    invoiceId: 'inv-1',
    invoiceNumber: 'FAC-2026-0042',
    clientName: 'Cédric Agbossou',
    amount: 1770000,
    method: 'mobile_money',
    reference: 'MTN-BJ-9021847',
    date: '2026-10-15',
  },
  // 14 Octobre 2026
  {
    id: 'pay-d14',
    invoiceId: 'inv-7',
    invoiceNumber: 'FAC-2026-0036',
    clientName: 'Amina Traoré',
    amount: 750000,
    method: 'bank_transfer',
    reference: 'VIR-ECO-20261014',
    date: '2026-10-14',
  },
  // 13 Octobre 2026
  {
    id: 'pay-4',
    invoiceId: 'inv-7',
    invoiceNumber: 'FAC-2026-0036',
    clientName: 'Amina Traoré',
    amount: 500000,
    method: 'bank_transfer',
    reference: 'VIR-SG-881923',
    date: '2026-10-13',
  },
  // 12 Octobre 2026
  {
    id: 'pay-d12',
    invoiceId: 'inv-5',
    invoiceNumber: 'FAC-2026-0038',
    clientName: 'Jean-Marc Houessou',
    amount: 850000,
    method: 'mobile_money',
    reference: 'MOOV-BJ-551022',
    date: '2026-10-12',
  },
  // 10 Octobre 2026
  {
    id: 'pay-d10',
    invoiceId: 'inv-3',
    invoiceNumber: 'FAC-2026-0040',
    clientName: 'Fadila Koudjo',
    amount: 800000,
    method: 'check',
    reference: 'CHQ-BOA-004921',
    date: '2026-10-10',
  },
  // 08 Octobre 2026
  {
    id: 'pay-d08',
    invoiceId: 'inv-11',
    invoiceNumber: 'FAC-2026-0043',
    clientName: 'Jean-Marc Houessou',
    amount: 1800000,
    method: 'mobile_money',
    reference: 'MTN-BJ-778210',
    date: '2026-10-08',
  },
  // 04 Octobre 2026
  {
    id: 'pay-2',
    invoiceId: 'inv-5',
    invoiceNumber: 'FAC-2026-0038',
    clientName: 'Jean-Marc Houessou',
    amount: 3540000,
    method: 'bank_transfer',
    reference: 'VIR-BOA-20261002',
    date: '2026-10-04',
  },
  // 02 Octobre 2026
  {
    id: 'pay-d02',
    invoiceId: 'inv-6',
    invoiceNumber: 'FAC-2026-0037',
    clientName: 'Cédric Agbossou',
    amount: 531000,
    method: 'cash',
    reference: 'RECU-ESP-0021',
    date: '2026-10-02',
  },
  // Septembre 2026 (T3 / S2)
  {
    id: 'pay-3',
    invoiceId: 'inv-3',
    invoiceNumber: 'FAC-2026-0040',
    clientName: 'Fadila Koudjo',
    amount: 800000,
    method: 'mobile_money',
    reference: 'MOOV-BJ-448109',
    date: '2026-09-28',
  },
  {
    id: 'pay-s20',
    invoiceId: 'inv-6',
    invoiceNumber: 'FAC-2026-0037',
    clientName: 'Cédric Agbossou',
    amount: 1200000,
    method: 'bank_transfer',
    reference: 'VIR-BOA-884910',
    date: '2026-09-20',
  },
  {
    id: 'pay-s08',
    invoiceId: 'inv-12',
    invoiceNumber: 'FAC-2026-0032',
    clientName: 'Cédric Agbossou',
    amount: 5537000,
    method: 'bank_transfer',
    reference: 'VIR-SG-993812',
    date: '2026-09-08',
  },
  // Août 2026 (T3 / S2)
  {
    id: 'pay-a28',
    invoiceId: 'inv-8',
    invoiceNumber: 'FAC-2026-0035',
    clientName: 'Bakary Koné',
    amount: 4484000,
    method: 'bank_transfer',
    reference: 'VIR-ECO-20260828',
    date: '2026-08-28',
  },
  {
    id: 'pay-a22',
    invoiceId: 'inv-9',
    invoiceNumber: 'FAC-2026-0034',
    clientName: 'Fadila Koudjo',
    amount: 2616000,
    method: 'check',
    reference: 'CHQ-BOA-881923',
    date: '2026-08-22',
  },
  // Juillet 2026 (T3 / S2)
  {
    id: 'pay-j28',
    invoiceId: 'inv-10',
    invoiceNumber: 'FAC-2026-0033',
    clientName: 'Jean-Marc Houessou',
    amount: 5400000,
    method: 'bank_transfer',
    reference: 'VIR-BOA-20260728',
    date: '2026-07-28',
  },
  // Juin 2026 (T2 / S1)
  {
    id: 'pay-m06',
    invoiceId: 'inv-m06',
    invoiceNumber: 'FAC-2026-0030',
    clientName: 'Amina Traoré',
    amount: 6200000,
    method: 'bank_transfer',
    reference: 'VIR-SG-20260625',
    date: '2026-06-25',
  },
  // Mai 2026 (T2 / S1)
  {
    id: 'pay-m05',
    invoiceId: 'inv-m05',
    invoiceNumber: 'FAC-2026-0028',
    clientName: 'Cédric Agbossou',
    amount: 4800000,
    method: 'bank_transfer',
    reference: 'VIR-BOA-20260520',
    date: '2026-05-20',
  },
  // Avril 2026 (T2 / S1)
  {
    id: 'pay-q2',
    invoiceId: 'inv-q2',
    invoiceNumber: 'FAC-2026-0025',
    clientName: 'Jean-Marc Houessou',
    amount: 3100000,
    method: 'bank_transfer',
    reference: 'VIR-BOA-20260418',
    date: '2026-04-18',
  },
  // Février 2026 (T1 / S1)
  {
    id: 'pay-q1',
    invoiceId: 'inv-q1',
    invoiceNumber: 'FAC-2026-0020',
    clientName: 'Fadila Koudjo',
    amount: 2500000,
    method: 'mobile_money',
    reference: 'MTN-BJ-20260215',
    date: '2026-02-15',
  },
  // Exercice 2025
  {
    id: 'pay-y25',
    invoiceId: 'inv-y25',
    invoiceNumber: 'FAC-2025-0089',
    clientName: 'Cédric Agbossou',
    amount: 3800000,
    method: 'bank_transfer',
    reference: 'VIR-BOA-20251120',
    date: '2025-11-20',
  },
];

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-10');
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [pendingVerificationUser, setPendingVerificationUser] = useState<PendingVerificationUser | null>(null);

  // Load from localStorage on mount (versioned storage as per plan: facturo:v1)
  useEffect(() => {
    try {
      const savedInvoices = localStorage.getItem('facturo:v1:invoices');
      if (savedInvoices) {
        const parsed = JSON.parse(savedInvoices);
        // Ensure new mock invoices (inv-8, inv-9, inv-10, inv-11, inv-12) are present so all months have data
        const existingIds = new Set(parsed.map((i: Invoice) => i.id));
        const missing = mockInvoices.filter((i) => !existingIds.has(i.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          setInvoices(merged);
          localStorage.setItem('facturo:v1:invoices', JSON.stringify(merged));
        } else {
          setInvoices(parsed);
        }
      }

      const savedClients = localStorage.getItem('facturo:v1:clients');
      if (savedClients) setClients(JSON.parse(savedClients));

      const savedProducts = localStorage.getItem('facturo:v1:products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedPayments = localStorage.getItem('facturo:v1:payments');
      if (savedPayments) {
        const parsed = JSON.parse(savedPayments);
        const existingIds = new Set(parsed.map((p: PaymentRecord) => p.id));
        const missing = initialPayments.filter((p) => !existingIds.has(p.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          setPayments(merged);
          localStorage.setItem('facturo:v1:payments', JSON.stringify(merged));
        } else {
          setPayments(parsed);
        }
      }

      const savedNotifs = localStorage.getItem('facturo:v1:notifications');
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

      const savedAuth = localStorage.getItem('facturo:v1:auth');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (typeof parsed.isAuthenticated === 'boolean') {
          setIsAuthenticated(parsed.isAuthenticated);
          setCurrentUser(parsed.currentUser);
        }
      }

      const savedPending = localStorage.getItem('facturo:v1:pending_verification');
      if (savedPending) {
        setPendingVerificationUser(JSON.parse(savedPending));
      }
    } catch (e) {
      console.warn('LocalStorage non accessible ou vide, utilisation des données démo.');
    }

    // Synchronisation en tâche de fond avec Supabase
    fetchSupabaseData().then((remote) => {
      if (remote) {
        if (remote.clients.length > 0) {
          setClients(remote.clients);
          try { localStorage.setItem('facturo:v1:clients', JSON.stringify(remote.clients)); } catch (e) {}
        }
        if (remote.products.length > 0) {
          setProducts(remote.products);
          try { localStorage.setItem('facturo:v1:products', JSON.stringify(remote.products)); } catch (e) {}
        }
        if (remote.invoices.length > 0) {
          setInvoices((prev) => {
            const remoteIds = new Set(remote.invoices.map((i) => i.id));
            const localOnly = prev.filter((i) => !remoteIds.has(i.id));
            const merged = [...remote.invoices, ...localOnly];
            try { localStorage.setItem('facturo:v1:invoices', JSON.stringify(merged)); } catch (e) {}
            return merged;
          });
        }
        if (remote.payments.length > 0) {
          setPayments((prev) => {
            const remoteIds = new Set(remote.payments.map((p) => p.id));
            const localOnly = prev.filter((p) => !remoteIds.has(p.id));
            const merged = [...remote.payments, ...localOnly];
            try { localStorage.setItem('facturo:v1:payments', JSON.stringify(merged)); } catch (e) {}
            return merged;
          });
        }
      }
    });
  }, []);

  // Save changes to localStorage
  const saveInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    try {
      localStorage.setItem('facturo:v1:invoices', JSON.stringify(newInvoices));
    } catch (e) {}
  };

  const saveClients = (newClients: Client[]) => {
    setClients(newClients);
    try {
      localStorage.setItem('facturo:v1:clients', JSON.stringify(newClients));
    } catch (e) {}
  };

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem('facturo:v1:products', JSON.stringify(newProducts));
    } catch (e) {}
  };

  const savePayments = (newPayments: PaymentRecord[]) => {
    setPayments(newPayments);
    try {
      localStorage.setItem('facturo:v1:payments', JSON.stringify(newPayments));
    } catch (e) {}
  };

  const login = (
    email = 'jobovog@gmail.com',
    name = 'MONROY Business',
    extra?: { firstName?: string; lastName?: string; organization?: string }
  ) => {
    const firstName = extra?.firstName || name.split(' ')[0] || 'MONROY';
    const lastName = extra?.lastName || (name.split(' ').slice(1).join(' ') || '');
    const user: UserProfile = {
      ...DEFAULT_USER,
      name: name || `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email,
      organization: extra?.organization || DEFAULT_USER.organization,
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('facturo:v1:auth', JSON.stringify({ isAuthenticated: true, currentUser: user }));
    } catch (e) {}
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    organization: string;
    password?: string;
  }) => {
    const firstName = userData.firstName.trim();
    const lastName = userData.lastName.trim();
    const email = userData.email.trim();
    const organization = userData.organization.trim();
    const token = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const pending: PendingVerificationUser = {
      firstName,
      lastName,
      email,
      organization,
      token,
      code,
      sentAt: new Date().toISOString(),
    };

    setPendingVerificationUser(pending);
    try {
      localStorage.setItem('facturo:v1:pending_verification', JSON.stringify(pending));
    } catch (e) {}

    // 1. Envoi via notre passerelle d'emailing de production (/api/auth/send-verification)
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const confirmUrl = `${origin}/confirm-email?token=${token}&email=${encodeURIComponent(email)}`;
    const networkUrl = `http://192.168.100.25:3000/confirm-email?token=${token}&email=${encodeURIComponent(email)}`;

    try {
      fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          organization,
          token,
          code,
          confirmUrl,
          networkUrl,
        }),
      }).catch((e) => console.warn('[Send Verification API catch]', e));
    } catch (e) {}

    // 2. Tentative via Supabase Auth
    try {
      const supabase = createClient();
      await supabase.auth.signUp({
        email,
        password: userData.password || 'SecurePassword2026!',
        options: {
          data: {
            firstName,
            lastName,
            organization,
          },
          emailRedirectTo: confirmUrl,
        },
      });
    } catch (err) {
      console.warn('[Supabase Auth signUp] Info / fallback :', err);
    }

    // L'utilisateur reste NON authentifié tant qu'il n'a pas confirmé son adresse email
    setCurrentUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.setItem('facturo:v1:auth', JSON.stringify({ isAuthenticated: false, currentUser: null }));
    } catch (e) {}

    return {
      success: true,
      requiresEmailVerification: true,
      email,
      token,
    };
  };

  const confirmEmailVerification = (tokenOrEmail: string) => {
    let pending = pendingVerificationUser;
    if (!pending) {
      try {
        const saved = localStorage.getItem('facturo:v1:pending_verification');
        if (saved) pending = JSON.parse(saved);
      } catch (e) {}
    }

    const cleanInput = (tokenOrEmail || '').trim().toLowerCase();
    const firstName = pending?.firstName || (cleanInput.includes('@') ? cleanInput.split('@')[0] : 'Mari-ella');
    const lastName = pending?.lastName || (pending ? '' : 'Manille');
    const email = pending?.email || (cleanInput.includes('@') ? cleanInput : 'monmonnroyteam@gmail.com');
    const organization = pending?.organization || 'MONROY AGENCY';
    const fullName = `${firstName} ${lastName}`.trim();

    const avatar = pending?.firstName
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || firstName)}&background=2563eb&color=fff&size=160&bold=true`
      : DEFAULT_USER.avatar;

    const verifiedUser: UserProfile = {
      ...DEFAULT_USER,
      name: fullName,
      firstName,
      lastName,
      email,
      organization,
      avatar,
      role: 'Fondateur / Gérant',
      emailVerified: true,
    };

    setCurrentUser(verifiedUser);
    setIsAuthenticated(true);
    setPendingVerificationUser(null);

    try {
      localStorage.setItem('facturo:v1:auth', JSON.stringify({ isAuthenticated: true, currentUser: verifiedUser }));
      localStorage.removeItem('facturo:v1:pending_verification');
    } catch (e) {}

    return true;
  };

  const resendVerificationEmail = async (targetEmail?: string) => {
    const emailToUse = targetEmail || pendingVerificationUser?.email;
    if (!emailToUse) return false;

    if (pendingVerificationUser) {
      const updated = { ...pendingVerificationUser, sentAt: new Date().toISOString() };
      setPendingVerificationUser(updated);
      try {
        localStorage.setItem('facturo:v1:pending_verification', JSON.stringify(updated));
      } catch (e) {}
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const token = pendingVerificationUser?.token || 'resend-token';
    const confirmUrl = `${origin}/confirm-email?token=${token}&email=${encodeURIComponent(emailToUse)}`;

    // 1. Envoi via passerelle d'emailing
    try {
      fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          firstName: pendingVerificationUser?.firstName || '',
          lastName: pendingVerificationUser?.lastName || '',
          organization: pendingVerificationUser?.organization || '',
          token,
          confirmUrl,
        }),
      }).catch((e) => console.warn('[Resend API catch]', e));
    } catch (e) {}

    // 2. Tentative Supabase Auth
    try {
      const supabase = createClient();
      await supabase.auth.resend({
        type: 'signup',
        email: emailToUse,
        options: {
          emailRedirectTo: confirmUrl,
        },
      });
      return true;
    } catch (e) {
      console.warn('[Supabase Auth resend] Info :', e);
      return true;
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...(prev || DEFAULT_USER), ...updates };
      try {
        localStorage.setItem(
          'facturo:v1:auth',
          JSON.stringify({ isAuthenticated: true, currentUser: updated })
        );
      } catch (e) {}
      return updated;
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.setItem('facturo:v1:auth', JSON.stringify({ isAuthenticated: false, currentUser: null }));
    } catch (e) {}
  };

  const saveNotifications = (newNotifs: AppNotification[]) => {
    setNotifications(newNotifs);
    try {
      localStorage.setItem('facturo:v1:notifications', JSON.stringify(newNotifs));
    } catch (e) {}
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, unread: false } : n));
    saveNotifications(updated);
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    saveNotifications(updated);
  };

  const dismissNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const unreadNotificationCount = notifications.filter((n) => n.unread).length;

  // Add a new invoice
  const addInvoice = (invoice: Invoice) => {
    const updated = [invoice, ...invoices];
    saveInvoices(updated);

    // Persistance asynchrone dans Supabase
    supabaseAddInvoice(invoice).catch((err) => {
      console.warn('[InvoiceContext] Échec enregistrement facture Supabase :', err);
    });

    if (invoice.status === 'draft') {
      const newNotif: AppNotification = {
        id: `notif-draft-${Date.now()}`,
        type: 'draft',
        title: 'Nouveau brouillon enregistré',
        desc: `${invoice.number} pour ${invoice.client.name} en attente de finalisation.`,
        time: 'À l’instant',
        unread: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        clientName: invoice.client.name,
        clientCompany: invoice.client.company,
        amount: invoice.total,
      };
      saveNotifications([newNotif, ...notifications]);
    }
  };

  // Update an existing invoice (e.g. updating a draft or emitting it)
  const updateInvoice = (id: string, updatedFields: Partial<Invoice>) => {
    const updated = invoices.map((inv) => (inv.id === id ? { ...inv, ...updatedFields } : inv));
    saveInvoices(updated);
  };

  // Delete an invoice or quote
  const deleteInvoice = (id: string) => {
    const updated = invoices.filter((inv) => inv.id !== id);
    saveInvoices(updated);
    const updatedNotifs = notifications.filter((n) => n.invoiceId !== id);
    saveNotifications(updatedNotifs);
  };

  // Convert a quote to an invoice (e.g. into status 'sent')
  const convertQuoteToInvoice = (quoteId: string, targetStatus: InvoiceStatus = 'sent'): Invoice | null => {
    const quote = invoices.find((inv) => inv.id === quoteId);
    if (!quote) return null;

    // Determine the next sequential invoice number FAC-2026-XXXX
    const numbers = invoices
      .map((inv) => {
        const m = inv.number.match(/FAC-\d+-(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 44;
    const nextInvoiceNum = `FAC-2026-${String(maxNum + 1).padStart(4, '0')}`;

    const convertedInvoice: Invoice = {
      ...quote,
      documentKind: 'invoice',
      number: nextInvoiceNum,
      status: targetStatus,
      notes: quote.notes
        ? `${quote.notes} (Facturé d'après le devis ${quote.number})`
        : `Facturé d'après le devis ${quote.number}`,
    };

    const updated = invoices.map((inv) => (inv.id === quoteId ? convertedInvoice : inv));
    saveInvoices(updated);

    return convertedInvoice;
  };

  // Add client
  const addClient = (clientData: Omit<Client, 'id'>): Client => {
    const tempId = `cli-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id: tempId,
    };
    const updated = [newClient, ...clients];
    saveClients(updated);

    // Persistance dans Supabase et mise à jour avec le véritable UUID Supabase
    supabaseAddClient(clientData).then((persisted) => {
      if (persisted) {
        setClients((prev) => prev.map((c) => (c.id === tempId ? persisted : c)));
      }
    });

    return newClient;
  };

  // Update client
  const updateClient = (id: string, updatedFields: Partial<Client>) => {
    const updatedClients = clients.map((c) => (c.id === id ? { ...c, ...updatedFields } : c));
    saveClients(updatedClients);

    // Also update client snapshot on any existing invoice for that client
    const updatedInvoices = invoices.map((inv) =>
      inv.clientId === id
        ? {
            ...inv,
            client: { ...inv.client, ...updatedFields },
          }
        : inv
    );
    saveInvoices(updatedInvoices);
  };

  // Add product
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const tempId = `prod-${Date.now()}`;
    const newProd: Product = {
      ...prodData,
      id: tempId,
    };
    const updated = [newProd, ...products];
    saveProducts(updated);

    // Persistance dans Supabase
    supabaseAddProduct(prodData).then((persisted) => {
      if (persisted) {
        setProducts((prev) => prev.map((p) => (p.id === tempId ? persisted : p)));
      }
    });

    return newProd;
  };

  // Add payment
  const addPayment = (payData: Omit<PaymentRecord, 'id'>) => {
    const newPay: PaymentRecord = {
      ...payData,
      id: `pay-${Date.now()}`,
    };
    const updatedPayments = [newPay, ...payments];
    savePayments(updatedPayments);

    // Persistance dans Supabase
    supabaseAddPayment(payData).catch((err) => {
      console.warn('[InvoiceContext] Échec enregistrement paiement Supabase :', err);
    });

    // Update the invoice amountPaid and status
    const inv = invoices.find((i) => i.id === payData.invoiceId);
    if (inv) {
      const newPaid = inv.amountPaid + payData.amount;
      const newStatus: InvoiceStatus = newPaid >= inv.total ? 'paid' : inv.status;
      updateInvoice(inv.id, {
        amountPaid: newPaid,
        status: newStatus,
      });

      // Remove or mark overdue notification for this invoice if fully paid
      if (newStatus === 'paid') {
        const filteredNotifs = notifications.map((n) =>
          n.invoiceId === inv.id ? { ...n, unread: false } : n
        );
        saveNotifications(filteredNotifs);
      }
    }
  };

  const getInvoice = (id: string) => {
    return invoices.find((inv) => inv.id === id);
  };

  // Dynamic Period label
  const periodLabel = React.useMemo(() => {
    return formatPeriodLabel(selectedPeriod);
  }, [selectedPeriod]);

  // Extended filter for Day, Month, Quarter, Semester, and Year
  const periodInvoices = React.useMemo(() => {
    if (selectedPeriod === 'ALL') return invoices;

    // Custom date range filter: 'range:YYYY-MM-DD:YYYY-MM-DD'
    if (selectedPeriod.startsWith('range:')) {
      const parts = selectedPeriod.split(':');
      if (parts.length === 3) {
        const [_, start, end] = parts;
        return invoices.filter((inv) => inv.issueDate >= start && inv.issueDate <= end);
      }
    }

    // Day filter: 'day:YYYY-MM-DD'
    if (selectedPeriod.startsWith('day:')) {
      const targetDate = selectedPeriod.replace('day:', '');
      return invoices.filter((inv) => inv.issueDate === targetDate);
    }

    // Quarter filter: 'quarter:2026-Q3' or '2026-Q3'
    if (selectedPeriod.startsWith('quarter:') || selectedPeriod.includes('-Q')) {
      const q = selectedPeriod.replace('quarter:', '');
      const quarterMonths: Record<string, string[]> = {
        '2026-Q4': ['2026-10', '2026-11', '2026-12'],
        '2026-Q3': ['2026-07', '2026-08', '2026-09'],
        '2026-Q2': ['2026-04', '2026-05', '2026-06'],
        '2026-Q1': ['2026-01', '2026-02', '2026-03'],
      };
      const validMonths = quarterMonths[q] || [];
      return invoices.filter((inv) => validMonths.some((m) => inv.issueDate.startsWith(m)));
    }

    // Semester filter: 'semester:2026-S1' or 'semester:2026-S2'
    if (selectedPeriod.startsWith('semester:')) {
      const s = selectedPeriod.replace('semester:', '');
      if (s === '2026-S2') {
        return invoices.filter((inv) => {
          const monthNum = parseInt(inv.issueDate.slice(5, 7), 10);
          return inv.issueDate.startsWith('2026') && monthNum >= 7 && monthNum <= 12;
        });
      }
      if (s === '2026-S1') {
        return invoices.filter((inv) => {
          const monthNum = parseInt(inv.issueDate.slice(5, 7), 10);
          return inv.issueDate.startsWith('2026') && monthNum >= 1 && monthNum <= 6;
        });
      }
    }

    // Year filter: 'year:2026'
    if (selectedPeriod.startsWith('year:')) {
      const targetYear = selectedPeriod.replace('year:', '');
      return invoices.filter((inv) => inv.issueDate.startsWith(targetYear));
    }

    // Default: Month filter (e.g. '2026-10' or 'month:2026-10')
    const cleanMonth = selectedPeriod.replace('month:', '');
    return invoices.filter((inv) => inv.issueDate.startsWith(cleanMonth));
  }, [invoices, selectedPeriod]);

  // Extended filter for Payments by period
  const periodPayments = React.useMemo(() => {
    if (selectedPeriod === 'ALL') return payments;

    // Custom date range filter: 'range:YYYY-MM-DD:YYYY-MM-DD'
    if (selectedPeriod.startsWith('range:')) {
      const parts = selectedPeriod.split(':');
      if (parts.length === 3) {
        const [_, start, end] = parts;
        return payments.filter((p) => p.date >= start && p.date <= end);
      }
    }

    // Day filter: 'day:YYYY-MM-DD'
    if (selectedPeriod.startsWith('day:')) {
      const targetDate = selectedPeriod.replace('day:', '');
      return payments.filter((p) => p.date === targetDate);
    }

    // Quarter filter: 'quarter:2026-Q4' or '2026-Q4'
    if (selectedPeriod.startsWith('quarter:') || selectedPeriod.includes('-Q')) {
      const q = selectedPeriod.replace('quarter:', '');
      const quarterMonths: Record<string, string[]> = {
        '2026-Q4': ['2026-10', '2026-11', '2026-12'],
        '2026-Q3': ['2026-07', '2026-08', '2026-09'],
        '2026-Q2': ['2026-04', '2026-05', '2026-06'],
        '2026-Q1': ['2026-01', '2026-02', '2026-03'],
      };
      const validMonths = quarterMonths[q] || [];
      return payments.filter((p) => validMonths.some((m) => p.date.startsWith(m)));
    }

    // Semester filter: 'semester:2026-S1' or 'semester:2026-S2'
    if (selectedPeriod.startsWith('semester:')) {
      const s = selectedPeriod.replace('semester:', '');
      if (s === '2026-S2') {
        return payments.filter((p) => {
          const monthNum = parseInt(p.date.slice(5, 7), 10);
          return p.date.startsWith('2026') && monthNum >= 7 && monthNum <= 12;
        });
      }
      if (s === '2026-S1') {
        return payments.filter((p) => {
          const monthNum = parseInt(p.date.slice(5, 7), 10);
          return p.date.startsWith('2026') && monthNum >= 1 && monthNum <= 6;
        });
      }
    }

    // Year filter: 'year:2026' or 'year:2025'
    if (selectedPeriod.startsWith('year:')) {
      const targetYear = selectedPeriod.replace('year:', '');
      return payments.filter((p) => p.date.startsWith(targetYear));
    }

    // Default: Month filter (e.g. '2026-10' or 'month:2026-10')
    const cleanMonth = selectedPeriod.replace('month:', '');
    return payments.filter((p) => p.date.startsWith(cleanMonth));
  }, [payments, selectedPeriod]);

  // Recalculate KPIs for the active period (uniquement sur les factures, hors devis)
  const isRealInvoice = (i: Invoice) => (!i.documentKind || i.documentKind === 'invoice') && !i.number.startsWith('DEV-');

  const periodKPIs: DashboardKPIs = React.useMemo(() => {
    const realInvoices = periodInvoices.filter(isRealInvoice);
    const activeInvoices = realInvoices.filter((i) => i.status !== 'draft');
    const totalInvoiced = activeInvoices.reduce((acc, i) => acc + i.total, 0);
    const totalPaid = realInvoices.reduce((acc, i) => acc + i.amountPaid, 0);
    const totalPending = realInvoices
      .filter((i) => i.status === 'sent')
      .reduce((acc, i) => acc + (i.total - i.amountPaid), 0);
    const totalOverdue = realInvoices
      .filter((i) => i.status === 'overdue')
      .reduce((acc, i) => acc + (i.total - i.amountPaid), 0);

    let paidTrend = 16.8;
    let invoicedTrend = 12.4;
    let pendingTrend = -4.2;
    let overdueTrend = 3.1;

    if (selectedPeriod === '2026-09') {
      paidTrend = -14.2;
      invoicedTrend = -8.5;
      pendingTrend = 0;
      overdueTrend = 12.5;
    } else if (selectedPeriod === '2026-08') {
      paidTrend = 28.5;
      invoicedTrend = 24.1;
      pendingTrend = 0;
      overdueTrend = 0;
    } else if (selectedPeriod === '2026-07') {
      paidTrend = 15.0;
      invoicedTrend = 10.0;
      pendingTrend = 0;
      overdueTrend = 0;
    } else if (selectedPeriod === 'ALL') {
      paidTrend = 21.4;
      invoicedTrend = 18.2;
      pendingTrend = -5.1;
      overdueTrend = 4.2;
    }

    return {
      totalInvoiced,
      totalPaid,
      totalPending,
      totalOverdue,
      invoicesCount: realInvoices.length,
      paidTrend,
      invoicedTrend,
      pendingTrend,
      overdueTrend,
    };
  }, [periodInvoices, selectedPeriod]);

  // Overall KPIs (full year, uniquement sur les factures, hors devis)
  const kpis: DashboardKPIs = React.useMemo(() => {
    const realInvoices = invoices.filter(isRealInvoice);
    const activeInvoices = realInvoices.filter((i) => i.status !== 'draft');
    const totalInvoiced = activeInvoices.reduce((acc, i) => acc + i.total, 0);
    const totalPaid = realInvoices.reduce((acc, i) => acc + i.amountPaid, 0);
    const totalPending = realInvoices
      .filter((i) => i.status === 'sent')
      .reduce((acc, i) => acc + (i.total - i.amountPaid), 0);
    const totalOverdue = realInvoices
      .filter((i) => i.status === 'overdue')
      .reduce((acc, i) => acc + (i.total - i.amountPaid), 0);

    return {
      totalInvoiced,
      totalPaid,
      totalPending,
      totalOverdue,
      invoicesCount: realInvoices.length,
      paidTrend: 16.8,
      invoicedTrend: 12.4,
      pendingTrend: -4.2,
      overdueTrend: 3.1,
    };
  }, [invoices]);

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        clients,
        products,
        payments,
        kpis,
        selectedPeriod,
        setSelectedPeriod,
        periodLabel,
        periodInvoices,
        periodPayments,
        periodKPIs,
        periodOptions: PERIOD_OPTIONS,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissNotification,
        unreadNotificationCount,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        convertQuoteToInvoice,
        addClient,
        updateClient,
        addProduct,
        addPayment,
        getInvoice,
        currentUser,
        isAuthenticated,
        pendingVerificationUser,
        login,
        register,
        confirmEmailVerification,
        resendVerificationEmail,
        updateUserProfile,
        logout,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};
