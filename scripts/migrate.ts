import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as xml2js from 'xml2js'
import * as dotenv from 'dotenv'

// Carica variabili d'ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Usa la Service Role Key per bypassare RLS

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRORE: Credenziali Supabase mancanti nel file .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Mappatura Fasi WP -> Fasi Supabase
// Adattato in base alle tue fasi standard. Le aggiuntive ('archivio', 'stand-by') le mettiamo in 'lost' e 'contacted',
// a meno che tu non decida di creare queste fasi in DB.
const phaseMapping: Record<string, string> = {
  'nuovi': 'unassigned',
  'contattati': 'contacted',
  'appuntamento': 'meeting',
  'preventivo-inviato': 'proposal',
  'trattativa': 'negotiation',
  'vinto': 'won',
  'perso': 'lost',
  'archivio': 'lost', // Default fallback
  'stand-by': 'contacted' // Default fallback
}

// Helper per estrarre un meta_value da un array di postmeta
function getMetaValue(postmetaArray: any[], key: string): any {
  if (!postmetaArray) return null
  const meta = postmetaArray.find((m: any) => m['wp:meta_key']?.[0] === key)
  return meta ? meta['wp:meta_value']?.[0] : null
}

async function migrateData() {
  console.log('🚀 Avvio migrazione da WordPress a Supabase...')

  const scriptsDir = path.resolve(process.cwd(), 'scripts')
  const files = fs.readdirSync(scriptsDir).filter(f => f.startsWith('wp-export') && f.endsWith('.xml'))
  
  if (files.length === 0) {
    console.error(`❌ ERRORE: Nessun file trovato in ${scriptsDir}`)
    console.error('Per favore inserisci i file esportati da WordPress in questa cartella (es. wp-export.xml)')
    process.exit(1)
  }

  let allItems: any[] = []

  for (const filename of files) {
    const xmlPath = path.resolve(scriptsDir, filename)
    console.log(`📄 Lettura file XML: ${filename}...`)
    const xmlData = fs.readFileSync(xmlPath, 'utf8')
    
    const parser = new xml2js.Parser()
    const result = await parser.parseStringPromise(xmlData)
    const items = result.rss.channel[0].item || []
    allItems = allItems.concat(items)
  }
  
  // Filtra solo i deal
  const deals = allItems.filter((item: any) => item['wp:post_type']?.[0] === 'crm_deal')
  
  console.log(`✅ Trovati ${deals.length} Deal da migrare. Inizio elaborazione...`)

  let successCount = 0
  let errorCount = 0

  for (const item of deals) {
    try {
      const title = item.title?.[0] || 'Senza Titolo'
      const description = item['content:encoded']?.[0] || ''
      const createdAt = item['wp:post_date_gmt']?.[0] || new Date().toISOString()
      
      // Estrai Fase (Categoria)
      const categories = item.category || []
      const phaseCategory = categories.find((c: any) => c.$?.domain === 'sales_phase')
      const originalPhaseSlug = phaseCategory?.$?.nicename || 'unassigned'
      const mappedPhase = phaseMapping[originalPhaseSlug] || 'unassigned'

      // Estrai Metadati
      const postmeta = item['wp:postmeta'] || []
      const valueStr = getMetaValue(postmeta, '_msc_deal_value')
      const value = valueStr ? parseFloat(valueStr) : 0
      
      const contactNameCache = getMetaValue(postmeta, '_msc_deal_contact_name_cache') || 'Sconosciuto'

      // 1. CREA O TROVA CONTATTO
      // Siccome WP nel dump XML (se esportati solo i Deal) non ha le email dei contatti,
      // usiamo il nome per creare un contatto fittizio.
      let contactId = null
      
      // Cerca se esiste già un contatto con questo nome
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('id')
        .eq('first_name', contactNameCache)
        .limit(1)
        .single()

      if (existingContact) {
        contactId = existingContact.id
      } else {
        const { data: newContact, error: contactError } = await supabase
          .from('contacts')
          .insert([{ first_name: contactNameCache, last_name: '' }])
          .select('id')
          .single()
          
        if (newContact) contactId = newContact.id
      }

      // 2. CREA IL DEAL
      const dealData = {
        title,
        contact_id: contactId,
        value,
        phase_id: mappedPhase,
        source: 'web',
        created_at: createdAt,
        updated_at: item['wp:post_modified_gmt']?.[0] || createdAt
      }

      const { error: dealError } = await supabase
        .from('deals')
        .insert([dealData])

      if (dealError) {
        console.error(`❌ Errore importazione deal "${title}":`, dealError.message)
        errorCount++
      } else {
        successCount++
        console.log(`✅ Importato: ${title} (Valore: €${value}, Fase: ${mappedPhase})`)
      }

    } catch (err: any) {
      console.error(`❌ Errore imprevisto sul deal:`, err.message)
      errorCount++
    }
  }

  console.log('----------------------------------------------------')
  console.log(`🎉 Migrazione completata!`)
  console.log(`✅ Deal importati: ${successCount}`)
  if (errorCount > 0) console.log(`❌ Deal falliti: ${errorCount}`)
  console.log('----------------------------------------------------')
}

migrateData().catch(console.error)
