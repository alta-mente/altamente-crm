-- 1. Modulo Scadenze (Services)
CREATE TABLE IF NOT EXISTS public.services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    service_type text NOT NULL, -- es. 'domain', 'hosting', 'tool', 'other'
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
    cost numeric DEFAULT 0,
    expiry_date date NOT NULL,
    status text DEFAULT 'active', -- active, expired, cancelled
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users full access to services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Tipi di Progetto
CREATE TABLE IF NOT EXISTS public.project_types (
    id text PRIMARY KEY,
    name text NOT NULL,
    sort_order integer DEFAULT 0
);

INSERT INTO public.project_types (id, name, sort_order) VALUES
    ('web', 'Siti Web / eCommerce', 0),
    ('social', 'Social Media / ADV', 1),
    ('brand', 'Branding & Design', 2)
ON CONFLICT (id) DO NOTHING;

-- Aggiorniamo le fasi esistenti (project_phases)
-- Aggiungiamo la colonna project_type_id
ALTER TABLE public.project_phases ADD COLUMN IF NOT EXISTS project_type_id text REFERENCES public.project_types(id) ON DELETE CASCADE;

-- Aggiorniamo le fasi vecchie per assegnarle al tipo 'web'
UPDATE public.project_phases SET project_type_id = 'web' WHERE project_type_id IS NULL;

-- Inseriamo fasi specifiche per le altre tipologie
INSERT INTO public.project_phases (id, title, sort_order, project_type_id) VALUES
    -- Social
    ('social_strategy', 'Strategia & Piano', 0, 'social'),
    ('social_creation', 'Creazione Asset', 1, 'social'),
    ('social_review', 'Approvazione Cliente', 2, 'social'),
    ('social_live', 'Programmabile / Live', 3, 'social'),
    -- Brand
    ('brand_research', 'Ricerca & Concept', 0, 'brand'),
    ('brand_design', 'Design', 1, 'brand'),
    ('brand_guidelines', 'Linee Guida', 2, 'brand'),
    ('brand_delivery', 'Consegnato', 3, 'brand')
ON CONFLICT (id) DO NOTHING;

-- Aggiungiamo type_id ai progetti
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS type_id text REFERENCES public.project_types(id) ON DELETE SET NULL;
-- Impostiamo un default per i progetti vecchi
UPDATE public.projects SET type_id = 'web' WHERE type_id IS NULL;
