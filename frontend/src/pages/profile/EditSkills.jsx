import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSkills, getUserSkills, addUserSkill, analyzeProfile, getCurrentUserId } from '../../api.js'

const EVIDENCE_TYPES = [
  { value: 'github', label: 'GitHub repo', icon: '🔗' },
  { value: 'certificate', label: 'Certificate', icon: '📜' },
  { value: 'portfolio', label: 'Portfolio piece', icon: '🖼️' },
  { value: 'project', label: 'Completed project', icon: '📁' },
]

const PROFICIENCIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

const ANALYZE_STAGES = [
  'Reading your resume…',
  'Checking your GitHub activity…',
  'Building your skill graph…',
]

export default function EditSkills() {
  const [allSkills, setAllSkills] = useState([])
  const [mySkills, setMySkills] = useState([]) // [{ skillId, name, confidence, evidence }]
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [newSkillId, setNewSkillId] = useState('')
  const [newProficiency, setNewProficiency] = useState('Beginner')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)

  const [evidenceTargetId, setEvidenceTargetId] = useState(null)
  const [evidenceType, setEvidenceType] = useState('github')
  const [evidenceLabel, setEvidenceLabel] = useState('')
  const [evidenceError, setEvidenceError] = useState('')

  const [resumeFile, setResumeFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  const [bio, setBio] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeStage, setAnalyzeStage] = useState('')
  const [analyzeError, setAnalyzeError] = useState('')
  const [analyzeResult, setAnalyzeResult] = useState(null)

  async function loadSkills() {
    const [skills, userSkills] = await Promise.all([getSkills(), getUserSkills(getCurrentUserId())])
    const skillById = Object.fromEntries(skills.map((s) => [s.id, s.name]))
    const mine = userSkills.map((us) => ({
      skillId: us.skill_id,
      name: skillById[us.skill_id] || `Skill #${us.skill_id}`,
      confidence: us.verification_status === 'Self-declared' ? 'self-declared' : 'evidence-backed',
      evidence: us.evidence_note ? { icon: '📎', label: us.evidence_note } : null,
    }))
    setAllSkills(skills)
    setMySkills(mine)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        await loadSkills()
      } catch (err) {
        if (!cancelled) setLoadError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  async function handleAnalyze(e) {
    e.preventDefault()
    if (!resumeFile && !resumeText.trim() && !githubUsername.trim() && !bio.trim()) {
      setAnalyzeError('Provide at least a resume, GitHub username, or description.')
      return
    }
    setAnalyzeError('')
    setAnalyzeResult(null)
    setAnalyzing(true)
    setAnalyzeStage(ANALYZE_STAGES[0])
    const stageTimer = setInterval(() => {
      setAnalyzeStage((prev) => {
        const i = ANALYZE_STAGES.indexOf(prev)
        return ANALYZE_STAGES[Math.min(i + 1, ANALYZE_STAGES.length - 1)]
      })
    }, 2500)

    try {
      const result = await analyzeProfile({
        resumeFile,
        resumeText: resumeText.trim() || undefined,
        githubUsername: githubUsername.trim() || undefined,
        bio: bio.trim() || undefined,
      })
      setAnalyzeResult(result)
      await loadSkills()
    } catch (err) {
      setAnalyzeError(err.message)
    } finally {
      clearInterval(stageTimer)
      setAnalyzing(false)
      setAnalyzeStage('')
    }
  }

  const availableToAdd = allSkills.filter((s) => !mySkills.some((m) => m.skillId === s.id))

  async function handleAddSkill(e) {
    e.preventDefault()
    if (!newSkillId) {
      setAddError('Pick a skill to add.')
      return
    }
    setAddError('')
    setAdding(true)
    try {
      await addUserSkill({ skillId: Number(newSkillId), proficiency: newProficiency })
      const skill = allSkills.find((s) => s.id === Number(newSkillId))
      setMySkills((prev) => [...prev, { skillId: skill.id, name: skill.name, confidence: 'self-declared', evidence: null }])
      setNewSkillId('')
      setNewProficiency('Beginner')
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  function startAddEvidence(skill) {
    setEvidenceTargetId(skill.skillId)
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
    setMySkills((prev) =>
      prev.map((s) =>
        s.skillId === evidenceTargetId
          ? { ...s, confidence: 'evidence-backed', evidence: { icon: type.icon, label: evidenceLabel.trim() } }
          : s
      )
    )
    setEvidenceTargetId(null)
  }

  return (
    <div className="page profile-page">
      <div className="page-eyebrow">Skill Profile — live from the real backend + database</div>
      <h1 className="profile-name">Edit Skills / Evidence</h1>
      <p className="page-desc">
        Skill credibility grows as you add evidence — self-declared is the starting point,
        not the ceiling.
      </p>

      {loading ? (
        <div className="loading-state">
          <span className="spinner" aria-hidden="true" />
          Loading your skills…
        </div>
      ) : loadError ? (
        <p className="form-error">Couldn't load your skills: {loadError}</p>
      ) : (
        <section className="profile-section">
          <div className="profile-section-title">Your skills</div>
          {mySkills.length === 0 && (
            <p className="page-desc">No skills added yet — add one below.</p>
          )}
          <ul className="edit-skill-list">
            {mySkills.map((s) => (
              <li key={s.skillId}>
                <div className="edit-skill-row">
                  <span className="edit-skill-name">{s.name}</span>
                  {s.confidence === 'evidence-backed' ? (
                    <span className="evidence-chip">
                      <span aria-hidden="true">{s.evidence?.icon || '📎'}</span> {s.evidence?.label || 'evidence-backed'}
                    </span>
                  ) : (
                    <span className="confidence-note">self-declared</span>
                  )}
                  <button type="button" className="btn btn-small btn-ghost" onClick={() => startAddEvidence(s)}>
                    {s.evidence ? 'Update evidence' : 'Add evidence'}
                  </button>
                </div>

                {evidenceTargetId === s.skillId && (
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
                      <button type="button" className="btn btn-small btn-ghost" onClick={() => setEvidenceTargetId(null)}>
                        Cancel
                      </button>
                    </div>
                    <p className="page-desc">
                      Note: evidence text isn't stored on the backend yet (no field for it exists there) —
                      this stays on-screen only until that's added.
                    </p>
                  </form>
                )}
              </li>
            ))}
          </ul>
          <form className="add-skill-row" onSubmit={handleAddSkill}>
            <select value={newSkillId} onChange={(e) => setNewSkillId(e.target.value)}>
              <option value="">Add a skill…</option>
              {availableToAdd.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select value={newProficiency} onChange={(e) => setNewProficiency(e.target.value)}>
              {PROFICIENCIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-small" disabled={adding}>{adding ? 'Adding…' : 'Add'}</button>
          </form>
          {addError && <p className="form-error">{addError}</p>}
        </section>
      )}

      <section className="profile-section">
        <div className="profile-section-title">Build your skill graph with AI</div>
        <p className="page-desc">
          Upload a resume, link your GitHub, or just describe yourself — the AI reads it and builds
          (or updates) your skill graph automatically. This calls a real AI model, not a mock.
        </p>

        <form className="form-stack" onSubmit={handleAnalyze}>
          <label>
            Resume (PDF)
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />
          </label>
          <label>
            Or paste resume text
            <textarea
              rows={3}
              placeholder="Paste resume text here if you'd rather not upload a file…"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </label>
          <label>
            GitHub username
            <input
              type="text"
              placeholder="e.g. torvalds"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
            />
          </label>
          <label>
            Describe yourself
            <textarea
              rows={3}
              placeholder="What have you built, worked on, or are into?"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>

          {analyzeError && <p className="form-error">{analyzeError}</p>}

          <div className="page-actions">
            <button type="submit" className="btn" disabled={analyzing}>
              {analyzing ? 'Analyzing…' : 'Analyze with AI'}
            </button>
          </div>
        </form>

        {analyzing && (
          <div className="loading-state">
            <span className="spinner" aria-hidden="true" />
            {analyzeStage}
          </div>
        )}

        {analyzeResult && (
          <div className="inferred-capability">
            <span className="inferred-tag">AI analysis complete</span>
            {analyzeResult.warning && <p className="form-error">{analyzeResult.warning}</p>}
            <p className="inferred-capability-text">{analyzeResult.summary}</p>
            <p className="page-desc">
              <strong>Potential capability:</strong> {analyzeResult.inferred_capability.capability}
              {' — based on '}{analyzeResult.inferred_capability.basis}
            </p>
          </div>
        )}
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
