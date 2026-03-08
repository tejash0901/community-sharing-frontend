import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { createAvailability, deleteAvailability, getAvailability } from '../services/availabilityService'
import { approveBooking, approveReturnBooking, getOwnerBookings, rejectBooking, rejectReturnBooking, collectBooking, cancelBooking } from '../services/bookingService'
import { createTool, deleteTool, getTools, updateTool, getImageUrl } from '../services/toolService'
import { useAuth } from '../hooks/useAuth'
import BookingStatusBadge from '../components/BookingStatusBadge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Package, Calendar, Clock, Trash2, Check, X, Pencil, Save,
  ChevronRight, Upload, AlertCircle, CheckCircle, Wrench, Users, ArrowLeftRight, Image
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const tabs = [
  { id: 'tools', label: 'My Tools', icon: Package },
  { id: 'add', label: 'Add Tool', icon: Plus },
  { id: 'bookings', label: 'Bookings', icon: ArrowLeftRight },
]

function OwnerPanelPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('tools')
  const [tools, setTools] = useState([])
  const [ownerBookings, setOwnerBookings] = useState([])
  const [selectedTool, setSelectedTool] = useState(null)
  const [editingTool, setEditingTool] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [slots, setSlots] = useState([])
  const [toolForm, setToolForm] = useState({ name: '', description: '', category: '', condition: 'GOOD', estimatedPrice: '' })
  const [imageFile, setImageFile] = useState(null)
  const [slotForm, setSlotForm] = useState({ startTime: '', endTime: '' })
  const [toast, setToast] = useState(null)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleError = (err) => {
    showToast('error', err?.response?.data?.message || err?.message || 'An error occurred')
  }

  const load = async () => {
    try {
      const allTools = await getTools()
      setTools(allTools.filter((t) => t.ownerId === user?.userId))
      setOwnerBookings(await getOwnerBookings())
    } catch (err) { handleError(err) }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  const onCreateTool = async (e) => {
    e.preventDefault()
    try {
      await createTool({ ...toolForm, estimatedPrice: toolForm.estimatedPrice ? Number(toolForm.estimatedPrice) : null }, imageFile)
      setToolForm({ name: '', description: '', category: '', condition: 'GOOD', estimatedPrice: '' })
      setImageFile(null)
      showToast('success', 'Tool created successfully')
      setActiveTab('tools')
      load()
    } catch (err) { handleError(err) }
  }

  const startEdit = (tool) => {
    setEditingTool(tool.id)
    setEditForm({
      name: tool.name || '',
      description: tool.description || '',
      category: tool.category || '',
      condition: tool.condition || 'GOOD',
      estimatedPrice: tool.estimatedPrice || '',
    })
  }

  const saveEdit = async (toolId) => {
    try {
      await updateTool(toolId, { ...editForm, estimatedPrice: editForm.estimatedPrice ? Number(editForm.estimatedPrice) : null })
      setEditingTool(null)
      showToast('success', 'Tool updated')
      load()
    } catch (err) { handleError(err) }
  }

  const loadSlots = async (toolId) => {
    try {
      setSelectedTool(toolId === selectedTool ? null : toolId)
      if (toolId !== selectedTool) setSlots(await getAvailability(toolId))
    } catch (err) { handleError(err) }
  }

  const onCreateSlot = async (e) => {
    e.preventDefault()
    if (!selectedTool) return
    try {
      await createAvailability(selectedTool, {
        startTime: new Date(slotForm.startTime).toISOString(),
        endTime: new Date(slotForm.endTime).toISOString(),
      })
      setSlotForm({ startTime: '', endTime: '' })
      showToast('success', 'Slot added')
      setSlots(await getAvailability(selectedTool))
    } catch (err) { handleError(err) }
  }

  const handleAction = async (action, msg) => {
    try {
      await action()
      showToast('success', msg || 'Done')
      load()
      if (selectedTool) setSlots(await getAvailability(selectedTool))
    } catch (err) { handleError(err) }
  }

  const formatDate = (d) => new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const pendingCount = ownerBookings.filter(b => b.status === 'PENDING' || b.status === 'RETURN_PENDING').length

  return (
    <div className="bg-[#060608] min-h-screen grain">
      <Navbar />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium"
            style={{ background: toast.type === 'error' ? 'rgba(251,113,133,0.1)' : 'rgba(52,211,153,0.1)', border: `1px solid ${toast.type === 'error' ? 'rgba(251,113,133,0.2)' : 'rgba(52,211,153,0.2)'}`, color: toast.type === 'error' ? '#fb7185' : '#34d399', backdropFilter: 'blur(16px)' }}>
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTool && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70" onClick={() => setEditingTool(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={(e) => e.target === e.currentTarget && setEditingTool(null)}>
              <div className="w-full max-w-md rounded-2xl p-8 space-y-5"
                style={{ background: 'rgba(14,14,18,0.98)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display font-semibold text-lg text-white">Edit Tool</h2>
                  <button onClick={() => setEditingTool(null)} className="text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Name</label>
                    <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Category</label>
                    <input className="input" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Description</label>
                    <textarea className="input min-h-[80px] resize-none" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Condition</label>
                      <select className="input" value={editForm.condition} onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}>
                        <option value="NEW">New</option><option value="GOOD">Good</option><option value="FAIR">Fair</option><option value="NEEDS_REPAIR">Needs Repair</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Price</label>
                      <input className="input" type="number" value={editForm.estimatedPrice} onChange={(e) => setEditForm({ ...editForm, estimatedPrice: e.target.value })} />
                    </div>
                  </div>
                  <button onClick={() => saveEdit(editingTool)} className="btn-primary w-full flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /><span>Save Changes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Owner Panel</h1>
          <p className="text-slate-500 text-sm">Manage your tools, availability slots, and booking requests.</p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex items-center gap-1 p-1 rounded-full mb-10 w-fit"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-300"
              style={{ color: activeTab === tab.id ? '#fff' : 'rgb(148,163,184)' }}>
              {activeTab === tab.id && (
                <motion.div layoutId="owner-tab-active" className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <tab.icon className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
              {tab.id === 'bookings' && pendingCount > 0 && (
                <span className="relative z-10 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: 'rgba(var(--color-cyan), 0.15)', color: 'rgb(var(--color-cyan))' }}>{pendingCount}</span>
              )}
            </button>
          ))}
        </motion.div>

        {/* ===== MY TOOLS ===== */}
        {activeTab === 'tools' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
            {tools.length === 0 && (
              <div className="card p-10 text-center">
                <Wrench strokeWidth={1.5} className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 text-sm mb-4">You haven't listed any tools yet.</p>
                <button onClick={() => setActiveTab('add')} className="btn-primary text-sm inline-flex items-center gap-2">
                  <span>Add your first tool</span><Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {tools.map((tool) => (
              <div key={tool.id} className="card overflow-hidden">
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Thumbnail */}
                    {tool.imageUrl ? (
                      <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <img src={getImageUrl(tool.imageUrl)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
                        style={{ background: 'rgba(var(--color-cyan), 0.06)', border: '1px solid rgba(var(--color-cyan), 0.1)' }}>
                        <Package strokeWidth={1.5} className="w-5 h-5" style={{ color: 'rgb(var(--color-cyan))' }} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-sm text-white truncate">{tool.name}</h3>
                      <p className="text-xs text-slate-500">{tool.category || 'General'} &middot; {tool.condition}
                        {tool.estimatedPrice ? ` &middot; ₹${tool.estimatedPrice.toLocaleString()}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(tool)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10 group"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                      title="Edit tool">
                      <Pencil className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                    </button>
                    <button onClick={() => loadSlots(tool.id)}
                      className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-full transition-all"
                      style={{
                        background: selectedTool === tool.id ? 'rgba(var(--color-cyan), 0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selectedTool === tool.id ? 'rgba(var(--color-cyan), 0.2)' : 'rgba(255,255,255,0.06)'}`,
                        color: selectedTool === tool.id ? 'rgb(var(--color-cyan))' : 'rgb(148,163,184)',
                      }}>
                      <Calendar className="w-3 h-3" /> Slots
                      <ChevronRight className={`w-3 h-3 transition-transform ${selectedTool === tool.id ? 'rotate-90' : ''}`} />
                    </button>
                    <button onClick={() => handleAction(() => deleteTool(tool.id), 'Tool deleted')}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-rose-500/10 group"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Trash2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Slots panel */}
                <AnimatePresence>
                  {selectedTool === tool.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="px-5 pb-5 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <form onSubmit={onCreateSlot} className="flex flex-wrap items-end gap-3 mb-4">
                          <div className="flex-1 min-w-[180px]">
                            <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block font-medium">Start</label>
                            <input className="input text-sm !py-2" type="datetime-local" required value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} />
                          </div>
                          <div className="flex-1 min-w-[180px]">
                            <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block font-medium">End</label>
                            <input className="input text-sm !py-2" type="datetime-local" required value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} />
                          </div>
                          <button className="btn-primary !py-2 text-xs flex items-center gap-1.5 shrink-0"><Plus className="w-3 h-3" /><span>Add Slot</span></button>
                        </form>
                        {slots.length === 0 && <p className="text-xs text-slate-600 text-center py-3">No availability slots yet.</p>}
                        <div className="space-y-2">
                          {slots.map((slot) => (
                            <div key={slot.id} className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl"
                              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Clock className="w-3 h-3 text-slate-600" />
                                <span>{formatDate(slot.startTime)}</span>
                                <span className="text-slate-600">&rarr;</span>
                                <span>{formatDate(slot.endTime)}</span>
                              </div>
                              <button onClick={() => handleAction(() => deleteAvailability(slot.id), 'Slot removed')} className="text-slate-600 hover:text-rose-400 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {/* ===== ADD TOOL ===== */}
        {activeTab === 'add' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="max-w-lg">
            <form onSubmit={onCreateTool} className="card p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tool Name <span style={{ color: 'rgb(var(--color-cyan))' }}>*</span></label>
                <input className="input" required placeholder="e.g. Bosch Power Drill" value={toolForm.name} onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</label>
                <input className="input" placeholder="e.g. Power Tools, Garden, Cleaning" value={toolForm.category} onChange={(e) => setToolForm({ ...toolForm, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Description</label>
                <textarea className="input min-h-[100px] resize-none" placeholder="Describe your tool..." value={toolForm.description} onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Condition</label>
                  <select className="input" value={toolForm.condition} onChange={(e) => setToolForm({ ...toolForm, condition: e.target.value })}>
                    <option value="NEW">New</option><option value="GOOD">Good</option><option value="FAIR">Fair</option><option value="NEEDS_REPAIR">Needs Repair</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Est. Price</label>
                  <input className="input" type="number" placeholder="0.00" value={toolForm.estimatedPrice} onChange={(e) => setToolForm({ ...toolForm, estimatedPrice: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Image</label>
                <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl cursor-pointer transition-all hover:border-white/20"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Upload strokeWidth={1.5} className="w-6 h-6 text-slate-500" />
                  <span className="text-xs text-slate-500">{imageFile ? imageFile.name : 'Click to upload image'}</span>
                  <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={(e) => setImageFile(e.target.files[0] || null)} />
                </label>
              </div>
              <button className="btn-primary w-full flex items-center justify-center gap-2"><Plus className="w-4 h-4" /><span>Create Tool</span></button>
            </form>
          </motion.div>
        )}

        {/* ===== BOOKINGS ===== */}
        {activeTab === 'bookings' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
            {ownerBookings.length === 0 && (
              <div className="card p-10 text-center">
                <Users strokeWidth={1.5} className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 text-sm">No booking requests yet.</p>
              </div>
            )}
            {ownerBookings.map((b) => (
              <div key={b.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <h3 className="font-display font-semibold text-sm text-white truncate">{b.toolName}</h3>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{b.borrowerName}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(b.requestedStartTime || b.slotStartTime)} &rarr; {formatDate(b.requestedEndTime || b.slotEndTime)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {b.status === 'PENDING' && (<>
                      <button onClick={() => handleAction(() => approveBooking(b.id), 'Approved')} className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}><Check className="w-3 h-3" /> Approve</button>
                      <button onClick={() => handleAction(() => rejectBooking(b.id), 'Rejected')} className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full" style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}><X className="w-3 h-3" /> Reject</button>
                    </>)}
                    {b.status === 'APPROVED' && (<>
                      <button onClick={() => handleAction(() => collectBooking(b.id), 'Marked collected')} className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full" style={{ background: 'rgba(var(--color-cyan), 0.1)', border: '1px solid rgba(var(--color-cyan), 0.2)', color: 'rgb(var(--color-cyan))' }}><Check className="w-3 h-3" /> Mark Collected</button>
                      <button onClick={() => handleAction(() => cancelBooking(b.id), 'Cancelled')} className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}><X className="w-3 h-3" /> Cancel</button>
                    </>)}
                    {b.status === 'COLLECT_PENDING' && (<span className="text-xs font-medium px-3 py-2 rounded-full" style={{ background: 'rgba(129,140,248,0.08)', color: '#818cf8' }}>Awaiting borrower</span>)}
                    {b.status === 'RETURN_PENDING' && (<>
                      <button onClick={() => handleAction(() => approveReturnBooking(b.id), 'Return confirmed')} className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}><Check className="w-3 h-3" /> Confirm Return</button>
                      <button onClick={() => handleAction(() => rejectReturnBooking(b.id), 'Return rejected')} className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full" style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}><X className="w-3 h-3" /> Reject</button>
                    </>)}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default OwnerPanelPage
