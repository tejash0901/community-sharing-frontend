import React from 'react'

const statusClass = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-rose-100 text-rose-800',
  RETURNED: 'bg-slate-100 text-slate-700',
}

function BookingStatusBadge({ status }) {
  return <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>
}

export default BookingStatusBadge