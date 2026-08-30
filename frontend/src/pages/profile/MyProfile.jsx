import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProfileHeader from '../../components/ProfileHeader.jsx'
import SkillGraph from '../../components/SkillGraph.jsx'
import InferredCapability from '../../components/InferredCapability.jsx'
import ReviewList from '../../components/ReviewList.jsx'
import { getSkillGraph, CURRENT_USER_ID } from '../../api.js'

const REVIEWS = [
  { rating: 5, author: 'Priya S.', text: 'Great to work with, delivered early.' },
  { rating: 4, author: 'Kabir M.', text: 'Solid help on the poster design.' },
]

function toTreeData(categories) {
  return categories.map((cat) => ({
    name: cat.name,
    children: cat.skills.map((s) => ({
      name: s.name,
      confidence: s.verification_status === 'Self-declared' ? 'self-declared' : 'evidence-backed',
      evidence: s.evidence_note ? { icon: '📎', label: s.evidence_note } : null,
    })),
  }))
}

export default function MyProfile() {
  const [graph, setGraph] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getSkillGraph(CURRENT_USER_ID)
      .then((data) => { if (!cancelled) setGraph(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="page profile-page">
      <div className="page-eyebrow">Skill Profile — live from the real backend + database</div>

      <ProfileHeader
        name="Bhavani"
        subtitle="Computer Science · 3rd year · Available weekends"
        bio={graph?.summary || 'Add a resume, GitHub, or description in Edit Skills to generate an AI summary.'}
        stats={[
          { value: '120', label: 'Credits' },
          { value: '4.6★', label: 'Avg rating' },
          { value: '8', label: 'Tasks done' },
        ]}
        actions={[
          <Link key="edit" to="/profile/edit-skills" className="btn">Edit Skills / Evidence</Link>,
        ]}
      />

      <section className="profile-section">
        <div className="profile-section-title">Skill Graph</div>
        <p className="page-desc">
          Not a flat list — the AI groups declared and verified skills into a structured graph,
          so it can infer capabilities you never explicitly stated.
        </p>

        {loading ? (
          <div className="loading-state">
            <span className="spinner" aria-hidden="true" />
            Loading your skill graph…
          </div>
        ) : error ? (
          <p className="form-error">Couldn't load your skill graph: {error}</p>
        ) : graph.categories.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No skills yet</p>
            <p className="page-desc">
              Go to <Link to="/profile/edit-skills" className="link-small">Edit Skills</Link> and add a resume,
              GitHub, or description to build your skill graph.
            </p>
          </div>
        ) : (
          <>
            <SkillGraph data={toTreeData(graph.categories)} />
            {graph.inferred_capability && (
              <InferredCapability
                basis={graph.inferred_capability.basis}
                capability={graph.inferred_capability.capability}
              />
            )}
          </>
        )}
      </section>

      <section className="profile-section">
        <div className="profile-section-title">Reviews received</div>
        <ReviewList reviews={REVIEWS} />
      </section>
    </div>
  )
}
