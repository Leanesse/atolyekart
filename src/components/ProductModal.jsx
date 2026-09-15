import { useEffect, useState } from 'react'
import ProductImage from './ProductImage.jsx'
import { getMaterials } from '../services/materialService.js'
import { formatPrice } from '../utils/format.js'

// Ürün detay pop-up'ı — specs, varyant tablosu (malzeme/renk/fiyat/stok)
// ve siparişe yönlendirme. App'ta seçili ürün state'iyle açılır.
export default function ProductModal({ product, onClose, onOrder }) {
  const [materialNames, setMaterialNames] = useState({})

  useEffect(() => {
    let alive = true
    getMaterials().then(list => {
      if (alive) setMaterialNames(Object.fromEntries(list.map(m => [m.id, m.name])))
    })
    return () => { alive = false }
  }, [])

  // ESC ile kapat + pop-up açıkken arka planın scroll'unu kilitle.
  useEffect(() => {
    if (!product) return
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [product, onClose])

  if (!product) return null

  const specLabels = { weight: 'Ağırlık', dimensions: 'Ölçüler', compatibility: 'Uyumluluk' }
  const specs = Object.entries(product.specs ?? {})
  const { averageRating, reviewCount, inStock, totalStock } = product

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal product-modal" role="dialog" aria-modal="true"
        aria-label={`${product.name} detayları`}
        onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-kicker">Ürün Detayı</span>
          <button className="modal-close" onClick={onClose} aria-label="Kapat">×</button>
        </div>

        <ProductImage
          emoji={product.emoji}
          images={product.images}
          tag={product.tags?.[0]}
          alt={product.name}
          badge={!inStock ? 'Stokta yok' : undefined}
        />

        <div className="modal-title-row">
          <h3>{product.name}</h3>
          {reviewCount > 0 && (
            <span className="rating" title={`${reviewCount} değerlendirme`}>★ {averageRating.toFixed(1)}</span>
          )}
        </div>
        <p className="desc">{product.description}</p>

        {specs.length > 0 && (
          <dl className="spec-grid">
            {specs.map(([key, value]) => (
              <div key={key}>
                <dt>{specLabels[key] ?? key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <h4 className="variant-head">Varyantlar · {formatPrice(product.priceFrom, product.currency)}</h4>
        <div className="variant-table">
          {product.variants.map(v => (
            <div className="variant-row" key={v.id}>
              <span className="variant-color">
                <i style={{ background: v.colorHex || 'var(--border-strong)' }} aria-hidden="true" />
                {v.color}
              </span>
              <span className="variant-material">{materialNames[v.materialId] ?? v.materialId}</span>
              <span className="variant-price">{formatPrice(v.price, v.currency)}</span>
              <span className={`variant-stock${v.stock > 0 ? '' : ' out'}`}>
                {v.stock > 0 ? (v.stock <= 5 ? `Son ${v.stock} adet` : `${v.stock} adet`) : 'Tükendi'}
              </span>
            </div>
          ))}
        </div>

        <p className="modal-stock-note">
          {inStock ? `Stokta — toplam ${totalStock} adet.` : 'Bu parça şu anda tükendi.'}
        </p>

        <div className="modal-actions">
          {inStock ? (
            <button className="btn btn-primary" onClick={() => onOrder(product)}>
              Bu Parçayı Sipariş Et
            </button>
          ) : (
            <a className="btn btn-ghost" href="#stok-bildirimi" onClick={onClose}>
              Stoğa Gelince Haber Ver
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
