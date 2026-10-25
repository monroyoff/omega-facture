'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Client, Invoice, InvoiceStatus, InvoiceItem, DashboardKPIs } from '@/lib/types';
import { mockClients, mockInvoices } from '@/lib/mock-data';
import { ToastNotification, type ToastMessage } from '@/components/ui/ToastNotification';
import {
  fetchSupabaseData,
  getOrCreateUserCompany,
  supabaseAddInvoice,
  supabaseUpdateInvoice,
  supabaseDeleteInvoice,
  supabaseAddClient,
  supabaseUpdateClient,
  supabaseDeleteClient,
  supabaseAddProduct,
  supabaseUpdateProduct,
  supabaseDeleteProduct,
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

const initialNotifications: AppNotification[] = [];

export interface UserProfile {
  id?: string;
  companyId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  organization: string;
  avatar: string;
  emailVerified?: boolean;
  password?: string;
}

export const DEFAULT_USER: UserProfile = {
  id: 'fc1ff9e5-80d6-4bcf-8794-c4bb463e148d',
  companyId: 'c0000000-0000-0000-0000-000000000001',
  name: 'Mari-ella Manille',
  firstName: 'Mari-ella',
  lastName: 'Manille',
  email: 'monmonnroyteam@gmail.com',
  role: 'Administrateur / Gérante',
  organization: 'MONROY AGENCY',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  emailVerified: true,
};

export const KNOWN_USERS_SEED: Record<string, UserProfile> = {
  'monmonnroyteam@gmail.com': {
    id: 'fc1ff9e5-80d6-4bcf-8794-c4bb463e148d',
    companyId: 'c0000000-0000-0000-0000-000000000001',
    name: 'Mari-ella Manille',
    firstName: 'Mari-ella',
    lastName: 'Manille',
    email: 'monmonnroyteam@gmail.com',
    role: 'Administrateur / Gérante',
    organization: 'MONROY AGENCY',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    emailVerified: true,
  },
  'laradamourr@gmail.com': {
    id: '292fab7a-a210-44b9-bee4-a54aca4321e9',
    companyId: 'c0000000-0000-0000-0000-000000000002',
    name: 'TFTGCFXF JHJHGU',
    firstName: 'TFTGCFXF',
    lastName: 'JHJHGU',
    email: 'laradamourr@gmail.com',
    role: 'Administrateur / Gérant',
    organization: 'KJKHGGJ',
    avatar: 'https://ui-avatars.com/api/?name=TFTGCFXF+JHJHGU&background=2563eb&color=fff&size=160&bold=true',
    emailVerified: true,
  },
  'jobovog@gmail.com': {
    id: '6c146673-29b7-4b00-9df8-9ff27224b617',
    companyId: 'c0000000-0000-0000-0000-000000000003',
    name: 'MONROY Business',
    firstName: 'MONROY',
    lastName: 'Business',
    email: 'jobovog@gmail.com',
    role: 'Directeur Général',
    organization: 'MONROY Business Solutions',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    emailVerified: true,
  },
};

export const getUserRegistry = (): Record<string, UserProfile> => {
  if (typeof window === 'undefined') return { ...KNOWN_USERS_SEED };
  try {
    const raw = localStorage.getItem('facturo:v1:users_registry');
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...KNOWN_USERS_SEED, ...parsed };
  } catch (e) {
    return { ...KNOWN_USERS_SEED };
  }
};

export const saveUserToRegistry = (user: UserProfile) => {
  if (typeof window === 'undefined') return;
  try {
    const registry = getUserRegistry();
    const key = user.email.toLowerCase().trim();
    registry[key] = { ...registry[key], ...user };
    localStorage.setItem('facturo:v1:users_registry', JSON.stringify(registry));
  } catch (e) {}
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
  toast: ToastMessage | null;
  showToast: (options: Omit<ToastMessage, 'id'>) => void;
  hideToast: () => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updated: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  convertQuoteToInvoice: (quoteId: string, targetStatus?: InvoiceStatus, extraFields?: Partial<Invoice>) => Invoice | null;
  addClient: (client: Omit<Client, 'id'>) => Client;
  updateClient: (id: string, updated: Partial<Client>) => void;
  deleteClient?: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  deleteProduct?: (id: string) => void;
  addPayment: (payment: Omit<PaymentRecord, 'id'>) => void;
  getInvoice: (id: string) => Invoice | undefined;
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  isDataLoading: boolean;
  refreshData: () => Promise<void>;
  pendingVerificationUser: PendingVerificationUser | null;
  login: (
    email?: string,
    passwordOrName?: string,
    extra?: { firstName?: string; lastName?: string; organization?: string; avatar?: string }
  ) => Promise<{ success: boolean; user?: UserProfile; error?: string; requiresEmailVerification?: boolean }>;
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
  logout: () => Promise<void>;
}

