# Script di Migrazione da WordPress a Supabase

Questo script (`migrate.ts`) serve come template per importare i tuoi dati attuali da WordPress al nuovo CRM su Supabase.

## Prerequisiti

1. Esporta i tuoi dati da WordPress (Deal, Contatti, Aziende) in formato JSON. Puoi usare un plugin WordPress come "WP All Export" o uno script PHP personalizzato per estrarre i Custom Post Types con i loro `post_meta`.
2. Salva il file esportato in questa cartella (`scripts/`) con il nome `wp-export.json`.
3. Assicurati che nel file `.env.local` (nella root del progetto) siano impostati:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (ATTENZIONE: usa la chiave di servizio, non la anon key, per poter bypassare le regole RLS di Supabase e inserire i dati massivamente).

## Come eseguire lo script

Esegui lo script utilizzando `npx tsx` (un esecutore TypeScript per Node.js):

```bash
cd scripts
npx tsx migrate.ts
```

## Personalizzazione

Lo script al momento contiene la logica di base per importare i `crm_deal`. Dovrai estendere la logica all'interno del ciclo `for` per includere l'importazione di:
- `crm_contact`
- `crm_company`
- `crm_note`
- `crm_log`

*Suggerimento*: Importa prima le Aziende e i Contatti per poterne salvare gli ID, in modo da poterli collegare correttamente quando importi i Deal.
