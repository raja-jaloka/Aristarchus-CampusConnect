import { NextRequest, NextResponse } from 'next/server'
import {
  events,
  searchEventsByName,
  filterEventsByCategory,
  isPastEvent,
  validateEventInput,
  createEvent,
  EventCategory,
} from '@/data/events'

// GET /api/events?query=&category=&organizerId=
//
// - Without organizerId: the public/student listing. Past and
//   cancelled events are always hidden here.
// - With organizerId: the organizer dashboard for that organizer.
//   Returns every one of their events, including past/cancelled ones,
//   so they can see the full history of what they've posted.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') ?? ''
  const category = (searchParams.get('category') as EventCategory | 'All') ?? 'All'
  const organizerId = searchParams.get('organizerId')

  let list = events

  if (organizerId) {
    list = list.filter((event) => event.organizerId === organizerId)
  } else {
    list = list.filter((event) => !event.cancelled && !isPastEvent(event))
  }

  list = searchEventsByName(list, query)
  list = filterEventsByCategory(list, category)

  return NextResponse.json({ events: list })
}

// POST /api/events — organizer creates a new event.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { name, description, date, venue, category, capacity, organizerId } = body

  if (!organizerId) {
    return NextResponse.json({ error: 'Missing organizerId.' }, { status: 400 })
  }

  const numericCapacity = Number(capacity)
  const error = validateEventInput({ name, date, venue, capacity: numericCapacity })
  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  const event = createEvent({
    name,
    description,
    date,
    venue,
    category,
    capacity: numericCapacity,
    organizerId,
  })

  return NextResponse.json({ event }, { status: 201 })
}
