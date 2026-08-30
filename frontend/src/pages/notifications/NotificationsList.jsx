import { Link } from 'react-router-dom'

const NOTIFICATIONS = [
  { id: 1, text: 'New match found for your video editing request', to: '/marketplace/matches/101' },
  { id: 2, text: 'Alex accepted your mentoring request', to: '/mentorship' },
  { id: 3, text: 'Priya left you a 5-star review', to: '/profile' },
  { id: 4, text: 'You earned 2 Campus Credits', to: '/wallet' },
]

export default function NotificationsList() {
  return (
    <div className="page">
      <div className="page-eyebrow">Notifications</div>
      <h1>Notifications</h1>

      <ul className="feed-list">
        {NOTIFICATIONS.map((n) => (
          <li key={n.id}>
            <Link to={n.to} className="feed-item">{n.text}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
