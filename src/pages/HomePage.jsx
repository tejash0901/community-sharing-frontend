import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTools } from '../services/toolService'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import ToolCard from '../components/ToolCard'

function HomePage() {
  const { isAuthenticated } = useAuth()
  const [tools, setTools] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    getTools().then(setTools).catch(() => setError('Login to view community tools.'))
  }, [])

  return (
    <>
      <Navbar />

      {/* Hero section */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-white">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Share Tools,{' '}
              <span className="text-brand-300">Build Community</span>
            </h1>
            <p className="text-brand-200 mt-4 text-lg max-w-2xl mx-auto">
              Borrow and lend tools within your community. Save money, reduce waste, and connect with your neighbours.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Link to="/register" className="bg-white text-brand-700 hover:bg-brand-50 font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                Get Started
              </Link>
              <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container-page">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isAuthenticated ? 'Community Tools' : 'Available Tools'}
          </h2>
        </div>

        {error && (
          <div className="card p-6 text-center">
            <p className="text-gray-500">{error}</p>
            <Link to="/login" className="btn-primary inline-block mt-4">Sign in to browse</Link>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </div>

        {!error && tools.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">🔧</div>
            <p className="text-gray-500">No tools available yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </>
  )
}

export default HomePage
