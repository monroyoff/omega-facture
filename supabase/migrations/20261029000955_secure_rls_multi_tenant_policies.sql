-- ==============================================================================
-- Migration : 20261029000955_secure_rls_multi_tenant_policies.sql
-- Description : Verrouillage strict de la sécurité RLS (Row Level Security)
--               Multi-tenant étanche par propriétaire (auth.uid) sur toutes les tables
-- ==============================================================================

-- 1. Nettoyer les éventuelles lignes orphelines de test sans user_id
DELETE FROM public.companies WHERE user_id IS NULL;

-- 2. Supprimer les anciennes politiques permissives de développement
DROP POLICY IF EXISTS "Allow all access to companies" ON public.companies;
DROP POLICY IF EXISTS "Allow all access to clients" ON public.clients;
DROP POLICY IF EXISTS "Allow all access to products" ON public.products;
DROP POLICY IF EXISTS "Allow all access to invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow all access to invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow all access to invoice_installments" ON public.invoice_installments;
DROP POLICY IF EXISTS "Allow all access to payments" ON public.payments;

-- 3. Activation formelle de Row Level Security sur 100% des tables exposées
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 4. Index de performance sur les clés étrangères pour accélérer les vérifications RLS
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_company_id ON public.payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_installments_invoice_id ON public.invoice_installments(invoice_id);

-- 5. Politiques RLS strictes et étanches par propriétaire (multi-tenant isolé)

-- A. Table: companies (accessible uniquement par l'utilisateur propriétaire authentifié)
CREATE POLICY "companies_manage_own" ON public.companies
    FOR ALL
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- B. Table: clients (accessible uniquement si l'entreprise appartient à l'utilisateur)
CREATE POLICY "clients_manage_own" ON public.clients
    FOR ALL
    TO authenticated
    USING (company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid())));

-- C. Table: products (accessible uniquement si l'entreprise appartient à l'utilisateur)
CREATE POLICY "products_manage_own" ON public.products
    FOR ALL
    TO authenticated
    USING (company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid())));

-- D. Table: invoices (accessible uniquement si l'entreprise appartient à l'utilisateur)
CREATE POLICY "invoices_manage_own" ON public.invoices
    FOR ALL
    TO authenticated
    USING (company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid())));

-- E. Table: invoice_items (accessible uniquement si la facture appartient à l'utilisateur)
CREATE POLICY "invoice_items_manage_own" ON public.invoice_items
    FOR ALL
    TO authenticated
    USING (invoice_id IN (
        SELECT id FROM public.invoices 
        WHERE company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid()))
    ))
    WITH CHECK (invoice_id IN (
        SELECT id FROM public.invoices 
        WHERE company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid()))
    ));

-- F. Table: invoice_installments (accessible uniquement si la facture appartient à l'utilisateur)
CREATE POLICY "invoice_installments_manage_own" ON public.invoice_installments
    FOR ALL
    TO authenticated
    USING (invoice_id IN (
        SELECT id FROM public.invoices 
        WHERE company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid()))
    ))
    WITH CHECK (invoice_id IN (
        SELECT id FROM public.invoices 
        WHERE company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid()))
    ));

-- G. Table: payments (accessible uniquement si l'entreprise appartient à l'utilisateur)
CREATE POLICY "payments_manage_own" ON public.payments
    FOR ALL
    TO authenticated
    USING (company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid())))
    WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = (SELECT auth.uid())));

-- 6. Sécurisation des fonctions contre les invocations RPC non autorisées
ALTER FUNCTION public.auto_confirm_user() SET search_path = public, auth;
REVOKE EXECUTE ON FUNCTION public.auto_confirm_user() FROM public, anon, authenticated;

ALTER FUNCTION public.rls_auto_enable() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.fn_sync_invoice_payments()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_paid BIGINT;
    v_invoice_total BIGINT;
    v_invoice_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_invoice_id := OLD.invoice_id;
    ELSE
        v_invoice_id := NEW.invoice_id;
    END IF;

    IF v_invoice_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Calculate total paid for this invoice
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM public.payments
    WHERE invoice_id = v_invoice_id;

    -- Fetch invoice total
    SELECT total INTO v_invoice_total
    FROM public.invoices
    WHERE id = v_invoice_id;

    IF v_invoice_total IS NOT NULL THEN
        -- Update invoice
        UPDATE public.invoices
        SET amount_paid = v_total_paid,
            status = CASE 
                WHEN v_total_paid >= v_invoice_total THEN 'paid'
                WHEN due_date < CURRENT_DATE AND v_total_paid < v_invoice_total THEN 'overdue'
                ELSE status
            END,
            updated_at = now()
        WHERE id = v_invoice_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.fn_sync_invoice_payments() FROM public, anon, authenticated;

