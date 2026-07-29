import { useEffect, useState } from 'react'
import { filterCategories } from '../data/categories.js'
import { getProducts } from '../services/productService.js'
import ProductCard from './ProductCard.jsx'

// Katalog bölümü — servisten veri çeker, filtreler ve grid'i çizer.
export default function ProductList() {
  const [activeCat, setActiveCat] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Ürünleri servisten yükle (ileride webhook/API olacak — burası değişmez).
  useEffect(() => {
    let alive = true
    getProducts().then(data => {
      if (alive) {
        setItems(data)
        setLoading(false)
      }
    })
    return () => { alive = false }
  }, [])

  const visible = activeCat === 'all'
    ? items
    : items.filter(p => p.categoryId === activeCat)

  return (
    <section id="urunler">
      <div className="container">
        <div className="sec-head">
          <div className="kicker">Katalog</div>
          <h2>Öne Çıkan Parçalar</h2>
          <p>Karışık bir seçki — frame, mount, koruyucu ve aksesuar.</p>
        </div>

        <div className="filters">
          {filterCategories.map(c => (
            <button
              key={c.id}
              className={`filter${activeCat === c.id ? ' active' : ''}`}
              onClick={() => setActiveCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="loading">Ürünler yükleniyor…</p>
        ) : (
          <div className="grid">
            {visible.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  )
}
