import React from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import styles from './Table.module.css'

interface Column<T> {
  key: string
  title: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  sortConfig?: { key: string; direction: 'asc' | 'desc' } | null
  onSort?: (key: string) => void
}

export function Table<T extends Record<string, any>>({ columns, data, sortConfig, onSort }: TableProps<T>) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={styles.th}
                onClick={() => col.sortable && onSort && onSort(col.key)}
                style={{ cursor: col.sortable ? 'pointer' : 'default' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {col.title}
                  {col.sortable && (
                    <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                      {sortConfig?.key === col.key ? (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      ) : (
                        <ArrowUpDown size={14} opacity={0.3} />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.td} style={{ textAlign: 'center', padding: '2rem' }}>
                Nessun dato trovato.
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr 
                key={item.id || i} 
                className={styles.tr}
              >
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
                    {col.render ? col.render(item) : item[col.key as keyof T]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
