import React from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { login, signup } from './actions'
import styles from './login.module.css'

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams
  const message = searchParams?.message

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>altamente CRM</h1>
          <p className={styles.subtitle}>Accedi per gestire i tuoi deal</p>
        </div>

        <form className={styles.form}>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="tu@esempio.com"
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            required
          />

          <div className={styles.actions}>
            <Button formAction={login} type="submit" variant="primary" style={{ width: '100%' }}>
              Accedi
            </Button>
            <Button formAction={signup} type="submit" variant="ghost" style={{ width: '100%' }}>
              Crea un account
            </Button>
          </div>

          {message && <p className={styles.error}>{message}</p>}
        </form>
      </div>
    </div>
  )
}
