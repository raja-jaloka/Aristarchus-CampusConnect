import { NextRequest, NextResponse } from 'next/server'
import {
  getEventById,
  updateEvent,
  cancelEventById,
  validateEventInput,
} from '@/data/events'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const event = getEventById(params.id)
  if (!event) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  }
  return NextResponse.json({ event })
}

// PATCH /api/events/[id] — organizer edits their event.
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const existing = getEventById(params.id)
  if (!existing) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const merged = {
    name: body.name ?? existing.name,
    date: body.date ?? existing.date,
    venue: body.venue ?? existing.venue,
    capacity: body.capacity !== undefined ? Number(body.capacity) : existing.capacity,
  }
  const error = validateEventInput(merged)
  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  const event = updateEvent(params.id, {
    name: body.name,
    description: body.description,
    date: body.date,
    venue: body.venue,
    category: body.category,
    capacity: body.capacity !== undefined ? Number(body.capacity) : undefined,
  })

  return NextResponse.json({ event })
}

// DELETE /api/events/[id] — organizer cancels their event (soft
// delete: the record stays so existing registrations can still
// resolve it, but it's hidden from students).
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const event = cancelEventById(params.id)
  if (!event) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  }
  return NextResponse.json({ event })
}
