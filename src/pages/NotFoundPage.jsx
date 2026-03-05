import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

function NotFoundPage() {
  return (
    <>
      <Navbar />
      <div className="container-page">
        <div className="card p-6">
          <h1 className="text-xl font-bold">Page Not Found</h1>
          <Link to="/" className="underline mt-2 inline-block">Go Home</Link>
        </div>
      </div>
    </>
  )
}

export default NotFoundPage