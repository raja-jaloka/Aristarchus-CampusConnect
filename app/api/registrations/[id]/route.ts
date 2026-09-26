import { NextRequest, NextResponse } from 'next/server'
import { cancelRegistration } from '@/data/registrations'

// DELETE /api/registrations/[id] — student cancels their own
// registration. Body must include { studentId } so we can check
// ownership before cancelling.
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json().catch(() => ({}) as { studentId?: string })
  const studentId = body.studentId
  if (!studentId) {
    return NextResponse.json({ error: 'studentId is required.' }, { status: 400 })
  }

  const result = cancelRegistration(params.id, studentId)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ registration: result.registration })
}
