// Seed data for registrations, so the "My Registrations" and Organizer
// pages have something real to display before participants build the
// actual registration flow (Task 2 and Task 3).

import { getEventById, isPastEvent } from './events'

export type RegistrationStatus = 'confirmed' | 'cancelled'

export interface Registration {
  id: string
  eventId: string
  studentId: string
  status: RegistrationStatus
  registeredAt: string // ISO date string
}

// NOTE FOR PARTICIPANTS: this array is the "database" of registrations.
// Task 2 (Registration) means pushing new items into this array when a
// student registers. Task 3 (Cancellation) means updating an item's
// status here. Keep using this same array — don't create a second store.
export const registrations: Registration[] = [
  {
    id: 'reg-01',
    eventId: 'evt-01',
    studentId: 'stu-1',
    status: 'confirmed',
    registeredAt: '2026-09-10T10:15:00',
  },
  {
    id: 'reg-02',
    eventId: 'evt-04',
    studentId: 'stu-1',
    status: 'confirmed',
    registeredAt: '2026-08-20T09:00:00',
  },
  {
    id: 'reg-03',
    eventId: 'evt-09',
    studentId: 'stu-1',
    status: 'confirmed',
    registeredAt: '2026-09-12T18:40:00',
  },
]

/** Simple lookup used by the placeholder "My Registrations" page. */
export function getRegistrationsForStudent(studentId: string): Registration[] {
  return registrations.filter((reg) => reg.studentId === studentId)
}

export function getRegistrationById(id: string): Registration | undefined {
  return registrations.find((reg) => reg.id === id)
}

/** An active (confirmed) registration for this student + event, if any. */
export function getActiveRegistration(
  eventId: string,
  studentId: string,
): Registration | undefined {
  return registrations.find(
    (reg) =>
      reg.eventId === eventId &&
      reg.studentId === studentId &&
      reg.status === 'confirmed',
  )
}

let nextRegNumber = registrations.length + 1

export interface RegisterResult {
  ok: boolean
  error?: string
  registration?: Registration
}

/**
 * Registers a student for an event, applying every guard Task 2 asks
 * for: event must exist, be open (not cancelled), be upcoming (not
 * past), have seats left, and the student must not already be
 * registered. Decrements seatsAvailable on success (fixes the "seat
 * count" and "duplicate registrations" bugs from Task 5 by
 * construction).
 */
export function registerStudentForEvent(
  eventId: string,
  studentId: string,
): RegisterResult {
  const event = getEventById(eventId)
  if (!event) return { ok: false, error: 'Event not found.' }
  if (event.cancelled) return { ok: false, error: 'This event has been cancelled.' }
  if (isPastEvent(event)) {
    return { ok: false, error: 'This event has already happened.' }
  }
  if (event.seatsAvailable <= 0) return { ok: false, error: 'This event is full.' }
  if (getActiveRegistration(eventId, studentId)) {
    return { ok: false, error: "You're already registered for this event." }
  }

  const registration: Registration = {
    id: `reg-${String(nextRegNumber++).padStart(2, '0')}`,
    eventId,
    studentId,
    status: 'confirmed',
    registeredAt: new Date().toISOString(),
  }
  registrations.push(registration)
  event.seatsAvailable -= 1
  return { ok: true, registration }
}

export interface CancelResult {
  ok: boolean
  error?: string
  registration?: Registration
}

/**
 * Cancels a registration (only the owning student may do so), marks
 * it 'cancelled' rather than removing it, and returns the seat to the
 * event. Refuses to double-cancel.
 */
export function cancelRegistration(id: string, studentId: string): CancelResult {
  const registration = getRegistrationById(id)
  if (!registration) return { ok: false, error: 'Registration not found.' }
  if (registration.studentId !== studentId) {
    return { ok: false, error: 'That registration does not belong to you.' }
  }
  if (registration.status === 'cancelled') {
    return { ok: false, error: 'This registration is already cancelled.' }
  }

  registration.status = 'cancelled'
  const event = getEventById(registration.eventId)
  if (event) {
    event.seatsAvailable = Math.min(event.capacity, event.seatsAvailable + 1)
  }
  return { ok: true, registration }
}
