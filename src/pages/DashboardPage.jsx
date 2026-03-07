import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { getDashboard, returnBooking, approveBooking, rejectBooking, approveReturnBooking, rejectReturnBooking, confirmCollectBooking, cancelBooking, collectBooking } from '../services/bookingService'
import BookingStatusBadge from '../components/BookingStatusBadge'

function DashboardPage() {
  const [data, setData] = useState({ myTools: [], borrowedTools: [], pendingOwnerRequests: [] })
  const [error, setError] = useState('')

  const load = () => {
    getDashboard().then(setData).catch((err) => setError(err?.response?.data?.message || 'Failed to load dashboard'))
  }

  const handleAction = async (action) => {
    try {
      setError('')
      await action()
      load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Action failed')
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Navbar />
      <div className="container-page space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {error && <div className="card p-3 text-rose-700">{error}</div>}

        <section className="card p-4">
          <h2 className="font-semibold mb-3">My Tools</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {data.myTools.map((tool) => <div key={tool.id} className="border rounded p-3">{tool.name} - {tool.category || 'General'}</div>)}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="font-semibold mb-3">Borrowed Tools</h2>
          <div className="space-y-2">
            {data.borrowedTools.map((booking) => (
              <div key={booking.id} className="border rounded p-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{booking.toolName}</div>
                  <div className="text-sm text-slate-500">Owner: {booking.ownerName}</div>
                  <div className="text-xs text-slate-500">
                    Time: {new Date(booking.requestedStartTime || booking.slotStartTime).toLocaleString()} - {new Date(booking.requestedEndTime || booking.slotEndTime).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookingStatusBadge status={booking.status} />
                  {booking.status === 'COLLECT_PENDING' && (
                    <button className="btn-primary" onClick={() => handleAction(() => confirmCollectBooking(booking.id))}>Confirm Collect</button>
                  )}
                  {(booking.status === 'COLLECTED' || booking.status === 'RETURN_REJECTED') && (
                    <button className="btn-secondary" onClick={() => handleAction(() => returnBooking(booking.id))}>Return</button>
                  )}
                  {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                    <button className="btn-secondary" onClick={() => handleAction(() => cancelBooking(booking.id))}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="font-semibold mb-3">Pending Requests for My Tools</h2>
          <div className="space-y-2">
            {data.pendingOwnerRequests.map((booking) => (
              <div key={booking.id} className="border rounded p-3 flex flex-wrap justify-between items-center gap-2">
                <div>
                  <div>{booking.toolName} requested by {booking.borrowerName}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(booking.requestedStartTime || booking.slotStartTime).toLocaleString()} - {new Date(booking.requestedEndTime || booking.slotEndTime).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookingStatusBadge status={booking.status} />
                  {booking.status === 'PENDING' && (
                    <>
                      <button className="btn-primary" onClick={() => handleAction(() => approveBooking(booking.id))}>Approve</button>
                      <button className="btn-secondary" onClick={() => handleAction(() => rejectBooking(booking.id))}>Reject</button>
                    </>
                  )}
                  {booking.status === 'APPROVED' && (
                    <>
                      <button className="btn-primary" onClick={() => handleAction(() => collectBooking(booking.id))}>Mark Collected</button>
                      <button className="btn-secondary" onClick={() => handleAction(() => cancelBooking(booking.id))}>Cancel</button>
                    </>
                  )}
                  {booking.status === 'COLLECT_PENDING' && (
                    <span className="text-xs text-indigo-700 font-medium">Waiting borrower confirmation</span>
                  )}
                  {booking.status === 'RETURN_PENDING' && (
                    <>
                      <button className="btn-primary" onClick={() => handleAction(() => approveReturnBooking(booking.id))}>Confirm Return</button>
                      <button className="btn-secondary" onClick={() => handleAction(() => rejectReturnBooking(booking.id))}>Reject Return</button>
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

export default DashboardPage
