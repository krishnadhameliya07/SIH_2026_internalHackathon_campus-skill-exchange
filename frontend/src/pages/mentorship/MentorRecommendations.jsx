import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const MENTORS = [
  { id: 'alex', name: 'Alex R.', tier: 'Strong Match', reason: 'Taught Figma to 3 peers before, patient teaching style.' },
  { id: 'mira', name: 'Mira K.', tier: 'Good Match', reason: 'Strong Figma portfolio, less mentoring experience.' },
]

export default function MentorRecommendations() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(timer)
  }, [id])

  return (
    <div className="page">
      <div className="page-eyebrow">Mentorship / Learning</div>
      <h1>Mentor Recommendations</h1>
      <p className="page-desc">Ranked peer mentors for this learning goal.</p>

      {loading ? (
        <div className="loading-state">
          <span className="spinner" aria-hidden="true" />
          Finding peer mentors…
        </div>
      ) : (
        <ul className="candidate-list">
          {MENTORS.map((m) => (
            <li key={m.id} className="candidate-card">
              <Link to={`/profile/${m.id}`} className="candidate-avatar">🧑</Link>
              <div className="candidate-body">
                <div className="candidate-header">
                  <Link to={`/profile/${m.id}`} className="candidate-name">{m.name}</Link>
                  <span className={'tier-badge tier-' + m.tier.split(' ')[0].toLowerCase()}>{m.tier}</span>
                </div>
                <p className="candidate-reason">{m.reason}</p>
              </div>
              <Link to="/mentorship" className="btn btn-small">Send Request</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
