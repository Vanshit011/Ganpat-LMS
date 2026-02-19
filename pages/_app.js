import '../styles/globals.css'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('lms_token')
    const u = localStorage.getItem('lms_user')
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
    }
    setLoading(false)
  }, [])

  const login = useCallback((t, u) => {
    localStorage.setItem('lms_token', t)
    localStorage.setItem('lms_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((u) => {
    localStorage.setItem('lms_user', JSON.stringify(u))
    setUser(u)
  }, [])

  const api = useCallback(async (url, options = {}) => {
    const t = localStorage.getItem('lms_token')
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Request failed')
    return data
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, api }}>
      {children}
    </AuthContext.Provider>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: { style: { background: '#14532d', color: '#fff' } },
          error:   { style: { background: '#dc2626', color: '#fff' } },
        }}
      />
    </AuthProvider>
  )
}
