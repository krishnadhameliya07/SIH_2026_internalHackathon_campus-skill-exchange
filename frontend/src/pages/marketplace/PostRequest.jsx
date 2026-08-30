import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function PostRequest() {
  const location = useLocation()
  const navigate = useNavigate()
  const [description, setDescription] = useState(location.state?.prefill || '')
  const [deadline, setDeadline] = useState('')
  const [constraints, setConstraints] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) {
      setError('Description is required.')
      return
    }
    if (!deadline) {
      setError('Pick a deadline.')
      return
    }
    setError('')
    navigate('/marketplace/matches/201')
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Marketplace</div>
      <h1>Post a Request</h1>
      <p className="page-desc">
        Pre-filled from the Feed's hero box. Add the remaining structured details before AI extraction runs.
      </p>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Description
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Deadline
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </label>
        <label>
          Constraints (optional)
          <input
            type="text"
            placeholder="e.g. must be under 5 minutes"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="page-actions">
          <button type="submit" className="btn">Submit → AI Match Results</button>
        </div>
      </form>
    </div>
  )
}
