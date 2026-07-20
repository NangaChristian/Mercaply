-- 1. Admin User Management Dashboard
-- Update profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;

-- Role enum is already text, we assume it can be 'admin', 'seller', 'buyer'.

-- RLS for admin user management
-- Only allow admin to update other users' roles, status, and is_banned.
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Admin-Controlled Commission System
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id integer PRIMARY KEY DEFAULT 1,
  commission_percentage numeric(5,2) DEFAULT 5.0
);
-- Ensure only one row
ALTER TABLE public.admin_settings ADD CONSTRAINT admin_settings_single_row CHECK (id = 1);

-- Insert default setting
INSERT INTO public.admin_settings (id, commission_percentage) VALUES (1, 5.0) ON CONFLICT (id) DO NOTHING;

-- RLS for admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read admin_settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Only admin can update admin_settings" ON public.admin_settings FOR UPDATE USING (is_admin());

-- Update orders table for commission and Fapshi
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS commission_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS seller_earnings numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS fapshi_trans_id text;

