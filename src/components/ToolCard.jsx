import React from 'react'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../services/toolService'

const conditionColors = {
  NEW: 'bg-emerald-50 text-emerald-700',
  GOOD: 'bg-blue-50 text-blue-700',
  FAIR: 'bg-amber-50 text-amber-700',
  NEEDS_REPAIR: 'bg-red-50 text-red-700',
}

function ToolCard({ tool }) {
  return (
    <div className="card overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      {tool.imageUrl ? (
        <div className="bg-gray-50 border-b border-gray-100">
          <img src={getImageUrl(tool.imageUrl)} alt={tool.name} className="w-full h-48 object-contain p-2" />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-brand-50 to-brand-100 h-48 flex items-center justify-center border-b border-gray-100">
          <span className="text-5xl opacity-50">🔧</span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-brand-600 transition-colors">{tool.name}</h3>
            <p className="text-sm text-gray-500">{tool.category || 'General'}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${conditionColors[tool.condition] || 'bg-gray-50 text-gray-600'}`}>
            {tool.condition || 'N/A'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2 flex-1">{tool.description || 'No description provided.'}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">by {tool.ownerName}</p>
          <Link to={`/tools/${tool.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
            View Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ToolCard
