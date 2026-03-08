import React from 'react'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../services/toolService'
import { ArrowUpRight } from 'lucide-react'

function ToolCard({ tool }) {
  return (
    <div className="card p-5 group">
      {tool.imageUrl && (
        <div className="rounded-xl overflow-hidden mb-4 bg-white/[0.02]">
          <img
            src={getImageUrl(tool.imageUrl)}
            alt={tool.name}
            className="w-full h-44 object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div>
          <h3 className="font-display font-semibold text-base text-white">{tool.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{tool.category || 'General'}</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 px-2.5 py-1 rounded-full shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {tool.condition || 'N/A'}
        </span>
      </div>
      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">{tool.description || 'No description provided.'}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-600">by {tool.ownerName}</p>
        <Link to={`/tools/${tool.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors group/link"
          style={{ color: 'rgb(var(--color-cyan))' }}>
          Details
          <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  )
}

export default ToolCard
