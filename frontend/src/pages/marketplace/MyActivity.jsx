import { Link, NavLink } from 'react-router-dom'

const ACTIVITY = [
  { id: 101, title: 'Video editing request', status: 'Matches ready', to: '/marketplace/matches/101' },
  { id: 102, title: 'Poster design request', status: 'In progress', to: '/marketplace/conversation/102' },
  { id: 103, title: 'Python tutoring offer', status: 'Completed', to: '/marketplace/review/103' },
]

export default function MyActivity() {
  return (
    <div className="page">
      <div className="page-eyebrow">Marketplace</div>
      <h1>My Activity</h1>

      <div className="tab-row">
        <NavLink to="/marketplace" end className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
          Feed
        </NavLink>
        <NavLink to="/marketplace/my-activity" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
          My Activity
        </NavLink>
      </div>

      <p className="page-desc">Requests and offers you've posted, and their current status.</p>

      <ul className="feed-list">
        {ACTIVITY.map((item) => (
          <li key={item.id}>
            <Link to={item.to} className="feed-item">
              {item.title} <span className="status-pill">{item.status}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
