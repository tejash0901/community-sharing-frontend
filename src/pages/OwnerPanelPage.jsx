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
      <div className="container-page grid lg:grid-cols-2 gap-6">
        {error && <div className="card p-3 text-rose-700 lg:col-span-2">{error}</div>}
        {success && <div className="card p-3 text-green-700 lg:col-span-2">{success}</div>}

        <section className="card p-4">
          <h2 className="font-semibold mb-3">Add Tool</h2>
          <form className="space-y-2" onSubmit={onCreateTool}>
            <input className="input" required placeholder="Tool name" value={toolForm.name} onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })} />
            <input className="input" placeholder="Category" value={toolForm.category} onChange={(e) => setToolForm({ ...toolForm, category: e.target.value })} />
            <textarea className="input" placeholder="Description" value={toolForm.description} onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })} />
            <select className="input" value={toolForm.condition} onChange={(e) => setToolForm({ ...toolForm, condition: e.target.value })}>
              <option value="NEW">New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="NEEDS_REPAIR">Needs Repair</option>
            </select>
            <input className="input" type="number" placeholder="Estimated Price" value={toolForm.estimatedPrice} onChange={(e) => setToolForm({ ...toolForm, estimatedPrice: e.target.value })} />
            <label className="block text-sm text-slate-600">Tool Image (optional)</label>
            <input className="input" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(e) => setImageFile(e.target.files[0] || null)} />
            <button className="btn-primary">Create Tool</button>
          </form>
        </section>

        <section className="card p-4">
          <h2 className="font-semibold mb-3">My Tools</h2>
          <div className="space-y-2">
            {tools.map((tool) => (
              <div key={tool.id} className="border rounded p-3 flex flex-wrap items-center justify-between gap-2">
                <span>{tool.name}</span>
                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={() => loadSlots(tool.id)}>Slots</button>
                  <button className="btn-secondary" onClick={() => handleAction(() => deleteTool(tool.id))}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {selectedTool && (
            <div className="mt-4 space-y-2">
              <h3 className="font-medium">Manage Availability</h3>
              <form className="grid gap-2" onSubmit={onCreateSlot}>
                <input className="input" type="datetime-local" required value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} />
                <input className="input" type="datetime-local" required value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} />
                <button className="btn-primary">Add Slot</button>
              </form>
              {slots.map((slot) => (
                <div key={slot.id} className="border rounded p-2 flex justify-between">
                  <span>{new Date(slot.startTime).toLocaleString()}</span>
                  <button className="btn-secondary" onClick={() => handleAction(() => deleteAvailability(slot.id))}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-4 lg:col-span-2">
          <h2 className="font-semibold mb-3">Booking Requests</h2>
          <div className="space-y-2">
            {ownerBookings.map((b) => (
              <div key={b.id} className="border rounded p-3 flex flex-wrap justify-between items-center gap-2">
                <div>
                  <div>{b.toolName} - requested by {b.borrowerName}</div>
                  <div className="text-xs text-slate-500">
                    Requested: {new Date(b.requestedStartTime || b.slotStartTime).toLocaleString()} - {new Date(b.requestedEndTime || b.slotEndTime).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookingStatusBadge status={b.status} />
                  {b.status === 'PENDING' && (
                    <>
                      <button className="btn-primary" onClick={() => handleAction(() => approveBooking(b.id))}>Approve</button>
                      <button className="btn-secondary" onClick={() => handleAction(() => rejectBooking(b.id))}>Reject</button>
                    </>
                  )}
                  {b.status === 'APPROVED' && (
                    <>
                      <button className="btn-primary" onClick={() => handleAction(() => collectBooking(b.id))}>Mark Collected</button>
                      <button className="btn-secondary" onClick={() => handleAction(() => cancelBooking(b.id))}>Cancel</button>
                    </>
                  )}
                  {b.status === 'COLLECT_PENDING' && (
                    <span className="text-xs text-indigo-700 font-medium">Waiting borrower confirmation</span>
                  )}
                  {b.status === 'RETURN_PENDING' && (
                    <>
                      <button className="btn-primary" onClick={() => handleAction(() => approveReturnBooking(b.id))}>Confirm Return</button>
                      <button className="btn-secondary" onClick={() => handleAction(() => rejectReturnBooking(b.id))}>Reject Return</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

export default OwnerPanelPage
