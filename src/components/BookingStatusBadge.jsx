import React from 'react'

const statusConfig = {
  PENDING: { label: 'Pending', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24' },
  APPROVED: { label: 'Approved', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', color: '#34d399' },
  COLLECT_PENDING: { label: 'Collect Pending', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)', color: '#818cf8' },
  COLLECTED: { label: 'Collected', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.2)', color: '#2dd4bf' },
  RETURN_PENDING: { label: 'Return Pending', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)', color: '#38bdf8' },
  RETURN_REJECTED: { label: 'Return Rejected', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)', color: '#fb923c' },
  REJECTED: { label: 'Rejected', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.2)', color: '#fb7185' },
  RETURNED: { label: 'Returned', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', color: '#94a3b8' },
  CANCELLED: { label: 'Cancelled', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)', color: '#6b7280' },
}

function BookingStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.CANCELLED
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
      {config.label}
    </span>
  )
}

export default BookingStatusBadge
