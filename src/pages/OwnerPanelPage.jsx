import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { createAvailability, deleteAvailability, getAvailability } from '../services/availabilityService'
import { approveBooking, getOwnerBookings, rejectBooking } from '../services/bookingService'
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
  const [slotForm, setSlotForm] = useState({ startTime: '', endTime: '' })

  const load = async () => {
    const allTools = await getTools()
    setTools(allTools.filter((t) => t.ownerId === user?.userId))
    setOwnerBookings(await getOwnerBookings())
  }

  useEffect(() => { load() }, [])

  const onCreateTool = async (e) => {
    e.preventDefault()
    await createTool({ ...toolForm, estimatedPrice: toolForm.estimatedPrice ? Number(toolForm.estimatedPrice) : null })
    setToolForm({ name: '', description: '', category: '', condition: 'GOOD', estimatedPrice: '' })
    load()
  }

  const loadSlots = async (toolId) => {
    setSelectedTool(toolId)
    setSlots(await getAvailability(toolId))
  }

  const onCreateSlot = async (e) => {
    e.preventDefault()
    if (!selectedTool) return
    await createAvailability(selectedTool, {
      startTime: new Date(slotForm.startTime).toISOString(),
      endTime: new Date(slotForm.endTime).toISOString(),
    })
    setSlotForm({ startTime: '', endTime: '' })
    loadSlots(selectedTool)
  }

  return (
    <>
      <Navbar />
      <div className="container-page grid lg:grid-cols-2 gap-6">
        <section className="card p-4">
          <h2 className="font-semibold mb-3">Add Tool</h2>
          <form className="space-y-2" onSubmit={onCreateTool}>
            <input className="input" required placeholder="Tool name" value={toolForm.name} onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })} />
            <input className="input" placeholder="Category" value={toolForm.category} onChange={(e) => setToolForm({ ...toolForm, category: e.target.value })} />
            <textarea className="input" placeholder="Description" value={toolForm.description} onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })} />
            <input className="input" placeholder="Condition (NEW/GOOD/FAIR/NEEDS_REPAIR)" value={toolForm.condition} onChange={(e) => setToolForm({ ...toolForm, condition: e.target.value })} />
            <input className="input" type="number" placeholder="Estimated Price" value={toolForm.estimatedPrice} onChange={(e) => setToolForm({ ...toolForm, estimatedPrice: e.target.value })} />
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
                  <button className="btn-secondary" onClick={async () => { await deleteTool(tool.id); load() }}>Delete</button>
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
                  <button className="btn-secondary" onClick={async () => { await deleteAvailability(slot.id); loadSlots(selectedTool) }}>Delete</button>
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
                <div>{b.toolName} - requested by {b.borrowerName}</div>
                <div className="flex items-center gap-2">
                  <BookingStatusBadge status={b.status} />
                  {b.status === 'PENDING' && (
                    <>
                      <button className="btn-primary" onClick={async () => { await approveBooking(b.id); load() }}>Approve</button>
                      <button className="btn-secondary" onClick={async () => { await rejectBooking(b.id); load() }}>Reject</button>
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