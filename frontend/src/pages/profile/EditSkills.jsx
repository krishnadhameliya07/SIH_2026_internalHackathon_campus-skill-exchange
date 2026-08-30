import { useState } from 'react'
import { Link } from 'react-router-dom'

const EVIDENCE_TYPES = [
  { value: 'github', label: 'GitHub repo', icon: '🔗' },
  { value: 'certificate', label: 'Certificate', icon: '📜' },
  { value: 'portfolio', label: 'Portfolio piece', icon: '🖼️' },
  { value: 'project', label: 'Completed project', icon: '📁' },
]

const INITIAL_SKILLS = [
  { name: 'Python', confidence: 'self-declared', evidence: null },
  { name: 'React', confidence: 'evidence-backed', evidence: { icon: '🔗', label: 'GitHub — nlp-chatbot repo' } },
  { name: 'Graphic Design', confidence: 'self-declared', evidence: null },
]

const EVIDENCE_ROWS = [
  { label: 'Resume', status: 'Not uploaded' },
  { label: 'GitHub', status: 'Connected — github.com/bhavani' },
  { label: 'Portfolio', status: 'Not uploaded' },
  { label: 'Certificates', status: '1 uploaded' },
]

export default function EditSkills() {
  const [skills, setSkills] = useState(INITIAL_SKILLS)
  const [newSkill, setNewSkill] = useState('')

  const [evidenceTargetName, setEvidenceTargetName] = useState(null)
  const [evidenceType, setEvidenceType] = useState('github')
  const [evidenceLabel, setEvidenceLabel] = useState('')
  const [evidenceError, setEvidenceError] = useState('')

  function handleAddSkill(e) {
    e.preventDefault()
    if (!newSkill.trim()) return
    setSkills((prev) => [...prev, { name: newSkill.trim(), confidence: 'self-declared', evidence: null }])
    setNewSkill('')
  }

  function startAddEvidence(skill) {
    setEvidenceTargetName(skill.name)
    setEvidenceType('github')
    setEvidenceLabel(skill.evidence?.label || '')
    setEvidenceError('')
  }

  function handleSubmitEvidence(e) {
    e.preventDefault()
    if (!evidenceLabel.trim()) {
      setEvidenceError('Describe the evidence or paste a link.')
      return
    }
    const type = EVIDENCE_TYPES.find((t) => t.value === evidenceType)
    setSkills((prev) =>
      prev.map((s) =>
        s.name === evidenceTargetName
          ? { ...s, confidence: 'evidence-backed', evidence: { icon: type.icon, label: evidenceLabel.trim() } }
          : s
      )
    )
    setEvidenceTargetName(null)
  }

  return (
    <div className="page profile-page">
      <div className="page-eyebrow">Skill Profile</div>
      <h1 className="profile-name">Edit Skills / Evidence</h1>
      <p className="page-desc">
        Skill credibility grows as you add evidence — self-declared is the starting point,
        not the ceiling.
      </p>

      <section className="profile-section">
        <div className="profile-section-title">Your skills</div>
        <ul className="edit-skill-list">
          {skills.map((s) => (
            <li key={s.name}>
              <div className="edit-skill-row">
                <span className="edit-skill-name">{s.name}</span>
                {s.evidence ? (
                  <span className="evidence-chip">
                    <span aria-hidden="true">{s.evidence.icon}</span> {s.evidence.label}
                  </span>
                ) : (
                  <span className="confidence-note">self-declared</span>
                )}
                <button type="button" className="btn btn-small btn-ghost" onClick={() => startAddEvidence(s)}>
                  {s.evidence ? 'Update evidence' : 'Add evidence'}
                </button>
              </div>

              {evidenceTargetName === s.name && (
                <form className="inline-review form-stack" onSubmit={handleSubmitEvidence}>
                  <label>
                    Evidence type
                    <select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)}>
                      {EVIDENCE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Description or link
                    <input
                      type="text"
                      placeholder="e.g. github.com/you/project or 'Built X for Y club'"
                      value={evidenceLabel}
                      onChange={(e) => setEvidenceLabel(e.target.value)}
                    />
                  </label>
                  {evidenceError && <p className="form-error">{evidenceError}</p>}
                  <div className="page-actions">
                    <button type="submit" className="btn btn-small">Save evidence</button>
                    <button type="button" className="btn btn-small btn-ghost" onClick={() => setEvidenceTargetName(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </li>
          ))}
        </ul>
        <form className="add-skill-row" onSubmit={handleAddSkill}>
          <input
            type="text"
            placeholder="Add a skill…"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
          />
          <button type="submit" className="btn btn-small">Add</button>
        </form>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">Other evidence on file</div>
        <p className="page-desc">General documents, not tied to one specific skill.</p>
        <ul className="evidence-list">
          {EVIDENCE_ROWS.map((row) => (
            <li key={row.label} className="evidence-row">
              <span className="evidence-row-label">{row.label}</span>
              <span className="evidence-row-status">{row.status}</span>
              <button type="button" className="btn btn-small btn-ghost">Upload</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">How trust is built</div>
        <ul className="trust-legend">
          <li><span className="confidence-note">self-declared</span> — you said so</li>
          <li><span className="evidence-chip">📎 evidence-backed</span> — you showed proof (project, cert, portfolio)</li>
          <li><span className="peer-chip">✓ peer-backed</span> — others confirmed it through completed work</li>
        </ul>
      </section>

      <div className="page-actions">
        <Link to="/profile" className="btn btn-ghost">← Back to My Profile</Link>
      </div>
    </div>
  )
}
