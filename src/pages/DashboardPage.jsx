import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getDashboard, returnBooking, approveBooking, rejectBooking, approveReturnBooking, rejectReturnBooking, confirmCollectBooking, cancelBooking, collectBooking } from '../services/bookingService'
import { getTools } from '../services/toolService'
import { useAuth } from '../hooks/useAuth'
import BookingStatusBadge from '../components/BookingStatusBadge'
import ToolCard from '../components/ToolCard'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Package, ArrowLeftRight, ClipboardList, Check, X,
  Clock, Users, AlertCircle, CheckCircle, RotateCcw, HandMetal,
  SlidersHorizontal, Filter
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const tabs = [
  { id: 'browse', label: 'Browse Tools', icon: Search },
  { id: 'borrowed', label: 'My Borrowings', icon: ArrowLeftRight },
  { id: 'mytools', label: 'My Listings', icon: Package },
  { id: 'requests', label: 'Requests', icon: ClipboardList },
]

const FINISHED_STATUSES = ['RETURNED', 'CANCELLED', 'REJECTED']

function DashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('browse')
  const [data, setData] = useState({ myTools: [], borrowedTools: [], pendingOwnerRequests: [] })
  const [communityTools, setCommunityTools] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCondition, setSelectedCondition] = useState('All')
  const [priceRange, setPriceRange] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [borrowingView, setBorrowingView] = useState('active')
  const [toast, setToast] = useState(null)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    getDashboard()
      .then(setData)
      .catch((err) => showToast('error', err?.response?.data?.message || 'Failed to load dashboard'))
  }

  const loadCommunityTools = () => {
    getTools()
      .then((tools) => setCommunityTools(tools.filter(t => t.ownerId !== user?.userId)))
      .catch(() => {})
  }

  const handleAction = async (action, msg) => {
    try {
      await action()
      showToast('success', msg || 'Done')
      load()
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Action failed')
    }
  }

  useEffect(() => {
    load()
    loadCommunityTools()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (d) => new Date(d).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  // Derive categories from tools
  const categories = useMemo(() => {
    const cats = new Set(communityTools.map(t => t.category || 'General'))
    return ['All', ...Array.from(cats).sort()]
  }, [communityTools])

  // Filter tools
  const filteredTools = useMemo(() => {
    return communityTools.filter(t => {
      if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !(t.category || '').toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (selectedCategory !== 'All' && (t.category || 'General') !== selectedCategory) return false
      if (selectedCondition !== 'All' && t.condition !== selectedCondition) return false
      if (priceRange === 'under1000' && (t.estimatedPrice || 0) >= 1000) return false
      if (priceRange === '1000-3000' && ((t.estimatedPrice || 0) < 1000 || (t.estimatedPrice || 0) > 3000)) return false
      if (priceRange === 'over3000' && (t.estimatedPrice || 0) <= 3000) return false
      return true
    })
  }, [communityTools, searchQuery, selectedCategory, selectedCondition, priceRange])

  // Split borrowings
  const activeBorrowings = data.borrowedTools.filter(b => !FINISHED_STATUSES.includes(b.status))
  const pastBorrowings = data.borrowedTools.filter(b => FINISHED_STATUSES.includes(b.status))
  const displayedBorrowings = borrowingView === 'active' ? activeBorrowings : pastBorrowings

  const pendingCount = data.pendingOwnerRequests.filter(b => b.status === 'PENDING' || b.status === 'RETURN_PENDING').length
  const borrowedActive = activeBorrowings.length
  const activeFilters = (selectedCategory !== 'All' ? 1 : 0) + (selectedCondition !== 'All' ? 1 : 0) + (priceRange !== 'All' ? 1 : 0)

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

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Dashboard</h1>
          <p className="text-slate-500 text-sm">Browse tools, track borrowings, and manage requests.</p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="flex items-center gap-1 p-1 rounded-full mb-10 w-fit overflow-x-auto"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap"
              style={{ color: activeTab === tab.id ? '#fff' : 'rgb(148,163,184)' }}>
              {activeTab === tab.id && (
                <motion.div layoutId="dash-tab-active" className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <tab.icon className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
              {tab.id === 'requests' && pendingCount > 0 && (
                <span className="relative z-10 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: 'rgba(var(--color-cyan), 0.15)', color: 'rgb(var(--color-cyan))' }}>{pendingCount}</span>
              )}
              {tab.id === 'borrowed' && borrowedActive > 0 && (
                <span className="relative z-10 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: 'rgba(var(--color-purple), 0.15)', color: 'rgb(var(--color-purple))' }}>{borrowedActive}</span>
              )}
            </button>
          ))}
        </motion.div>

        {/* ===== BROWSE TOOLS ===== */}
        {activeTab === 'browse' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            {/* Search + Filter toggle */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input className="input !pl-11" placeholder="Search tools by name or category..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-full transition-all shrink-0"
                style={{
                  background: showFilters || activeFilters > 0 ? 'rgba(var(--color-cyan), 0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${showFilters || activeFilters > 0 ? 'rgba(var(--color-cyan), 0.2)' : 'rgba(255,255,255,0.06)'}`,
                  color: showFilters || activeFilters > 0 ? 'rgb(var(--color-cyan))' : '#94a3b8',
                }}>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeFilters > 0 && (
                  <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                    style={{ background: 'rgb(var(--color-cyan))', color: '#000' }}>{activeFilters}</span>
                )}
              </button>
            </div>

            {/* Filters panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="card p-5 space-y-4">
                    {/* Category chips */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium block mb-2">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button key={cat} onClick={() => setSelectedCategory(cat)}
                            className="text-xs px-3 py-1.5 rounded-full transition-all"
                            style={{
                              background: selectedCategory === cat ? 'rgba(var(--color-cyan), 0.15)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${selectedCategory === cat ? 'rgba(var(--color-cyan), 0.3)' : 'rgba(255,255,255,0.06)'}`,
                              color: selectedCategory === cat ? 'rgb(var(--color-cyan))' : '#94a3b8',
                            }}>{cat}</button>
                        ))}
                      </div>
                    </div>
                    {/* Condition + Price row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium block mb-2">Condition</label>
                        <div className="flex flex-wrap gap-2">
                          {['All', 'NEW', 'GOOD', 'FAIR'].map(c => (
                            <button key={c} onClick={() => setSelectedCondition(c)}
                              className="text-xs px-3 py-1.5 rounded-full transition-all"
                              style={{
                                background: selectedCondition === c ? 'rgba(var(--color-purple), 0.15)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${selectedCondition === c ? 'rgba(var(--color-purple), 0.3)' : 'rgba(255,255,255,0.06)'}`,
                                color: selectedCondition === c ? 'rgb(var(--color-purple))' : '#94a3b8',
                              }}>{c === 'All' ? 'All' : c.charAt(0) + c.slice(1).toLowerCase()}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-medium block mb-2">Price Range</label>
                        <div className="flex flex-wrap gap-2">
                          {[['All', 'All'], ['under1000', 'Under ₹1k'], ['1000-3000', '₹1k-3k'], ['over3000', 'Over ₹3k']].map(([val, label]) => (
                            <button key={val} onClick={() => setPriceRange(val)}
                              className="text-xs px-3 py-1.5 rounded-full transition-all"
                              style={{
                                background: priceRange === val ? 'rgba(var(--color-cyan), 0.15)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${priceRange === val ? 'rgba(var(--color-cyan), 0.3)' : 'rgba(255,255,255,0.06)'}`,
                                color: priceRange === val ? 'rgb(var(--color-cyan))' : '#94a3b8',
                              }}>{label}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {activeFilters > 0 && (
                      <button onClick={() => { setSelectedCategory('All'); setSelectedCondition('All'); setPriceRange('All') }}
                        className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'rgb(var(--color-cyan))' }}>
                        Clear all filters
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results count */}
            <div className="text-xs text-slate-600 mb-5">{filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} found</div>

            {filteredTools.length === 0 && (
              <div className="card p-10 text-center">
                <Package strokeWidth={1.5} className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 text-sm">{searchQuery || activeFilters ? 'No tools match your filters.' : 'No community tools available yet.'}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTools.map((tool, idx) => (
                <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.4 }}>
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== MY BORROWINGS ===== */}
        {activeTab === 'borrowed' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            {/* Active / Past toggle */}
            <div className="flex items-center gap-1 p-1 rounded-full mb-6 w-fit"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {[['active', 'Active'], ['past', 'History']].map(([val, label]) => (
                <button key={val} onClick={() => setBorrowingView(val)}
                  className="relative px-5 py-2 rounded-full text-xs font-medium transition-all"
                  style={{ color: borrowingView === val ? '#fff' : 'rgb(148,163,184)' }}>
                  {borrowingView === val && (
                    <motion.div layoutId="borrow-toggle" className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                  <span className="relative z-10">{label}</span>
                  {val === 'active' && activeBorrowings.length > 0 && (
                    <span className="relative z-10 ml-2 w-5 h-5 rounded-full text-[10px] font-bold inline-flex items-center justify-center"
                      style={{ background: 'rgba(var(--color-purple), 0.15)', color: 'rgb(var(--color-purple))' }}>
                      {activeBorrowings.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {displayedBorrowings.length === 0 && (
                <div className="card p-10 text-center">
                  <ArrowLeftRight strokeWidth={1.5} className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm mb-4">
                    {borrowingView === 'active' ? "No active borrowings." : "No past borrowings."}
                  </p>
                  {borrowingView === 'active' && (
                    <button onClick={() => setActiveTab('browse')}
                      className="btn-primary text-sm inline-flex items-center gap-2">
                      <span>Browse tools</span><Search className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {displayedBorrowings.map((b) => (
                <div key={b.id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <h3 className="font-display font-semibold text-sm text-white truncate">{b.toolName}</h3>
                        <BookingStatusBadge status={b.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Owner: {b.ownerName}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(b.requestedStartTime || b.slotStartTime)} &rarr; {formatDate(b.requestedEndTime || b.slotEndTime)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {b.status === 'COLLECT_PENDING' && (
                        <button onClick={() => handleAction(() => confirmCollectBooking(b.id), 'Collection confirmed')}
                          className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full"
                          style={{ background: 'rgba(var(--color-cyan), 0.1)', border: '1px solid rgba(var(--color-cyan), 0.2)', color: 'rgb(var(--color-cyan))' }}>
                          <HandMetal className="w-3 h-3" /> Confirm Collect
                        </button>
                      )}
                      {(b.status === 'COLLECTED' || b.status === 'RETURN_REJECTED') && (
                        <button onClick={() => handleAction(() => returnBooking(b.id), 'Return requested')}
                          className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full"
                          style={{ background: 'rgba(var(--color-purple), 0.1)', border: '1px solid rgba(var(--color-purple), 0.2)', color: 'rgb(var(--color-purple))' }}>
                          <RotateCcw className="w-3 h-3" /> Return
                        </button>
                      )}
                      {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                        <button onClick={() => handleAction(() => cancelBooking(b.id), 'Booking cancelled')}
                          className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== MY LISTINGS ===== */}
        {activeTab === 'mytools' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
            {data.myTools.length === 0 && (
              <div className="card p-10 text-center">
                <Package strokeWidth={1.5} className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 text-sm mb-4">You haven't listed any tools yet.</p>
                <Link to="/owner" className="btn-primary text-sm inline-flex items-center gap-2"><span>Go to Owner Panel</span></Link>
              </div>
            )}
            {data.myTools.map((tool) => (
              <div key={tool.id} className="card p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                    style={{ background: 'rgba(var(--color-cyan), 0.06)', border: '1px solid rgba(var(--color-cyan), 0.1)' }}>
                    <Package strokeWidth={1.5} className="w-4 h-4" style={{ color: 'rgb(var(--color-cyan))' }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-sm text-white truncate">{tool.name}</h3>
                    <p className="text-xs text-slate-500">{tool.category || 'General'} &middot; {tool.condition || 'N/A'}</p>
                  </div>
                </div>
                <Link to={`/tools/${tool.id}`} className="text-xs font-medium px-4 py-2 rounded-full shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>View</Link>
              </div>
            ))}
          </motion.div>
        )}

        {/* ===== REQUESTS ===== */}
        {activeTab === 'requests' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
            {data.pendingOwnerRequests.length === 0 && (
              <div className="card p-10 text-center">
                <ClipboardList strokeWidth={1.5} className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 text-sm">No booking requests for your tools.</p>
              </div>
            )}
            {data.pendingOwnerRequests.map((b) => (
              <div key={b.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <h3 className="font-display font-semibold text-sm text-white truncate">{b.toolName}</h3>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {b.borrowerName}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(b.requestedStartTime || b.slotStartTime)} &rarr; {formatDate(b.requestedEndTime || b.slotEndTime)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {b.status === 'PENDING' && (<>
                      <button onClick={() => handleAction(() => approveBooking(b.id), 'Approved')}
                        className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full"
                        style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                        <Check className="w-3 h-3" /> Approve</button>
                      <button onClick={() => handleAction(() => rejectBooking(b.id), 'Rejected')}
                        className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full"
                        style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}>
                        <X className="w-3 h-3" /> Reject</button>
                    </>)}
                    {b.status === 'APPROVED' && (<>
                      <button onClick={() => handleAction(() => collectBooking(b.id), 'Marked collected')}
                        className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full"
                        style={{ background: 'rgba(var(--color-cyan), 0.1)', border: '1px solid rgba(var(--color-cyan), 0.2)', color: 'rgb(var(--color-cyan))' }}>
                        <Check className="w-3 h-3" /> Mark Collected</button>
                      <button onClick={() => handleAction(() => cancelBooking(b.id), 'Cancelled')}
                        className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                        <X className="w-3 h-3" /> Cancel</button>
                    </>)}
                    {b.status === 'COLLECT_PENDING' && (
                      <span className="text-xs font-medium px-3 py-2 rounded-full" style={{ background: 'rgba(129,140,248,0.08)', color: '#818cf8' }}>Awaiting borrower</span>
                    )}
                    {b.status === 'RETURN_PENDING' && (<>
                      <button onClick={() => handleAction(() => approveReturnBooking(b.id), 'Return confirmed')}
                        className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full"
                        style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                        <Check className="w-3 h-3" /> Confirm Return</button>
                      <button onClick={() => handleAction(() => rejectReturnBooking(b.id), 'Return rejected')}
                        className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full"
                        style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}>
                        <X className="w-3 h-3" /> Reject</button>
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

export default DashboardPage
