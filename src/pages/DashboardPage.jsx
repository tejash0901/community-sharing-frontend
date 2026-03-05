import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { getDashboard, returnBooking } from '../services/bookingService'
import BookingStatusBadge from '../components/BookingStatusBadge'

function DashboardPage() {
  const [data, setData] = useState({ myTools: [], borrowedTools: [], pendingOwnerRequests: [] })

  const load = () => getDashboard().then(setData)

  useEffect(() => { load() }, [])

  return (
    <>
      <Navbar />
      <div className="container-page space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

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
                  {(booking.status === 'APPROVED' || booking.status === 'RETURN_REJECTED') && (
                    <button className="btn-secondary" onClick={async () => { await returnBooking(booking.id); load() }}>Return</button>
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
              <div key={booking.id} className="border rounded p-3 flex justify-between">
                <span>{booking.toolName} requested by {booking.borrowerName}</span>
                <BookingStatusBadge status={booking.status} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

export default DashboardPage
