import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../hooks/useAuth'
import { getTools } from '../services/toolService'
import { getDashboard } from '../services/bookingService'
import { motion } from 'framer-motion'
import { User, Mail, Building, Layers, Hash, Package, ArrowLeftRight, MapPin, Shield } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function ProfilePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ toolsListed: 0, toolsBorrowed: 0, activeBookings: 0 })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [allTools, dashboard] = await Promise.all([getTools(), getDashboard()])
        const myTools = allTools.filter(t => t.ownerId === user?.userId)
        const active = dashboard.borrowedTools?.filter(b => !['RETURNED', 'CANCELLED', 'REJECTED'].includes(b.status)) || []
        setStats({
          toolsListed: myTools.length,
          toolsBorrowed: dashboard.borrowedTools?.length || 0,
          activeBookings: active.length,
        })
      } catch {}
    }
    loadStats()
  }, [user])

  const infoFields = [
    { icon: User, label: 'Name', value: user?.name },
    { icon: Mail, label: 'Email', value: user?.email },
    { icon: Shield, label: 'Community', value: user?.communityName },
  ]

  const statCards = [
    { icon: Package, label: 'Tools Listed', value: stats.toolsListed, color: 'cyan' },
    { icon: ArrowLeftRight, label: 'Total Borrowings', value: stats.toolsBorrowed, color: 'purple' },
    { icon: MapPin, label: 'Active Bookings', value: stats.activeBookings, color: 'cyan' },
  ]

  return (
    <div className="bg-[#060608] min-h-screen grain">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <motion.div initial="hidden" animate="visible">
          {/* Avatar + Name */}
          <motion.div variants={fadeUp} custom={0} className="text-center mb-12">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgb(var(--color-cyan)), rgb(var(--color-purple)))' }}>
              <span className="font-display font-bold text-2xl text-white">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl text-white mb-1">{user?.name}</h1>
            <p className="text-slate-500 text-sm">{user?.communityName} Community</p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} custom={1} className="grid grid-cols-3 gap-4 mb-10">
            {statCards.map((s, i) => (
              <div key={i} className="card p-5 text-center">
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{
                    background: s.color === 'cyan' ? 'rgba(var(--color-cyan), 0.08)' : 'rgba(var(--color-purple), 0.08)',
                    border: `1px solid ${s.color === 'cyan' ? 'rgba(var(--color-cyan), 0.15)' : 'rgba(var(--color-purple), 0.15)'}`,
                  }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color === 'cyan' ? 'rgb(var(--color-cyan))' : 'rgb(var(--color-purple))' }} />
                </div>
                <div className="font-display font-bold text-xl text-white">{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Info card */}
          <motion.div variants={fadeUp} custom={2} className="card p-6 space-y-4">
            <h2 className="font-display font-semibold text-sm text-white mb-4">Account Details</h2>
            {infoFields.map((f, i) => (
              <div key={i} className="flex items-center gap-4 py-3"
                style={{ borderBottom: i < infoFields.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <f.icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-600">{f.label}</div>
                  <div className="text-sm text-slate-200">{f.value || '-'}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage
