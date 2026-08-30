import { Link, useParams } from 'react-router-dom'
import ProfileHeader from '../../components/ProfileHeader.jsx'
import SkillGraph from '../../components/SkillGraph.jsx'
import InferredCapability from '../../components/InferredCapability.jsx'
import ReviewList from '../../components/ReviewList.jsx'

const SKILL_GRAPH = [
  {
    name: 'Media',
    children: [
      {
        name: 'Video Editing',
        confidence: 'evidence-backed',
        evidence: { icon: '🎬', label: 'Portfolio — 3 completed edits' },
        children: [{ name: 'Premiere Pro', confidence: 'self-declared' }],
      },
    ],
  },
]

const REVIEWS = [{ rating: 5, author: 'Mira K.', text: 'Delivered ahead of schedule.' }]

/**
 * Shared screen — same components as MyProfile, minus edit actions, plus a
 * way to reach out. Same skill-graph/review presentation regardless of
 * which listing/match/team/mentor screen linked here from.
 */
export default function PublicProfileView() {
  const { userId } = useParams()

  return (
    <div className="page profile-page">
      <div className="page-eyebrow">Shared screen — linked from listings, matches, team & mentor recommendations</div>

      <ProfileHeader
        name={userId}
        subtitle="Computer Science · 2nd year · Available this week"
        stats={[
          { value: '4.9★', label: 'Avg rating' },
          { value: '12', label: 'Tasks done' },
        ]}
        actions={[
          <Link key="request" to="/marketplace/conversation/102" className="btn">Request Help</Link>,
        ]}
      />

      <section className="profile-section">
        <div className="profile-section-title">Skill Graph</div>
        <SkillGraph data={SKILL_GRAPH} />
        <InferredCapability
          basis="Video Editing + Premiere Pro"
          capability="Short-form content production"
        />
      </section>

      <section className="profile-section">
        <div className="profile-section-title">Reviews</div>
        <ReviewList reviews={REVIEWS} />
      </section>
    </div>
  )
}
