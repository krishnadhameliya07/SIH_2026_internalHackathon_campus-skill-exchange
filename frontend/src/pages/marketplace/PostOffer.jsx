import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getSkills, createService } from '../../api.js'

export default function PostOffer() {
  const location = useLocation()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState(location.state?.prefill || '')
  const [skillId, setSkillId] = useState('')
  const [skills, setSkills] = useState([])
  const [skillsError, setSkillsError] = useState('')
  const [availability, setAvailability] = useState('')
  const [credits, setCredits] = useState(1)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getSkills()
      .then(setSkills)
      .catch(() => setSkillsError('Could not reach the backend to load skills — is it running?'))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Give your offer a short title.')
      return
    }
    if (!description.trim()) {
      setError('Description is required.')
      return
    }
    if (!skillId) {
      setError('Pick the skill this offer is for.')
      return
    }
    if (!availability.trim()) {
      setError('Add your availability.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await createService({
        title: title.trim(),
        description: description.trim(),
        skillId: Number(skillId),
        availability,
        credits: Number(credits) || 1,
      })
      navigate('/marketplace/my-activity')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Marketplace</div>
      <h1>Post an Offer</h1>
      <p className="page-desc">This submits to the real backend — it'll appear in the Feed and My Activity for real.</p>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            placeholder="e.g. Python tutoring for beginners"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          Description
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Skill
          <select value={skillId} onChange={(e) => setSkillId(e.target.value)}>
            <option value="">Select a skill…</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        {skillsError && <p className="form-error">{skillsError}</p>}
        <label>
          Availability
          <input
            type="text"
            placeholder="e.g. weekends"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />
        </label>
        <label>
          Credits per hour
          <input type="number" min="1" value={credits} onChange={(e) => setCredits(e.target.value)} />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="page-actions">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post Offer → My Activity'}
          </button>
        </div>
      </form>
    </div>
  )
}
