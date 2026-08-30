import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getSkills, createRequest } from '../../api.js'

export default function PostRequest() {
  const location = useLocation()
  const navigate = useNavigate()
  const [description, setDescription] = useState(location.state?.prefill || '')
  const [deadline, setDeadline] = useState('')
  const [skillId, setSkillId] = useState('')
  const [skills, setSkills] = useState([])
  const [skillsError, setSkillsError] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getSkills()
      .then(setSkills)
      .catch(() => setSkillsError('Could not reach the backend to load skills — is it running?'))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) {
      setError('Description is required.')
      return
    }
    if (!skillId) {
      setError('Pick the skill this request needs.')
      return
    }
    if (!deadline) {
      setError('Pick a deadline.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const created = await createRequest({ description: description.trim(), skillId: Number(skillId), deadline })
      navigate(`/marketplace/matches/${created.id}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Marketplace</div>
      <h1>Post a Request</h1>
      <p className="page-desc">
        Pre-filled from the Feed's hero box. This now submits to the real backend — AI Match Results
        will show real, database-computed matches.
      </p>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Description
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Skill required
          <select value={skillId} onChange={(e) => setSkillId(e.target.value)}>
            <option value="">Select a skill…</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        {skillsError && <p className="form-error">{skillsError}</p>}
        <label>
          Deadline
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="page-actions">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit → AI Match Results'}
          </button>
        </div>
      </form>
    </div>
  )
}
