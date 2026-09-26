import { NextRequest, NextResponse } from 'next/server'
import { validateSignupInput, createUser, SignupInput } from '@/data/auth'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const input: SignupInput = {
    name: body.name ?? '',
    email: body.email ?? '',
    password: body.password ?? '',
    confirmPassword: body.confirmPassword ?? '',
    role: body.role,
  }

  const error = validateSignupInput(input)
  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  const user = createUser(input)
  return NextResponse.json({ user }, { status: 201 })
}
