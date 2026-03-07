import React from 'react'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../services/toolService'

function ToolCard({ tool }) {
  return (
    <div className="card p-4">
      {tool.imageUrl && (
        <img src={getImageUrl(tool.imageUrl)} alt={tool.name} className="w-full h-48 object-contain rounded mb-3 bg-slate-50" />
      )}
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-semibold text-lg">{tool.name}</h3>
          <p className="text-sm text-slate-600">{tool.category || 'General'}</p>
        </div>
        <span className="text-xs bg-slate-100 px-2 py-1 rounded">{tool.condition || 'N/A'}</span>
      </div>
      <p className="text-sm mt-3 line-clamp-3">{tool.description || 'No description provided.'}</p>
      <p className="text-xs text-slate-500 mt-2">Owner: {tool.ownerName}</p>
      <Link to={`/tools/${tool.id}`} className="btn-primary inline-block mt-4">View Details</Link>
    </div>
  )
}

export default ToolCard
