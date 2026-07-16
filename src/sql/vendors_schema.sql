-- 1. Ajout de nouvelles colonnes à la table `stores` existante
-- Si vous utilisez `stores` pour représenter les vendeurs/entreprises.
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS cover_image text,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS region text;

-- 2. Création de la table pour le Portfolio des vendeurs
CREATE TABLE IF NOT EXISTS public.store_portfolios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_store_portfolios_store_id ON public.store_portfolios(store_id);

-- Politiques de sécurité (RLS) pour store_portfolios
ALTER TABLE public.store_portfolios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Portfolios are viewable by everyone." ON public.store_portfolios;
CREATE POLICY "Portfolios are viewable by everyone." 
  ON public.store_portfolios FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Store owners can insert their own portfolios." ON public.store_portfolios;
CREATE POLICY "Store owners can insert their own portfolios." 
  ON public.store_portfolios FOR INSERT 
  WITH CHECK (
    store_id = auth.uid()
  );

DROP POLICY IF EXISTS "Store owners can update their own portfolios." ON public.store_portfolios;
CREATE POLICY "Store owners can update their own portfolios." 
  ON public.store_portfolios FOR UPDATE 
  USING (
    store_id = auth.uid()
  );

DROP POLICY IF EXISTS "Store owners can delete their own portfolios." ON public.store_portfolios;
CREATE POLICY "Store owners can delete their own portfolios." 
  ON public.store_portfolios FOR DELETE 
  USING (
    store_id = auth.uid()
  );
