import { useState } from 'react'
import { Link } from 'react-router-dom'

const INITIAL_REQUESTS_RECEIVED = [
  { id: 301, mentee: 'Rohan T.', menteeId: 'rohan', topic: 'Python basics' },
]

const INITIAL_REQUESTS_SENT = [
  { id: 201, mentor: 'Priya S.', mentorId: 'priya', topic: 'UI/UX Design' },
]

const INITIAL_MENTORSHIPS = [
  {
    id: 1,
    role: 'learning',
    topic: 'Figma',
    withName: 'Alex R.',
    status: 'Active',
    path: ['Basics', 'Components', 'Prototyping'],
    currentStep: 1,
    to: '/mentorship/1/conversation',
  },
  {
    id: 2,
    role: 'learning',
    topic: 'Python',
    withName: 'Sana T.',
    status: 'Active',
    path: ['Syntax & Basics', 'Data Structures', 'Mini Project'],
    currentStep: 0,
    to: '/mentorship/2/conversation',
  },
]

const INITIAL_SUGGESTIONS = [
  {
    id: 401,
    mentor: 'Meera R.',
    mentorId: 'meera',
    topic: 'UI/UX Design',
    reason: 'Based on your recent Figma searches in Marketplace',
  },
  {
    id: 402,
    mentor: 'Arjun K.',
    mentorId: 'arjun',
    topic: 'Public Speaking',
    reason: "Because you're leading the SIH Hackathon Team project",
  },
]

const DEFAULT_PATH = ['Getting started', 'Core concepts', 'Practice project']

