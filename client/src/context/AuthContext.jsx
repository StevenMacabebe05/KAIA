import { createContext, useContext, useEffect, useState } from 'react'
import { HARDCODED_ACCOUNTS } from '../data/users'

const AuthContext = createContext(null)
const KEY = 'kaia_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(KEY)
    if (raw) setUser(JSON.parse(raw))
    setLoading(false)
  }, [])

  function persist(u) {
    if (u) localStorage.setItem(KEY, JSON.stringify(u))
    else localStorage.removeItem(KEY)
    setUser(u)
  }

  async function logIn({ email, password }) {
    const match = HARDCODED_ACCOUNTS.find(
      (u) => u.email === email && u.password === password
    )
    if (!match) throw new Error('Invalid email or password.')
    persist(match)
    return match
  }

  async function signUp({ name, email, password, role }) {
    if (HARDCODED_ACCOUNTS.some((u) => u.email === email)) {
      throw new Error('This email is already registered.')
    }
    const demoUser = {
      id: 'u-demo-' + Date.now(),
      name: name,
      email: email,
      role: role,
      ngoId: null,
      isDemo: true,
    }
    persist(demoUser)
    return demoUser
  }

  function logOut() {
    persist(null)
  }

  function updateUser(patch) {
    persist({ ...user, ...patch })
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, logIn, signUp, logOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}