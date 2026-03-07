import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getTool, getImageUrl } from '../services/toolService'
import { createBooking } from '../services/bookingService'
import { getAvailabilityWindows } from '../services/availabilityService'

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
      setSuccess('Booking requested successfully. Status is now PENDING approval.')
      load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Booking failed')
    }
  }

  return (
    <>
      <Navbar />
      <div className="container-page space-y-6">
        {success && <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-xl px-4 py-3">{success}</div>}
        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

        {tool && (
          <div className="card overflow-hidden">
            <div className="md:flex">
              {tool.imageUrl ? (
                <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100">
                  <img src={getImageUrl(tool.imageUrl)} alt={tool.name} className="max-h-80 object-contain rounded-lg" />
                </div>
              ) : (
                <div className="md:w-1/2 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center p-12 border-b md:border-b-0 md:border-r border-gray-100">
                  <span className="text-7xl opacity-40">🔧</span>
                </div>
              )}
              <div className="md:w-1/2 p-6 md:p-8 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${conditionColors[tool.condition] || 'bg-gray-50 text-gray-600'}`}>
                      {tool.condition || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{tool.category || 'General'}</p>
                </div>
                <p className="text-gray-600 leading-relaxed">{tool.description || 'No description provided.'}</p>
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <DetailRow label="Owner" value={tool.ownerName} />
                  <DetailRow label="Pickup Address" value={`Block ${tool.ownerBlock || '-'}, Floor ${tool.ownerFloor || '-'}, Flat ${tool.ownerFlatNumber || '-'}`} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card p-6">
          <h2 className="section-title mb-4">Available Slots</h2>
          {slots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No free windows currently available for this tool.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {slots.map((slot) => {
                const key = `${slot.id}-${slot.startTime}-${slot.endTime}`
                return (
                  <div key={key} className="border border-gray-100 rounded-xl p-5 space-y-3 hover:bg-gray-50/50 transition-colors">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">Available:</span>{' '}
                      {new Date(slot.startTime).toLocaleString()} &mdash; {new Date(slot.endTime).toLocaleString()}
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <label className="input-label">From</label>
                        <input
                          className="input"
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
                      <div className="flex-1 min-w-[200px]">
                        <label className="input-label">To</label>
                        <input
                          className="input"
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
                      <button className="btn-primary whitespace-nowrap" onClick={() => requestBooking(slot)}>Request Booking</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
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
