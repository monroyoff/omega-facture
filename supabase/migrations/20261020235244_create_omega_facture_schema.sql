-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. COMPANIES (Profil Entreprise Émettrice)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL DEFAULT 'MONROY Business Solutions',
    ifu TEXT DEFAULT '0202110485960',
    rccm TEXT DEFAULT 'RB/COT/21 B 1042',
    email TEXT DEFAULT 'contact@monroy-solutions.com',
    phone TEXT DEFAULT '+229 01 95 44 44 30',
    address TEXT DEFAULT 'Allada, République du Bénin',
    city TEXT DEFAULT 'Allada',
    country TEXT DEFAULT 'Bénin',
    currency TEXT NOT NULL DEFAULT 'XOF',
    default_vat NUMERIC NOT NULL DEFAULT 18,
    invoice_prefix TEXT NOT NULL DEFAULT 'FAC',
    payment_terms INTEGER NOT NULL DEFAULT 15,
    momo_number TEXT DEFAULT '+229 01 95 44 44 30',
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CLIENTS (Carnet d'adresses clients)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    country TEXT DEFAULT 'Bénin',
    tax_id TEXT, -- IFU / NCC / NINEA
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PRODUCTS (Catalogue Produits & Prestations)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price BIGINT NOT NULL DEFAULT 0, -- Montant FCFA entier
    vat_rate NUMERIC NOT NULL DEFAULT 18,
    unit TEXT NOT NULL DEFAULT 'prestation',
    category TEXT NOT NULL DEFAULT 'Prestations',
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. INVOICES (Factures & Devis)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT,
    invoice_number TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'standard', -- standard, split, recurring
    status TEXT NOT NULL DEFAULT 'draft',  -- draft, sent, paid, overdue
    currency TEXT NOT NULL DEFAULT 'XOF',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal BIGINT NOT NULL DEFAULT 0,
    discount BIGINT NOT NULL DEFAULT 0,
    vat_amount BIGINT NOT NULL DEFAULT 0,
    total BIGINT NOT NULL DEFAULT 0,
    amount_paid BIGINT NOT NULL DEFAULT 0,
    notes TEXT,
    recurrence_config JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index unique sur numéro de facture par entreprise
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number_company 
ON public.invoices(company_id, invoice_number);

-- 5. INVOICE ITEMS (Lignes d'articles de facture)
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price BIGINT NOT NULL DEFAULT 0,
    discount_pct NUMERIC NOT NULL DEFAULT 0,
    vat_rate NUMERIC NOT NULL DEFAULT 18,
    total BIGINT NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. INVOICE INSTALLMENTS (Échéanciers d'acomptes)
CREATE TABLE IF NOT EXISTS public.invoice_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    percentage NUMERIC NOT NULL,
    amount BIGINT NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, paid
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. PAYMENTS (Règlements & Encaissements)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    method TEXT NOT NULL DEFAULT 'mobile_money', -- mobile_money, bank_transfer, cash, check
    reference TEXT,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

