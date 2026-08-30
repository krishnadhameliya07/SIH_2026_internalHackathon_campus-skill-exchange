import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { getSkills, getRequests, getServices, getUser } from '../../api.js'

const POPULAR_TAGS = ['Poster Design', 'Video Editing', 'Web Development', 'Logo Design', 'Python Tutoring']

const CATEGORIES = [
  { name: 'Design', icon: '🎨' },
  { name: 'Programming', icon: '💻' },
  { name: 'Writing', icon: '✍️' },
  { name: 'Video & Media', icon: '🎬' },
  { name: 'Tutoring', icon: '📚' },
  { name: 'Other', icon: '🔧' },
]

// Real skills don't carry one of our 6 display categories yet (the backend's
// own `category` field is just "General" for now), so map by name until
// real skill-taxonomy categories exist.
const CATEGORY_BY_SKILL = {
  'Video Editing': 'Video & Media',
  Python: 'Programming',
  'Graphic Design': 'Design',
}

export default function MarketplaceFeed() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('need') // 'need' | 'can'
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [skills, requests, services] = await Promise.all([getSkills(), getRequests(), getServices()])
        const skillById = Object.fromEntries(skills.map((s) => [s.id, s.name]))

        const userIds = [...new Set([...requests.map((r) => r.user_id), ...services.map((s) => s.user_id)])]
        const users = await Promise.all(userIds.map(getUser))
        const userById = Object.fromEntries(users.map((u) => [u.id, u.name]))

        const requestItems = requests.map((r) => {
          const skillName = skillById[r.skill_required] || 'Other'
          return {
            id: `req-${r.id}`,
            type: 'Request',
            posterId: r.user_id,
            poster: userById[r.user_id] || 'Unknown',
            title: r.description,
            tags: [skillName],
            meta: r.deadline ? `Due ${r.deadline}` : '',
            category: CATEGORY_BY_SKILL[skillName] || 'Other',
            createdAt: r.created_at,
          }
        })

        const serviceItems = services.map((s) => {
          const skillName = skillById[s.skill_id] || 'Other'
          return {
            id: `svc-${s.id}`,
            type: 'Offer',
            posterId: s.user_id,
            poster: userById[s.user_id] || 'Unknown',
            title: s.title,
            tags: [skillName],
            meta: [s.availability, `${s.credits} credit${s.credits !== 1 ? 's' : ''}/hr`].filter(Boolean).join(' · '),
            category: CATEGORY_BY_SKILL[skillName] || 'Other',
            createdAt: s.created_at,
          }
        })

        const merged = [...requestItems, ...serviceItems].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )

        if (!cancelled) setListings(merged)
      } catch (err) {
        if (!cancelled) setLoadError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) {
      setError(mode === 'need' ? 'Describe what you need help with.' : 'Describe what you can offer.')
      return
    }
    setError('')
    const destination = mode === 'need' ? '/marketplace/post-request' : '/marketplace/post-offer'
    navigate(destination, { state: { prefill: text.trim() } })
  }

  function handlePopularTag(tag) {
    setMode('need')
    setText(`I need help with ${tag.toLowerCase()}`)
    if (error) setError('')
  }

  function toggleCategory(name) {
    setSelectedCategory((prev) => (prev === name ? null : name))
  }

  const filteredListings = selectedCategory
    ? listings.filter((l) => l.category === selectedCategory)
    : listings

  return (
    <div className="page">
      <div className="page-eyebrow">Marketplace — live from the real backend + database</div>
      <h1>Marketplace</h1>

      <div className="tab-row">
        <NavLink to="/marketplace" end className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
          Feed
        </NavLink>
        <NavLink to="/marketplace/my-activity" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
          My Activity
        </NavLink>
      </div>

      <form className="hero-box" onSubmit={handleSubmit}>
        <div className="hero-toggle">
          <button
            type="button"
            className={'toggle-btn' + (mode === 'need' ? ' active' : '')}
            onClick={() => setMode('need')}
          >
            I need help
          </button>
          <button
            type="button"
            className={'toggle-btn' + (mode === 'can' ? ' active' : '')}
            onClick={() => setMode('can')}
          >
            I can help
          </button>
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); if (error) setError('') }}
          placeholder={
            mode === 'need'
              ? 'e.g. I need someone to edit a 5-minute promotional video by Saturday'
              : 'e.g. I can teach Python to beginners on weekends'
          }
        />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn">Submit</button>

        <div className="popular-row">
          <span className="popular-label">Popular:</span>
          {POPULAR_TAGS.map((tag) => (
            <button key={tag} type="button" className="popular-tag" onClick={() => handlePopularTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </form>

      <div className="category-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            type="button"
            className={'category-chip' + (selectedCategory === cat.name ? ' active' : '')}
            onClick={() => toggleCategory(cat.name)}
          >
            <span aria-hidden="true">{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <select defaultValue="">
          <option value="" disabled>Availability</option>
          <option>This week</option>
          <option>Weekends</option>
        </select>
        <select defaultValue="recent">
          <option value="recent">Sort: Recent</option>
          <option value="relevance">Sort: Relevance</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">
          <span className="spinner" aria-hidden="true" />
          Loading the feed…
        </div>
      ) : loadError ? (
        <p className="form-error">Couldn't load the feed: {loadError}</p>
      ) : filteredListings.length > 0 ? (
        <ul className="listing-feed">
          {filteredListings.map((listing) => (
            <li key={listing.id} className="listing-card">
              <Link to={`/profile/${listing.posterId}`} className="listing-poster">
                🧑 {listing.poster}
              </Link>
              <Link to={`/marketplace/listing/${listing.id}`} className="listing-body">
                <span className={'listing-badge ' + listing.type.toLowerCase()}>{listing.type}</span>
                <h3>{listing.title}</h3>
                <div className="listing-tags">
                  {listing.tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
                <div className="listing-meta">{listing.meta}</div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="page-desc fallback-note">
          Nothing posted in {selectedCategory} yet. <button type="button" className="link-btn" onClick={() => setSelectedCategory(null)}>Clear filter</button>
        </p>
      )}
    </div>
  )
}
