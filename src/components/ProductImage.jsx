// Ürün kartının görsel alanı — images[] varsa foto, yoksa emoji fallback.
export default function ProductImage({ emoji, images = [], tag, alt, badge }) {
  const src = images[0]
  return (
    <div className="card-img" role="img" aria-label={alt}>
      {tag && <span className="card-tag">{tag}</span>}
      {badge && <span className="card-badge">{badge}</span>}
      {src
        ? <img src={src} alt={alt} className="card-photo" />
        : <span className="card-emoji" aria-hidden="true">{emoji}</span>}
    </div>
  )
}
