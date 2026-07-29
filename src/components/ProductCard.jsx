import ProductImage from './ProductImage.jsx'
import { formatPrice } from '../utils/format.js'

// Tek bir ürün kartı — ProductView (türetilmiş alanlarla) alır.
export default function ProductCard({ product }) {
  const {
    name, description, emoji, images, tags,
    priceFrom, currency, inStock, averageRating, reviewCount,
  } = product

  return (
    <div className="card">
      <ProductImage
        emoji={emoji}
        images={images}
        tag={tags?.[0]}
        alt={name}
        badge={!inStock ? 'Stokta yok' : undefined}
      />
      <div className="card-body">
        <div className="card-title-row">
          <h3>{name}</h3>
          {reviewCount > 0 && (
            <span className="rating" title={`${reviewCount} değerlendirme`}>
              ★ {averageRating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="desc">{description}</p>
        <div className="card-foot">
          <span className="price">{formatPrice(priceFrom, currency)}</span>
          <button className="card-btn" disabled={!inStock}>
            {inStock ? 'Detay' : 'Tükendi'}
          </button>
        </div>
      </div>
    </div>
  )
}
