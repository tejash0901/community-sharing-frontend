import React from 'react'

const statusConfig = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COLLECT_PENDING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  COLLECTED: 'bg-teal-50 text-teal-700 border-teal-200',
  RETURN_PENDING: 'bg-sky-50 text-sky-700 border-sky-200',
  RETURN_REJECTED: 'bg-orange-50 text-orange-700 border-orange-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  RETURNED: 'bg-gray-50 text-gray-600 border-gray-200',
  CANCELLED: 'bg-gray-50 text-gray-500 border-gray-200',
}

function BookingStatusBadge({ status }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  )
}

export default BookingStatusBadge
