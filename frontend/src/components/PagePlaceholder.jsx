import { Link } from 'react-router-dom'

/**
 * Generic scaffold page: shows what belongs on this screen and lets you
 * click through to whatever it links to per the agreed UI map, without any
 * real data/logic yet.
 */
export default function PagePlaceholder({ area, title, description, bullets, actions, children }) {
  return (
    <div className="page">
      {area && <div className="page-eyebrow">{area}</div>}
      <h1>{title}</h1>
      {description && <p className="page-desc">{description}</p>}

      {bullets && bullets.length > 0 && (
        <ul className="page-bullets">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}

      {children}

      {actions && actions.length > 0 && (
        <div className="page-actions">
          {actions.map((a) => (
            <Link key={a.to} className={a.variant === 'ghost' ? 'btn btn-ghost' : 'btn'} to={a.to}>
              {a.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
