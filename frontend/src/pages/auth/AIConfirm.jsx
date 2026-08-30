import { useNavigate } from 'react-router-dom'
import { login } from '../../auth.js'

export default function AIConfirm() {
  const navigate = useNavigate()

  function handleConfirm() {
    login()
    navigate('/')
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Auth & Onboarding</div>
      <h1>Confirm your skills</h1>
      <p className="page-desc">
        AI-normalized skills from the previous step, shown back for the student to review and confirm before landing on the Dashboard.
      </p>
      <ul className="page-bullets">
        <li>React — evidence: GitHub repo (confidence: evidence-backed)</li>
        <li>Python — self-declared</li>
        <li>Graphic Design — self-declared</li>
      </ul>
      <div className="page-actions">
        <button type="button" className="btn" onClick={handleConfirm}>
          Confirm → Dashboard
        </button>
      </div>
    </div>
  )
}
