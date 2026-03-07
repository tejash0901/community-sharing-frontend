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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your tools and bookings</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        {/* My Tools */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-sm font-bold">{data.myTools.length}</span>
            <h2 className="section-title">My Tools</h2>
          </div>
          {data.myTools.length === 0 ? (
            <p className="text-sm text-gray-400">You haven't listed any tools yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.myTools.map((tool) => (
                <div key={tool.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-white transition-colors">
                  <div className="font-medium text-gray-900">{tool.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{tool.category || 'General'}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Borrowed Tools */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-sm font-bold">{data.borrowedTools.length}</span>
            <h2 className="section-title">Borrowed Tools</h2>
          </div>
          {data.borrowedTools.length === 0 ? (
            <p className="text-sm text-gray-400">You haven't borrowed any tools.</p>
          ) : (
            <div className="space-y-3">
              {data.borrowedTools.map((booking) => (
                <div key={booking.id} className="border border-gray-100 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">{booking.toolName}</div>
                    <div className="text-sm text-gray-500">Owner: {booking.ownerName}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(booking.requestedStartTime || booking.slotStartTime).toLocaleString()} &mdash; {new Date(booking.requestedEndTime || booking.slotEndTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <BookingStatusBadge status={booking.status} />
                    {booking.status === 'COLLECT_PENDING' && (
                      <button className="btn-primary" onClick={() => handleAction(() => confirmCollectBooking(booking.id))}>Confirm Collect</button>
                    )}
                    {(booking.status === 'COLLECTED' || booking.status === 'RETURN_REJECTED') && (
                      <button className="btn-secondary" onClick={() => handleAction(() => returnBooking(booking.id))}>Return</button>
                    )}
                    {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                      <button className="btn-danger" onClick={() => handleAction(() => cancelBooking(booking.id))}>Cancel</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Requests */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">{data.pendingOwnerRequests.length}</span>
            <h2 className="section-title">Pending Requests for My Tools</h2>
          </div>
          {data.pendingOwnerRequests.length === 0 ? (
            <p className="text-sm text-gray-400">No pending requests.</p>
          ) : (
            <div className="space-y-3">
              {data.pendingOwnerRequests.map((booking) => (
                <div key={booking.id} className="border border-gray-100 rounded-xl p-4 flex flex-wrap justify-between items-center gap-3 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <div className="font-medium text-gray-900">{booking.toolName} <span className="text-gray-400 font-normal">requested by</span> {booking.borrowerName}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(booking.requestedStartTime || booking.slotStartTime).toLocaleString()} &mdash; {new Date(booking.requestedEndTime || booking.slotEndTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <BookingStatusBadge status={booking.status} />
                    {booking.status === 'PENDING' && (
                      <>
                        <button className="btn-primary" onClick={() => handleAction(() => approveBooking(booking.id))}>Approve</button>
                        <button className="btn-danger" onClick={() => handleAction(() => rejectBooking(booking.id))}>Reject</button>
                      </>
                    )}
                    {booking.status === 'APPROVED' && (
                      <>
                        <button className="btn-primary" onClick={() => handleAction(() => collectBooking(booking.id))}>Mark Collected</button>
                        <button className="btn-danger" onClick={() => handleAction(() => cancelBooking(booking.id))}>Cancel</button>
                      </>
                    )}
                    {booking.status === 'COLLECT_PENDING' && (
                      <span className="text-xs text-brand-600 font-medium bg-brand-50 px-3 py-1.5 rounded-full">Waiting borrower confirmation</span>
                    )}
                    {booking.status === 'RETURN_PENDING' && (
                      <>
                        <button className="btn-primary" onClick={() => handleAction(() => approveReturnBooking(booking.id))}>Confirm Return</button>
                        <button className="btn-danger" onClick={() => handleAction(() => rejectReturnBooking(booking.id))}>Reject Return</button>
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

export default DashboardPage
