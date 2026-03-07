import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-2">Sign in to your community account</p>
          </div>
          <form onSubmit={submit} className="card p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <div>
              <label className="input-label">Email</label>
              <input className="input" placeholder="you@example.com" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input className="input" placeholder="Enter your password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn-primary w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="text-sm text-center text-gray-500">
              Don't have an account?{' '}
              <Link className="text-brand-600 hover:text-brand-700 font-medium" to="/register">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}

export default LoginPage
