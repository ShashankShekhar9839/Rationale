import React, { createContext, useContext, useEffect, useState } from 'react'

type User = {
  id?: number
  email?: string
  name?: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (token: string, user?: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rationale_token'))
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('rationale_user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (token) localStorage.setItem('rationale_token', token)
    else localStorage.removeItem('rationale_token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('rationale_user', JSON.stringify(user))
    else localStorage.removeItem('rationale_user')
  }, [user])

  const login = (t: string, u?: User) => {
    setToken(t)
    if (u) setUser(u)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
