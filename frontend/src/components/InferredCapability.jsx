/**
 * A static demo of the AI Skill Graph's inference: shows how a combination
 * of declared/verified skills implies a broader capability the student
 * never explicitly typed in. Mock content for now — the real version comes
 * from the AI teammate's skill-graph logic once it exists.
 */
export default function InferredCapability({ basis, capability }) {
  return (
    <div className="inferred-capability">
      <span className="inferred-tag">AI inferred</span>
      <p className="inferred-capability-text">
        <strong>Potential capability:</strong> {capability}
      </p>
      <p className="page-desc">Based on {basis}</p>
    </div>
  )
}
