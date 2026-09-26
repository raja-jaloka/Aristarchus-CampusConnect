'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { CampusEvent } from '@/data/events'
import EmptyState from '@/components/EmptyState'
import StatusBadge from '@/components/StatusBadge'
import EventForm, { EventFormValues } from '@/components/EventForm'

export default function OrganizerPage() {
  const { currentUser } = useAuth()
  const [events, setEvents] = useState<CampusEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const load = useCallback(() => {
    if (currentUser.role !== 'organizer') return
    setLoading(true)
    fetch(`/api/events?organizerId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => setEvents(data.events ?? []))
      .finally(() => setLoading(false))
  }, [currentUser])

  useEffect(() => {
    load()
  }, [load])

  if (currentUser.role !== 'organizer') {
    return (
      <section className="shell" style={{ padding: '56px 0' }}>
        <EmptyState
          title="This page is for organizers"
          description="Switch to an organizer account from the top-right menu to manage events."
        />
      </section>
    )
  }

  async function handleCreate(values: EventFormValues): Promise<string | null> {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, organizerId: currentUser.id }),
    })
    const data = await res.json()
    if (!res.ok) return data.error ?? 'Could not create event.'
    setCreating(false)
    load()
    return null
  }

  async function handleEdit(
    id: string,
    values: EventFormValues,
  ): Promise<string | null> {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const data = await res.json()
    if (!res.ok) return data.error ?? 'Could not update event.'
    setEditingId(null)
    load()
    return null
  }

  async function handleCancelEvent(id: string) {
    setCancellingId(id)
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
    setCancellingId(null)
    load()
  }

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      <div
        style={{
          marginBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <span className="eyebrow-tag">organizer console</span>
          <h1 style={{ fontSize: 30, marginTop: 10 }}>Manage your events</h1>
          <p style={{ marginTop: 8 }}>
            Create, edit, and cancel the events you've posted.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null)
            setCreating((v) => !v)
          }}
        >
          {creating ? 'Close' : '+ New event'}
        </button>
      </div>

      {creating && (
        <EventForm
          submitLabel="Create event"
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {loading ? (
        <p style={{ fontSize: 14 }}>Loading your events…</p>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events posted yet"
          description="Once you create an event, it'll show up here."
        />
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map((event) => {
            if (editingId === event.id) {
              return (
                <li key={event.id}>
                  <EventForm
                    initial={{
                      name: event.name,
                      description: event.description,
                      date: event.date,
                      venue: event.venue,
                      category: event.category,
                      capacity: event.capacity,
                    }}
                    submitLabel="Save changes"
                    onSubmit={(values) => handleEdit(event.id, values)}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              )
            }

            const status = event.cancelled
              ? 'cancelled'
              : event.seatsAvailable <= 0
                ? 'full'
                : 'open'
            return (
              <li
                key={event.id}
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
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: 17,
                    }}
                  >
                    {event.name}
                  </span>
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
                    · {event.venue} · {event.seatsAvailable}/{event.capacity}{' '}
                    seats
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StatusBadge status={status} />
                  <button
                    className="btn btn-secondary"
                    disabled={event.cancelled}
                    onClick={() => {
                      setCreating(false)
                      setEditingId(event.id)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-secondary"
                    disabled={event.cancelled || cancellingId === event.id}
                    onClick={() => handleCancelEvent(event.id)}
                  >
                    {event.cancelled
                      ? 'Cancelled'
                      : cancellingId === event.id
                        ? 'Cancelling…'
                        : 'Cancel'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
