import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DescribeProject() {
  const navigate = useNavigate()
  const [idea, setIdea] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!idea.trim()) {
      setError('Describe your project idea.')
      return
    }
    setError('')
    navigate('/team-builder/1/requirements')
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Project Team Builder</div>
      <h1>Describe your project</h1>
      <p className="page-desc">Give the AI a project idea; it extracts the required capabilities in the next step.</p>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Project idea
          <textarea
            rows={3}
            placeholder="e.g. Build an AI-based waste management application"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="page-actions">
          <button type="submit" className="btn">Submit → Requirements Confirmation</button>
        </div>
      </form>
    </div>
  )
}
