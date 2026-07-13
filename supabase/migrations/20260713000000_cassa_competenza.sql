-- Aggiunta invoice_id a company_hours per collegare ore fatturate a fatture
ALTER TABLE public.company_hours 
ADD COLUMN invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL;

-- Aggiunta always_send_report a projects
ALTER TABLE public.projects 
ADD COLUMN always_send_report boolean DEFAULT false;
