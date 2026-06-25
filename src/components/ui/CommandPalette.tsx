'use client'

import React, { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { Briefcase, Users, Building, Search } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import styles from './CommandPalette.module.css'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<{ type: string, id: string, name: string }[]>([])
  const router = useRouter()
  const supabase = createClient()

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    const fetchResults = async () => {
      if (search.length < 2) {
        setResults([])
        return
      }
      
      const { data: deals } = await supabase.from('deals').select('id, title').ilike('title', `%${search}%`).limit(3)
      const { data: contacts } = await supabase.from('contacts').select('id, first_name, last_name').or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`).limit(3)
      const { data: companies } = await supabase.from('companies').select('id, name').ilike('name', `%${search}%`).limit(3)
      
      const formatted = [
        ...(deals || []).map(d => ({ type: 'deal', id: d.id, name: d.title })),
        ...(contacts || []).map(c => ({ type: 'contact', id: c.id, name: `${c.first_name} ${c.last_name || ''}`.trim() })),
        ...(companies || []).map(c => ({ type: 'company', id: c.id, name: c.name }))
      ]
      
      setResults(formatted)
    }
    
    const timeout = setTimeout(fetchResults, 300)
    return () => clearTimeout(timeout)
  }, [search, supabase])

  const onSelect = (type: string, id: string) => {
    setOpen(false)
    if (type === 'deal') router.push(`/deals?id=${id}`) // Può aprire il drawer in seguito
    if (type === 'contact') router.push(`/contacts?id=${id}`)
    if (type === 'company') router.push(`/companies?id=${id}`)
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <Command className={styles.command}>
          <div className={styles.header}>
            <Search size={20} className={styles.searchIcon} />
            <Command.Input 
              autoFocus 
              placeholder="Cerca deal, contatti, aziende..." 
              className={styles.input}
              value={search}
              onValueChange={setSearch}
            />
            <div className={styles.escBadge}>ESC</div>
          </div>
          <Command.List className={styles.list}>
            {search.length > 0 && results.length === 0 && (
              <Command.Empty className={styles.empty}>Nessun risultato trovato per "{search}"</Command.Empty>
            )}
            
            {results.length > 0 && (
              <Command.Group heading="Risultati">
                {results.map((item) => (
                  <Command.Item 
                    key={`${item.type}-${item.id}`} 
                    onSelect={() => onSelect(item.type, item.id)}
                    className={styles.item}
                  >
                    {item.type === 'deal' && <Briefcase size={16} />}
                    {item.type === 'contact' && <Users size={16} />}
                    {item.type === 'company' && <Building size={16} />}
                    <span>{item.name}</span>
                    <span className={styles.typeBadge}>{item.type}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Azioni rapide">
              <Command.Item onSelect={() => { router.push('/board'); setOpen(false); }} className={styles.item}>
                Vai alla Kanban Board
              </Command.Item>
              <Command.Item onSelect={() => { router.push('/settings'); setOpen(false); }} className={styles.item}>
                Apri Impostazioni
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
