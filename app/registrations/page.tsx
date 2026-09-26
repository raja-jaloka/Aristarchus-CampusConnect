'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { CampusEvent, isPastEvent } from '@/data/events'
import { Registration } from '@/data/registrations'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'

type Row = { registration: Registration; event: CampusEvent }

export default function RegistrationsPage() {
  const { currentUser } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const load = useCallback(() => {
    if (currentUser.role !== 'student') return
    setLoading(true)
    fetch(`/api/registrations?studentId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => setRows(data.registrations ?? []))
      .finally(() => setLoading(false))
  }, [currentUser])

  useEffect(() => {
    load()
  }, [load])

  if (currentUser.role !== 'student') {
    return (
      <section className="shell" style={{ padding: '56px 0' }}>
        <EmptyState
          title="This page is for students"
          description="Switch to a student account from the top-right menu to see registered events."
        />
      </section>
    )
  }

  async function handleCancel(registrationId: string) {
    setCancellingId(registrationId)
    await fetch(`/api/registrations/${registrationId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: currentUser.id }),
    })
    setCancellingId(null)
    load()
  }

  const upcoming = rows.filter(
    (row) => row.registration.status !== 'cancelled' && !isPastEvent(row.event),
  )
  const pastOrCancelled = rows.filter(
    (row) => row.registration.status === 'cancelled' || isPastEvent(row.event),
  )

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow-tag">signed up as {currentUser.name}</span>
        <h1 style={{ fontSize: 30, marginTop: 10 }}>My registrations</h1>
        <p style={{ marginTop: 8 }}>
          Everything you've registered for, split into what's still ahead of
          you and what's already past or cancelled.
        </p>
      </div>

      {loading ? (
        <p style={{ fontSize: 14 }}>Loading your registrations…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No registrations yet"
          description="Once you register for an event, it'll show up here."
          action={
            <Link href="/events" className="btn btn-primary">
              Browse events
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <RegistrationGroup
            title="Upcoming"
            rows={upcoming}
            emptyText="Nothing upcoming yet."
            cancellingId={cancellingId}
            onCancel={handleCancel}
            allowCancel
          />
          <RegistrationGroup
            title="Past & cancelled"
            rows={pastOrCancelled}
            emptyText="Nothing here yet."
            cancellingId={cancellingId}
            onCancel={handleCancel}
            allowCancel={false}
          />
        </div>
      )}
    </section>
  )
}

function RegistrationGroup({
  title,
  rows,
  emptyText,
  cancellingId,
  onCancel,
  allowCancel,
}: {
  title: string
  rows: Row[]
  emptyText: string
  cancellingId: string | null
  onCancel: (id: string) => void
  allowCancel: boolean
}) {
  return (
    <div>
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>{title}</h2>
      {rows.length === 0 ? (
        <p style={{ fontSize: 13.5 }}>{emptyText}</p>
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map(({ registration, event }) => {
            const past = isPastEvent(event)
            const status =
              registration.status === 'cancelled' ? 'cancelled' : past ? 'past' : 'open'
            const canCancel = allowCancel && status === 'open'
            return (
              <li
                key={registration.id}
                className="card-surface"
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <Link
                    href={`/events/${event.id}`}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: 17,
                      textDecoration: 'none',
                    }}
                  >
                    {event.name}
                  </Link>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: 'var(--ink-soft)',
                      marginTop: 4,
                    }}
                  >
                    {new Date(event.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    · {event.venue}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StatusBadge status={status} />
                  <button
                    className="btn btn-secondary"
                    disabled={!canCancel || cancellingId === registration.id}
                    onClick={() => onCancel(registration.id)}
                    title={
                      canCancel
                        ? undefined
                        : status === 'cancelled'
                          ? 'Already cancelled'
                          : 'This event has already happened'
                    }
                  >
                    {cancellingId === registration.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
