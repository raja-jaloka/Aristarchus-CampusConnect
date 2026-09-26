import { NextResponse } from 'next/server'
import { users, toPublicUser } from '@/data/auth'

export async function GET() {
  return NextResponse.json({ users: users.map(toPublicUser) })
}
