import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService.js'
import { submitStockNotify } from '../services/stockNotifyService.js'

const emptyForm = { name: '', email: '', productId: '' }

// Stok bildirimi bölümü — ürün stoğa girince haber vermek için bilgi toplar.
export default function StockNotify() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let alive = true
    getProducts().then(data => {
      if (alive) {
        // Tükenen ürünleri öne al — bildirim en çok onlar için anlamlı.
        const sorted = [...data].sort((a, b) => Number(a.inStock) - Number(b.inStock))
        setProducts(sorted)
      }
    })
    return () => { alive = false }
  }, [])

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    try {
      await submitStockNotify({
        name: form.name,
        email: form.email,
        productId: form.productId,
      })
      setDone(true)
      setForm(emptyForm)
    } catch (err) {
      alert('Bildirim kaydedilemedi, lütfen tekrar deneyin.')
      console.error('[StockNotify] submit hatası:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="stok-bildirimi">
      <div className="container">
        <div className="sec-head">
          <div className="kicker">Stok Bildirimi</div>
          <h2>Stoğa Gelince Haber Ver</h2>
          <p>Tükenen bir parçayı mı arıyorsun? Stoğa girince ilk sana haber verelim.</p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {done ? (
            <>
              <h3>Kaydını Aldık ✅</h3>
              <p className="form-note">
                Seçtiğin ürün stoğa girdiğinde e-posta ile haber vereceğiz.
              </p>
              <button type="button" className="btn btn-primary" onClick={() => setDone(false)}>
                Yeni Bildirim
              </button>
            </>
          ) : (
            <>
              <h3>Bildirim Talebi</h3>
              <div className="field">
                <label>Ad Soyad</label>
                <input type="text" required placeholder="Adınız Soyadınız"
                  value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div className="field">
                <label>E-posta</label>
                <input type="email" required placeholder="ornek@mail.com"
                  value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="field">
                <label>Ürün</label>
                <select required value={form.productId}
                  onChange={e => update('productId', e.target.value)}>
                  <option value="">Seçiniz</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}{!p.inStock ? ' (Stokta yok)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? 'Gönderiliyor…' : 'Bildir'}
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  )
}
