-- 1. Modify companies table
ALTER TABLE public.companies
ADD COLUMN time_tracking_enabled boolean DEFAULT false,
ADD COLUMN contact_email text,
ADD COLUMN prepaid_minutes integer DEFAULT 0,
ADD COLUMN hourly_rate numeric DEFAULT 0,
ADD COLUMN report_token text,
ADD COLUMN wp_id integer;

-- 2. Create company_hours table
CREATE TABLE IF NOT EXISTS public.company_hours (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    description text NOT NULL,
    minutes integer NOT NULL,
    billed boolean DEFAULT false NOT NULL,
    batch_id text DEFAULT '' NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for querying hours by company quickly
CREATE INDEX IF NOT EXISTS idx_company_hours_company_id ON public.company_hours(company_id);
-- Index for querying unbilled hours quickly
CREATE INDEX IF NOT EXISTS idx_company_hours_billed_company ON public.company_hours(billed, company_id);

-- 3. Security (RLS)
ALTER TABLE public.company_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to company_hours" 
ON public.company_hours 
FOR ALL TO authenticated 
USING (true) WITH CHECK (true);
