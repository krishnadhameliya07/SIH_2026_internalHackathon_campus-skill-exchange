import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Shared one-shot completion screen — reused by Marketplace and Team Builder,
 * both of which have a clear "we're done" moment. Mentorship deliberately
 * does NOT reuse this (see MyMentorships.jsx) since it's an ongoing
 * relationship, not a single transaction.
 */
export default function CompletionReview() {
  const location = useLocation()
  const navigate = useNavigate()
  const isTeamBuilder = location.pathname.startsWith('/team-builder')

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) {
      setError('Pick a rating before submitting.')
      return
    }
    setError('')
    navigate(isTeamBuilder ? '/team-builder' : '/marketplace/my-activity')
  }

  return (
    <div className="page">
      <div className="page-eyebrow">{isTeamBuilder ? 'Project Team Builder' : 'Marketplace'}</div>
      <h1>Confirm completion & review</h1>
      <p className="page-desc">
        {isTeamBuilder
          ? 'Mark this project complete and rate your teammates.'
          : 'Mark this task complete and leave a rating for the other student.'}
      </p>

      <form className="form-stack" onSubmit={handleSubmit}>
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
          <textarea rows={3} placeholder="How did it go?" value={comment} onChange={(e) => setComment(e.target.value)} />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="page-actions">
          <button type="submit" className="btn">
            {isTeamBuilder ? 'Submit → My Projects' : 'Submit → My Activity'}
          </button>
        </div>
      </form>
    </div>
  )
}
