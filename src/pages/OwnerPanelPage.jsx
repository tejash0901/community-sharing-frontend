import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { createAvailability, deleteAvailability, getAvailability } from '../services/availabilityService'
import { approveBooking, approveReturnBooking, getOwnerBookings, rejectBooking, rejectReturnBooking, collectBooking, cancelBooking } from '../services/bookingService'
import { createTool, deleteTool, getTools } from '../services/toolService'
import { useAuth } from '../hooks/useAuth'
import BookingStatusBadge from '../components/BookingStatusBadge'

function OwnerPanelPage() {
  const { user } = useAuth()
  const [tools, setTools] = useState([])
  const [ownerBookings, setOwnerBookings] = useState([])
  const [selectedTool, setSelectedTool] = useState(null)
  const [slots, setSlots] = useState([])
  const [toolForm, setToolForm] = useState({ name: '', description: '', category: '', condition: 'GOOD', estimatedPrice: '' })
  const [imageFile, setImageFile] = useState(null)
  const [slotForm, setSlotForm] = useState({ startTime: '', endTime: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleError = (err) => {
    setError(err?.response?.data?.message || err?.message || 'An error occurred')
    setSuccess('')
  }

  const load = async () => {
    try {
      const allTools = await getTools()
      setTools(allTools.filter((t) => t.ownerId === user?.userId))
      setOwnerBookings(await getOwnerBookings())
    } catch (err) {
      handleError(err)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 1000)
    return () => clearInterval(interval)
  }, [])

  const onCreateTool = async (e) => {
    e.preventDefault()
    try {
      setError('')
      await createTool({ ...toolForm, estimatedPrice: toolForm.estimatedPrice ? Number(toolForm.estimatedPrice) : null }, imageFile)
      setToolForm({ name: '', description: '', category: '', condition: 'GOOD', estimatedPrice: '' })
      setImageFile(null)
      setSuccess('Tool created successfully')
      load()
    } catch (err) {
      handleError(err)
    }
  }

  const loadSlots = async (toolId) => {
    try {
      setSelectedTool(toolId)
      setSlots(await getAvailability(toolId))
    } catch (err) {
      handleError(err)
    }
  }

  const onCreateSlot = async (e) => {
    e.preventDefault()
    if (!selectedTool) return
    try {
      setError('')
      await createAvailability(selectedTool, {
        startTime: new Date(slotForm.startTime).toISOString(),
        endTime: new Date(slotForm.endTime).toISOString(),
      })
      setSlotForm({ startTime: '', endTime: '' })
      setSuccess('Slot added successfully')
      loadSlots(selectedTool)
    } catch (err) {
      handleError(err)
    }
  }

  const handleAction = async (action) => {
    try {
      setError('')
      await action()
      setSuccess('Action completed successfully')
      load()
      if (selectedTool) loadSlots(selectedTool)
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container-page space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owner Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your tools, availability, and bookings</p>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-xl px-4 py-3">{success}</div>}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Add Tool */}
          <section className="card p-6">
            <h2 className="section-title mb-4">Add New Tool</h2>
            <form className="space-y-4" onSubmit={onCreateTool}>
              <div>
                <label className="input-label">Tool Name</label>
                <input className="input" required placeholder="e.g. Power Drill" value={toolForm.name} onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Category</label>
                <input className="input" placeholder="e.g. Power Tools" value={toolForm.category} onChange={(e) => setToolForm({ ...toolForm, category: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea className="input min-h-[80px]" placeholder="Describe the tool..." value={toolForm.description} onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Condition</label>
                  <select className="input" value={toolForm.condition} onChange={(e) => setToolForm({ ...toolForm, condition: e.target.value })}>
                    <option value="NEW">New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="NEEDS_REPAIR">Needs Repair</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Estimated Price</label>
                  <input className="input" type="number" placeholder="0.00" value={toolForm.estimatedPrice} onChange={(e) => setToolForm({ ...toolForm, estimatedPrice: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="input-label">Tool Image (optional)</label>
                <input className="input" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(e) => setImageFile(e.target.files[0] || null)} />
              </div>
              <button className="btn-primary w-full">Create Tool</button>
            </form>
          </section>

          {/* My Tools */}
          <section className="card p-6">
            <h2 className="section-title mb-4">My Tools</h2>
            {tools.length === 0 ? (
              <p className="text-sm text-gray-400">No tools yet. Create your first tool!</p>
            ) : (
              <div className="space-y-2">
                {tools.map((tool) => (
                  <div key={tool.id} className={`border rounded-xl p-4 flex flex-wrap items-center justify-between gap-2 transition-colors ${selectedTool === tool.id ? 'border-brand-300 bg-brand-50/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <div>
                      <span className="font-medium text-gray-900">{tool.name}</span>
                      <span className="text-sm text-gray-400 ml-2">{tool.category}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary !py-2 !px-3 text-sm" onClick={() => loadSlots(tool.id)}>Manage Slots</button>
                      <button className="btn-danger !py-2 !px-3 text-sm" onClick={() => handleAction(() => deleteTool(tool.id))}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTool && (
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                <h3 className="font-medium text-gray-800">Availability Slots</h3>
                <form className="grid sm:grid-cols-2 gap-3" onSubmit={onCreateSlot}>
                  <div>
                    <label className="input-label">Start Time</label>
                    <input className="input" type="datetime-local" required value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">End Time</label>
                    <input className="input" type="datetime-local" required value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} />
                  </div>
                  <button className="btn-primary sm:col-span-2">Add Slot</button>
                </form>
                {slots.length === 0 ? (
                  <p className="text-sm text-gray-400">No slots added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {slots.map((slot) => (
                      <div key={slot.id} className="border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                        <span className="text-sm text-gray-600">{new Date(slot.startTime).toLocaleString()} &mdash; {new Date(slot.endTime).toLocaleString()}</span>
                        <button className="btn-danger !py-1.5 !px-3 text-sm" onClick={() => handleAction(() => deleteAvailability(slot.id))}>Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Booking Requests */}
        <section className="card p-6">
          <h2 className="section-title mb-4">Booking Requests</h2>
          {ownerBookings.length === 0 ? (
            <p className="text-sm text-gray-400">No booking requests yet.</p>
          ) : (
            <div className="space-y-3">
              {ownerBookings.map((b) => (
                <div key={b.id} className="border border-gray-100 rounded-xl p-4 flex flex-wrap justify-between items-center gap-3 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">{b.toolName} <span className="text-gray-400 font-normal">requested by</span> {b.borrowerName}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(b.requestedStartTime || b.slotStartTime).toLocaleString()} &mdash; {new Date(b.requestedEndTime || b.slotEndTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <BookingStatusBadge status={b.status} />
                    {b.status === 'PENDING' && (
                      <>
                        <button className="btn-primary" onClick={() => handleAction(() => approveBooking(b.id))}>Approve</button>
                        <button className="btn-danger" onClick={() => handleAction(() => rejectBooking(b.id))}>Reject</button>
                      </>
                    )}
                    {b.status === 'APPROVED' && (
                      <>
                        <button className="btn-primary" onClick={() => handleAction(() => collectBooking(b.id))}>Mark Collected</button>
                        <button className="btn-danger" onClick={() => handleAction(() => cancelBooking(b.id))}>Cancel</button>
                      </>
                    )}
                    {b.status === 'COLLECT_PENDING' && (
                      <span className="text-xs text-brand-600 font-medium bg-brand-50 px-3 py-1.5 rounded-full">Waiting borrower confirmation</span>
                    )}
                    {b.status === 'RETURN_PENDING' && (
                      <>
                        <button className="btn-primary" onClick={() => handleAction(() => approveReturnBooking(b.id))}>Confirm Return</button>
                        <button className="btn-danger" onClick={() => handleAction(() => rejectReturnBooking(b.id))}>Reject Return</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

export default OwnerPanelPage
