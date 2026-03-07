import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

function NotFoundPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-8xl font-bold text-brand-100 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
          <Link to="/" className="btn-primary inline-block">Back to Home</Link>
        </div>
      </div>
    </>
  )
}

export default NotFoundPage
