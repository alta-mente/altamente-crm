-- Creazione delle tabelle principali per Altamente CRM

-- 1. Tabella delle Fasi (Sales Phases)
CREATE TABLE IF NOT EXISTS public.phases (
    id text PRIMARY KEY,
    title text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Popolamento delle fasi base
INSERT INTO public.phases (id, title, sort_order) VALUES
    ('unassigned', 'Nuovi', 0),
    ('contacted', 'Contattati', 1),
    ('meeting', 'Incontro', 2),
    ('proposal', 'Proposta Inviata', 3),
    ('negotiation', 'Trattativa', 4),
    ('won', 'Vinto', 5),
    ('lost', 'Perso', 6)
ON CONFLICT (id) DO NOTHING;

-- 2. Tabella Aziende
CREATE TABLE IF NOT EXISTS public.companies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    vat_number text,
    address text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabella Contatti
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabella Deal (Opportunità)
CREATE TABLE IF NOT EXISTS public.deals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
    contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
    course text,
    value numeric DEFAULT 0,
    source text DEFAULT 'web' CHECK (source IN ('corsidia', 'web', 'piuitalia')),
    phase_id text REFERENCES public.phases(id) ON DELETE SET NULL DEFAULT 'unassigned',
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Collegamento agli utenti auth di Supabase
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabella Appuntamenti
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE,
    title text NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sicurezza: Abilita Row Level Security (RLS)
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policy di base: gli utenti autenticati possono leggere e scrivere tutto per ora
-- (In un ambiente di produzione andrebbe ristretto a assigned_to)
CREATE POLICY "Allow authenticated users full access to phases" ON public.phases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to companies" ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to contacts" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to deals" ON public.deals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to appointments" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Funzione per aggiornare automaticamente l'updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deals_modtime
    BEFORE UPDATE ON public.deals
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
