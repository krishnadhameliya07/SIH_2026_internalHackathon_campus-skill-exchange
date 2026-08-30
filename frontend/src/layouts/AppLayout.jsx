import { Outlet } from 'react-router-dom'
import TopNav from '../components/TopNav.jsx'

export default function AppLayout() {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
