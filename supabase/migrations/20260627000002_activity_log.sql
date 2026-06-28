-- Migration per la tabella activity_logs (Diario di Bordo)

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- Ensure a log belongs to exactly one entity (either deal or project)
    CONSTRAINT log_belongs_to_one CHECK (
        (deal_id IS NOT NULL AND project_id IS NULL) OR
        (deal_id IS NULL AND project_id IS NOT NULL)
    )
);

-- RLS Policies
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" 
ON public.activity_logs 
FOR ALL 
TO authenticated 
USING (true);
