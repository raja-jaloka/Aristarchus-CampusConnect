'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

export default function RegisterButton({
  eventId,
  canRegister,
  fallbackLabel,
}: {
  eventId: string
  canRegister: boolean
  fallbackLabel: string
}) {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  )

  const isStudent = currentUser.role === 'student'

  if (!isStudent) {
    return (
      <button
        className="btn btn-primary"
        disabled
        style={{ marginTop: 4 }}
        title="Switch to a student account from the top-right menu to register"
      >
        Log in as a student to register
      </button>
    )
  }

  async function handleRegister() {
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, studentId: currentUser.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error ?? 'Something went wrong.' })
      } else {
        setMessage({ type: 'success', text: "You're registered!" })
        router.refresh()
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error — please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
      <button
        className="btn btn-primary"
        disabled={!canRegister || submitting}
        onClick={handleRegister}
      >
        {submitting ? 'Registering…' : canRegister ? 'Register' : fallbackLabel}
      </button>
      {message && (
        <p
          style={{
            fontSize: 13,
            margin: 0,
            color: message.type === 'error' ? 'var(--rust)' : 'var(--green)',
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
