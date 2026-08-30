import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function PostOffer() {
  const location = useLocation()
  const navigate = useNavigate()
  const [description, setDescription] = useState(location.state?.prefill || '')
  const [level, setLevel] = useState('beginner')
  const [availability, setAvailability] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) {
      setError('Description is required.')
      return
    }
    if (!availability.trim()) {
      setError('Add your availability.')
      return
    }
    setError('')
    navigate('/marketplace/my-activity')
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Marketplace</div>
      <h1>Post an Offer</h1>
      <p className="page-desc">
        Pre-filled from the Feed's hero box. Add availability/level before AI extraction runs and the offer becomes searchable.
      </p>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Description
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Level
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label>
          Availability
          <input
            type="text"
            placeholder="e.g. weekends"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="page-actions">
          <button type="submit" className="btn">Confirm → My Activity</button>
        </div>
      </form>
    </div>
  )
}