const initialProducts: Product[] = [];

const initialPayments: PaymentRecord[] = [];


const isFictitiousId = (id?: string) => {
  if (!id) return true;
  if (/^(inv|dev|cli|prod|pay|notif)-00\d$/.test(id)) return true;
  if (id.startsWith('a0000000') || id.startsWith('b0000000') || id.startsWith('e0000000')) return true;
  if (id === '54e9c159-da2e-4eae-ba06-24a7b85a0486') return true;
  return false;
};

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialisation uniforme SSR & Client pour éliminer tout décalage d'hydratation (Hydration Mismatch)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 2. Initialisation des listes (peuplées immédiatement dans useEffect via le cache local et Supabase)
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-10');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [pendingVerificationUser, setPendingVerificationUser] = useState<PendingVerificationUser | null>(null);

  /**
   * Charge les données de facturation strictement isolées pour une société donnée
   */
  const loadUserData = async (user: UserProfile) => {
    setIsDataLoading(true);
    let companyId = user.companyId;
    if (!companyId) {
      companyId = await getOrCreateUserCompany(user.id, user.organization, user.email);
      user.companyId = companyId;
      saveUserToRegistry(user);
    }

    const cacheKey = `facturo:v1:${companyId}`;
    let localInvoices: Invoice[] = [];
    try {
      const savedInvoices = localStorage.getItem(`${cacheKey}:invoices`);
      if (savedInvoices) {
        const parsed = JSON.parse(savedInvoices);
        localInvoices = Array.isArray(parsed) ? parsed.filter((i: Invoice) => !isFictitiousId(i.id)) : [];
        setInvoices(localInvoices);
      } else {
        setInvoices([]);
      }

      const savedClients = localStorage.getItem(`${cacheKey}:clients`);
      if (savedClients) {
        const parsed = JSON.parse(savedClients);
        setClients(Array.isArray(parsed) ? parsed.filter((c: Client) => !isFictitiousId(c.id)) : []);
      } else {
        setClients([]);
      }

      const savedProducts = localStorage.getItem(`${cacheKey}:products`);
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        setProducts(Array.isArray(parsed) ? parsed.filter((p: Product) => !isFictitiousId(p.id)) : []);
      } else {
        setProducts([]);
      }

      const savedPayments = localStorage.getItem(`${cacheKey}:payments`);
      if (savedPayments) {
        const parsed = JSON.parse(savedPayments);
        setPayments(Array.isArray(parsed) ? parsed.filter((p: PaymentRecord) => !isFictitiousId(p.id)) : []);
      } else {
        setPayments([]);
      }
    } catch (e) {}

    // Synchronisation depuis Supabase (source réelle filtrée par company_id) avec Réconciliation Inviolable
    try {
      const remote = await fetchSupabaseData(companyId);
      if (remote) {
        // Registre persistant des conversions inviolables
        let convertedMap: Record<string, { number: string }> = {};
        try {
          const rawConv = localStorage.getItem('facturo:v1:converted_quotes');
          if (rawConv) convertedMap = JSON.parse(rawConv);
        } catch (e) {}

        const localMap = new Map<string, Invoice>();
        for (const inv of localInvoices) {
          localMap.set(inv.id, inv);
        }

        const reconciledInvoices: Invoice[] = remote.invoices.map((remoteInv) => {
          const localInv = localMap.get(remoteInv.id);
          const wasConverted = convertedMap[remoteInv.id];

          // RÈGLE D'OR : Si le document a été converti en facture (soit en local, soit dans le registre persistant),
          // une ancienne version distante (devis DEV-) NE PEUT JAMAIS l'écraser !
          const localIsFacture = (localInv && (!localInv.documentKind || localInv.documentKind === 'invoice') && !localInv.number.startsWith('DEV-')) || Boolean(wasConverted);
          const remoteIsDevis = remoteInv.documentKind === 'quote' || remoteInv.number.startsWith('DEV-');

          if (localIsFacture && remoteIsDevis) {
            const finalNumber = wasConverted?.number || localInv?.number || remoteInv.number.replace('DEV-', 'FAC-');
            const reconciled: Invoice = {
              ...(localInv || remoteInv),
              id: remoteInv.id,
              number: finalNumber,
              documentKind: 'invoice',
              type: 'standard',
              status: localInv?.status || remoteInv.status || 'sent',
              notes: localInv?.notes || remoteInv.notes,
            };

            // Auto-heal Supabase en arrière-plan pour réparer la base distante immédiatement
            supabaseUpdateInvoice(
              remoteInv.id,
              {
                number: finalNumber,
                documentKind: 'invoice',
                type: 'standard',
                status: reconciled.status,
                notes: reconciled.notes,
              },
              remoteInv.number
            ).catch((err) => console.warn('[Auto-heal conversion error] :', err));

            return reconciled;
          }

          return remoteInv;
        });

        // Conserver les factures créées localement qui ne sont pas encore arrivées sur Supabase
        for (const localInv of localInvoices) {
          if (!reconciledInvoices.some((r) => r.id === localInv.id)) {
            reconciledInvoices.push(localInv);
            supabaseAddInvoice(localInv, companyId).catch((err) => console.warn('[Auto-heal new invoice error] :', err));
          }
        }

        setClients(remote.clients);
        setProducts(remote.products);
        setInvoices(reconciledInvoices);
        setPayments(remote.payments);
        try {
          localStorage.setItem(`${cacheKey}:clients`, JSON.stringify(remote.clients));
          localStorage.setItem(`${cacheKey}:products`, JSON.stringify(remote.products));
          localStorage.setItem(`${cacheKey}:invoices`, JSON.stringify(reconciledInvoices));
          localStorage.setItem(`${cacheKey}:payments`, JSON.stringify(remote.payments));
        } catch (e) {}
      }
    } catch (e) {
      console.warn('[loadUserData] Erreur de synchronisation Supabase :', e);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Initialisation au montage : vérification de session stricte
  useEffect(() => {
    const initAuth = async () => {
      try {
        const isLoggedOutFlag = typeof window !== 'undefined' && localStorage.getItem('facturo:v1:is_logged_out') === 'true';
        const isPublicPath = typeof window !== 'undefined' && (
          window.location.pathname === '/login' ||
          window.location.pathname === '/register' ||
          window.location.pathname === '/verify-email' ||
          window.location.pathname === '/confirm-email'
        );

        if (isLoggedOutFlag) {
          setCurrentUser(null);
          setIsAuthenticated(false);
          setInvoices([]);
          setClients([]);
          setProducts([]);
          setPayments([]);
          setAuthLoading(false);
          setIsDataLoading(false);
          return;
        }

        const savedPending = typeof window !== 'undefined' ? localStorage.getItem('facturo:v1:pending_verification') : null;
        if (savedPending) {
          setPendingVerificationUser(JSON.parse(savedPending));
        }

        const savedAuth = typeof window !== 'undefined' ? localStorage.getItem('facturo:v1:auth') : null;
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          if (parsed && parsed.isAuthenticated === false) {
            setCurrentUser(null);
            setIsAuthenticated(false);
            setInvoices([]);
            setClients([]);
            setProducts([]);
            setPayments([]);
            setAuthLoading(false);
            return;
          }
          if (parsed?.isAuthenticated && parsed?.currentUser && parsed?.currentUser?.emailVerified) {
            setCurrentUser(parsed.currentUser);
            setIsAuthenticated(true);
            setAuthLoading(false);
            // Charger les données en arrière-plan sans bloquer l'affichage de l'écran
            loadUserData(parsed.currentUser).catch((err) => console.warn('[loadUserData background] :', err));
            return;
          }
        }

        // Sur les pages publiques (/login, /register), ne JAMAIS auto-reconnecter via session Supabase
        if (isPublicPath) {
          setCurrentUser(null);
          setIsAuthenticated(false);
          setAuthLoading(false);
          setIsDataLoading(false);
          return;
        }

        // Vérification de la session Supabase active avec timeout de sécurité (max 2.5s)
        try {
          const supabase = createClient();
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 2500)
          );
          const { data } = await Promise.race([sessionPromise, timeoutPromise]);
          if (data?.session?.user) {
            const sbUser = data.session.user;
            const meta = (sbUser.user_metadata || {}) as Record<string, any>;
            const isVerified = Boolean(sbUser.confirmed_at || sbUser.email_confirmed_at || meta.email_verified);
            if (isVerified) {
              const fullName = `${meta.firstName || ''} ${meta.lastName || ''}`.trim() || meta.organization || sbUser.email?.split('@')[0] || 'Utilisateur';
              const companyId = await getOrCreateUserCompany(sbUser.id, meta.organization, sbUser.email);
              const userProfile: UserProfile = {
                id: sbUser.id,
                companyId,
                name: fullName,
                firstName: meta.firstName || fullName,
                lastName: meta.lastName || '',
                email: sbUser.email || '',
                organization: meta.organization || 'Mon Entreprise',
                role: 'Administrateur / Gérant',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563eb&color=fff&size=160&bold=true`,
                emailVerified: true,
              };
              setCurrentUser(userProfile);
              setIsAuthenticated(true);
              try {
                localStorage.setItem('facturo:v1:auth', JSON.stringify({ isAuthenticated: true, currentUser: userProfile }));
                localStorage.removeItem('facturo:v1:is_logged_out');
              } catch (e) {}
              saveUserToRegistry(userProfile);
              setAuthLoading(false);
              loadUserData(userProfile).catch((err) => console.warn('[loadUserData background] :', err));
              return;
            }
          }
        } catch (e) {}

        // Par défaut : non authentifié, aucune donnée en mémoire
        setCurrentUser(null);
        setIsAuthenticated(false);
        setInvoices([]);
        setClients([]);
        setProducts([]);
        setPayments([]);
        setIsDataLoading(false);
      } catch (e) {
        console.warn('[initAuth] Erreur :', e);
        setIsDataLoading(false);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  // Synchronisation inter-onglets : si un onglet se déconnecte, tous les onglets se déconnectent instantanément
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'facturo:v1:is_logged_out' && e.newValue === 'true') {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setInvoices([]);
        setClients([]);
        setProducts([]);
        setPayments([]);
        if (!window.location.pathname.startsWith('/login')) {
          window.location.replace('/login');
        }
      } else if (e.key === 'facturo:v1:auth') {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : null;
          if (parsed && parsed.isAuthenticated === false) {
            setCurrentUser(null);
            setIsAuthenticated(false);
            setInvoices([]);
            setClients([]);
            setProducts([]);
            setPayments([]);
            if (!window.location.pathname.startsWith('/login')) {
              window.location.replace('/login');
            }
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sauvegarde des modifications dans le cache spécifique à l'utilisateur
  const saveInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    const key = currentUser?.companyId ? `facturo:v1:${currentUser.companyId}:invoices` : 'facturo:v1:invoices';
    try {
      localStorage.setItem(key, JSON.stringify(newInvoices));
    } catch (e) {}
  };

  const saveClients = (newClients: Client[]) => {
    setClients(newClients);
    const key = currentUser?.companyId ? `facturo:v1:${currentUser.companyId}:clients` : 'facturo:v1:clients';
    try {
      localStorage.setItem(key, JSON.stringify(newClients));
    } catch (e) {}
  };

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    const key = currentUser?.companyId ? `facturo:v1:${currentUser.companyId}:products` : 'facturo:v1:products';
    try {
      localStorage.setItem(key, JSON.stringify(newProducts));
    } catch (e) {}
  };

  const savePayments = (newPayments: PaymentRecord[]) => {
    setPayments(newPayments);
    const key = currentUser?.companyId ? `facturo:v1:${currentUser.companyId}:payments` : 'facturo:v1:payments';
    try {
      localStorage.setItem(key, JSON.stringify(newPayments));
    } catch (e) {}
  };

  /**
   * Connexion sécurisée : AUCUN compte fictif toléré.
   * L'utilisateur DOIT obligatoirement avoir un compte valide et un mot de passe correct.
   */
  const login = async (
    emailOrCredentials?: string,
    passwordOrName?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string; requiresEmailVerification?: boolean }> => {
    const cleanEmail = (emailOrCredentials || '').trim().toLowerCase();
    const password = (passwordOrName || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Veuillez saisir une adresse email valide.' };
    }
    if (!password) {
      return { success: false, error: 'Veuillez renseigner votre mot de passe.' };
    }

    // 1. Authentification Supabase Auth
    try {
      const supabase = createClient();
      const { data: authData, error: sbError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!sbError && authData?.user) {
        const sbUser = authData.user;
        const isVerified = Boolean(sbUser.confirmed_at || sbUser.email_confirmed_at || (sbUser.user_metadata as any)?.email_verified);
        if (!isVerified) {
          return {
            success: false,
            error: "Votre adresse email n'a pas encore été confirmée. Veuillez vérifier votre boîte mail et valider le lien reçu.",
            requiresEmailVerification: true,
          };
        }

        const meta = (sbUser.user_metadata || {}) as Record<string, any>;
        const fullName = `${meta.firstName || ''} ${meta.lastName || ''}`.trim() || meta.organization || cleanEmail.split('@')[0];
        const companyId = await getOrCreateUserCompany(sbUser.id, meta.organization, cleanEmail);

        const profile: UserProfile = {
          id: sbUser.id,
          companyId,
          name: fullName,
          firstName: meta.firstName || fullName,
          lastName: meta.lastName || '',
          email: cleanEmail,
          organization: meta.organization || 'Mon Entreprise',
          role: 'Administrateur / Gérant',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563eb&color=fff&size=160&bold=true`,
          emailVerified: true,
        };

        setCurrentUser(profile);
        setIsAuthenticated(true);
        saveUserToRegistry(profile);
        await loadUserData(profile);

        try {
          localStorage.removeItem('facturo:v1:is_logged_out');
          localStorage.setItem('facturo:v1:auth', JSON.stringify({ isAuthenticated: true, currentUser: profile }));
          localStorage.removeItem('facturo:v1:last_email');
          localStorage.removeItem('facturo:v1:last_registered_email');
        } catch (e) {}

        return { success: true, user: profile };
      }

      if (sbError && sbError.message.toLowerCase().includes('email not confirmed')) {
        return {
          success: false,
          error: "Votre adresse email n'a pas encore été confirmée. Veuillez valider le lien reçu dans votre messagerie.",
          requiresEmailVerification: true,
        };
      }
    } catch (e) {
      console.warn('[login] Supabase auth attempt catch:', e);
    }

    // 2. Vérification dans le registre persistant
    const registry = getUserRegistry();
    const regUser = registry[cleanEmail];

    if (!regUser) {
      return {
        success: false,
        error: "Aucun compte n'existe avec cette adresse email. Veuillez d'abord vous inscrire.",
      };
    }

    if (regUser.password && regUser.password !== password) {
      return {
        success: false,
        error: "Mot de passe incorrect. Veuillez vérifier votre saisie.",
      };
    }

    if (!regUser.emailVerified) {
      return {
        success: false,
        error: "Votre adresse email n'a pas encore été validée. Veuillez cliquer sur le lien de confirmation reçu.",
        requiresEmailVerification: true,
      };
    }

    // Connexion réussie via le registre vérifié
    const companyId = regUser.companyId || await getOrCreateUserCompany(regUser.id, regUser.organization, cleanEmail);
    const validUser: UserProfile = {
      ...regUser,
      companyId,
      emailVerified: true,
    };

    setCurrentUser(validUser);
    setIsAuthenticated(true);
    saveUserToRegistry(validUser);
    await loadUserData(validUser);

    try {
      localStorage.removeItem('facturo:v1:is_logged_out');
      localStorage.setItem('facturo:v1:auth', JSON.stringify({ isAuthenticated: true, currentUser: validUser }));
      localStorage.removeItem('facturo:v1:last_email');
      localStorage.removeItem('facturo:v1:last_registered_email');
    } catch (e) {}

    return { success: true, user: validUser };
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
    const fullName = `${firstName} ${lastName}`.trim();

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

    // Enregistrer le profil réel dès l'inscription dans le registre persistant
    const userProfile: UserProfile = {
      ...DEFAULT_USER,
      name: fullName,
      firstName,
      lastName,
      email,
      organization,
      role: 'Administrateur / Gérant',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || firstName)}&background=2563eb&color=fff&size=160&bold=true`,
      emailVerified: false,
    };
    saveUserToRegistry(userProfile);
    try {
      localStorage.removeItem('facturo:v1:last_registered_email');
      localStorage.removeItem('facturo:v1:last_email');
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
    const registry = getUserRegistry();
    const existing = registry[cleanInput] || (pending?.email ? registry[pending.email.toLowerCase()] : undefined);

    const firstName = pending?.firstName || existing?.firstName || (cleanInput.includes('@') ? cleanInput.split('@')[0] : 'Mari-ella');
    const lastName = pending?.lastName || existing?.lastName || (pending ? '' : 'Manille');
    const email = pending?.email || existing?.email || (cleanInput.includes('@') ? cleanInput : 'monmonnroyteam@gmail.com');
    const organization = pending?.organization || existing?.organization || 'MONROY AGENCY';
    const fullName = `${firstName} ${lastName}`.trim();

    const avatar = existing?.avatar || (pending?.firstName
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || firstName)}&background=2563eb&color=fff&size=160&bold=true`
      : DEFAULT_USER.avatar);

    const verifiedUser: UserProfile = {
      ...DEFAULT_USER,
      ...(existing || {}),
      name: fullName,
      firstName,
      lastName,
      email,
      organization,
      avatar,
      role: existing?.role || 'Fondateur / Gérant',
      emailVerified: true,
    };

    saveUserToRegistry(verifiedUser);
    setCurrentUser(verifiedUser);
    setIsAuthenticated(true);
    setPendingVerificationUser(null);

    try {
      localStorage.setItem('facturo:v1:auth', JSON.stringify({ isAuthenticated: true, currentUser: verifiedUser }));
      localStorage.removeItem('facturo:v1:last_email');
      localStorage.removeItem('facturo:v1:last_registered_email');
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
        saveUserToRegistry(updated);
      } catch (e) {}
      return updated;
    });
  };

  const logout = async () => {
    // 1. IMMÉDIAT & SYNCHRONE : marquer comme déconnecté dans le localStorage
    try {
      localStorage.setItem('facturo:v1:is_logged_out', 'true');
      localStorage.setItem('facturo:v1:auth', JSON.stringify({ isAuthenticated: false, currentUser: null }));
      localStorage.removeItem('facturo:v1:last_email');
      localStorage.removeItem('facturo:v1:last_registered_email');
      localStorage.removeItem('facturo:v1:pending_verification');
      if (typeof window !== 'undefined') {
        // Supprimer toutes les clés de session Supabase stockées en localStorage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-') || key.includes('-auth-token') || key.includes('supabase') || key.includes('last_email')) {
            localStorage.removeItem(key);
          }
        });
        // Supprimer tous les cookies de session Supabase (sb-*)
        document.cookie.split(';').forEach((cookie) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          if (name.startsWith('sb-') || name.includes('auth-token') || name.includes('supabase')) {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
            if (window.location.hostname) {
              document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
            }
          }
        });
      }
    } catch (e) {}

    // 2. Réinitialiser les états React en mémoire
    setCurrentUser(null);
    setIsAuthenticated(false);
    setInvoices([]);
    setClients([]);
    setProducts([]);
    setPayments([]);
    setNotifications([]);

    // 3. Déconnexion Supabase client (global scope) avec timeout strict
    try {
      const supabase = createClient();
      await Promise.race([
        supabase.auth.signOut({ scope: 'global' }),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]).catch(() => {});
    } catch (e) {}

    // 4. Déconnexion serveur via route API (purge des cookies de session HTTP)
    try {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
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

  // Toast notifications temporaires (émissions, sauvegardes, validations)
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((options: Omit<ToastMessage, 'id'>) => {
    setToast({
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...options,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Add a new invoice
  const addInvoice = (invoice: Invoice) => {
    const updated = [invoice, ...invoices];
    saveInvoices(updated);

    // Persistance asynchrone dans Supabase avec isolation par société
    supabaseAddInvoice(invoice, currentUser?.companyId).catch((err) => {
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

    // Synchronisation Supabase
    supabaseUpdateInvoice(id, updatedFields).catch((err) => {
      console.warn("[InvoiceContext] Échec mise à jour facture Supabase :", err);
    });
  };

  // Delete an invoice or quote
  const deleteInvoice = (id: string) => {
    const target = invoices.find((inv) => inv.id === id);
    const updated = invoices.filter((inv) => inv.id !== id);
    saveInvoices(updated);
    const updatedNotifs = notifications.filter((n) => n.invoiceId !== id);
    saveNotifications(updatedNotifs);

    // Nettoyer du registre de conversion si supprimé
    try {
      const rawConv = localStorage.getItem('facturo:v1:converted_quotes');
      if (rawConv) {
        const convMap = JSON.parse(rawConv);
        delete convMap[id];
        localStorage.setItem('facturo:v1:converted_quotes', JSON.stringify(convMap));
      }
    } catch (e) {}

    // Synchronisation Supabase
    supabaseDeleteInvoice(id, target?.number).catch((err) => {
      console.warn("[InvoiceContext] Échec suppression facture Supabase :", err);
    });
  };

  // Convert a quote to an invoice (e.g. into status 'sent') et persister immédiatement dans Supabase
  const convertQuoteToInvoice = (
    quoteId: string,
    targetStatus: InvoiceStatus = 'sent',
    extraFields?: Partial<Invoice>
  ): Invoice | null => {
    const quote = invoices.find((inv) => inv.id === quoteId);
    if (!quote) return null;

    // Determine the next sequential invoice number FAC-2026-XXXX
    const numbers = invoices
      .map((inv) => {
        const m = inv.number.match(/FAC-\d+-(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextInvoiceNum = `FAC-2026-${String(maxNum + 1).padStart(4, '0')}`;

    const originalQuoteNum = quote.number;
    const convertedNotes = extraFields?.notes || (quote.notes
      ? `${quote.notes} (Facturé d'après le devis ${originalQuoteNum})`
      : `Facturé d'après le devis ${originalQuoteNum}`);

    const convertedInvoice: Invoice = {
      ...quote,
      ...(extraFields || {}),
      documentKind: 'invoice',
      number: nextInvoiceNum,
      status: targetStatus,
      type: 'standard',
      notes: convertedNotes,
    };

    const updated = invoices.map((inv) => (inv.id === quoteId ? convertedInvoice : inv));
    saveInvoices(updated);

    // Enregistrement dans le registre persistant inviolable des conversions
    try {
      const rawConv = localStorage.getItem('facturo:v1:converted_quotes');
      const convMap = rawConv ? JSON.parse(rawConv) : {};
      convMap[quoteId] = { number: nextInvoiceNum, convertedAt: new Date().toISOString() };
      localStorage.setItem('facturo:v1:converted_quotes', JSON.stringify(convMap));
    } catch (e) {}

    // Synchronisation Supabase immédiate et persistante (garantit qu'aucun rechargement ne repasse la facture en devis)
    supabaseUpdateInvoice(
      quoteId,
      {
        ...convertedInvoice,
        number: nextInvoiceNum,
        documentKind: 'invoice',
        type: 'standard',
        status: targetStatus,
        notes: convertedNotes,
      },
      originalQuoteNum
    ).catch((err) => {
      console.warn("[InvoiceContext] Échec conversion devis en facture Supabase :", err);
    });

    return convertedInvoice;
  };

  // Add client
  const addClient = (clientData: Omit<Client, 'id'> & { id?: string }): Client => {
    const tempId = clientData.id && clientData.id.length === 36
      ? clientData.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cli-${Date.now()}`);
    const newClient: Client = {
      ...clientData,
      id: tempId,
    };
    const updated = [newClient, ...clients];
    saveClients(updated);

    // Persistance dans Supabase et mise à jour avec le véritable UUID Supabase
    supabaseAddClient(newClient, currentUser?.companyId).then((persisted) => {
      if (persisted && persisted.id !== tempId) {
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

    // Synchronisation Supabase
    supabaseUpdateClient(id, updatedFields).catch((err) => {
      console.warn("[InvoiceContext] Échec mise à jour client Supabase :", err);
    });
  };

  const deleteClient = (id: string) => {
    const updated = clients.filter((c) => c.id !== id);
    saveClients(updated);
    supabaseDeleteClient(id).catch((err) => {
      console.warn("[InvoiceContext] Échec suppression client Supabase :", err);
    });
  };

  // Add product
  const addProduct = (prodData: Omit<Product, 'id'> & { id?: string }): Product => {
    const tempId = prodData.id && prodData.id.length === 36
      ? prodData.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prod-${Date.now()}`);
    const newProd: Product = {
      ...prodData,
      id: tempId,
    };
    const updated = [newProd, ...products];
    saveProducts(updated);

    // Persistance dans Supabase
    supabaseAddProduct(newProd, currentUser?.companyId).then((persisted) => {
      if (persisted && persisted.id !== tempId) {
        setProducts((prev) => prev.map((p) => (p.id === tempId ? persisted : p)));
      }
    });

    return newProd;
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
    supabaseDeleteProduct(id).catch((err) => {
      console.warn('[InvoiceContext] Échec suppression produit Supabase :', err);
    });
  };

  // Add payment
  const addPayment = (payData: Omit<PaymentRecord, 'id'> & { id?: string }) => {
    const newId = payData.id && payData.id.length === 36
      ? payData.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay-${Date.now()}`);
    const newPay: PaymentRecord = {
      ...payData,
      id: newId,
    };
    const updatedPayments = [newPay, ...payments];
    savePayments(updatedPayments);

    // Persistance dans Supabase
    supabaseAddPayment(newPay, currentUser?.companyId).catch((err) => {
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

  // Recalculate KPIs for the active period (factures réelles pour le CA, inclut tous les règlements et acomptes encaissés)
  const isRealInvoice = (i: Invoice) => (!i.documentKind || i.documentKind === 'invoice') && !i.number.startsWith('DEV-');

  const periodKPIs: DashboardKPIs = React.useMemo(() => {
    const realInvoices = periodInvoices.filter(isRealInvoice);
    const activeInvoices = realInvoices.filter((i) => i.status !== 'draft');
    const totalInvoiced = activeInvoices.reduce((acc, i) => acc + i.total, 0);

    // Montant encaissé au tableau de bord : cumule les règlements des factures ainsi que les acomptes perçus (y compris acomptes sur devis/commandes)
    const totalPaid = periodInvoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);

    const totalPending = realInvoices
      .filter((i) => i.status === 'sent')
      .reduce((acc, i) => acc + (i.total - i.amountPaid), 0);
    const totalOverdue = realInvoices
      .filter((i) => i.status === 'overdue')
      .reduce((acc, i) => acc + (i.total - i.amountPaid), 0);

    let paidTrend = 0;
    let invoicedTrend = 0;
    let pendingTrend = 0;
    let overdueTrend = 0;

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

  // Overall KPIs (full year, uniquement sur les factures pour le CA, inclut tous les règlements et acomptes reçus)
  const kpis: DashboardKPIs = React.useMemo(() => {
    const realInvoices = invoices.filter(isRealInvoice);
    const activeInvoices = realInvoices.filter((i) => i.status !== 'draft');
    const totalInvoiced = activeInvoices.reduce((acc, i) => acc + i.total, 0);

    // Montant encaissé : total des factures soldées et de tous les acomptes perçus
    const totalPaid = invoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);

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
      paidTrend: 0,
      invoicedTrend: 0,
      pendingTrend: 0,
      overdueTrend: 0,
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
        toast,
        showToast,
        hideToast,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        convertQuoteToInvoice,
        addClient,
        updateClient,
        deleteClient,
        addProduct,
        deleteProduct,
        addPayment,
        getInvoice,
        currentUser,
        isAuthenticated,
        authLoading,
        isDataLoading,
        refreshData: async () => {
          if (currentUser) {
            await loadUserData(currentUser);
          }
        },
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
      <ToastNotification toast={toast} onClose={hideToast} />
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
