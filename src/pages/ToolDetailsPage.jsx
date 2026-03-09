import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getTool, getImageUrl } from '../services/toolService'
import { createBooking } from '../services/bookingService'
import { getAvailabilityWindows } from '../services/availabilityService'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Tag, ShieldCheck, Clock, Calendar,
  AlertCircle, CheckCircle, ArrowRight, Package, User
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const conditionColors = {
  NEW: 'bg-emerald-50 text-emerald-700',
  GOOD: 'bg-blue-50 text-blue-700',
  FAIR: 'bg-amber-50 text-amber-700',
  NEEDS_REPAIR: 'bg-red-50 text-red-700',
}

function ToolDetailsPage() {
  const { id } = useParams()
  const [tool, setTool] = useState(null)
  const [slots, setSlots] = useState([])
  const [requestedRanges, setRequestedRanges] = useState({})
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const toLocalInputValue = (isoString) => {
    const date = new Date(isoString)
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return date.toISOString().slice(0, 16)
  }

  const formatDate = (d) => new Date(d).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const load = async () => {
    try {
      const [t, s] = await Promise.all([getTool(id), getAvailabilityWindows(id)])
      setTool(t)
      setSlots(s)
      const nextRanges = {}
      s.forEach((slot) => {
        const key = `${slot.id}-${slot.startTime}-${slot.endTime}`
        nextRanges[key] = {
          startTime: toLocalInputValue(slot.startTime),
          endTime: toLocalInputValue(slot.endTime),
        }
      })
      setRequestedRanges(nextRanges)
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Unable to load tool')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    load()
  }, [id])

  const requestBooking = async (slot) => {
    const key = `${slot.id}-${slot.startTime}-${slot.endTime}`
    const range = requestedRanges[key]
    if (!range?.startTime || !range?.endTime) {
      showToast('error', 'Please choose start and end time')
      return
    }
    try {
      await createBooking({
        toolId: Number(id),
        slotId: slot.id,
        requestedStartTime: new Date(range.startTime).toISOString(),
        requestedEndTime: new Date(range.endTime).toISOString(),
      })
      showToast('success', 'Booking requested! Status is now pending approval.')
      load()
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Booking failed')
    }
  }

  const conditionColor = {
    NEW: { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', color: '#34d399' },
    GOOD: { bg: 'rgba(var(--color-cyan), 0.1)', border: 'rgba(var(--color-cyan), 0.2)', color: 'rgb(var(--color-cyan))' },
    FAIR: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24' },
    NEEDS_REPAIR: { bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.2)', color: '#fb7185' },
  }

  return (
    <div className="bg-[#060608] min-h-screen grain">
      <Navbar />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium"
            style={{
              background: toast.type === 'error' ? 'rgba(251,113,133,0.1)' : 'rgba(52,211,153,0.1)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(251,113,133,0.2)' : 'rgba(52,211,153,0.2)'}`,
              color: toast.type === 'error' ? '#fb7185' : '#34d399',
              backdropFilter: 'blur(16px)',
            }}
          >
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        {/* Back link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </motion.div>

        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin mx-auto" />
          </div>
        )}

        {!loading && tool && (
          <motion.div initial="hidden" animate="visible" className="space-y-6">
            {/* Hero card */}
            <motion.div variants={fadeUp} custom={0} className="card overflow-hidden">
              {/* Image */}
              {tool.imageUrl && (
                <div className="w-full h-64 md:h-80 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <img
                    src={getImageUrl(tool.imageUrl)}
                    alt={tool.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="p-8">
                {/* Title row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">{tool.name}</h1>
                    {tool.description && (
                      <p className="text-slate-400 text-sm leading-relaxed max-w-xl">{tool.description}</p>
                    )}
                  </div>
                  {tool.estimatedPrice && (
                    <div className="shrink-0 text-right">
                      <div className="font-display font-bold text-2xl text-white">
                        ₹{tool.estimatedPrice.toLocaleString()}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500">Est. Value</div>
                    </div>
                  )}
                </div>

                {/* Meta tags */}
                <div className="flex flex-wrap gap-3">
                  {/* Category */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300">{tool.category || 'General'}</span>
                  </div>

                  {/* Condition */}
                  {(() => {
                    const c = conditionColor[tool.condition] || conditionColor.GOOD
                    return (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                        style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: c.color }} />
                        <span style={{ color: c.color }}>{tool.condition}</span>
                      </div>
                    )
                  })()}

                  {/* Owner */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300">{tool.ownerName}</span>
                  </div>

                  {/* Pickup */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300">
                      Block {tool.ownerBlock || '-'}, Floor {tool.ownerFloor || '-'}, Flat {tool.ownerFlatNumber || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Available Slots */}
            <motion.div variants={fadeUp} custom={1}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(var(--color-cyan), 0.08)', border: '1px solid rgba(var(--color-cyan), 0.15)' }}>
                  <Calendar className="w-4 h-4" style={{ color: 'rgb(var(--color-cyan))' }} />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg text-white">Available Slots</h2>
                  <p className="text-xs text-slate-500">Choose a time window and request booking</p>
                </div>
              </div>

              {slots.length === 0 && (
                <div className="card p-10 text-center">
                  <Clock strokeWidth={1.5} className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm">No availability slots for this tool right now.</p>
                  <p className="text-slate-600 text-xs mt-1">Check back later or contact the owner.</p>
                </div>
              )}

              <div className="space-y-4">
                {slots.map((slot, idx) => {
                  const key = `${slot.id}-${slot.startTime}-${slot.endTime}`
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="card p-6"
                    >
                      {/* Window header */}
                      <div className="flex items-center gap-2 mb-5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs text-slate-400">
                          Available: {formatDate(slot.startTime)} &rarr; {formatDate(slot.endTime)}
                        </span>
                      </div>

                      {/* Booking form */}
                      <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium block">
                              Requested Start
                            </label>
                            <input
                              className="input text-sm !py-2.5"
                              type="datetime-local"
                              value={requestedRanges[key]?.startTime || ''}
                              min={toLocalInputValue(slot.startTime)}
                              max={toLocalInputValue(slot.endTime)}
                              onChange={(e) => setRequestedRanges((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], startTime: e.target.value },
                              }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium block">
                              Requested End
                            </label>
                            <input
                              className="input text-sm !py-2.5"
                              type="datetime-local"
                              value={requestedRanges[key]?.endTime || ''}
                              min={toLocalInputValue(slot.startTime)}
                              max={toLocalInputValue(slot.endTime)}
                              onChange={(e) => setRequestedRanges((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], endTime: e.target.value },
                              }))}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => requestBooking(slot)}
                          className="btn-primary flex items-center justify-center gap-2 shrink-0 md:self-end"
                        >
                          <span>Request Booking</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {!loading && !tool && (
          <div className="card p-10 text-center">
            <Package strokeWidth={1.5} className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Tool not found.</p>
            <Link to="/dashboard" className="btn-primary text-sm inline-flex items-center gap-2 mt-4">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-400 min-w-[110px]">{label}</span>
      <span className="text-gray-700 font-medium">{value}</span>
    </div>
  )
}

export default ToolDetailsPage
