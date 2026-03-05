import React, { createContext, useEffect, useMemo, useState } from 'react'
import { login as loginApi, register as registerApi } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('auth_token')
    const userRaw = localStorage.getItem('auth_user')
    return {
      token,
      user: userRaw ? JSON.parse(userRaw) : null,
    }
  })

  useEffect(() => {
    if (auth.token) localStorage.setItem('auth_token', auth.token)
    else localStorage.removeItem('auth_token')

    if (auth.user) localStorage.setItem('auth_user', JSON.stringify(auth.user))
    else localStorage.removeItem('auth_user')
  }, [auth])

  const login = async (payload) => {
    const res = await loginApi(payload)
    setAuth({
      token: res.token,
      user: {
        userId: res.userId,
        name: res.name,
        email: res.email,
        communityId: res.communityId,
        communityName: res.communityName,
      },
    })
  }

  const register = async (payload) => {
    const res = await registerApi(payload)
    setAuth({
      token: res.token,
      user: {
        userId: res.userId,
        name: res.name,
        email: res.email,
        communityId: res.communityId,
        communityName: res.communityName,
      },
    })
  }

  const logout = () => setAuth({ token: null, user: null })

  const value = useMemo(
    () => ({ token: auth.token, user: auth.user, isAuthenticated: !!auth.token, login, register, logout }),
    [auth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}