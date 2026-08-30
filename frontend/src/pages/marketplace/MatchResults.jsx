import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMatchesForRequest, getUser, scoreTier } from '../../api.js'

export default function MatchResults() {
  const { requestId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [candidates, setCandidates] = useState([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    async function load() {
      try {
        const matches = await getMatchesForRequest(requestId)
        const withNames = await Promise.all(
          matches.map(async (m) => {
            const user = await getUser(m.candidate_id)
            return {
              id: m.candidate_id,
              name: user.name,
              tier: scoreTier(m.match_score),
              reason: m.reason,
            }
          })
        )
        if (!cancelled) setCandidates(withNames)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [requestId])

  return (
    <div className="page">
      <div className="page-eyebrow">Marketplace — live from the real backend + database</div>
      <div className="match-context">
        <div>
          <h1>Matches for request #{requestId}</h1>
        </div>
        <Link to="/marketplace/post-request" className="link-small">Edit request →</Link>
      </div>

      {loading ? (
        <div className="loading-state">
          <span className="spinner" aria-hidden="true" />
          Finding your best matches…
        </div>
      ) : error ? (
        <p className="form-error">Couldn't load matches: {error}</p>
      ) : candidates.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No one with this skill yet</p>
          <p className="page-desc">
            The AI checked the database and genuinely found no students offering this skill right now —
            this isn't an error, there's just no one to match with yet.
          </p>
          <Link to="/marketplace/post-request" className="btn btn-small btn-ghost">← Try a different skill</Link>
        </div>
      ) : (
        <ul className="candidate-list">
          {candidates.map((c) => (
            <li key={c.id} className="candidate-card">
              <Link to={`/profile/${c.id}`} className="candidate-avatar">🧑</Link>
              <div className="candidate-body">
                <div className="candidate-header">
                  <Link to={`/profile/${c.id}`} className="candidate-name">{c.name}</Link>
                  <span className={'tier-badge tier-' + c.tier.split(' ')[0].toLowerCase()}>{c.tier}</span>
                </div>
                <p className="candidate-reason">{c.reason}</p>
              </div>
              <Link to="/marketplace/conversation/102" className="btn btn-small">Send Request</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
