import { Link } from 'react-router-dom'
import ProfileHeader from '../../components/ProfileHeader.jsx'
import SkillGraph from '../../components/SkillGraph.jsx'
import InferredCapability from '../../components/InferredCapability.jsx'
import ReviewList from '../../components/ReviewList.jsx'

const SKILL_GRAPH = [
  {
    name: 'Programming',
    children: [
      {
        name: 'Python',
        confidence: 'self-declared',
        children: [
          {
            name: 'NLP',
            confidence: 'self-declared',
            children: [{ name: 'LLM / RAG', confidence: 'self-declared' }],
          },
        ],
      },
      {
        name: 'React',
        confidence: 'evidence-backed',
        evidence: { icon: '🔗', label: 'GitHub — nlp-chatbot repo' },
      },
    ],
  },
  {
    name: 'Design',
    children: [{ name: 'Graphic Design', confidence: 'self-declared' }],
  },
]

const REVIEWS = [
  { rating: 5, author: 'Priya S.', text: 'Great to work with, delivered early.' },
  { rating: 4, author: 'Kabir M.', text: 'Solid help on the poster design.' },
]

export default function MyProfile() {
  return (
    <div className="page profile-page">
      <div className="page-eyebrow">Skill Profile</div>

      <ProfileHeader
        name="Bhavani"
        subtitle="Computer Science · 3rd year · Available weekends"
        bio="Building the frontend for skillX. Into NLP side projects and graphic design on the side."
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
        <SkillGraph data={SKILL_GRAPH} />
        <InferredCapability
          basis="Python + NLP + LLM/RAG"
          capability="AI application development"
        />
      </section>

      <section className="profile-section">
        <div className="profile-section-title">Reviews received</div>
        <ReviewList reviews={REVIEWS} />
      </section>
    </div>
  )
}