export default function MyMentorships() {
  const [requestsReceived, setRequestsReceived] = useState(INITIAL_REQUESTS_RECEIVED)
  const [requestsSent, setRequestsSent] = useState(INITIAL_REQUESTS_SENT)
  const [mentorships, setMentorships] = useState(INITIAL_MENTORSHIPS)
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS)

  const [endingId, setEndingId] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  function acceptReceived(req) {
    setRequestsReceived((prev) => prev.filter((r) => r.id !== req.id))
    setMentorships((prev) => [
      ...prev,
      {
        id: req.id,
        role: 'mentoring',
        topic: req.topic,
        withName: req.mentee,
        status: 'Active',
        path: DEFAULT_PATH,
        currentStep: 0,
        to: `/mentorship/${req.id}/conversation`,
      },
    ])
  }

  function declineReceived(req) {
    setRequestsReceived((prev) => prev.filter((r) => r.id !== req.id))
  }

  function cancelSent(req) {
    setRequestsSent((prev) => prev.filter((r) => r.id !== req.id))
  }

  function markStepComplete(id) {
    setMentorships((prev) =>
      prev.map((m) => (m.id === id ? { ...m, currentStep: Math.min(m.currentStep + 1, m.path.length - 1) } : m))
    )
  }

  function markInterested(sugg) {
    setSuggestions((prev) => prev.filter((s) => s.id !== sugg.id))
    setRequestsSent((prev) => [...prev, { id: sugg.id, mentor: sugg.mentor, mentorId: sugg.mentorId, topic: sugg.topic }])
  }

  function dismissSuggestion(sugg) {
    setSuggestions((prev) => prev.filter((s) => s.id !== sugg.id))
  }

  function startEnding(id) {
    setEndingId(id)
    setRating(0)
    setComment('')
    setError('')
  }

  function handleSubmitReview(e) {
    e.preventDefault()
    if (rating === 0) {
      setError('Pick a rating before submitting.')
      return
    }
    setMentorships((prev) => prev.map((m) => (m.id === endingId ? { ...m, status: 'Completed' } : m)))
    setEndingId(null)
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Mentorship / Learning</div>
      <h1>My Mentorships</h1>
      <p className="page-desc">
        Requests waiting on a response, ongoing mentorships with clear progress, and mentors the AI thinks you'd want.
      </p>

      {requestsReceived.length > 0 && (
        <section className="profile-section">
          <div className="profile-section-title">Requests For You ({requestsReceived.length})</div>
          <ul className="feed-list">
            {requestsReceived.map((req) => (
              <li key={req.id} className="invite-card">
                <div>
                  <strong>{req.mentee}</strong> wants you to mentor them in <strong>{req.topic}</strong>
                </div>
                <div className="invite-actions">
                  <button type="button" className="btn btn-small" onClick={() => acceptReceived(req)}>Accept</button>
                  <button type="button" className="btn btn-small btn-ghost" onClick={() => declineReceived(req)}>Decline</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {requestsSent.length > 0 && (
        <section className="profile-section">
          <div className="profile-section-title">Requests You've Sent ({requestsSent.length})</div>
          <ul className="feed-list">
            {requestsSent.map((req) => (
              <li key={req.id} className="invite-card">
                <div>
                  <strong>{req.topic}</strong> with {req.mentor}
                  <div className="page-desc">Waiting for a response</div>
                </div>
                <div className="invite-actions">
                  <span className="status-pill">Pending</span>
                  <button type="button" className="btn btn-small btn-ghost" onClick={() => cancelSent(req)}>Cancel</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="profile-section">
        <div className="profile-section-title">My Mentorships</div>
        <ul className="mentorship-card-list">
          {mentorships.map((m) => (
            <li key={m.id} className="mentorship-card">
              <div className="mentorship-card-top">
                <span className={'role-badge role-' + m.role}>{m.role === 'learning' ? 'Learning' : 'Mentoring'}</span>
                <span className="mentorship-card-title">{m.topic} with {m.withName}</span>
                <span className={'status-pill status-' + m.status.toLowerCase()}>{m.status}</span>
              </div>

              {m.status === 'Active' && (
                <ul className="path-checklist">
                  {m.path.map((step, i) => (
                    <li key={step} className={i < m.currentStep ? 'path-done' : i === m.currentStep ? 'path-current' : 'path-upcoming'}>
                      <span className="path-icon" aria-hidden="true">{i < m.currentStep ? '✓' : i === m.currentStep ? '▸' : '○'}</span>
                      {step}
                    </li>
                  ))}
                </ul>
              )}

              <div className="page-actions">
                <Link to={m.to} className="btn btn-small btn-ghost">Open conversation</Link>
                {m.status === 'Active' && m.currentStep < m.path.length - 1 && (
                  <button type="button" className="btn btn-small" onClick={() => markStepComplete(m.id)}>
                    Mark "{m.path[m.currentStep]}" complete
                  </button>
                )}
                {m.status === 'Active' && (
                  <button type="button" className="btn btn-small btn-ghost" onClick={() => startEnding(m.id)}>
                    End mentorship
                  </button>
                )}
              </div>

              {endingId === m.id && (
                <form className="inline-review form-stack" onSubmit={handleSubmitReview}>
                  <label>
                    Rating
                    <div className="star-row star-row-interactive">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className="star-btn"
                          aria-label={`${n} star${n > 1 ? 's' : ''}`}
                          onClick={() => { setRating(n); setError('') }}
                        >
                          {n <= rating ? '★' : '☆'}
                        </button>
                      ))}
                    </div>
                  </label>
                  <label>
                    Comment
                    <textarea
                      rows={2}
                      placeholder="How was the mentorship?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </label>
                  {error && <p className="form-error">{error}</p>}
                  <div className="page-actions">
                    <button type="submit" className="btn btn-small">Submit & mark completed</button>
                    <button type="button" className="btn btn-small btn-ghost" onClick={() => setEndingId(null)}>Cancel</button>
                  </div>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>

      {suggestions.length > 0 && (
        <section className="profile-section">
          <div className="profile-section-title">Suggested For You</div>
          <ul className="candidate-list">
            {suggestions.map((s) => (
              <li key={s.id} className="candidate-card">
                <Link to={`/profile/${s.mentorId}`} className="candidate-avatar">🧑</Link>
                <div className="candidate-body">
                  <div className="candidate-header">
                    <Link to={`/profile/${s.mentorId}`} className="candidate-name">{s.mentor}</Link>
                    <span className="tag">{s.topic}</span>
                  </div>
                  <p className="candidate-reason">{s.reason}</p>
                </div>
                <div className="invite-actions">
                  <button type="button" className="btn btn-small" onClick={() => markInterested(s)}>I'm interested</button>
                  <button type="button" className="btn btn-small btn-ghost" onClick={() => dismissSuggestion(s)}>Not interested</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="page-actions">
        <Link to="/mentorship/new" className="btn">+ Find a Mentor</Link>
      </div>
    </div>
  )
}
