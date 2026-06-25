import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as xml2js from 'xml2js'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRORE: Credenziali Supabase mancanti nel file .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

function getMetaValue(postmetaArray: any[], key: string): any {
  if (!postmetaArray) return null
  const meta = postmetaArray.find((m: any) => m['wp:meta_key']?.[0] === key)
  return meta ? meta['wp:meta_value']?.[0] : null
}

async function migrateCompanies() {
  console.log('🚀 Avvio migrazione Aziende da WordPress a Supabase...')

  const scriptsDir = path.resolve(process.cwd(), 'scripts')
  const files = fs.readdirSync(scriptsDir).filter(f => f.startsWith('compan') && f.endsWith('.xml'))
  
  if (files.length === 0) {
    console.error(`❌ ERRORE: Nessun file trovato in ${scriptsDir}`)
    console.error('Per favore inserisci i file esportati in questa cartella (es. companies-export.xml)')
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
  
  const companies = allItems.filter((item: any) => item['wp:post_type']?.[0] === 'crm_company')
  
  console.log(`✅ Trovate ${companies.length} Aziende da migrare. Inizio elaborazione...`)

  let successCount = 0
  let errorCount = 0

  for (const item of companies) {
    try {
      const name = item.title?.[0] || 'Senza Nome'
      const createdAt = item['wp:post_date_gmt']?.[0] || new Date().toISOString()
      
      const postmeta = item['wp:postmeta'] || []
      const vat = getMetaValue(postmeta, '_msc_company_p_iva') || null
      const phone = getMetaValue(postmeta, '_msc_company_phone') || null
      const address = getMetaValue(postmeta, '_msc_company_address') || null
      const email = getMetaValue(postmeta, '_stt_contact_email') || null

      const companyData = {
        name,
        vat_number: vat,
        address,
        created_at: createdAt
      }

      // Evita duplicati basandosi sul nome
      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .eq('name', name)
        .single()

      if (existing) {
        // Opzionale: potremmo aggiornare se esiste
        console.log(`⚠️ Azienda già esistente saltata: ${name}`)
        continue
      }

      const { error: insertError } = await supabase
        .from('companies')
        .insert([companyData])

      if (insertError) {
        console.error(`❌ Errore importazione azienda "${name}":`, insertError.message)
        errorCount++
      } else {
        successCount++
        console.log(`✅ Importata: ${name}`)
      }

    } catch (err: any) {
      console.error(`❌ Errore imprevisto sull'azienda:`, err.message)
      errorCount++
    }
  }

  console.log('----------------------------------------------------')
  console.log(`🎉 Migrazione completata!`)
  console.log(`✅ Aziende importate: ${successCount}`)
  if (errorCount > 0) console.log(`❌ Aziende fallite: ${errorCount}`)
  console.log('----------------------------------------------------')
}

migrateCompanies().catch(console.error)
