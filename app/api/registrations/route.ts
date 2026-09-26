import { NextRequest, NextResponse } from 'next/server'
import { registrations, registerStudentForEvent } from '@/data/registrations'
import { getEventById } from '@/data/events'

// GET /api/registrations?studentId=stu-1
//
// Returns this student's registrations joined with their event.
// Registrations for events an organizer has since cancelled are
// dropped entirely, per Task 4's "hide cancelled events and their
// registrations from students".
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')
  if (!studentId) {
    return NextResponse.json({ error: 'studentId is required.' }, { status: 400 })
  }

  const mine = registrations
    .filter((reg) => reg.studentId === studentId)
    .map((registration) => ({
      registration,
      event: getEventById(registration.eventId),
    }))
    .filter(
      (row): row is { registration: typeof row.registration; event: NonNullable<typeof row.event> } =>
        row.event !== undefined && !row.event.cancelled,
    )

  return NextResponse.json({ registrations: mine })
}

// POST /api/registrations — student registers for an event.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { eventId, studentId } = body
  if (!eventId || !studentId) {
    return NextResponse.json(
      { error: 'eventId and studentId are required.' },
      { status: 400 },
    )
  }

  const result = registerStudentForEvent(eventId, studentId)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ registration: result.registration }, { status: 201 })
}
