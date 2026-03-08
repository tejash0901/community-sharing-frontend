import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, Lock } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

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
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#060608] min-h-screen grain">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] right-[20%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, rgb(var(--color-cyan)), transparent 70%)' }} />
        <div className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, rgb(var(--color-purple)), transparent 70%)' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
        <motion.div
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div variants={fadeUp} custom={0} className="text-center mb-10">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to access your community dashboard</p>
          </motion.div>

          {/* Form card */}
          <motion.form
            variants={fadeUp}
            custom={1}
            onSubmit={submit}
            className="rounded-2xl p-8 md:p-10 space-y-5"
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
                className="text-sm text-rose-400 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)' }}
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  className="input !pl-11"
                  placeholder="you@example.com"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  className="input !pl-11"
                  placeholder="Enter your password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              className="btn-primary w-full flex items-center justify-center gap-2 group mt-2"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </motion.form>

          {/* Footer link */}
          <motion.p variants={fadeUp} custom={2} className="text-center mt-8 text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium transition-colors hover:text-white"
              style={{ color: 'rgb(var(--color-cyan))' }}>
              Create one
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
