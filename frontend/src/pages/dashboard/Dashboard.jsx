import { useState } from 'react'
import { Link } from 'react-router-dom'

const STATS = [
  { value: '120', label: 'Credits' },
  { value: '1', label: 'Skills verified' },
  { value: '8', label: 'Tasks done' },
  { value: '2', label: 'Active mentorships' },
]

const PROGRESS_ITEMS = [
  {
    id: 1,
    text: 'New match found for your "video editing" request',
    to: '/marketplace/matches/101',
  },
  {
    id: 2,
    text: 'Alex accepted your mentoring request for Figma',
    to: '/mentorship',
  },
  {
    id: 3,
    text: 'Team invite pending your response on "Waste Management App"',
    to: '/team-builder',
  },
]

const RECOMMENDATIONS = [
  {
    id: 1,
    text: 'Kabir needs help debugging a Python script — matches your Python skill',
    to: '/marketplace',
  },
  {
    id: 2,
    text: 'Meera R. can mentor you in UI/UX Design, based on your recent Figma interest',
    to: '/mentorship',
  },
  {
    id: 3,
    text: "Your React skills match an open Frontend role on 'Campus Event Finder'",
    to: '/team-builder',
  },
]

const NOTIFICATIONS_PREVIEW = [
  'Priya left you a 5-star review',
  'You earned 2 Campus Credits',
  'New message in your Poster Design conversation',
]

export default function Dashboard() {
  const [showSkillNudge, setShowSkillNudge] = useState(true)

  return (
    <div className="page">
      <div className="page-eyebrow">Home / Dashboard</div>
      <h1>Welcome back, Bhavani</h1>

      <div className="profile-stats dash-stats">
        {STATS.map((s) => (
          <div className="profile-stat" key={s.label}>
            <div className="profile-stat-value">{s.value}</div>
            <div className="profile-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="dash-section">
        <h2>Needs your attention</h2>
        <ul className="feed-list">
          {PROGRESS_ITEMS.map((item) => (
            <li key={item.id}>
              <Link to={item.to} className="feed-item">
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="dash-section">
        <h2>Recommended for you</h2>
        <p className="page-desc">New opportunities the AI thinks fit you — not things you've already started.</p>
        <ul className="feed-list">
          {RECOMMENDATIONS.map((item) => (
            <li key={item.id}>
              <Link to={item.to} className="feed-item">
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {showSkillNudge && (
        <div className="inferred-capability dash-nudge">
          <button
            type="button"
            className="dash-nudge-dismiss"
            aria-label="Dismiss"
            onClick={() => setShowSkillNudge(false)}
          >
            ×
          </button>
          <p className="inferred-capability-text">Your skills are mostly self-declared.</p>
          <p className="page-desc">
            Add evidence (a repo, a certificate, a project) to improve your AI matches.{' '}
            <Link to="/profile/edit-skills" className="link-small">Add evidence →</Link>
          </p>
        </div>
      )}

      <section className="dash-section">
        <div className="dash-section-header">
          <h2>Notifications</h2>
          <Link to="/notifications" className="link-small">See all →</Link>
        </div>
        <ul className="feed-list feed-list-muted">
          {NOTIFICATIONS_PREVIEW.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
