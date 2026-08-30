import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function StateLearningGoal() {
  const navigate = useNavigate()
  const [goal, setGoal] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!goal.trim()) {
      setError('Tell us what you want to learn.')
      return
    }
    setError('')
    navigate('/mentorship/1/gap')
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Mentorship / Learning</div>
      <h1>What do you want to learn?</h1>
      <p className="page-desc">A learning goal, not a task — different from Marketplace's 'Post a Request'.</p>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Learning goal
          <input
            type="text"
            placeholder="e.g. I want to learn Figma"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="page-actions">
          <button type="submit" className="btn">Submit → Skill Gap & Learning Path</button>
        </div>
      </form>
    </div>
  )
}
