import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
          skill<span className="auth-logo-accent">X</span>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
