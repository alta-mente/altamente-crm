'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { LayoutDashboard, Users, Building, Settings, LogOut, Briefcase, BookOpen, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import styles from './Sidebar.module.css'
import { Button } from '../ui/Button'

interface SidebarProps {
  isOpen: boolean
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Vendite (Deal)', href: '/board', icon: Briefcase },
    { name: 'Progetti', href: '/projects', icon: BookOpen },
    { name: 'Scadenze', href: '/services', icon: CalendarIcon },
    { name: 'Ore (Consuntivi)', href: '/time-tracking', icon: Clock },
    { name: 'Contatti', href: '/contacts', icon: Users },
    { name: 'Aziende', href: '/companies', icon: Building },
    { name: 'Impostazioni', href: '/settings', icon: Settings },
  ]

  return (
    <aside className={clsx(styles.sidebar, isOpen && styles.sidebarOpen)}>
      <div className={styles.header}>
        altamente CRM
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={clsx(styles.navItem, isActive && styles.navItemActive)}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <Button variant="ghost" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--color-danger)' }} onClick={handleLogout}>
          <LogOut size={20} />
          Esci
        </Button>
      </div>
    </aside>
  )
}
