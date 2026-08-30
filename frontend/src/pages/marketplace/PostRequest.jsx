import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createSmartRequest } from '../../api.js'

const STAGES = [
  'Figuring out what skills this actually needs…',
  'Searching the campus skill graph…',
  'Ranking the best matches…',
]

export default function PostRequest() {
  const location = useLocation()
  const navigate = useNavigate()
  const [description, setDescription] = useState(location.state?.prefill || '')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [stage, setStage] = useState('')

  useEffect(() => {
    if (!submitting) return
    setStage(STAGES[0])
    const timer = setInterval(() => {
      setStage((prev) => STAGES[Math.min(STAGES.indexOf(prev) + 1, STAGES.length - 1)])
    }, 3000)
    return () => clearInterval(timer)
  }, [submitting])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) {
      setError('Describe what you need — no need to know which specific skills it involves.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const result = await createSmartRequest({ description: description.trim(), deadline: deadline || undefined })
      navigate(`/marketplace/matches/${result.results[0]?.request_id || 'smart'}`, { state: { smartResult: result, description: description.trim() } })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Marketplace — real AI intent extraction</div>
      <h1>Post a Request</h1>
      <p className="page-desc">
        Just describe what you need — you don't need to know which specific skills it involves.
        The AI figures that out and finds real matches for each one.
      </p>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          What do you need?
          <textarea
            rows={3}
            placeholder="e.g. I want to create a YouTube video"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Deadline (optional)
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </label>

        {error && <p className="form-error">{error}</p>}

        {submitting && (
          <div className="loading-state">
            <span className="spinner" aria-hidden="true" />
            {stage}
          </div>
        )}

        <div className="page-actions">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Working…' : 'Find Matches'}
          </button>
        </div>
      </form>
    </div>
  )
}
