CREATE TABLE IF NOT EXISTS public.api_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text UNIQUE NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admin can manage integrations" ON public.api_integrations FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

INSERT INTO public.api_integrations (provider, config, is_active) 
VALUES 
('fapshi', '{"apiUser": "", "apiKey": "", "baseUrl": "https://sandbox.fapshi.com"}'::jsonb, false),
('smtp', '{"host": "smtp.hostinger.com", "port": 465, "secure": true, "user": "", "pass": "", "from": "contact@mercaply.com"}'::jsonb, false)
ON CONFLICT (provider) DO NOTHING;
