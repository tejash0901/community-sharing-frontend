import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getTool } from '../services/toolService'
import { createBooking } from '../services/bookingService'
import { getAvailabilityWindows } from '../services/availabilityService'

function ToolDetailsPage() {
  const { id } = useParams()
  const [tool, setTool] = useState(null)
  const [slots, setSlots] = useState([])
  const [requestedRanges, setRequestedRanges] = useState({})
  const [pendingRequestKeys, setPendingRequestKeys] = useState([])
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const toLocalInputValue = (isoString) => {
    const date = new Date(isoString)
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return date.toISOString().slice(0, 16)
  }

  const load = async () => {
    setError('')
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
      setError(err?.response?.data?.message || 'Unable to load tool')
    }
  }

  useEffect(() => {
    setPendingRequestKeys([])
    setSuccess('')
    load()
  }, [id])

  const requestBooking = async (slot) => {
    try {
      setError('')
      setSuccess('')
      const key = `${slot.id}-${slot.startTime}-${slot.endTime}`
      const range = requestedRanges[key]
      if (!range?.startTime || !range?.endTime) {
        setError('Please choose start and end time')
        return
      }
      await createBooking({
        toolId: Number(id),
        slotId: slot.id,
        requestedStartTime: new Date(range.startTime).toISOString(),
        requestedEndTime: new Date(range.endTime).toISOString(),
      })
      setPendingRequestKeys((prev) => [...new Set([...prev, key])])
      setSuccess('Booking requested successfully. Status is now PENDING approval.')
      load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Booking failed')
    }
  }

  return (
    <>
      <Navbar />
      <div className="container-page space-y-4">
        {success && <div className="card p-3 text-green-700">{success}</div>}
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
              <div key={`${slot.id}-${slot.startTime}-${slot.endTime}`} className="border rounded p-3 flex flex-wrap justify-between items-center gap-3">
                <div className="space-y-2">
                  <div className="text-sm text-slate-600">
                    Available window: {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      className="input"
                      type="datetime-local"
                      value={requestedRanges[`${slot.id}-${slot.startTime}-${slot.endTime}`]?.startTime || ''}
                      min={toLocalInputValue(slot.startTime)}
                      max={toLocalInputValue(slot.endTime)}
                      onChange={(e) => setRequestedRanges((prev) => ({
                        ...prev,
                        [`${slot.id}-${slot.startTime}-${slot.endTime}`]: { ...prev[`${slot.id}-${slot.startTime}-${slot.endTime}`], startTime: e.target.value },
                      }))}
                    />
                    <input
                      className="input"
                      type="datetime-local"
                      value={requestedRanges[`${slot.id}-${slot.startTime}-${slot.endTime}`]?.endTime || ''}
                      min={toLocalInputValue(slot.startTime)}
                      max={toLocalInputValue(slot.endTime)}
                      onChange={(e) => setRequestedRanges((prev) => ({
                        ...prev,
                        [`${slot.id}-${slot.startTime}-${slot.endTime}`]: { ...prev[`${slot.id}-${slot.startTime}-${slot.endTime}`], endTime: e.target.value },
                      }))}
                    />
                  </div>
                </div>
                {slot.status === 'AVAILABLE' && !pendingRequestKeys.includes(`${slot.id}-${slot.startTime}-${slot.endTime}`) ? (
                  <button className="btn-primary" onClick={() => requestBooking(slot)}>Request Booking</button>
                ) : slot.status === 'AVAILABLE' ? (
                  <span className="text-sm text-amber-700 font-medium">PENDING APPROVAL</span>
                ) : (
                  <span className="text-sm">{slot.status}</span>
                )}
              </div>
            ))}
            {slots.length === 0 && <div className="text-sm text-slate-500">No free windows currently available for this tool.</div>}
          </div>
        </div>
      </div>
    </>
  )
}

export default ToolDetailsPage
