'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { PublicUser } from '@/data/auth'

interface AuthContextValue {
  currentUser: PublicUser
  setCurrentUserId: (id: string) => void
  allUsers: PublicUser[]
  /** Adds a freshly-signed-up user to the known list (if needed) and
   * makes them the current user. */
  login: (user: PublicUser) => void
}

const FALLBACK_USER: PublicUser = {
  id: 'stu-1',
  name: 'Aditi Rao',
  email: 'aditi.rao@kiit.ac.in',
  role: 'student',
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [allUsers, setAllUsers] = useState<PublicUser[]>([FALLBACK_USER])
  const [currentUserId, setCurrentUserId] = useState(FALLBACK_USER.id)

  // The account list now lives server-side (so newly signed-up users
  // show up everywhere), so fetch it instead of importing the seed
  // array directly.
  useEffect(() => {
    fetch('/api/auth/users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.users) && data.users.length > 0) {
          setAllUsers(data.users)
        }
      })
      .catch(() => {
        // Keep the fallback seed user if the fetch fails.
      })
  }, [])

  const currentUser =
    allUsers.find((u) => u.id === currentUserId) ?? allUsers[0] ?? FALLBACK_USER

  function login(user: PublicUser) {
    setAllUsers((prev) => (prev.some((u) => u.id === user.id) ? prev : [...prev, user]))
    setCurrentUserId(user.id)
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, setCurrentUserId, allUsers, login }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return context
}
