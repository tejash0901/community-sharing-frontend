import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getTool } from '../services/toolService'
import { createBooking } from '../services/bookingService'
import { getAvailability } from '../services/availabilityService'

function ToolDetailsPage() {
  const { id } = useParams()
  const [tool, setTool] = useState(null)
  const [slots, setSlots] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      const [t, s] = await Promise.all([getTool(id), getAvailability(id)])
      setTool(t)
      setSlots(s)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load tool')
    }
  }

  useEffect(() => { load() }, [id])

  const requestBooking = async (slotId) => {
    try {
      await createBooking({ toolId: Number(id), slotId })
      load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Booking failed')
    }
  }

  return (
    <>
      <Navbar />
      <div className="container-page space-y-4">
        {error && <div className="card p-3 text-rose-700">{error}</div>}
        {tool && (
          <div className="card p-4">
            <h1 className="text-2xl font-bold">{tool.name}</h1>
            <p className="text-slate-600 mt-2">{tool.description}</p>
            <p className="mt-2">Category: {tool.category || 'General'}</p>
            <p>Condition: {tool.condition || 'N/A'}</p>
            <p>Owner pickup address: Block {tool.ownerBlock || '-'}, Floor {tool.ownerFloor || '-'}, Flat {tool.ownerFlatNumber || '-'}</p>
          </div>
        )}

        <div className="card p-4">
          <h2 className="font-semibold mb-3">Available Slots</h2>
          <div className="space-y-2">
            {slots.map((slot) => (
              <div key={slot.id} className="border rounded p-3 flex flex-wrap justify-between items-center gap-3">
                <span>{new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}</span>
                {slot.status === 'AVAILABLE' ? (
                  <button className="btn-primary" onClick={() => requestBooking(slot.id)}>Request Booking</button>
                ) : (
                  <span className="text-sm">{slot.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default ToolDetailsPage