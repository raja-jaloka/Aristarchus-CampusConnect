'use client'

import { CSSProperties, ReactNode, useState } from 'react'
import { EventCategory } from '@/data/events'

export interface EventFormValues {
  name: string
  description: string
  date: string
  venue: string
  category: EventCategory
  capacity: number
}

const CATEGORIES: EventCategory[] = [
  'Tech',
  'Cultural',
  'Sports',
  'Workshop',
  'Career',
  'Music',
]

export default function EventForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<EventFormValues>
  submitLabel: string
  onSubmit: (values: EventFormValues) => Promise<string | null>
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial?.date ? initial.date.slice(0, 16) : '')
  const [venue, setVenue] = useState(initial?.venue ?? '')
  const [category, setCategory] = useState<EventCategory>(initial?.category ?? 'Tech')
  const [capacity, setCapacity] = useState(initial?.capacity ?? 30)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await onSubmit({
      name,
      description,
      date,
      venue,
      category,
      capacity: Number(capacity),
    })
    setSubmitting(false)
    if (result) setError(result)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-surface"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        marginBottom: 16,
      }}
    >
      {error && (
        <p style={{ color: 'var(--rust)', fontSize: 13.5, margin: 0 }}>{error}</p>
      )}

      <Field label="Event name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' as const }}
        />
      </Field>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Field label="Date &amp; time">
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={inputStyle}
          />
        </Field>
        <Field label="Venue">
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
            style={inputStyle}
          />
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EventCategory)}
            style={inputStyle}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Capacity">
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            required
            style={inputStyle}
          />
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        fontSize: 13,
        flex: '1 1 200px',
      }}
    >
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
