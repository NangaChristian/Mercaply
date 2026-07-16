-- 1. Ajout des colonnes manquantes à la table `stores`
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
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS logo text,
ADD COLUMN IF NOT EXISTS banner text,
ADD COLUMN IF NOT EXISTS "ownerId" uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS "totalSales" numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isVerified" boolean DEFAULT false;

-- 2. Création de la table pour les catégories dynamiques
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  icon_url text,
  type text NOT NULL CHECK (type IN ('product', 'service')),
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Politiques de sécurité (RLS) pour categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone." ON public.categories;
CREATE POLICY "Categories are viewable by everyone." 
  ON public.categories FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories." ON public.categories;
CREATE POLICY "Admins can manage categories." 
  ON public.categories FOR ALL 
  USING (auth.role() = 'authenticated');
