import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '@/lib/api'

type AuthContextValue = {
  isAuthenticated: boolean
  initialized: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // check cookie
    // We use /tasks 
    void (async () => {
      try {
        await api.get('/tasks')
        setIsAuthenticated(true)
      } catch {
        setIsAuthenticated(false)
      } finally {
        setInitialized(true)
      }
    })()
  }, [])

  const login = () => {
    setIsAuthenticated(true)
  }

  const logout = () => {
    setIsAuthenticated(false)
    // Inform backend to clear HttpOnly cookie; ignore failures so UI still logs out.
    void (async () => {
      try {
        await api.post('/logout')
      } catch {
        // no-op
      }
    })()
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

