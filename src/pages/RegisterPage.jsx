import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', phoneNumber: '', communityInviteCode: '', block: '', floor: '', flatNumber: '',
  })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-2">Join your community and start sharing tools</p>
          </div>
          <form onSubmit={submit} className="card p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Personal Info */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Full Name</label>
                  <input className="input" placeholder="John Doe" required value={form.name} onChange={set('name')} />
                </div>
                <div>
                  <label className="input-label">Email</label>
                  <input className="input" placeholder="you@example.com" type="email" required value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <label className="input-label">Password</label>
                  <input className="input" placeholder="Minimum 6 characters" type="password" required minLength={6} value={form.password} onChange={set('password')} />
                </div>
                <div>
                  <label className="input-label">Phone Number</label>
                  <input className="input" placeholder="+91 98765 43210" type="tel" required value={form.phoneNumber} onChange={set('phoneNumber')} />
                </div>
              </div>
            </div>

            {/* Community */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Community</h2>
              <div>
                <label className="input-label">Invite Code</label>
                <input className="input" placeholder="Enter your community invite code" required value={form.communityInviteCode} onChange={set('communityInviteCode')} />
              </div>
            </div>

            {/* Address */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Address Details</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="input-label">Block</label>
                  <input className="input" placeholder="A" required value={form.block} onChange={set('block')} />
                </div>
                <div>
                  <label className="input-label">Floor</label>
                  <input className="input" placeholder="3" required value={form.floor} onChange={set('floor')} />
                </div>
                <div>
                  <label className="input-label">Flat No.</label>
                  <input className="input" placeholder="301" required value={form.flatNumber} onChange={set('flatNumber')} />
                </div>
              </div>
            </div>

            <button className="btn-primary w-full" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <p className="text-sm text-center text-gray-500">
              Already have an account?{' '}
              <Link className="text-brand-600 hover:text-brand-700 font-medium" to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}

export default RegisterPage
