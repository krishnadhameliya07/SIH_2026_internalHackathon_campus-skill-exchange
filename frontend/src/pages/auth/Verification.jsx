import { useLocation, useNavigate } from 'react-router-dom'

export default function Verification() {
  const location = useLocation()
  const navigate = useNavigate()

  function handleVerify() {
    // Still a mock OTP step (no real email delivery exists) — just carries
    // the real name/email collected on the previous screen forward.
    navigate('/onboarding/profile', { state: location.state })
  }

  return (
    <div className="page">
      <div className="page-eyebrow">Auth & Onboarding</div>
      <h1>Verify your college ID</h1>
      <p className="page-desc">
        OTP / email-link confirmation goes here. New users only — existing users never see this screen.
      </p>
      <ul className="page-bullets">
        <li>6-digit code input</li>
        <li>Resend code link</li>
        <li>Fallback: manual ID upload for review</li>
      </ul>
      <div className="page-actions">
        <button type="button" className="btn" onClick={handleVerify}>
          Verify → Profile & Skills Setup
        </button>
      </div>
    </div>
  )
}
