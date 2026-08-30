import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getMatchesForRequest, getUser, scoreTier } from '../../api.js'

function CandidateCard({ id, name, tier, reason }) {
  return (
    <li className="candidate-card">
      <Link to={`/profile/${id}`} className="candidate-avatar">🧑</Link>
      <div className="candidate-body">
        <div className="candidate-header">
          <Link to={`/profile/${id}`} className="candidate-name">{name}</Link>
          <span className={'tier-badge tier-' + tier.split(' ')[0].toLowerCase()}>{tier}</span>
        </div>
        <p className="candidate-reason">{reason}</p>
      </div>
      <Link to="/marketplace/conversation/102" className="btn btn-small">Send Request</Link>
    </li>
  )
}

function EmptyForSkill() {
  return (
    <div className="empty-state">
      <p className="empty-state-title">No one with this skill yet</p>
      <p className="page-desc">
        The AI checked the database and genuinely found no students offering this skill right now.
      </p>
    </div>
  )
}

/** Grouped-by-skill view — used right after a real "Post a Request" submission, where a goal can need several distinct skills. */
function SmartResultsView({ smartResult, description }) {
  return (
    <div className="page">
      <div className="page-eyebrow">Marketplace — real AI intent extraction + matching</div>
      <div className="match-context">
        <div>
          <h1>Matches for "{description}"</h1>
          <p className="page-desc">
            The AI determined this needs {smartResult.extracted_skills.length} distinct skill
            {smartResult.extracted_skills.length !== 1 ? 's' : ''}: {smartResult.extracted_skills.join(', ')}
          </p>
        </div>
        <Link to="/marketplace/post-request" className="link-small">Edit request →</Link>
      </div>

      {smartResult.results.map((group) => (
        <section key={group.request_id} className="profile-section">
          <div className="profile-section-title">{group.skill}</div>
          {group.matches.length === 0 ? (
            <EmptyForSkill />
          ) : (
            <ul className="candidate-list">
              {group.matches.map((m) => (
                <CandidateCard
                  key={m.candidate_id}
                  id={m.candidate_id}
                  name={m.candidate_name}
                  tier={scoreTier(m.score)}
                  reason={m.reason}
                />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

export default function MatchResults() {
  const { requestId } = useParams()
  const location = useLocation()
  const smartResult = location.state?.smartResult

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [candidates, setCandidates] = useState([])

  useEffect(() => {
    if (smartResult) return // grouped view handles its own data, nothing to fetch
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
  }, [requestId, smartResult])

  if (smartResult) {
    return <SmartResultsView smartResult={smartResult} description={location.state.description} />
  }

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
            <CandidateCard key={c.id} id={c.id} name={c.name} tier={c.tier} reason={c.reason} />
          ))}
        </ul>
      )}
    </div>
  )
}
