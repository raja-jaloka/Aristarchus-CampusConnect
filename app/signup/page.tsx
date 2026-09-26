'use client'

import { CSSProperties, FormEvent, ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { UserRole } from '@/data/auth'

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not create your account.')
        return
      }
      login(data.user)
      router.push(role === 'organizer' ? '/organizer' : '/events')
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="shell" style={{ padding: '56px 0 64px', maxWidth: 480 }}>
      <span className="eyebrow-tag">join campus connect</span>
      <h1 style={{ fontSize: 28, marginTop: 10, marginBottom: 8 }}>
        Create an account
      </h1>
      <p style={{ marginBottom: 24 }}>
        Sign up as a student to register for events, or as an organizer to
        post your own.
      </p>

      <form
        onSubmit={handleSubmit}
        className="card-surface"
        style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        {error && (
          <p style={{ color: 'var(--rust)', fontSize: 13.5, margin: 0 }}>{error}</p>
        )}

        <Field label="Full name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
          />
        </Field>
        <Field label="Confirm password">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
          />
        </Field>
        <Field label="I'm signing up as">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            style={inputStyle}
          >
            <option value="student">Student</option>
            <option value="organizer">Organizer</option>
          </select>
        </Field>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: 13.5 }}>
        Just exploring?{' '}
        <Link href="/" style={{ fontWeight: 600 }}>
          Go back home
        </Link>{' '}
        and use the account switcher in the navbar instead.
      </p>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13 }}>
      <span style={{ color: 'var(--ink-soft)' }}>{label}</span>
      {children}
    </label>
  )
}

const inputStyle: CSSProperties = {
  padding: '9px 12px',
  border: '1.5px solid var(--line)',
  borderRadius: 'var(--radius)',
  fontSize: 14,
  fontFamily: 'inherit',
  background: 'var(--paper-raised)',
  color: 'var(--ink)',
}
