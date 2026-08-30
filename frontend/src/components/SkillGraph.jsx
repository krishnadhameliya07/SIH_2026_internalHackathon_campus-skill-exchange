function ConfidenceDisplay({ node }) {
  if (!node.confidence) return null

  if (node.confidence === 'evidence-backed' && node.evidence) {
    return (
      <span className="evidence-chip">
        <span aria-hidden="true">{node.evidence.icon || '📎'}</span> {node.evidence.label}
      </span>
    )
  }

  if (node.confidence === 'peer-backed') {
    const count = node.peerCount || 1
    return <span className="peer-chip">✓ Confirmed by {count} peer{count > 1 ? 's' : ''}</span>
  }

  // self-declared, or evidence-backed with no evidence attached yet — the
  // point of this component is to show proof, not just assert a label, so
  // the fallback stays deliberately understated rather than a colored badge.
  return <span className="confidence-note">self-declared</span>
}

function SkillNode({ node }) {
  return (
    <li className="skill-node">
      <div className="skill-node-row">
        <span className={node.confidence ? 'skill-node-name' : 'skill-node-category'}>{node.name}</span>
        <ConfidenceDisplay node={node} />
      </div>
      {node.children && node.children.length > 0 && (
        <ul className="skill-tree-branch">
          {node.children.map((child) => (
            <SkillNode key={child.name} node={child} />
          ))}
        </ul>
      )}
    </li>
  )
}

/**
 * Renders the AI Skill Graph as a vertical indented tree — category nodes
 * (no confidence) group skill nodes. Evidence-backed skills show the actual
 * evidence (not just the word "evidence-backed"); self-declared skills get
 * an understated note since there's nothing to show yet.
 */
export default function SkillGraph({ data }) {
  return (
    <ul className="skill-tree">
      {data.map((node) => (
        <SkillNode key={node.name} node={node} />
      ))}
    </ul>
  )
}
