import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

export type UserRole = 'student' | 'organizer'

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  // Only present for accounts created through signup. The two seed
  // accounts below are demo accounts (no real credentials), which is
  // why they're excluded from this — they're switched to directly
  // from the navbar dropdown, same as before.
  passwordHash?: string
  passwordSalt?: string
}

export type PublicUser = Omit<AppUser, 'passwordHash' | 'passwordSalt'>

export const users: AppUser[] = [
  { id: 'stu-1', name: 'Aditi Rao', email: 'aditi.rao@kiit.ac.in', role: 'student' },
  { id: 'org-1', name: 'Rohan Verma', email: 'rohan.verma@kiit.ac.in', role: 'organizer' },
]

export function getUserById(id: string): AppUser | undefined {
  return users.find((user) => user.id === id)
}

export function getUserByEmail(email: string): AppUser | undefined {
  const target = email.trim().toLowerCase()
  return users.find((user) => user.email.toLowerCase() === target)
}

export function toPublicUser(user: AppUser): PublicUser {
  const { passwordHash, passwordSalt, ...publicUser } = user
  return publicUser
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('hex')
}

/** Constant-time password check. Returns false for accounts with no
 * password set (the two demo seed accounts). */
export function verifyPassword(user: AppUser, password: string): boolean {
  if (!user.passwordHash || !user.passwordSalt) return false
  const candidate = Buffer.from(hashPassword(password, user.passwordSalt), 'hex')
  const stored = Buffer.from(user.passwordHash, 'hex')
  return stored.length === candidate.length && timingSafeEqual(stored, candidate)
}

function nextIdForRole(role: UserRole): string {
  const prefix = role === 'student' ? 'stu' : 'org'
  const numbers = users
    .filter((u) => u.id.startsWith(`${prefix}-`))
    .map((u) => Number(u.id.slice(prefix.length + 1)))
    .filter((n) => Number.isFinite(n))
  const next = numbers.length ? Math.max(...numbers) + 1 : 1
  return `${prefix}-${next}`
}

export interface SignupInput {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
}

/** Returns an error message, or null if the input is valid. */
export function validateSignupInput(input: SignupInput): string | null {
  if (!input.name || !input.name.trim()) return 'Name is required.'

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!input.email || !emailPattern.test(input.email.trim())) {
    return 'Enter a valid email address.'
  }
  if (getUserByEmail(input.email)) {
    return 'An account with that email already exists.'
  }
  if (!input.password || input.password.length < 8) {
    return 'Password must be at least 8 characters.'
  }
  if (input.password !== input.confirmPassword) {
    return 'Passwords do not match.'
  }
  if (input.role !== 'student' && input.role !== 'organizer') {
    return 'Role must be student or organizer.'
  }
  return null
}

export function createUser(input: SignupInput): PublicUser {
  const salt = randomBytes(16).toString('hex')
  const user: AppUser = {
    id: nextIdForRole(input.role),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    passwordHash: hashPassword(input.password, salt),
    passwordSalt: salt,
  }
  users.push(user)
  return toPublicUser(user)
}
