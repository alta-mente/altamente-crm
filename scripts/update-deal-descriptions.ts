import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as xml2js from 'xml2js'
import * as dotenv from 'dotenv'

// Carica variabili d'ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRORE: Credenziali Supabase mancanti nel file .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateDescriptions() {
  console.log('🚀 Avvio aggiornamento descrizioni da WordPress a Supabase...')

  const scriptsDir = path.resolve(process.cwd(), 'scripts')
  const files = fs.readdirSync(scriptsDir).filter(f => f.startsWith('wp-export') && f.endsWith('.xml'))
  
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
  console.log(`✅ Trovati ${deals.length} Deal. Controllo descrizioni...`)

  let updateCount = 0

  for (const item of deals) {
    const title = item.title?.[0] || 'Senza Titolo'
    const description = item['content:encoded']?.[0] || ''
    
    if (description && description.trim() !== '') {
      // Cerca il deal nel DB
      const { data: existingDeal } = await supabase
        .from('deals')
        .select('id')
        .eq('title', title)
        .limit(1)
        .single()
        
      if (existingDeal) {
        const { error } = await supabase
          .from('deals')
          .update({ description })
          .eq('id', existingDeal.id)
          
        if (error) {
          console.error(`❌ Errore aggiornamento "${title}":`, error.message)
        } else {
          console.log(`✅ Aggiornata descrizione per: ${title}`)
          updateCount++
        }
      }
    }
  }

  console.log(`🎉 Operazione completata! Aggiornate ${updateCount} descrizioni.`)
}

updateDescriptions().catch(console.error)
