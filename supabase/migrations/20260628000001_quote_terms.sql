-- Aggiunge la colonna quote_terms alla tabella workspace_settings
ALTER TABLE workspace_settings
ADD COLUMN IF NOT EXISTS quote_terms TEXT;
