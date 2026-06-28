-- MIGRATION SCRIPT GENERATO AUTOMATICAMENTE
DO $$
DECLARE
    cid uuid;
BEGIN

    -- Azienda: AV Consulting (WP ID: 10125)
    SELECT id INTO cid FROM public.companies WHERE name = 'AV Consulting' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('AV Consulting', true, 'valter.valenti@avconsulting.it', 0, 30, 10125)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'valter.valenti@avconsulting.it', prepaid_minutes = 0, hourly_rate = 30, wp_id = 10125 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2026-05-07', 'assistenza sito e email cumulativo di piu interventi nei giorni/settimane scorsi', 180, false, '');

    -- Azienda: Avvocato Valerio Martone (WP ID: 10099)
    SELECT id INTO cid FROM public.companies WHERE name = 'Avvocato Valerio Martone' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Avvocato Valerio Martone', false, '', 0, 0, 10099)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 10099 
        WHERE id = cid;
    END IF;

    -- Azienda: Az.Agr.Alessandri Bruno (WP ID: 10098)
    SELECT id INTO cid FROM public.companies WHERE name = 'Az.Agr.Alessandri Bruno' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Az.Agr.Alessandri Bruno', true, 'info@olioalessandri.it', 300, 0, 10098)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'info@olioalessandri.it', prepaid_minutes = 300, hourly_rate = 0, wp_id = 10098 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2026-04-23', 'avvio assitenza. apertura ticket con Shellrent per down del server e accesso al filemanager', 30, true, '20260508-1030'),
    (cid, '2026-05-04', 'assistenza a migrazione servizi da localweb a sherlerent', 30, true, '20260508-1030'),
    (cid, '2026-05-07', 'attività di trasferimento del sito da localweb a shelrent, risoluzione di problemi legati al tema JupiterX, ripristino funzionalità ecommerce (cumulativo di più giorni di intervento)', 360, true, '20260508-1030'),
    (cid, '2026-05-08', '(eccedenza già fatturata)', 0, true, '20260508-1030');

    -- Azienda: altamente.it (WP ID: 9873)
    SELECT id INTO cid FROM public.companies WHERE name = 'altamente.it' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('altamente.it', false, '', 0, 0, 9873)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 9873 
        WHERE id = cid;
    END IF;

    -- Azienda: Azienda Spadoni Marco (WP ID: 9645)
    SELECT id INTO cid FROM public.companies WHERE name = 'Azienda Spadoni Marco' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Azienda Spadoni Marco', false, '', 0, 0, 9645)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 9645 
        WHERE id = cid;
    END IF;

    -- Azienda: Francesco Guardato (WP ID: 9345)
    SELECT id INTO cid FROM public.companies WHERE name = 'Francesco Guardato' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Francesco Guardato', true, 'Francesco.guardato@gmail.com', 0, 40, 9345)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'Francesco.guardato@gmail.com', prepaid_minutes = 0, hourly_rate = 40, wp_id = 9345 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2026-01-02', 'prime modifiche richieste', 15, true, '20260123-1509'),
    (cid, '2026-01-02', 'prima bozza bozza pagina kids', 90, true, '20260123-1509'),
    (cid, '2026-01-09', 'avanzamento pagina kids', 75, true, '20260123-1509'),
    (cid, '2026-01-12', 'aggiornamento, versione mobile', 60, true, '20260123-1509'),
    (cid, '2026-01-13', 'aggiunta call to action', 30, true, '20260123-1513');

    -- Azienda: Larghetti & Partners (WP ID: 9157)
    SELECT id INTO cid FROM public.companies WHERE name = 'Larghetti & Partners' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Larghetti & Partners', false, '', 0, 0, 9157)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 9157 
        WHERE id = cid;
    END IF;

    -- Azienda: Aurales di Federico Benedetti (WP ID: 9154)
    SELECT id INTO cid FROM public.companies WHERE name = 'Aurales di Federico Benedetti' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Aurales di Federico Benedetti', false, '', 0, 0, 9154)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 9154 
        WHERE id = cid;
    END IF;

    -- Azienda: Fimal SRL (WP ID: 9149)
    SELECT id INTO cid FROM public.companies WHERE name = 'Fimal SRL' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Fimal SRL', false, '', 0, 0, 9149)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 9149 
        WHERE id = cid;
    END IF;

    -- Azienda: Area Immobiliare (WP ID: 7678)
    SELECT id INTO cid FROM public.companies WHERE name = 'Area Immobiliare' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Area Immobiliare', true, '', 900, 0, 7678)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = '', prepaid_minutes = 900, hourly_rate = 0, wp_id = 7678 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2022-07-05', 'eliminazione immobili e aggiornamenti + aggiunta 4 immobili', 90, false, ''),
    (cid, '2022-08-31', 'aggiornamenoto immobili', 60, false, ''),
    (cid, '2022-10-10', 'caricamento immobili', 90, false, ''),
    (cid, '2023-07-28', 'aggionamento prezzi ed eliminazione di tutti li annunci tranne 7', 90, false, ''),
    (cid, '2023-07-31', 'caricamento immobili', 210, false, ''),
    (cid, '2023-08-01', 'caricamento immobili', 30, false, ''),
    (cid, '2023-09-25', 'caricamento immobili', 60, false, ''),
    (cid, '2024-02-11', 'caricamento immobili', 135, false, ''),
    (cid, '2024-07-01', 'manutenzioine sito in down', 60, false, '');

    -- Azienda: Lucia Lucia (WP ID: 7669)
    SELECT id INTO cid FROM public.companies WHERE name = 'Lucia Lucia' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Lucia Lucia', false, '', 0, 0, 7669)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7669 
        WHERE id = cid;
    END IF;

    -- Azienda: altamente (WP ID: 7625)
    SELECT id INTO cid FROM public.companies WHERE name = 'altamente' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('altamente', true, 'arocchi@gmail.com', 0, 35, 7625)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'arocchi@gmail.com', prepaid_minutes = 0, hourly_rate = 35, wp_id = 7625 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2025-12-12', 'assistenza per connessione dagi usa', 60, false, ''),
    (cid, '2025-12-22', 'sacac', 30, false, '');

    -- Azienda: Aptisystem (WP ID: 7467)
    SELECT id INTO cid FROM public.companies WHERE name = 'Aptisystem' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Aptisystem', false, '', 0, 0, 7467)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7467 
        WHERE id = cid;
    END IF;

    -- Azienda: google (WP ID: 7307)
    SELECT id INTO cid FROM public.companies WHERE name = 'google' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('google', false, '', 0, 0, 7307)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7307 
        WHERE id = cid;
    END IF;

    -- Azienda: flli.mancini (WP ID: 7304)
    SELECT id INTO cid FROM public.companies WHERE name = 'flli.mancini' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('flli.mancini', false, '', 0, 0, 7304)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7304 
        WHERE id = cid;
    END IF;

    -- Azienda: Movis (WP ID: 7293)
    SELECT id INTO cid FROM public.companies WHERE name = 'Movis' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Movis', true, '', 0, 50, 7293)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = '', prepaid_minutes = 0, hourly_rate = 50, wp_id = 7293 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2023-02-04', 'caricamento post sito+fb cancer day', 60, true, '20251211-1916'),
    (cid, '2023-02-13', 'post facebook ospedale bellaria bologna', 30, true, '20251211-1916'),
    (cid, '2023-02-20', 'creazione profilo instagram e set up con pagina facebook', 120, true, '20251211-1916'),
    (cid, '2023-03-02', 'supporto Rita con CV e altro', 90, true, '20251211-1916'),
    (cid, '2023-03-13', 'post maratona su sito e fb e ig', 45, true, '20251211-1916'),
    (cid, '2023-04-06', '5mille su sito golden brain', 45, true, '20251211-1916'),
    (cid, '2023-04-20', 'pdf calendario eventi', 120, true, '20251211-1916'),
    (cid, '2023-05-15', 'creazione sistema gestione eventi 2023 su sito movis', 180, true, '20251211-1916'),
    (cid, '2023-06-16', 'modifiche varie locandina in vari giorni', 60, true, '20251211-1916'),
    (cid, '2023-06-06', 'creazione loccandina per jazz', 60, true, '20251211-1916'),
    (cid, '2023-06-26', 'modifiche varie sito movis e altro', 120, true, '20251211-1916'),
    (cid, '2023-07-24', 'aggiunta logo fab', 30, true, '20251211-1916'),
    (cid, '2023-07-27', 'locandina flamiania rosa e altro', 120, true, '20251211-1916'),
    (cid, '2023-07-31', 'locandina flamiania rosa e altro', 30, true, '20251211-1916'),
    (cid, '2023-08-23', 'varie flaminia rosa', 90, true, '20251211-1916'),
    (cid, '2023-09-25', 'varie flaminia rosa mese di settembre', 90, true, '20251211-1916'),
    (cid, '2023-10-06', 'locandina visite al palazzo ducale piu altro', 120, true, '20251211-1916'),
    (cid, '2023-10-17', 'sistema prenotazione visite  palzzo più altro vari giorni', 180, true, '20251211-1916'),
    (cid, '2023-11-20', 'locandina dieta mediterranea', 90, true, '20251211-1916'),
    (cid, '2024-03-22', 'pagina rita emili su movis', 30, true, '20251211-1916'),
    (cid, '2025-01-28', 'inserimenti eventi passati per elena', 90, false, ''),
    (cid, '2025-01-31', 'inserimenti eventi passati per elena', 75, false, ''),
    (cid, '2025-02-03', 'inserimenti eventi passati per elena', 45, false, ''),
    (cid, '2025-02-05', 'vari interventi tra movis e golden brain', 90, false, ''),
    (cid, '2025-02-05', 'caricmanto evento maratona rosa (vari giorni)', 180, false, '');

    -- Azienda: DISTRETTO RURALE RISO E RANE (WP ID: 7148)
    SELECT id INTO cid FROM public.companies WHERE name = 'DISTRETTO RURALE RISO E RANE' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('DISTRETTO RURALE RISO E RANE', false, '', 0, 0, 7148)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7148 
        WHERE id = cid;
    END IF;

    -- Azienda: The White Rose Guild Limited (WP ID: 7116)
    SELECT id INTO cid FROM public.companies WHERE name = 'The White Rose Guild Limited' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('The White Rose Guild Limited', true, '', 0, 35, 7116)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = '', prepaid_minutes = 0, hourly_rate = 35, wp_id = 7116 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2025-04-22', 'aggiornamenti vari', 30, true, '20251211-1039'),
    (cid, '2025-05-08', 'aggiornamenti vari', 30, true, '20251211-1039'),
    (cid, '2025-05-22', 'aggiornamenti vari', 30, true, '20251211-1039'),
    (cid, '2025-06-04', 'aggiornamenti vari e aggiornamento terms and cond', 60, true, '20251211-1039'),
    (cid, '2025-06-21', 'aggiornamenti', 30, true, '20251211-1039'),
    (cid, '2025-07-10', 'aggiornamenti', 30, true, '20251211-1039'),
    (cid, '2025-07-28', 'aggiornamenti', 45, true, '20251211-1039'),
    (cid, '2025-08-12', 'aggiornamenti vari', 30, true, '20260525-072428'),
    (cid, '2025-08-28', 'aggiornamenti vari', 15, true, '20260525-072428'),
    (cid, '2025-09-10', 'aggiornamenti vari', 45, true, '20260525-072428'),
    (cid, '2025-09-28', 'aggiornamenti vari', 30, true, '20260525-072428'),
    (cid, '2025-10-12', 'aggiornamenti vari', 30, true, '20260525-072428'),
    (cid, '2025-10-30', 'aggiornamenti vari', 45, true, '20260525-072428'),
    (cid, '2025-11-11', 'assistenza per connessione dagi usa', 75, true, '20260525-072428'),
    (cid, '2025-08-12', 'aggiornamenti vari', 30, true, '20260525-072428'),
    (cid, '2025-08-28', 'aggiornamenti vari', 15, true, '20260525-072428'),
    (cid, '2025-09-10', 'aggiornamenti vari', 45, true, '20260525-072428'),
    (cid, '2025-09-28', 'aggiornamenti vari', 30, true, '20260525-072428'),
    (cid, '2025-10-12', 'aggiornamenti vari', 30, true, '20260525-072428'),
    (cid, '2026-02-19', 'assistenza per recuproaccount mailchimp', 30, true, '20260525-072428'),
    (cid, '2025-12-01', 'maintenance', 45, true, '20260525-072428'),
    (cid, '2026-01-12', 'maintenance', 30, true, '20260525-072428'),
    (cid, '2026-02-09', 'maintenance', 30, true, '20260525-072428'),
    (cid, '2026-03-02', 'maintenance', 45, false, ''),
    (cid, '2026-03-25', 'maintenance', 30, false, ''),
    (cid, '2026-04-13', 'maintenance', 45, false, ''),
    (cid, '2026-05-04', 'maintenance', 30, false, ''),
    (cid, '2026-05-25', 'maintenance', 45, false, '');

    -- Azienda: TRASPORTI E SERVIZI AMBIENTALI PER L''IMPRESA S.R.L. (WP ID: 7118)
    SELECT id INTO cid FROM public.companies WHERE name = 'TRASPORTI E SERVIZI AMBIENTALI PER L''IMPRESA S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('TRASPORTI E SERVIZI AMBIENTALI PER L''IMPRESA S.R.L.', false, '', 0, 0, 7118)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7118 
        WHERE id = cid;
    END IF;

    -- Azienda: Università degli Studi di Urbino Carlo Bo (WP ID: 7120)
    SELECT id INTO cid FROM public.companies WHERE name = 'Università degli Studi di Urbino Carlo Bo' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Università degli Studi di Urbino Carlo Bo', false, '', 0, 0, 7120)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7120 
        WHERE id = cid;
    END IF;

    -- Azienda: VALENTINI GROUP PAPER SRL (WP ID: 7122)
    SELECT id INTO cid FROM public.companies WHERE name = 'VALENTINI GROUP PAPER SRL' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('VALENTINI GROUP PAPER SRL', false, '', 0, 0, 7122)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7122 
        WHERE id = cid;
    END IF;

    -- Azienda: VHosting Solution s.r.l. (WP ID: 7124)
    SELECT id INTO cid FROM public.companies WHERE name = 'VHosting Solution s.r.l.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('VHosting Solution s.r.l.', false, '', 0, 0, 7124)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7124 
        WHERE id = cid;
    END IF;

    -- Azienda: VOCALSOUND DI PALAZZI GABRIELE (WP ID: 7125)
    SELECT id INTO cid FROM public.companies WHERE name = 'VOCALSOUND DI PALAZZI GABRIELE' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('VOCALSOUND DI PALAZZI GABRIELE', true, 'info@vocalsound.it', 600, 0, 7125)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'info@vocalsound.it', prepaid_minutes = 600, hourly_rate = 0, wp_id = 7125 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2024-05-27', 'primi interventi id manutenzione richiesti da Martina', 45, true, '20260203-1015'),
    (cid, '2024-05-28', 'assitenza varia', 30, true, '20260203-1015'),
    (cid, '2024-05-29', 'altri interventi della lista', 45, true, '20260203-1015'),
    (cid, '2024-06-03', 'interventi ripristino sito', 45, true, '20260203-1015'),
    (cid, '2024-06-05', 'traduzione di alcune parti del sito e email', 30, true, '20260203-1015'),
    (cid, '2024-07-12', 'errore in ricerca segnalato da martina', 30, true, '20260203-1015'),
    (cid, '2024-10-18', 'asistenza', 30, true, '20260203-1015'),
    (cid, '2024-11-06', 'asistenza a martina', 60, true, '20260203-1015'),
    (cid, '2025-01-22', 'asistenza a martina', 15, true, '20260203-1015'),
    (cid, '2025-08-01', 'asistenza a martina su api Brevo', 15, true, '20260203-1015'),
    (cid, '2026-01-16', 'assistenza martina via whataspp per malfunzionamento sito', 15, true, '20260203-1015'),
    (cid, '2026-01-20', 'tentativo di risoluzione problematiche sito', 195, true, '20260203-1015'),
    (cid, '2026-01-28', 'ripristino backup e disabilitazione degli aggiornamenti automatici che riprentavano il problema', 30, true, '20260203-1015'),
    (cid, '2026-02-16', 'risoluzione problema upload (totale 45min ma contabilizzo solo 30min perchè c\''era un residuo di 15 minuti dal precedente monte ore)', 30, false, '');

    -- Azienda: S.E.C. (WP ID: 7097)
    SELECT id INTO cid FROM public.companies WHERE name = 'S.E.C.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('S.E.C.', false, '', 0, 0, 7097)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7097 
        WHERE id = cid;
    END IF;

    -- Azienda: Sant''Andrea B&B di Giuliani Michela (WP ID: 7099)
    SELECT id INTO cid FROM public.companies WHERE name = 'Sant''Andrea B&B di Giuliani Michela' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Sant''Andrea B&B di Giuliani Michela', true, '', 300, 0, 7099)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = '', prepaid_minutes = 300, hourly_rate = 0, wp_id = 7099 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2025-03-25', 'modifiche sito come da whatspp di stefano', 60, false, ''),
    (cid, '2025-05-21', 'menu inglese e verifica problema click su email', 75, false, ''),
    (cid, '2025-08-01', 'assistenza telefonica per rinnovo dominio', 30, false, ''),
    (cid, '2025-08-13', 'cambio dei dati di fatturazione con ticket su aruba', 30, false, '');

    -- Azienda: SEMAR S.R.L. (WP ID: 7101)
    SELECT id INTO cid FROM public.companies WHERE name = 'SEMAR S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('SEMAR S.R.L.', false, '', 0, 0, 7101)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7101 
        WHERE id = cid;
    END IF;

    -- Azienda: SKIN SYSTEM S.R.L.. (WP ID: 7102)
    SELECT id INTO cid FROM public.companies WHERE name = 'SKIN SYSTEM S.R.L..' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('SKIN SYSTEM S.R.L..', false, '', 0, 0, 7102)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7102 
        WHERE id = cid;
    END IF;

    -- Azienda: SOCIETA'' AGRICOLA RISO E RANE S.R.L. (WP ID: 7104)
    SELECT id INTO cid FROM public.companies WHERE name = 'SOCIETA'' AGRICOLA RISO E RANE S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('SOCIETA'' AGRICOLA RISO E RANE S.R.L.', false, '', 0, 0, 7104)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7104 
        WHERE id = cid;
    END IF;

    -- Azienda: SPAR DESIGN S.R.L. (WP ID: 7106)
    SELECT id INTO cid FROM public.companies WHERE name = 'SPAR DESIGN S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('SPAR DESIGN S.R.L.', true, 'zanni@spar.it', 0, 30, 7106)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'zanni@spar.it', prepaid_minutes = 0, hourly_rate = 30, wp_id = 7106 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2025-05-01', 'forfait mese di maggio 2025', 240, true, '20251210-1358'),
    (cid, '2025-06-03', 'singole campagne locali come da mail di Federica', 75, true, '20251210-1358'),
    (cid, '2025-06-04', 'singole campagne locali come da mail di Federica', 120, true, '20251210-1358'),
    (cid, '2025-05-04', 'setup tik tok event manager sul sito spar per future ads', 60, true, '20251210-1358'),
    (cid, '2025-06-09', 'report campagne per federica', 30, true, '20251210-1358'),
    (cid, '2025-06-10', 'risoluzione problematica register (gestione ticket, migrazione nel nuovo server, ripristino cms)', 285, true, '20251210-1358'),
    (cid, '2025-06-11', 'ripristino CMS', 75, true, '20251210-1358'),
    (cid, '2025-06-17', 'sistemazione rivenditori + report campagne', 135, true, '20251210-1358'),
    (cid, '2025-06-13', 'caricamento nuovo listino 2025', 15, true, '20251210-1358'),
    (cid, '2025-06-25', 'caricamenti su tiktok e post sul magazine del sito', 30, true, '20251210-1358'),
    (cid, '2025-06-25', 'nuove ads campagne locals', 30, true, '20251210-1358'),
    (cid, '2025-06-27', 'nuove ads campagne locals', 75, true, '20251210-1358'),
    (cid, '2025-07-10', 'caricamento video tik tok (cumulativo piu giorni)', 105, true, '20251210-1359'),
    (cid, '2025-07-24', 'assistenza tecnica per problemi down del sito', 105, true, '20251210-1359'),
    (cid, '2025-08-06', 'carciamenti e eliminazioni su cms e sito', 75, true, '20251210-1359'),
    (cid, '2025-07-13', 'news per rivenditori esteri dubai e panama', 105, true, '20251210-1359'),
    (cid, '2025-07-14', 'sistemazione invio mail del cerca rivenditore (analisi ricerca soluzione debug del codice)', 195, true, '20251210-1359'),
    (cid, '2025-07-15', 'assistenza facebook verified', 45, true, '20251210-1359'),
    (cid, '2025-10-15', 'migrazione su server vhosting', 300, true, '20251210-1359'),
    (cid, '2025-10-15', 'nuove campagne local con lead generation', 150, true, '20251210-1359'),
    (cid, '2025-10-18', 'assistenza campagne e altro', 30, true, '20251210-1359'),
    (cid, '2025-10-21', 'aggioranemnti e debug CMS', 60, true, '20251210-1359'),
    (cid, '2025-11-14', 'manutenzione campagna leads locali', 30, true, '20251210-1359'),
    (cid, '2025-11-29', 'aggiornamento prestige notte', 30, true, '20251210-1359'),
    (cid, '2025-12-02', 'NUOVA AREA RISERVATA (cumulativo di più giorni di sviluppo e testing)', 1080, true, '20251210-1359'),
    (cid, '2025-12-09', 'cancellazione file da area riservata come da mail di federica', 30, true, '20251210-1359'),
    (cid, '2025-12-11', 'campagna prestige', 30, true, '20260611-080411'),
    (cid, '2025-12-11', 'campagna prestige', 15, true, '20260611-080411'),
    (cid, '2025-12-16', 'Campagna Isola, penisola o cucina lineare?', 30, true, '20260611-080411'),
    (cid, '2026-01-15', 'post sul blog apertura spar point palermo', 45, true, '20260611-080411'),
    (cid, '2026-01-15', 'campagna sky living', 45, true, '20260611-080411'),
    (cid, '2026-01-28', 'riunione, finalizzazione area cataloghi e listini, recensioni avvio progetto', 240, true, '20260611-080411'),
    (cid, '2026-02-12', 'manutenzione sito sui segnalazione di barbara. alcune collezioni non erano raggiungibili dopo l\''ultimo aggiornamento di wordpress a causa della riscrittura di alcuni url', 90, true, '20260611-080411'),
    (cid, '2026-02-17', 'assistenza campagne: riattivazione prestige', 30, true, '20260611-080411'),
    (cid, '2026-02-18', 'caricamento del nuovo modello Sky Kitchen', 255, true, '20260611-080411'),
    (cid, '2026-02-18', 'rimozione Tresor luxory da sito da vecchio cms e da nuovo cms', 45, true, '20260611-080411'),
    (cid, '2026-02-19', 'modifiche sito come accordi con federica', 60, true, '20260611-080411'),
    (cid, '2026-02-27', 'sky kitchens pubblicazione menu altro', 90, true, '20260611-080411'),
    (cid, '2026-03-18', 'assistenza per email automatiche dello store locator', 30, true, '20260611-080411'),
    (cid, '2026-03-25', 'riunione presso spar, prime modifiche a campagne, modifiche alla gestione dei listini come da indicazioni della mattina', 240, true, '20260611-080411'),
    (cid, '2026-03-26', 'campagne e modifiche al sito come da riunione di ieri', 90, true, '20260611-080411'),
    (cid, '2026-03-27', 'pubblicazione nuova area riservata', 90, true, '20260611-080411'),
    (cid, '2026-03-28', 'cms', 210, true, '20260611-080411'),
    (cid, '2026-03-30', 'strumento cerca rivenditori cumulativo di piu giorni', 315, true, '20260611-080411'),
    (cid, '2026-03-31', 'modifiche e correzioni area CMS', 135, true, '20260611-080411'),
    (cid, '2026-04-01', 'affinamenti al cms', 150, true, '20260611-080411'),
    (cid, '2026-04-13', 'riunione con federica e modifche al cms', 105, true, '20260611-080411'),
    (cid, '2026-04-15', 'assistenza CMS', 15, true, '20260611-080411'),
    (cid, '2026-04-23', 'report province regioni punti vendita', 180, true, '20260611-080411'),
    (cid, '2026-05-07', 'aggiornamenti con federica per richieste rivenditore e eliminazione agenti', 75, true, '20260611-080411'),
    (cid, '2026-05-13', 'assistenza cms', 15, true, '20260611-080411'),
    (cid, '2026-05-15', 'risoluzione problema di mobilveneto', 30, true, '20260611-080411'),
    (cid, '2026-06-09', 'modifica per visualizzare log azioni degli utenti', 30, true, '20260611-080411'),
    (cid, '2026-06-11', 'Ci siamo accordati oggi per saldo delle precedenti ore a 1.200 € invece di € 1.342,50', 0, false, ''),
    (cid, '2026-06-17', 'casa sky: meccanismo di invio coupon', 240, false, '');

    -- Azienda: SPINOVATE S.R.L. (WP ID: 7107)
    SELECT id INTO cid FROM public.companies WHERE name = 'SPINOVATE S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('SPINOVATE S.R.L.', false, '', 0, 0, 7107)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7107 
        WHERE id = cid;
    END IF;

    -- Azienda: STUDIO MARINELLI (WP ID: 7109)
    SELECT id INTO cid FROM public.companies WHERE name = 'STUDIO MARINELLI' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('STUDIO MARINELLI', false, '', 0, 0, 7109)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7109 
        WHERE id = cid;
    END IF;

    -- Azienda: Tecnomarket s.r.l (WP ID: 7110)
    SELECT id INTO cid FROM public.companies WHERE name = 'Tecnomarket s.r.l' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Tecnomarket s.r.l', false, '', 0, 0, 7110)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7110 
        WHERE id = cid;
    END IF;

    -- Azienda: TECNOWAY SRL (WP ID: 7112)
    SELECT id INTO cid FROM public.companies WHERE name = 'TECNOWAY SRL' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('TECNOWAY SRL', false, '', 0, 0, 7112)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7112 
        WHERE id = cid;
    END IF;

    -- Azienda: TESSUTI D''EPOCA DI PRITELLI RAFFAELLA (WP ID: 7114)
    SELECT id INTO cid FROM public.companies WHERE name = 'TESSUTI D''EPOCA DI PRITELLI RAFFAELLA' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('TESSUTI D''EPOCA DI PRITELLI RAFFAELLA', true, 'raffaellapritelli@gmail.com', 0, 50, 7114)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'raffaellapritelli@gmail.com', prepaid_minutes = 0, hourly_rate = 50, wp_id = 7114 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2025-08-04', 'assistenza su varie cose (cumulativa dei giorni precedenti)', 90, true, '20251210-1824'),
    (cid, '2025-08-04', 'aggiornamenti vari sul sito necessari dopo mesi dall\''ultimo accesso', 75, true, '20251210-1824'),
    (cid, '2025-08-04', 'Caricamento nuovo post sul blog', 45, true, '20251210-1824'),
    (cid, '2025-08-26', 'assistenza su codice sconto e altro', 30, true, '20251210-1824'),
    (cid, '2025-10-20', 'pubblicazione articolo blog', 45, true, '20251210-1824'),
    (cid, '2025-11-24', 'assistenza analytucs', 30, true, '20251210-1824'),
    (cid, '2025-12-19', 'creazione coupon e altro', 15, false, ''),
    (cid, '2026-01-12', 'assistenza per sito superati limiti sia disco che database', 120, false, ''),
    (cid, '2026-03-20', 'assistenza con pagine eliminate', 30, false, ''),
    (cid, '2026-04-03', 'ripristino iscriziopne alla newsletter dopo disattivazione di movyla', 45, false, ''),
    (cid, '2026-06-25', 'assistenza per ordini fake', 45, false, '');

    -- Azienda: MELETTI MARCO (WP ID: 7078)
    SELECT id INTO cid FROM public.companies WHERE name = 'MELETTI MARCO' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('MELETTI MARCO', true, '', 0, 50, 7078)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = '', prepaid_minutes = 0, hourly_rate = 50, wp_id = 7078 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2024-11-22', 'Creazione campagne facebook e google (cumulativo anche dei giorni precedenti). preparazione degli accoount, metodi di pagamento ecc ecc', 240, true, ''),
    (cid, '2024-11-26', 'campagne sistemazione problemi con pagamenti e altra assistenza', 180, true, ''),
    (cid, '2024-12-02', 'assistenza campagne', 60, true, ''),
    (cid, '2024-12-13', 'assistenza campagne', 120, true, ''),
    (cid, '2024-12-14', 'campagna local', 60, true, ''),
    (cid, '2025-01-25', 'nuova campagna san valentino', 90, true, ''),
    (cid, '2025-02-07', 'ripristino sito marcomeletti.com', 75, true, ''),
    (cid, '2025-10-03', 'caricamento prezzi nuovi', 180, false, '');

    -- Azienda: Molecular Modelling Studio di Alessandro Mazzanti (WP ID: 7080)
    SELECT id INTO cid FROM public.companies WHERE name = 'Molecular Modelling Studio di Alessandro Mazzanti' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Molecular Modelling Studio di Alessandro Mazzanti', false, '', 0, 0, 7080)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7080 
        WHERE id = cid;
    END IF;

    -- Azienda: MY TEAM LAB SRL (WP ID: 7082)
    SELECT id INTO cid FROM public.companies WHERE name = 'MY TEAM LAB SRL' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('MY TEAM LAB SRL', false, '', 0, 0, 7082)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7082 
        WHERE id = cid;
    END IF;

    -- Azienda: NASSIBA SOCIETA'' A RESPONSABILITA'' LIMITATA SEMPLIFICATA (WP ID: 7084)
    SELECT id INTO cid FROM public.companies WHERE name = 'NASSIBA SOCIETA'' A RESPONSABILITA'' LIMITATA SEMPLIFICATA' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('NASSIBA SOCIETA'' A RESPONSABILITA'' LIMITATA SEMPLIFICATA', true, 'Nassibaleslous@gmail.com', 0, 40, 7084)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'Nassibaleslous@gmail.com', prepaid_minutes = 0, hourly_rate = 40, wp_id = 7084 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2026-02-06', 'menu san valentino', 45, false, '');

    -- Azienda: NEW FACES & STARS S.R.L. (WP ID: 7086)
    SELECT id INTO cid FROM public.companies WHERE name = 'NEW FACES & STARS S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('NEW FACES & STARS S.R.L.', false, '', 0, 0, 7086)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7086 
        WHERE id = cid;
    END IF;

    -- Azienda: NUCCI CONSULENZA DEL LAVORO E LEGALE DI BENEDETTI A & I (WP ID: 7088)
    SELECT id INTO cid FROM public.companies WHERE name = 'NUCCI CONSULENZA DEL LAVORO E LEGALE DI BENEDETTI A & I' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('NUCCI CONSULENZA DEL LAVORO E LEGALE DI BENEDETTI A & I', false, '', 0, 0, 7088)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7088 
        WHERE id = cid;
    END IF;

    -- Azienda: PADA ENGINEERING S.R.L. (WP ID: 7089)
    SELECT id INTO cid FROM public.companies WHERE name = 'PADA ENGINEERING S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('PADA ENGINEERING S.R.L.', true, 'bfiorani@pada.it', 0, 45, 7089)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'bfiorani@pada.it', prepaid_minutes = 0, hourly_rate = 45, wp_id = 7089 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2026-05-22', 'sistemazione contatti/lavora con noi ita e ing', 90, false, '');

    -- Azienda: PICENI ART FOR JOB SOCIETA'' COOPERATIVA CONSORTILE (WP ID: 7091)
    SELECT id INTO cid FROM public.companies WHERE name = 'PICENI ART FOR JOB SOCIETA'' COOPERATIVA CONSORTILE' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('PICENI ART FOR JOB SOCIETA'' COOPERATIVA CONSORTILE', false, '', 0, 0, 7091)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7091 
        WHERE id = cid;
    END IF;

    -- Azienda: PIUITALIA S.R.L. (WP ID: 7093)
    SELECT id INTO cid FROM public.companies WHERE name = 'PIUITALIA S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('PIUITALIA S.R.L.', false, '', 0, 0, 7093)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7093 
        WHERE id = cid;
    END IF;

    -- Azienda: PUNTO METAL DI BARTOLINI ORAZIO (WP ID: 7095)
    SELECT id INTO cid FROM public.companies WHERE name = 'PUNTO METAL DI BARTOLINI ORAZIO' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('PUNTO METAL DI BARTOLINI ORAZIO', false, '', 0, 0, 7095)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7095 
        WHERE id = cid;
    END IF;

    -- Azienda: G.EM.A. MEDICAL SRL (WP ID: 7048)
    SELECT id INTO cid FROM public.companies WHERE name = 'G.EM.A. MEDICAL SRL' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('G.EM.A. MEDICAL SRL', false, '', 0, 0, 7048)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7048 
        WHERE id = cid;
    END IF;

    -- Azienda: GELATERIA TROPICAL DI CERRI FRANCESCA (WP ID: 7049)
    SELECT id INTO cid FROM public.companies WHERE name = 'GELATERIA TROPICAL DI CERRI FRANCESCA' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('GELATERIA TROPICAL DI CERRI FRANCESCA', false, '', 0, 0, 7049)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7049 
        WHERE id = cid;
    END IF;

    -- Azienda: GENERAL S.R.L. (WP ID: 7051)
    SELECT id INTO cid FROM public.companies WHERE name = 'GENERAL S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('GENERAL S.R.L.', false, '', 0, 0, 7051)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7051 
        WHERE id = cid;
    END IF;

    -- Azienda: GIESSE PLAST S.R.L. (WP ID: 7053)
    SELECT id INTO cid FROM public.companies WHERE name = 'GIESSE PLAST S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('GIESSE PLAST S.R.L.', false, '', 0, 0, 7053)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7053 
        WHERE id = cid;
    END IF;

    -- Azienda: Golden Brain ETS Associazione culturale (WP ID: 7055)
    SELECT id INTO cid FROM public.companies WHERE name = 'Golden Brain ETS Associazione culturale' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Golden Brain ETS Associazione culturale', false, '', 0, 0, 7055)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7055 
        WHERE id = cid;
    END IF;

    -- Azienda: HOLIDAY HOME DI LUCIA DIOMEDE (WP ID: 7057)
    SELECT id INTO cid FROM public.companies WHERE name = 'HOLIDAY HOME DI LUCIA DIOMEDE' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('HOLIDAY HOME DI LUCIA DIOMEDE', false, '', 0, 0, 7057)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7057 
        WHERE id = cid;
    END IF;

    -- Azienda: INNOVA GROUP S.R.L. (WP ID: 7059)
    SELECT id INTO cid FROM public.companies WHERE name = 'INNOVA GROUP S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('INNOVA GROUP S.R.L.', false, '', 0, 0, 7059)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7059 
        WHERE id = cid;
    END IF;

    -- Azienda: JUNIOR GLASS 2007 S.R.L. (WP ID: 7061)
    SELECT id INTO cid FROM public.companies WHERE name = 'JUNIOR GLASS 2007 S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('JUNIOR GLASS 2007 S.R.L.', false, '', 0, 0, 7061)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7061 
        WHERE id = cid;
    END IF;

    -- Azienda: Lamicolor (WP ID: 7063)
    SELECT id INTO cid FROM public.companies WHERE name = 'Lamicolor' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Lamicolor', true, '', 0, 60, 7063)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = '', prepaid_minutes = 0, hourly_rate = 60, wp_id = 7063 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2024-09-12', 'aggiunta allumini \"Line\"', 45, true, '20251210-1418'),
    (cid, '2024-11-04', 'assistenza', 45, true, '20251210-1418'),
    (cid, '2024-11-05', 'cambio immagine home', 30, true, '20251210-1418'),
    (cid, '2025-03-06', 'aggiornamento certificazioni ita e ing', 45, true, '20251210-1418'),
    (cid, '2025-03-17', 'Nuova news camper 2025 ita e ing', 135, true, '20251210-1418'),
    (cid, '2025-03-19', 'modifiche compact exterior', 45, true, '20251210-1418'),
    (cid, '2025-05-06', 'agiornamenrto certificazioni ita e ing', 90, true, '20251210-1418'),
    (cid, '2025-05-22', 'aggiornamento marmi e urban ita e ing', 135, true, '20251210-1418'),
    (cid, '2025-05-28', 'aggiornamento News 2025', 105, true, '20251210-1418'),
    (cid, '2025-05-30', 'aggiornamento News 2025 versione inglese', 45, true, '20251210-1418'),
    (cid, '2025-07-23', 'aggiornamenti stone 6119 6123', 45, true, '20260211-0900'),
    (cid, '2025-10-27', 'aggiornamenti news marmi e legni', 165, true, '20260211-0900'),
    (cid, '2025-10-28', 'aggiunta marmo 6109', 15, true, '20260211-0900'),
    (cid, '2025-11-04', 'assistenza per immagini sito da fornire a rivenditore inglese', 30, true, '20260211-0900'),
    (cid, '2026-01-07', 'inserimento campioni uniti', 45, true, '20260211-0900'),
    (cid, '2026-01-12', 'sostituzione certifcati iso', 30, true, '20260211-0900'),
    (cid, '2026-01-23', 'campioni Lamicolor da inserire in ordine numerico crescente nel link News 2025 (con bollino verde) e nel link Collezioni - Urban (senza bollino). ITA E ING', 45, true, '20260211-0900'),
    (cid, '2026-01-26', 'generazione di 3 qrcode', 75, true, '20260211-0900'),
    (cid, '2026-02-02', 'generazione del 4 qrcode e fix dei precedenti', 45, true, '20260211-0900'),
    (cid, '2026-02-11', 'aggiornamento carvan 26 27', 135, true, '20260211-0900'),
    (cid, '2026-03-31', 'sostituzione certificato ambiente en pdf e immagine', 45, false, ''),
    (cid, '2026-06-12', 'news 2026 e creazione archivio: sia ita e ing', 225, false, ''),
    (cid, '2026-06-23', 'inserimento re-lieve', 135, false, '');

    -- Azienda: Le Nuvole di Maurizio Tombari (WP ID: 7065)
    SELECT id INTO cid FROM public.companies WHERE name = 'Le Nuvole di Maurizio Tombari' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Le Nuvole di Maurizio Tombari', false, '', 0, 0, 7065)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7065 
        WHERE id = cid;
    END IF;

    -- Azienda: LE PANIER DI CLAUDIA GATTI (WP ID: 7067)
    SELECT id INTO cid FROM public.companies WHERE name = 'LE PANIER DI CLAUDIA GATTI' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('LE PANIER DI CLAUDIA GATTI', false, '', 0, 0, 7067)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7067 
        WHERE id = cid;
    END IF;

    -- Azienda: LION CONSULTING SRL (WP ID: 7069)
    SELECT id INTO cid FROM public.companies WHERE name = 'LION CONSULTING SRL' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('LION CONSULTING SRL', false, '', 0, 0, 7069)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7069 
        WHERE id = cid;
    END IF;

    -- Azienda: LOVANIUM SAS DR. FRANK MUSARRA & DR. FEDERICA PRADARELLI (WP ID: 7071)
    SELECT id INTO cid FROM public.companies WHERE name = 'LOVANIUM SAS DR. FRANK MUSARRA & DR. FEDERICA PRADARELLI' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('LOVANIUM SAS DR. FRANK MUSARRA & DR. FEDERICA PRADARELLI', false, '', 0, 0, 7071)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7071 
        WHERE id = cid;
    END IF;

    -- Azienda: Luigi Martinelli (WP ID: 7073)
    SELECT id INTO cid FROM public.companies WHERE name = 'Luigi Martinelli' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Luigi Martinelli', true, 'martinelli.luigi@hotmail.it', 0, 60, 7073)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'martinelli.luigi@hotmail.it', prepaid_minutes = 0, hourly_rate = 60, wp_id = 7073 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2026-01-12', 'assistenza per ripristino mail e sito', 45, false, ''),
    (cid, '2026-01-19', 'assistenza con animazione dello slideshow in home page dove scomparivano le scitrte dopo la prima slide', 30, false, '');

    -- Azienda: M-M MOTORS S.R.L. (WP ID: 7074)
    SELECT id INTO cid FROM public.companies WHERE name = 'M-M MOTORS S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('M-M MOTORS S.R.L.', false, '', 0, 0, 7074)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7074 
        WHERE id = cid;
    END IF;

    -- Azienda: MASCHIO GASPARDO S.P.A. (WP ID: 7076)
    SELECT id INTO cid FROM public.companies WHERE name = 'MASCHIO GASPARDO S.P.A.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('MASCHIO GASPARDO S.P.A.', false, '', 0, 0, 7076)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7076 
        WHERE id = cid;
    END IF;

    -- Azienda: CASSIANI SOLUTION S.R.L. (WP ID: 7021)
    SELECT id INTO cid FROM public.companies WHERE name = 'CASSIANI SOLUTION S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('CASSIANI SOLUTION S.R.L.', false, '', 0, 0, 7021)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7021 
        WHERE id = cid;
    END IF;

    -- Azienda: CHIAMATI BIO SOCIETA AGRICOLA (WP ID: 7023)
    SELECT id INTO cid FROM public.companies WHERE name = 'CHIAMATI BIO SOCIETA AGRICOLA' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('CHIAMATI BIO SOCIETA AGRICOLA', false, '', 0, 0, 7023)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7023 
        WHERE id = cid;
    END IF;

    -- Azienda: CONSORZIO DI TUTELA E VALORIZZAZIONE DELL''OLIO EXTRAVERGINE D''OLIVA CARTOCETO (WP ID: 7025)
    SELECT id INTO cid FROM public.companies WHERE name = 'CONSORZIO DI TUTELA E VALORIZZAZIONE DELL''OLIO EXTRAVERGINE D''OLIVA CARTOCETO' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('CONSORZIO DI TUTELA E VALORIZZAZIONE DELL''OLIO EXTRAVERGINE D''OLIVA CARTOCETO', true, 'info@oliocartocetodop.it', 600, 0, 7025)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'info@oliocartocetodop.it', prepaid_minutes = 600, hourly_rate = 0, wp_id = 7025 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2025-10-01', 'assistenza rinnovo servizi', 30, true, '20260609-074728'),
    (cid, '2025-10-30', 'modifiche al sito come da mail di oggi (logo)', 30, true, '20260609-074728'),
    (cid, '2025-11-03', 'nuova tabella soci produttori', 45, true, '20260609-074728'),
    (cid, '2025-11-13', 'pubblicazione evento', 45, true, '20260609-074728'),
    (cid, '2025-12-21', 'inserimento loghi regione e eu', 45, true, '20260609-074728'),
    (cid, '2026-01-16', 'aggiornamento su indicazioni di monia via whatsapp', 45, true, '20260609-074728'),
    (cid, '2026-01-20', 'assistenza immagine coperta da copyright', 30, true, '20260609-074728'),
    (cid, '2026-04-11', 'inizio lavoro per sezione Karl Hoffmann', 90, true, '20260609-074728'),
    (cid, '2026-04-14', 'avanzamento pagina trees for peace', 75, true, '20260609-074728'),
    (cid, '2026-04-23', 'aggiornamento pagina tree for peace come richiesta d amail di karl', 75, true, '20260609-074728'),
    (cid, '2026-05-08', 'creazione news servizio Rai', 45, true, '20260609-074728'),
    (cid, '2026-05-20', 'pubblicazione news ulivi della pace', 30, false, ''),
    (cid, '2026-05-24', 'inserimento video tg3 in three for peace', 45, true, '20260609-074728');

    -- Azienda: DDEXPERIENCE S.R.L. (WP ID: 7027)
    SELECT id INTO cid FROM public.companies WHERE name = 'DDEXPERIENCE S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('DDEXPERIENCE S.R.L.', false, '', 0, 0, 7027)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7027 
        WHERE id = cid;
    END IF;

    -- Azienda: DONZELLI LORENZO (WP ID: 7029)
    SELECT id INTO cid FROM public.companies WHERE name = 'DONZELLI LORENZO' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('DONZELLI LORENZO', false, '', 0, 0, 7029)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7029 
        WHERE id = cid;
    END IF;

    -- Azienda: DREAMING S.R.L. (WP ID: 7031)
    SELECT id INTO cid FROM public.companies WHERE name = 'DREAMING S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('DREAMING S.R.L.', false, '', 0, 0, 7031)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7031 
        WHERE id = cid;
    END IF;

    -- Azienda: EDILMAG S.R.L. (WP ID: 7032)
    SELECT id INTO cid FROM public.companies WHERE name = 'EDILMAG S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('EDILMAG S.R.L.', true, 'cri@edilmag.it', 0, 45, 7032)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'cri@edilmag.it', prepaid_minutes = 0, hourly_rate = 45, wp_id = 7032 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2025-12-11', 'inizio lavori su nuovo sito ilink. Nuova veste grafica e nuovi contenuti', 90, true, '20260209-1054'),
    (cid, '2025-12-05', 'prima riunione avvio lavori presso OCM', 75, true, '20260209-1054'),
    (cid, '2025-12-18', 'trasferimento sito su nuovo server', 75, true, '20260209-1054'),
    (cid, '2025-12-19', 'configurazione posta', 45, true, '20260209-1054'),
    (cid, '2025-12-22', 'predisposizione nuovo sito ilink (cumulativo di più giorni: creazione ambiente di staging + setup nuova veste grafica)', 480, true, '20260209-1054'),
    (cid, '2025-12-15', 'call industria 4.0', 30, true, '20260209-1054'),
    (cid, '2025-12-30', 'avanzamento sito nuovo ilink', 180, true, '20260209-1054'),
    (cid, '2026-01-02', 'avanzamento ilink con setup plugin lingue e altro', 75, true, '20260209-1054'),
    (cid, '2026-01-08', 'caricamento pagina iperammortamento', 45, true, '20260209-1054'),
    (cid, '2026-01-08', 'affinamenti a iperammortamento', 30, true, '20260209-1054'),
    (cid, '2026-01-09', 'bozza pagina software', 30, true, '20260209-1054'),
    (cid, '2026-01-12', 'creazione pagine cookie privacy contatti faq', 180, true, '20260209-1054'),
    (cid, '2026-01-13', 'affinamenti vari e avanzamento lavori', 75, true, '20260209-1054'),
    (cid, '2026-01-21', 'nuovo dominio ilinksystem.com settaggi e migrazioni', 165, true, '20260209-1054'),
    (cid, '2026-01-22', 'cal con fede e con paolo', 45, true, '20260209-1054'),
    (cid, '2026-01-23', 'avanzamento sito nuovo ilink', 300, true, '20260209-1054'),
    (cid, '2026-01-26', 'avanzamento sito', 240, true, '20260209-1054'),
    (cid, '2026-01-29', 'avanzamento', 60, true, '20260209-1054'),
    (cid, '2026-02-02', 'call e prime modifiche dopo call', 90, true, '20260209-1054'),
    (cid, '2026-02-03', 'avanzamento dopo call di ieri', 300, true, '20260209-1054'),
    (cid, '2026-02-04', 'modifiche come da mail di Paolo', 105, true, '20260209-1054'),
    (cid, '2026-02-05', 'modifiche cheiste da paolo', 90, true, '20260209-1054'),
    (cid, '2026-02-06', 'modifiche come d mail di di cri e paolo', 270, true, '20260209-1054'),
    (cid, '2026-02-09', 'affinamenti', 150, true, '20260209-1054'),
    (cid, '2026-02-19', 'modifiche post incontro rete vendita (come da mail di paolo)', 135, true, '20260513-0645'),
    (cid, '2026-02-20', 'versione mobile', 90, true, '20260513-0645'),
    (cid, '2026-02-21', 'supporto per versione mobile e traduzioni', 45, true, '20260513-0645'),
    (cid, '2026-02-25', 'aggiornamenti come da mail di Paolo di questa mattina', 225, true, '20260513-0645'),
    (cid, '2026-02-27', 'aggiornamenti vari', 105, true, '20260513-0645'),
    (cid, '2026-03-02', 'pubblicazione + versione inglese', 390, true, '20260513-0645'),
    (cid, '2026-03-02', 'modifiche mail di paolo', 60, true, '20260513-0645'),
    (cid, '2026-03-04', 'varie', 60, true, '20260513-0645'),
    (cid, '2026-03-09', 'varie', 75, true, '20260513-0645'),
    (cid, '2026-03-20', 'applicazione modifiche richieste (varie in vari giorni)', 165, true, '20260513-0645'),
    (cid, '2026-03-21', 'call + interventi emersi', 225, true, '20260513-0645'),
    (cid, '2026-03-23', 'modifiche di cri', 45, true, '20260513-0645'),
    (cid, '2026-03-24', 'affinamenti vari', 45, true, '20260513-0645'),
    (cid, '2026-04-02', 'piccole sistemazioni e modifiche', 30, true, '20260513-0645'),
    (cid, '2026-04-14', 'migrazione sito da vecchio dominio a ilinksystem.com verifica che tutto funzioni correttamente', 105, true, '20260513-0645'),
    (cid, '2026-04-21', 'assistenza casella email per sito e brevo', 30, true, '20260513-0645'),
    (cid, '2026-05-08', 'assistenza Luzi per condicvisione social e aggiunta icone nel footer per i 4 social', 45, true, '20260513-0645'),
    (cid, '2026-05-16', 'modifiche al sito', 105, false, ''),
    (cid, '2026-05-18', 'modifiche come da mail di Paolo', 45, false, ''),
    (cid, '2026-05-21', 'call allinememento', 75, false, ''),
    (cid, '2026-05-22', 'configurazione Brevo per invii nwsletter', 90, false, ''),
    (cid, '2026-05-26', 'newsletter: import contatti e prima nl di 3', 180, false, ''),
    (cid, '2026-05-27', 'modifiche e invio nl', 75, false, ''),
    (cid, '2026-06-03', 'assistenza invioo prima newsletter', 75, false, ''),
    (cid, '2026-06-11', 'newsletter rivenditori', 45, false, ''),
    (cid, '2026-06-15', 'caricmaneto pdf', 15, false, '');

    -- Azienda: ENTE CPT SCUOLA EDILE (WP ID: 7034)
    SELECT id INTO cid FROM public.companies WHERE name = 'ENTE CPT SCUOLA EDILE' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('ENTE CPT SCUOLA EDILE', false, '', 0, 0, 7034)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7034 
        WHERE id = cid;
    END IF;

    -- Azienda: FACILE.IT RETAIL S.R.L. (WP ID: 7036)
    SELECT id INTO cid FROM public.companies WHERE name = 'FACILE.IT RETAIL S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('FACILE.IT RETAIL S.R.L.', false, '', 0, 0, 7036)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7036 
        WHERE id = cid;
    END IF;

    -- Azienda: FALEGNAMERIA TAFANI DI TAFANI GIANCARLO E DANIELE S.N.C. (WP ID: 7038)
    SELECT id INTO cid FROM public.companies WHERE name = 'FALEGNAMERIA TAFANI DI TAFANI GIANCARLO E DANIELE S.N.C.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('FALEGNAMERIA TAFANI DI TAFANI GIANCARLO E DANIELE S.N.C.', true, 'info@tafanisrl.it', 0, 60, 7038)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'info@tafanisrl.it', prepaid_minutes = 0, hourly_rate = 60, wp_id = 7038 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2026-04-01', 'assistenza per problema email', 45, false, '');

    -- Azienda: FILPLACE S.R.L. (WP ID: 7040)
    SELECT id INTO cid FROM public.companies WHERE name = 'FILPLACE S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('FILPLACE S.R.L.', false, '', 0, 0, 7040)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7040 
        WHERE id = cid;
    END IF;

    -- Azienda: FISCOZEN S.P.A. (WP ID: 7042)
    SELECT id INTO cid FROM public.companies WHERE name = 'FISCOZEN S.P.A.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('FISCOZEN S.P.A.', false, '', 0, 0, 7042)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7042 
        WHERE id = cid;
    END IF;

    -- Azienda: FIVE GROUP MONZA S.R.L. (WP ID: 7044)
    SELECT id INTO cid FROM public.companies WHERE name = 'FIVE GROUP MONZA S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('FIVE GROUP MONZA S.R.L.', false, '', 0, 0, 7044)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7044 
        WHERE id = cid;
    END IF;

    -- Azienda: FONDAZIONE PESCHERIA CENTRO ARTI VISIVE (WP ID: 7046)
    SELECT id INTO cid FROM public.companies WHERE name = 'FONDAZIONE PESCHERIA CENTRO ARTI VISIVE' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('FONDAZIONE PESCHERIA CENTRO ARTI VISIVE', true, '', 0, 52, 7046)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = '', prepaid_minutes = 0, hourly_rate = 52, wp_id = 7046 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2025-04-15', 'aggiornamento palazzo ducale pesaromusei.it', 15, true, '20251210-1439'),
    (cid, '2025-04-23', 'aggiornamento nuovo CDA', 45, true, '20251210-1439'),
    (cid, '2025-04-29', 'aggiornamento nuovo CDA', 15, true, '20251210-1439'),
    (cid, '2025-04-30', 'aggiornamento mission', 30, true, '20251210-1439'),
    (cid, '2025-05-02', 'NUOVI DOCUMENTI DISPONIBILI AL BANDO PER NUOVO DIRETTORE GENERALE 2025', 45, true, '20251210-1439'),
    (cid, '2025-05-02', 'aggiornamenti vari sul backend', 15, true, '20251210-1439'),
    (cid, '2025-05-08', 'aggiunta documento ad avvisi pubblici', 30, true, '20251210-1439'),
    (cid, '2025-05-12', 'assistenza', 15, true, '20251210-1439'),
    (cid, '2025-05-20', 'Editing di pdf e pubblicazione', 105, true, '20251210-1439'),
    (cid, '2025-05-20', 'modifica alla tabella Consulenti e collaboratori', 45, true, '20251210-1439'),
    (cid, '2025-05-27', 'creazione pagina temporanea https://pesaromusei.it/summermuseum/', 30, true, '20251210-1439'),
    (cid, '2025-06-04', 'caricamento pdf summermuseum con nuovo plugin pageflip', 75, true, '20251210-1439'),
    (cid, '2025-07-14', 'assistenza per casella email palazzoducale e altro', 45, true, '20251210-1439'),
    (cid, '2025-07-31', 'assistenza caselle email', 30, true, '20251210-1439'),
    (cid, '2025-08-12', 'assistenza telefonica', 30, true, '20251210-1439'),
    (cid, '2025-08-13', 'assistenza per quovai', 30, true, '20251210-1439'),
    (cid, '2025-08-19', 'aggiornamenti link card mudei', 45, true, '20251210-1439'),
    (cid, '2025-08-19', 'aggiornamenti tecnici necessari: versione di PHP del server, versione di wordpress.', 45, true, '20251210-1439'),
    (cid, '2025-08-19', 'sostituzione mappa google con mappa leaflet', 150, true, '20260226-0842'),
    (cid, '2025-08-19', 'asistenza per analytics', 15, true, '20260226-0842'),
    (cid, '2025-09-09', 'supporto per recupero tabella collabioratori andata persa', 60, true, '20260226-0842'),
    (cid, '2025-10-02', 'supporto con nuova casella di posta', 30, true, '20260226-0842'),
    (cid, '2025-11-13', 'assistenza per editing pdf curriculu,m', 30, true, '20260226-0842'),
    (cid, '2025-11-19', 'supporto tecnico a qovai per Impostazione DKIM per dominio pesaromusei.it', 75, true, '20260226-0842'),
    (cid, '2026-01-27', 'assistenza per down sito web pesaromusei. Analisi e riprisitno', 90, true, '20260226-0842'),
    (cid, '2026-01-29', 'sostituizione del plugin \"accessibilità\" che causava la visualizzazione sballata del sito. Analisi delle soluzioni alternative testing carimencto e configurazione.', 195, true, '20260226-0842'),
    (cid, '2026-02-26', 'assistenza posta e altro', 75, true, '20260226-0842'),
    (cid, '2026-03-20', 'assistenza con modifiche alle caselle email (vari giorni)', 90, false, ''),
    (cid, '2026-03-20', 'assistenza per cambio password caselle email', 45, false, ''),
    (cid, '2026-04-15', 'assistenza lydia con alcune modifiche al sito pesaromuei', 45, false, ''),
    (cid, '2026-04-16', 'assistenza lydia', 15, false, ''),
    (cid, '2026-05-13', 'assistenza lydia', 15, false, ''),
    (cid, '2026-05-15', 'assistenza per caselle di posta', 30, false, ''),
    (cid, '2026-06-09', 'intervento su pesaromusei.it per nuova bigliettazione. piu aggiornamento plugin e wordpress core', 90, false, '');

    -- Azienda: ADRIATICA COSTRUZIONI S.R.L. (WP ID: 7003)
    SELECT id INTO cid FROM public.companies WHERE name = 'ADRIATICA COSTRUZIONI S.R.L.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('ADRIATICA COSTRUZIONI S.R.L.', false, '', 0, 0, 7003)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7003 
        WHERE id = cid;
    END IF;

    -- Azienda: AGRICOLA 2000 SOCIETA'' COOP. PER AZIONI (WP ID: 7005)
    SELECT id INTO cid FROM public.companies WHERE name = 'AGRICOLA 2000 SOCIETA'' COOP. PER AZIONI' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('AGRICOLA 2000 SOCIETA'' COOP. PER AZIONI', false, '', 0, 0, 7005)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7005 
        WHERE id = cid;
    END IF;

    -- Azienda: SD ITALY (WP ID: 7007)
    SELECT id INTO cid FROM public.companies WHERE name = 'SD ITALY' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('SD ITALY', false, '', 0, 0, 7007)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7007 
        WHERE id = cid;
    END IF;

    -- Azienda: ARENA S.P.A. (WP ID: 7009)
    SELECT id INTO cid FROM public.companies WHERE name = 'ARENA S.P.A.' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('ARENA S.P.A.', false, '', 0, 0, 7009)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7009 
        WHERE id = cid;
    END IF;

    -- Azienda: ATELIER LM INTERIORS SRLS (WP ID: 7011)
    SELECT id INTO cid FROM public.companies WHERE name = 'ATELIER LM INTERIORS SRLS' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('ATELIER LM INTERIORS SRLS', false, '', 0, 0, 7011)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7011 
        WHERE id = cid;
    END IF;

    -- Azienda: B.S.M. INOX SOCIETA'' A RESPONSABILITA'' LIMITATA SEMPLIFICATA (WP ID: 7013)
    SELECT id INTO cid FROM public.companies WHERE name = 'B.S.M. INOX SOCIETA'' A RESPONSABILITA'' LIMITATA SEMPLIFICATA' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('B.S.M. INOX SOCIETA'' A RESPONSABILITA'' LIMITATA SEMPLIFICATA', true, 'info@bsminox.it', 0, 55, 7013)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = true, contact_email = 'info@bsminox.it', prepaid_minutes = 0, hourly_rate = 55, wp_id = 7013 
        WHERE id = cid;
    END IF;

    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES
    (cid, '2025-05-09', 'Bug invio mail ordini', 90, true, '20251211-1913'),
    (cid, '2025-05-15', 'aggiornamento wordpress e plugin', 45, true, '20251211-1913'),
    (cid, '2025-05-16', 'assistenza varia e avvio campagne', 90, true, '20251211-1913'),
    (cid, '2025-06-10', 'conversion tracking', 45, true, '20251211-1913'),
    (cid, '2025-06-25', 'problema invio mail ordini e aggiornamento plugin', 30, true, '20251211-1913'),
    (cid, '2025-07-01', 'aggiornamenti spese di spedizione e altro', 45, true, '20251211-1913'),
    (cid, '2025-07-28', 'aggiornamento tema', 30, true, '20251211-1913'),
    (cid, '2025-07-03', 'banner ferie', 30, false, ''),
    (cid, '2025-09-10', 'aggiornamento elementor', 45, false, ''),
    (cid, '2025-09-30', 'aggiornamento tema e elementor e risoluzione bug', 45, false, ''),
    (cid, '2025-10-01', 'call con amad + modifica a sconto 10% nel checkout', 30, false, ''),
    (cid, '2026-01-12', 'assistenza per pagamento non andato a buon fine con carta di credito di james morales', 45, false, ''),
    (cid, '2026-01-26', 'assistenza per pagamento non andato a buon fine con carta di credito di james morales', 30, false, ''),
    (cid, '2026-03-26', 'maintenance, assistenza per ordini spam, aggiornamenti vari', 90, false, ''),
    (cid, '2026-06-12', 'assistenza b2b', 30, false, ''),
    (cid, '2026-06-13', 'assistenza per ordine joseph hu', 30, false, '');

    -- Azienda: BAR CAFFETTERIA EDICOLA CARTOLERIA BINDA DI FEDERICI ENRICO (WP ID: 7015)
    SELECT id INTO cid FROM public.companies WHERE name = 'BAR CAFFETTERIA EDICOLA CARTOLERIA BINDA DI FEDERICI ENRICO' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('BAR CAFFETTERIA EDICOLA CARTOLERIA BINDA DI FEDERICI ENRICO', false, '', 0, 0, 7015)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7015 
        WHERE id = cid;
    END IF;

    -- Azienda: BRAND GROUP SRL (WP ID: 7017)
    SELECT id INTO cid FROM public.companies WHERE name = 'BRAND GROUP SRL' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('BRAND GROUP SRL', false, '', 0, 0, 7017)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7017 
        WHERE id = cid;
    END IF;

    -- Azienda: Cassa Edile Pesaro (WP ID: 7019)
    SELECT id INTO cid FROM public.companies WHERE name = 'Cassa Edile Pesaro' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Cassa Edile Pesaro', false, '', 0, 0, 7019)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 7019 
        WHERE id = cid;
    END IF;

    -- Azienda: Mood agency (WP ID: 6998)
    SELECT id INTO cid FROM public.companies WHERE name = 'Mood agency' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)
        VALUES ('Mood agency', false, '', 0, 0, 6998)
        RETURNING id INTO cid;
    ELSE
        UPDATE public.companies 
        SET time_tracking_enabled = false, contact_email = '', prepaid_minutes = 0, hourly_rate = 0, wp_id = 6998 
        WHERE id = cid;
    END IF;

END $$;
