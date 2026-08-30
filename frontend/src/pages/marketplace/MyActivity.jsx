import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getRequests, getServices, getCurrentUserId } from '../../api.js'

export default function MyActivity() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [requests, services] = await Promise.all([getRequests(), getServices()])

        const mine = [
          ...requests
            .filter((r) => r.user_id === getCurrentUserId())
            .map((r) => ({
              id: `req-${r.id}`,
              title: r.description,
              status: r.status,
              to: `/marketplace/matches/${r.id}`,
              createdAt: r.created_at,
            })),
          ...services
            .filter((s) => s.user_id === getCurrentUserId())
            .map((s) => ({
              id: `svc-${s.id}`,
              title: s.title,
              status: s.status,
              to: `/marketplace/listing/svc-${s.id}`,
              createdAt: s.created_at,
            })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        if (!cancelled) setItems(mine)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="page">
      <div className="page-eyebrow">Marketplace — live from the real backend + database</div>
      <h1>My Activity</h1>

      <div className="tab-row">
        <NavLink to="/marketplace" end className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
          Feed
        </NavLink>
        <NavLink to="/marketplace/my-activity" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
          My Activity
        </NavLink>
      </div>

      <p className="page-desc">Requests and offers you've posted, pulled live from the real database.</p>

      {loading ? (
        <div className="loading-state">
          <span className="spinner" aria-hidden="true" />
          Loading your activity…
        </div>
      ) : error ? (
        <p className="form-error">Couldn't load your activity: {error}</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">Nothing posted yet</p>
          <p className="page-desc">Post a request or offer from the Feed and it'll show up here for real.</p>
        </div>
      ) : (
        <ul className="feed-list">
          {items.map((item) => (
            <li key={item.id}>
              <Link to={item.to} className="feed-item">
                {item.title} <span className="status-pill">{item.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
