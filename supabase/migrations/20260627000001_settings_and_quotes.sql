-- 1. Aggiunta colonna per il testo del preventivo in Deals
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS quote_description text;

-- 2. Creazione Tabella Impostazioni (Workspace Settings)
CREATE TABLE IF NOT EXISTS public.workspace_settings (
    id integer PRIMARY KEY DEFAULT 1,
    company_name text NOT NULL DEFAULT 'Il Tuo Nome / Freelance',
    vat_number text,
    address text,
    email text,
    logo_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sicurezza Impostazioni
ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users full access to workspace_settings" ON public.workspace_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Inseriamo una riga di default (se non esiste)
INSERT INTO public.workspace_settings (id, company_name, vat_number, address, email)
VALUES (1, 'Nome Azienda', 'IT12345678901', 'Via Roma 1', 'hello@iltuosito.com')
ON CONFLICT (id) DO NOTHING;

-- Trigger per l'aggiornamento automatico della data di modifica
CREATE TRIGGER update_workspace_settings_modtime
    BEFORE UPDATE ON public.workspace_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 3. Creazione Bucket di Storage per il Logo
-- Creiamo un bucket pubblico chiamato 'assets'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy di sicurezza per il bucket 'assets' (chiunque può leggere, gli autenticati possono scrivere)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'assets' );

CREATE POLICY "Authenticated Users can upload" 
ON storage.objects FOR INSERT 
TO authenticated WITH CHECK ( bucket_id = 'assets' );

CREATE POLICY "Authenticated Users can update" 
ON storage.objects FOR UPDATE 
TO authenticated USING ( bucket_id = 'assets' );

CREATE POLICY "Authenticated Users can delete" 
ON storage.objects FOR DELETE 
TO authenticated USING ( bucket_id = 'assets' );
