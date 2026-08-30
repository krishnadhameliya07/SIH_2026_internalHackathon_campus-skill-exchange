export default function ReviewList({ reviews }) {
  return (
    <ul className="review-list">
      {reviews.map((r, i) => (
        <li key={i} className="review-card">
          <div className="review-card-header">
            <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            <span className="review-author">— {r.author}</span>
          </div>
          <p className="review-text">"{r.text}"</p>
        </li>
      ))}
    </ul>
  )
}
