import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const CANDIDATES = [
  {
    id: 'kabir',
    name: 'Kabir M.',
    tier: 'Strong Match',
    tags: ['Video Editing', 'Premiere Pro'],
    availability: 'Available this week',
    proof: 'Evidence-backed (3 completed projects)',
    reason: 'Matched on video editing skill + availability before Saturday.',
  },
  {
    id: 'sana',
    name: 'Sana T.',
    tier: 'Good Match',
    tags: ['Video Editing'],
    availability: 'Available weekends',
    proof: 'Self-declared',
    reason: 'Matched on video editing skill; availability is a partial fit.',
  },
  {
    id: 'divya',
    name: 'Divya P.',
    tier: 'Possible Match',
    tags: ['Photography', 'Basic editing'],
    availability: 'Available this week',
    proof: 'Peer-backed (2 reviews)',
    reason: 'Adjacent skill set — editing experience is limited but availability fits well.',
  },
]

export default function MatchResults() {
  const { requestId } = useParams()
  // Simulates the real fetch-and-wait that will replace this once matching
  // is a backend call — same "loading -> ready" shape, so swapping in a real
  // request later doesn't change how this screen renders.
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(timer)
  }, [requestId])

  return (
    <div className="page">
      <div className="page-eyebrow">Marketplace</div>
      <div className="match-context">
        <div>
          <h1>Matches for request #{requestId}</h1>
          <p className="page-desc">"Need someone to edit a 5-minute promotional video by Saturday"</p>
        </div>
        <Link to="/marketplace/post-request" className="link-small">Edit request →</Link>
      </div>

      {loading ? (
        <div className="loading-state">
          <span className="spinner" aria-hidden="true" />
          Finding your best matches…
        </div>
      ) : (
        <>
          <ul className="candidate-list">
            {CANDIDATES.map((c) => (
              <li key={c.id} className="candidate-card">
                <Link to={`/profile/${c.id}`} className="candidate-avatar">🧑</Link>
                <div className="candidate-body">
                  <div className="candidate-header">
                    <Link to={`/profile/${c.id}`} className="candidate-name">{c.name}</Link>
                    <span className={'tier-badge tier-' + c.tier.split(' ')[0].toLowerCase()}>{c.tier}</span>
                  </div>
                  <div className="listing-tags">
                    {c.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                  </div>
                  <div className="candidate-meta">{c.availability} · {c.proof}</div>
                  <p className="candidate-reason">{c.reason}</p>
                </div>
                <Link to="/marketplace/conversation/102" className="btn btn-small">Send Request</Link>
              </li>
            ))}
          </ul>

          <p className="page-desc fallback-note">
            No strong matches? <Link to="/marketplace/post-request" className="link-small">Broaden your request →</Link>
          </p>
        </>
      )}
    </div>
  )
}
