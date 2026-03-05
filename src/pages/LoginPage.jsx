import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <>
      <Navbar />
      <div className="container-page max-w-md">
        <form onSubmit={submit} className="card p-6 space-y-4">
          <h1 className="text-xl font-bold">Login</h1>
          {error && <p className="text-rose-700 text-sm">{error}</p>}
          <input className="input" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn-primary w-full" type="submit">Login</button>
          <p className="text-sm">No account? <Link className="underline" to="/register">Register</Link></p>
        </form>
      </div>
    </>
  )
}

export default LoginPage