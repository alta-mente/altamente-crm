'use client'

import React, { useState } from 'react'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAgendaOpen, setIsAgendaOpen] = useState(false)

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} />
      <NotificationManager />
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.menuButton}
              onClick={() => setIsSidebarOpen(true)}
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
              title="Agenda"
            >
              <Calendar size={20} />
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
