import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const TEAM = [
  { id: 'nisha', name: 'Nisha V.', role: 'ML', reason: 'Completed 2 ML projects, available this month.' },
  { id: 'kabir', name: 'Kabir M.', role: 'Backend', reason: 'FastAPI experience, evidence-backed.' },
  { id: 'sana', name: 'Sana T.', role: 'Frontend', reason: 'React portfolio, complementary availability.' },
]

export default function RecommendedTeam() {
  const { projectId } = useParams()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(timer)
  }, [projectId])

  return (
    <div className="page">
      <div className="page-eyebrow">Project Team Builder</div>
      <h1>Recommended Team</h1>
      <p className="page-desc">
        Complementary team suggested for this project. If someone declines, there's no
        auto-replacement for MVP — you find a replacement manually.
      </p>

      {loading ? (
        <div className="loading-state">
          <span className="spinner" aria-hidden="true" />
          Assembling a complementary team…
        </div>
      ) : (
        <>
          <ul className="candidate-list">
            {TEAM.map((m) => (
              <li key={m.id} className="candidate-card">
                <Link to={`/profile/${m.id}`} className="candidate-avatar">🧑</Link>
                <div className="candidate-body">
                  <div className="candidate-header">
                    <Link to={`/profile/${m.id}`} className="candidate-name">{m.name}</Link>
                    <span className="tag">{m.role}</span>
                  </div>
                  <p className="candidate-reason">{m.reason}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="page-actions">
            <Link to="/team-builder" className="btn">Send invites → My Projects</Link>
          </div>
        </>
      )}
    </div>
  )
}
