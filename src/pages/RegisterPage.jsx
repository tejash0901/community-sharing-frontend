import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import { motion } from 'framer-motion'
import { ArrowRight, User, Mail, Lock, Phone, Hash, Building, Layers } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

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
      setError(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const fields = [
    { key: 'name', label: 'Full Name', icon: User, placeholder: 'John Doe', type: 'text', required: true },
    { key: 'email', label: 'Email', icon: Mail, placeholder: 'you@example.com', type: 'email', required: true },
    { key: 'password', label: 'Password', icon: Lock, placeholder: 'Min. 6 characters', type: 'password', required: true },
    { key: 'phoneNumber', label: 'Phone', icon: Phone, placeholder: '+91 9876543210', type: 'tel', required: false },
    { key: 'communityInviteCode', label: 'Invite Code', icon: Hash, placeholder: 'Community invite code', type: 'text', required: true },
  ]

  const addressFields = [
    { key: 'block', label: 'Block', icon: Building, placeholder: 'A', type: 'text' },
    { key: 'floor', label: 'Floor', icon: Layers, placeholder: '3', type: 'text' },
    { key: 'flatNumber', label: 'Flat No.', icon: Hash, placeholder: '301', type: 'text' },
  ]

  return (
    <div className="bg-[#060608] min-h-screen grain">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, rgb(var(--color-purple)), transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, rgb(var(--color-cyan)), transparent 70%)' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
        <motion.div
          initial="hidden"
          animate="visible"
          className="w-full max-w-lg"
        >
          {/* Header */}
          <motion.div variants={fadeUp} custom={0} className="text-center mb-10">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">Join your community</h1>
            <p className="text-slate-500 text-sm">Create an account to start sharing tools with neighbors</p>
          </motion.div>

          {/* Form card */}
          <motion.form
            variants={fadeUp}
            custom={1}
            onSubmit={submit}
            className="rounded-2xl p-8 md:p-10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-rose-400 px-4 py-3 rounded-xl mb-6"
                style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)' }}
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-5">
              {/* Main fields */}
              {fields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    {f.label}
                    {f.required && <span style={{ color: 'rgb(var(--color-cyan))' }}>*</span>}
                  </label>
                  <div className="relative">
                    <f.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      className="input !pl-11"
                      placeholder={f.placeholder}
                      type={f.type}
                      required={f.required}
                      value={form[f.key]}
                      onChange={set(f.key)}
                    />
                  </div>
                </div>
              ))}

              {/* Address section */}
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <span className="text-[10px] uppercase tracking-[0.15em] text-slate-600 font-medium">Address (optional)</span>
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {addressFields.map((f) => (
                    <div key={f.key} className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{f.label}</label>
                      <div className="relative">
                        <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                        <input
                          className="input !pl-9 text-sm"
                          placeholder={f.placeholder}
                          type={f.type}
                          value={form[f.key]}
                          onChange={set(f.key)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                className="btn-primary w-full flex items-center justify-center gap-2 group mt-3"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Creating account...' : 'Create account'}</span>
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </motion.form>

          {/* Footer link */}
          <motion.p variants={fadeUp} custom={2} className="text-center mt-8 text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium transition-colors hover:text-white"
              style={{ color: 'rgb(var(--color-cyan))' }}>
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default RegisterPage
