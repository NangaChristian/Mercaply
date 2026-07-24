const fs = require('fs');

const sql = `
-- ==============================================================================
-- VISUALIZ ENTERPRISE ARCHITECTURE MIGRATION
-- V4 - FULL ENTERPRISE MARKETPLACE SCHEMA
-- Author: Principal Database Architect
-- Purpose: Non-destructive enterprise upgrade
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- 2. ENUMS
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin', 'support', 'accountant', 'moderator', 'super_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE kyc_status AS ENUM ('pending', 'under_review', 'additional_docs_required', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pending', 'payment_pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'disputed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'payment', 'refund', 'commission', 'payout'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE quote_status AS ENUM ('draft', 'pending', 'accepted', 'rejected', 'expired'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system', 'quote'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. CORE TABLES (NON-DESTRUCTIVE)

-- Reference Tables
CREATE TABLE IF NOT EXISTS public.countries (
    iso2 CHAR(2) PRIMARY KEY,
    name TEXT NOT NULL,
    currency_code CHAR(3) NOT NULL,
    dial_code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_iso2 CHAR(2) REFERENCES public.countries(iso2),
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES public.regions(id),
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.currencies (
    code CHAR(3) PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    exchange_rate NUMERIC(10,4) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.languages (
    code CHAR(2) PRIMARY KEY,
    name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Profiles (Add missing columns)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS language_code CHAR(2) REFERENCES public.languages(code),
ADD COLUMN IF NOT EXISTS country_iso2 CHAR(2) REFERENCES public.countries(iso2),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Companies & KYC
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id),
    legal_name TEXT NOT NULL,
    trading_name TEXT,
    registration_number TEXT,
    tax_id TEXT,
    incorporation_date DATE,
    address_line1 TEXT,
    address_line2 TEXT,
    city_id UUID REFERENCES public.cities(id),
    country_iso2 CHAR(2) REFERENCES public.countries(iso2),
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    banner_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    rating NUMERIC(3,2) DEFAULT 0.00,
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.kyc_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    status kyc_status DEFAULT 'pending',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.kyc_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kyc_request_id UUID NOT NULL REFERENCES public.kyc_requests(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    comments TEXT,
    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catalog: Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catalog: Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    subcategory_id UUID REFERENCES public.subcategories(id),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(12,2) NOT NULL,
    currency_code CHAR(3) DEFAULT 'XAF' REFERENCES public.currencies(code),
    min_order_quantity INTEGER DEFAULT 1,
    unit TEXT,
    is_active BOOLEAN DEFAULT true,
    is_digital BOOLEAN DEFAULT false,
    weight NUMERIC(10,2),
    dimensions JSONB,
    tags TEXT[],
    views INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (setweight(to_tsvector('french', coalesce(title, '')), 'A') || setweight(to_tsvector('french', coalesce(description, '')), 'B')) STORED
);

CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    attributes JSONB NOT NULL,
    price_adjustment NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_inventory (
    variant_id UUID PRIMARY KEY REFERENCES public.product_variants(id) ON DELETE CASCADE,
    stock_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    tier_name TEXT,
    min_quantity INTEGER NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catalog: Services
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    subcategory_id UUID REFERENCES public.subcategories(id),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(12,2) NOT NULL,
    price_type TEXT NOT NULL,
    currency_code CHAR(3) DEFAULT 'XAF' REFERENCES public.currencies(code),
    delivery_time TEXT,
    is_active BOOLEAN DEFAULT true,
    tags TEXT[],
    views INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (setweight(to_tsvector('french', coalesce(title, '')), 'A') || setweight(to_tsvector('french', coalesce(description, '')), 'B')) STORED
);

CREATE TABLE IF NOT EXISTS public.service_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    delivery_time_days INTEGER,
    revisions INTEGER,
    features JSONB,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id),
    company_id UUID NOT NULL REFERENCES public.companies(id),
    service_id UUID REFERENCES public.services(id),
    product_id UUID REFERENCES public.products(id),
    status quote_status DEFAULT 'pending',
    original_request TEXT NOT NULL,
    offered_price NUMERIC(12,2),
    currency_code CHAR(3) DEFAULT 'XAF',
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quote_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    message TEXT NOT NULL,
    attachments JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders & Payments
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id),
    company_id UUID NOT NULL REFERENCES public.companies(id),
    status order_status DEFAULT 'pending',
    total_amount NUMERIC(12,2) NOT NULL,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    shipping_amount NUMERIC(12,2) DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    commission_amount NUMERIC(12,2) DEFAULT 0,
    currency_code CHAR(3) DEFAULT 'XAF' REFERENCES public.currencies(code),
    shipping_address JSONB,
    billing_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    service_id UUID REFERENCES public.services(id),
    variant_id UUID REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id),
    balance NUMERIC(12,2) DEFAULT 0.00,
    currency_code CHAR(3) DEFAULT 'XAF' REFERENCES public.currencies(code),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id),
    order_id UUID REFERENCES public.orders(id),
    type transaction_type NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    fee NUMERIC(12,2) DEFAULT 0,
    net_amount NUMERIC(12,2) NOT NULL,
    status payment_status DEFAULT 'pending',
    reference TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    transaction_id UUID REFERENCES public.transactions(id),
    provider TEXT NOT NULL,
    provider_transaction_id TEXT,
    amount NUMERIC(12,2) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    status payment_status DEFAULT 'pending',
    payment_method JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id),
    amount NUMERIC(12,2) NOT NULL,
    bank_account_info JSONB NOT NULL,
    status payment_status DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social & Interactions
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id),
    product_id UUID REFERENCES public.products(id),
    service_id UUID REFERENCES public.services(id),
    company_id UUID REFERENCES public.companies(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    images TEXT[],
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE NULLS NOT DISTINCT (user_id, product_id, service_id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    is_group BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    type message_type DEFAULT 'text',
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support & Content
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status ticket_status DEFAULT 'open',
    priority ticket_priority DEFAULT 'medium',
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    message TEXT NOT NULL,
    attachments TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id),
    target_type TEXT NOT NULL, -- 'user', 'product', 'company'
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status ticket_status DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.cms_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    position TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics & Logs
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_data JSONB,
    page_url TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    search_term TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. INDEXES & PERFORMANCE
-- ==============================================================================

-- B-Tree Indexes for Foreign Keys
CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_company ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_services_company ON public.services(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_company ON public.orders(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);

-- GIN Indexes for Full Text Search
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_services_search ON public.services USING GIN (search_vector);

-- GIN Indexes for JSONB
CREATE INDEX IF NOT EXISTS idx_product_variants_attributes ON public.product_variants USING GIN (attributes);
CREATE INDEX IF NOT EXISTS idx_analytics_events_data ON public.analytics_events USING GIN (event_data);

-- ==============================================================================
-- 5. STORAGE BUCKETS
-- ==============================================================================
-- Note: Supabase storage buckets require calling storage.create_bucket().
-- We'll create them safely.

INSERT INTO storage.buckets (id, name, public) VALUES 
  ('public-products', 'public-products', true),
  ('public-services', 'public-services', true),
  ('avatars', 'avatars', true),
  ('company-logos', 'company-logos', true),
  ('company-banners', 'company-banners', true),
  ('kyc-private', 'kyc-private', false),
  ('messages-files', 'messages-files', false),
  ('invoices', 'invoices', false),
  ('exports', 'exports', false),
  ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 6. TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Audit Logging Function
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (action, table_name, record_id, new_data)
        VALUES ('INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (action, table_name, record_id, old_data, new_data)
        VALUES ('UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (action, table_name, record_id, old_data)
        VALUES ('DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for sensitive tables
DO $$ BEGIN
    CREATE TRIGGER audit_companies AFTER INSERT OR UPDATE OR DELETE ON public.companies FOR EACH ROW EXECUTE FUNCTION log_audit_event();
    CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON public.orders FOR EACH ROW EXECUTE FUNCTION log_audit_event();
    CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON public.transactions FOR EACH ROW EXECUTE FUNCTION log_audit_event();
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view verified companies" ON public.companies FOR SELECT USING (is_verified = true);
CREATE POLICY "Owners can manage their companies" ON public.companies FOR ALL USING (auth.uid() = owner_id);

ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view their KYC" ON public.kyc_requests FOR SELECT USING (EXISTS (SELECT 1 FROM public.companies WHERE companies.id = kyc_requests.company_id AND companies.owner_id = auth.uid()));
CREATE POLICY "Owners can create KYC" ON public.kyc_requests FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.companies WHERE companies.id = kyc_requests.company_id AND companies.owner_id = auth.uid()));

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage their products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.companies WHERE companies.id = products.company_id AND companies.owner_id = auth.uid()));

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers can view their orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can view their orders" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.companies WHERE companies.id = orders.company_id AND companies.owner_id = auth.uid()));

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their wallets" ON public.wallets FOR SELECT USING (auth.uid() = owner_id);

-- System Admin bypass
CREATE POLICY "Admins bypass RLS" ON public.companies FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ==============================================================================
-- 8. MATERIALIZED VIEWS & VIEWS
-- ==============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.sales_analytics_mat_view AS
SELECT 
    company_id,
    DATE_TRUNC('month', created_at) AS month,
    SUM(total_amount) as total_sales,
    COUNT(id) as total_orders
FROM public.orders
WHERE status IN ('delivered', 'completed', 'shipped')
GROUP BY company_id, DATE_TRUNC('month', created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_analytics_mat_view ON public.sales_analytics_mat_view(company_id, month);

-- End of Migration
`;

fs.writeFileSync('supabase/migrations/00004_enterprise_architecture.sql', sql);
console.log('Migration generated successfully.');
