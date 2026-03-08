import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getOwnerBookings } from '../services/bookingService'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Settings, LogOut, Menu, X, User, Bell } from 'lucide-react'

const navLinks = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/owner', label: 'Owner Panel', icon: Settings },
]

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const [notifItems, setNotifItems] = useState([])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  // Poll for notifications
  useEffect(() => {
    if (!isAuthenticated) return
    const loadNotifs = async () => {
      try {
        const bookings = await getOwnerBookings()
        const pending = bookings.filter(b => b.status === 'PENDING' || b.status === 'RETURN_PENDING')
        setNotifCount(pending.length)
        setNotifItems(pending.slice(0, 5))
      } catch {}
    }
    loadNotifs()
    const interval = setInterval(loadNotifs, 10000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav
        className="fixed w-full top-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(6,6,8,0.85)' : 'rgba(6,6,8,0.4)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, rgb(var(--color-cyan)), rgb(var(--color-purple)))' }}>
              <span className="font-display font-bold text-xs text-white">CS</span>
            </div>
            <span className="font-display font-semibold text-sm text-white hidden sm:block">
              Community<span className="text-slate-400">Share</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {/* Nav links as pill tabs */}
                <div className="flex items-center gap-0.5 p-1 rounded-full mr-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300"
                      style={{ color: isActive(link.to) ? '#fff' : 'rgb(148,163,184)' }}
                    >
                      {isActive(link.to) && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <link.icon className="w-3.5 h-3.5 relative z-10" />
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Notifications bell */}
                <div className="relative mr-2">
                  <button
                    onClick={() => setShowNotif(!showNotif)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 relative"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Bell className="w-3.5 h-3.5 text-slate-400" />
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                        style={{ background: 'rgb(var(--color-cyan))' }}>
                        {notifCount}
                      </span>
                    )}
                  </button>

                  {/* Notification dropdown */}
                  <AnimatePresence>
                    {showNotif && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-72 rounded-xl overflow-hidden z-50"
                        style={{ background: 'rgba(14,14,18,0.98)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
                      >
                        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <span className="font-display font-semibold text-xs text-white">Notifications</span>
                        </div>
                        {notifItems.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-600">No pending actions</div>
                        ) : (
                          <div className="max-h-60 overflow-y-auto">
                            {notifItems.map((b) => (
                              <Link
                                key={b.id}
                                to="/owner"
                                onClick={() => setShowNotif(false)}
                                className="block px-4 py-3 transition-colors hover:bg-white/[0.03]"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                              >
                                <div className="text-xs text-white font-medium">{b.toolName}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  {b.status === 'PENDING' ? `Booking request from ${b.borrowerName}` : `Return request from ${b.borrowerName}`}
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        <Link to="/owner" onClick={() => setShowNotif(false)}
                          className="block px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-medium transition-colors hover:bg-white/[0.03]"
                          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgb(var(--color-cyan))' }}>
                          View all in Owner Panel
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User + Profile + Logout */}
                <div className="flex items-center gap-2">
                  <Link to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:bg-white/[0.03]"
                    style={{ background: 'rgba(var(--color-cyan), 0.06)', border: '1px solid rgba(var(--color-cyan), 0.1)' }}>
                    <User className="w-3 h-3" style={{ color: 'rgb(var(--color-cyan))' }} />
                    <span className="text-xs font-medium" style={{ color: 'rgb(var(--color-cyan))' }}>
                      {user?.name}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 group"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">Login</Link>
                <Link to="/register"
                  className="text-sm font-medium px-5 py-2 rounded-full transition-all duration-300 hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, rgb(var(--color-cyan)), rgb(var(--color-purple)))', color: '#fff' }}>
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {mobileOpen ? <X className="w-4 h-4 text-slate-300" /> : <Menu className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </nav>

      {/* Close notif on outside click */}
      {showNotif && <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />}

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }} className="fixed top-16 left-0 right-0 z-40 md:hidden p-4">
              <div className="rounded-2xl overflow-hidden p-3 space-y-1"
                style={{ background: 'rgba(12,12,16,0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="flex items-center gap-2.5 px-4 py-3 mb-2 rounded-xl"
                      style={{ background: 'rgba(var(--color-cyan), 0.05)' }}>
                      <User className="w-4 h-4" style={{ color: 'rgb(var(--color-cyan))' }} />
                      <span className="text-sm font-medium text-white">{user?.name}</span>
                    </Link>
                    {navLinks.map((link) => (
                      <Link key={link.to} to={link.to}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors"
                        style={{ color: isActive(link.to) ? '#fff' : 'rgb(148,163,184)', background: isActive(link.to) ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                        <link.icon className="w-4 h-4" />{link.label}
                      </Link>
                    ))}
                    {notifCount > 0 && (
                      <Link to="/owner" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                        style={{ color: 'rgb(var(--color-cyan))' }}>
                        <Bell className="w-4 h-4" /> {notifCount} pending requests
                      </Link>
                    )}
                    <div className="h-px my-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white w-full transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300">Login</Link>
                    <Link to="/register"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white"
                      style={{ background: 'linear-gradient(135deg, rgb(var(--color-cyan)), rgb(var(--color-purple)))' }}>
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
