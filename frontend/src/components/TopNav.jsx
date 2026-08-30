import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { logout } from '../auth.js'

const PRIMARY_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/team-builder', label: 'Team Builder' },
  { to: '/mentorship', label: 'Mentorship' },
  { to: '/profile', label: 'Profile' },
]

export default function TopNav() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  function handleLogout() {
    logout()
    setMobileOpen(false)
    setProfileOpen(false)
    navigate('/login')
  }

  return (
    <header className="top-nav">
      <div className="top-nav-row">
        <Link to="/" className="top-nav-logo" onClick={() => setMobileOpen(false)}>
          skillX
        </Link>

        <nav className="top-nav-links top-nav-links-desktop">
          {PRIMARY_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => 'top-nav-link' + (isActive ? ' active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="top-nav-secondary top-nav-secondary-desktop">
          <Link to="/wallet" className="wallet-chip" title="Campus Credits balance">
            💳 120 cr
          </Link>
          <Link to="/notifications" className="icon-btn" title="Notifications">
            🔔<span className="badge">3</span>
          </Link>
          <div className="profile-menu">
            <button
              type="button"
              className="icon-btn avatar-btn"
              onClick={() => setProfileOpen((v) => !v)}
              aria-expanded={profileOpen}
            >
              🧑
            </button>
            {profileOpen && (
              <div className="dropdown" onMouseLeave={() => setProfileOpen(false)}>
                <Link to="/profile" onClick={() => setProfileOpen(false)}>My Profile</Link>
                <Link to="/settings" onClick={() => setProfileOpen(false)}>Account Settings</Link>
                <button type="button" className="dropdown-btn" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className="hamburger-btn"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          ☰
        </button>
      </div>

      {mobileOpen && (
        <nav className="mobile-menu">
          {PRIMARY_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => 'mobile-menu-link' + (isActive ? ' active' : '')}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <hr />
          <Link to="/wallet" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>Wallet (120 cr)</Link>
          <Link to="/notifications" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>Notifications (3)</Link>
          <Link to="/settings" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>Account Settings</Link>
          <button type="button" className="mobile-menu-link mobile-menu-btn" onClick={handleLogout}>Logout</button>
        </nav>
      )}
    </header>
  )
}
