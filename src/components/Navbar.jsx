import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white shadow-lg sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-0">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            <span className="bg-white/10 rounded-lg p-1.5 text-brand-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </span>
            <span>ToolShare</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <span className="text-brand-200 text-sm mr-3">Hi, {user?.name}</span>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/owner">Owner Panel</NavLink>
                <button onClick={handleLogout} className="ml-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link to="/register" className="ml-2 bg-white text-brand-700 hover:bg-brand-50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition" onClick={() => setMenuOpen(!menuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {isAuthenticated ? (
              <>
                <span className="block text-brand-200 text-sm px-3 py-2">Hi, {user?.name}</span>
                <MobileLink to="/" onClick={() => setMenuOpen(false)}>Home</MobileLink>
                <MobileLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileLink>
                <MobileLink to="/owner" onClick={() => setMenuOpen(false)}>Owner Panel</MobileLink>
                <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm transition">Logout</button>
              </>
            ) : (
              <>
                <MobileLink to="/login" onClick={() => setMenuOpen(false)}>Login</MobileLink>
                <MobileLink to="/register" onClick={() => setMenuOpen(false)}>Register</MobileLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, children }) {
  return (
    <Link to={to} className="text-sm text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200">
      {children}
    </Link>
  )
}

function MobileLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="block px-3 py-2 rounded-lg hover:bg-white/10 text-sm transition">
      {children}
    </Link>
  )
}

export default Navbar
