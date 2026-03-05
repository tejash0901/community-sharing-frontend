import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-brand-900 text-white">
      <div className="container-page py-3 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="font-bold text-lg">Community Tool Sharing</Link>
        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <span>{user?.name}</span>
              <Link to="/" className="underline">Home</Link>
              <Link to="/dashboard" className="underline">Dashboard</Link>
              <Link to="/owner" className="underline">Owner Panel</Link>
              <button onClick={handleLogout} className="btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="underline">Login</Link>
              <Link to="/register" className="underline">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
