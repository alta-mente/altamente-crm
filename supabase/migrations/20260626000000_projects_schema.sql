-- 1. Tabella delle Fasi dei Progetti (Project Phases)
CREATE TABLE IF NOT EXISTS public.project_phases (
    id text PRIMARY KEY,
    title text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Popolamento delle fasi di default per i progetti
INSERT INTO public.project_phases (id, title, sort_order) VALUES
    ('briefing', 'Briefing / Setup', 0),
    ('design', 'Design / Creatività', 1),
    ('development', 'Sviluppo / Esecuzione', 2),
    ('review', 'Revisione Cliente', 3),
    ('live', 'Pubblicato / Consegnato', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. Tabella Progetti (Projects)
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
    deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL,
    phase_id text REFERENCES public.project_phases(id) ON DELETE SET NULL DEFAULT 'briefing',
    
    -- Risorse e Link
    drive_url text,
    figma_url text,
    github_url text,
    
    -- Amministrazione
    billing_type text DEFAULT 'one-off' CHECK (billing_type IN ('one-off', 'retainer_monthly', 'retainer_yearly')),
    billing_amount numeric DEFAULT 0,
    billing_status text DEFAULT 'to_invoice' CHECK (billing_status IN ('to_invoice', 'invoiced', 'paid', 'late')),
    
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sicurezza: Abilita Row Level Security (RLS)
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy di base: gli utenti autenticati possono leggere e scrivere tutto
CREATE POLICY "Allow authenticated users full access to project_phases" ON public.project_phases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger per l'aggiornamento automatico della data di modifica
CREATE TRIGGER update_projects_modtime
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
