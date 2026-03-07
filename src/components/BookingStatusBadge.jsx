import React from 'react'

const statusClass = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  COLLECT_PENDING: 'bg-indigo-100 text-indigo-800',
  COLLECTED: 'bg-teal-100 text-teal-800',
  RETURN_PENDING: 'bg-sky-100 text-sky-800',
  RETURN_REJECTED: 'bg-orange-100 text-orange-800',
  REJECTED: 'bg-rose-100 text-rose-800',
  RETURNED: 'bg-slate-100 text-slate-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

function BookingStatusBadge({ status }) {
  return <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>
}

export default BookingStatusBadge
