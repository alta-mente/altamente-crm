'use client'

import React, { useState } from 'react'
import clsx from 'clsx'
import { Menu, Bell, Search, Calendar } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { AgendaSidebar } from './AgendaSidebar'
import { NotificationManager } from './NotificationManager'
import { CommandPalette } from '../ui/CommandPalette'
import styles from './DashboardLayout.module.css'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [isAgendaOpen, setIsAgendaOpen] = useState(false)

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsMobileOpen(true)
    } else {
      setIsDesktopCollapsed(!isDesktopCollapsed)
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isMobileOpen} isCollapsed={isDesktopCollapsed} onClose={() => setIsMobileOpen(false)} />
      <NotificationManager />
      
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <main className={clsx(styles.main, isDesktopCollapsed && styles.mainCollapsed)}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.menuButton}
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <h1 className={styles.title}>{title}</h1>
          </div>
          
          <div className={styles.headerRight}>
            <button 
              className={styles.iconButton}
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              title="Cerca (Cmd+K)"
            >
              <Search size={20} />
            </button>
            <button 
              className={styles.iconButton} 
              onClick={() => setIsAgendaOpen(true)}
              title="Task & Memo"
            >
              <Bell size={20} />
            </button>
          </div>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </main>

      <AgendaSidebar isOpen={isAgendaOpen} onClose={() => setIsAgendaOpen(false)} />
      <CommandPalette />
    </div>
  )
}
