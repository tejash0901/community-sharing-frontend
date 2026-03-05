import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', phoneNumber: '', communityInviteCode: '', block: '', floor: '', flatNumber: '',
  })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <>
      <Navbar />
      <div className="container-page max-w-lg">
        <form onSubmit={submit} className="card p-6 space-y-3">
          <h1 className="text-xl font-bold">Register</h1>
          {error && <p className="text-rose-700 text-sm">{error}</p>}
          <input className="input" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="input" placeholder="Phone Number" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          <input className="input" placeholder="Community Invite Code" required value={form.communityInviteCode} onChange={(e) => setForm({ ...form, communityInviteCode: e.target.value })} />
          <input className="input" placeholder="Block" value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} />
          <input className="input" placeholder="Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
          <input className="input" placeholder="Flat Number" value={form.flatNumber} onChange={(e) => setForm({ ...form, flatNumber: e.target.value })} />
          <button className="btn-primary w-full" type="submit">Create Account</button>
          <p className="text-sm">Already have account? <Link className="underline" to="/login">Login</Link></p>
        </form>
      </div>
    </>
  )
}

export default RegisterPage