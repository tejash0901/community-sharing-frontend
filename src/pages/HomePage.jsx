import React, { useEffect, useState } from 'react'
import { getTools } from '../services/toolService'
import Navbar from '../components/Navbar'
import ToolCard from '../components/ToolCard'

function HomePage() {
  const [tools, setTools] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    getTools().then(setTools).catch(() => setError('Login to view community tools.'))
  }, [])

  return (
    <>
      <Navbar />
      <div className="container-page">
        <h1 className="text-2xl font-bold mb-4">Community Tools</h1>
        {error && <div className="card p-3 text-rose-700">{error}</div>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      </div>
    </>
  )
}

export default HomePage