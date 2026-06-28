-- 1. Aggiungere le colonne alla tabella projects
ALTER TABLE public.projects
ADD COLUMN time_tracking_enabled boolean DEFAULT false,
ADD COLUMN prepaid_minutes integer DEFAULT 0,
ADD COLUMN hourly_rate numeric DEFAULT 0,
ADD COLUMN report_token text;

-- 2. Aggiungere project_id alla tabella company_hours (che rimarrà con questo nome per ora)
ALTER TABLE public.company_hours
ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- 3. Data Migration: creare "Progetto Generale" per le aziende con time tracking attivo
DO $$
DECLARE
    company_record RECORD;
    new_project_id uuid;
BEGIN
    FOR company_record IN 
        SELECT id, name, prepaid_minutes, hourly_rate, time_tracking_enabled, report_token
        FROM public.companies 
        WHERE time_tracking_enabled = true OR id IN (SELECT DISTINCT company_id FROM public.company_hours)
    LOOP
        -- Crea un "Progetto Generale" per l'azienda ereditando le sue impostazioni
        INSERT INTO public.projects (
            title, 
            company_id, 
            phase_id, 
            billing_type, 
            time_tracking_enabled, 
            prepaid_minutes, 
            hourly_rate, 
            report_token
        ) VALUES (
            'Progetto Generale (' || company_record.name || ')',
            company_record.id,
            'briefing',
            CASE WHEN company_record.prepaid_minutes > 0 THEN 'retainer_monthly' ELSE 'one-off' END,
            COALESCE(company_record.time_tracking_enabled, true),
            COALESCE(company_record.prepaid_minutes, 0),
            COALESCE(company_record.hourly_rate, 0),
            company_record.report_token
        ) RETURNING id INTO new_project_id;

        -- Aggiorna tutte le ore associate a questa azienda con il nuovo project_id
        UPDATE public.company_hours
        SET project_id = new_project_id
        WHERE company_id = company_record.id;
    END LOOP;
END $$;

-- 4. Rendere project_id obbligatorio
ALTER TABLE public.company_hours
ALTER COLUMN project_id SET NOT NULL;

-- 5. Rimuovere le vecchie colonne dalla tabella companies (Attenzione: azione distruttiva sicura perché abbiamo migrato)
ALTER TABLE public.companies
DROP COLUMN time_tracking_enabled,
DROP COLUMN prepaid_minutes,
DROP COLUMN hourly_rate,
DROP COLUMN report_token;
