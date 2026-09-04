'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const requested = searchParams.get('next') || '/marketplace'
  const next = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/marketplace'

  async function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const supabase = createClient()

      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name }, emailRedirectTo: `${window.location.origin}${next}` },
        })
        if (error) throw error
        if (data.session) window.location.href = next
        else setMessage('Account created. Check your email if confirmation is enabled.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = next
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to continue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <div className="form-card auth-card">
        <Link href="/" className="brand">DUKANEN <span>دكانين</span></Link>
        <p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Join the marketplace'}</p>
        <h2>{mode === 'login' ? 'Sign in to Dukanen' : 'Create your Dukanen account'}</h2>
        <p className="auth-note">Buy, save listings, contact sellers and grow into a Dukanen seller account.</p>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label htmlFor="name">Full name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </>
          )}

          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button className="primary auth-submit" disabled={loading} type="submit">
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <button className="auth-switch" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} type="button">
          {mode === 'login' ? 'New to Dukanen? Create an account' : 'Already have an account? Sign in'}
        </button>
      </div>
    </main>
  )
}
