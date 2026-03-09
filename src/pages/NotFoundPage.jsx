import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ArrowLeft } from 'lucide-react'

function NotFoundPage() {
  return (
    <div className="bg-[#060608] min-h-screen grain">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="font-display font-bold text-8xl text-transparent bg-clip-text mb-6"
            style={{ backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))' }}>
            404
          </div>
          <h1 className="font-display font-bold text-2xl text-white mb-3">Page not found</h1>
          <p className="text-slate-500 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <Link to="/" className="btn-primary text-sm inline-flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> <span>Go home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
