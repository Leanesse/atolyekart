import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService.js'
import { submitOrder } from '../services/orderService.js'

const emptyForm = { name: '', productId: '', phone: '', email: '', quantity: 1 }

// Sipariş bölümü — form → onay ekranı → başarı (3 adımlı akış).
export default function OrderForm() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [step, setStep] = useState('form') // 'form' | 'confirm' | 'done'
  const [sending, setSending] = useState(false)
  const [orderNo, setOrderNo] = useState('')

  // Ürünleri servisten yükle (ileride webhook/API olsa da burası değişmez).
  useEffect(() => {
    let alive = true
    getProducts().then(data => { if (alive) setProducts(data) })
    return () => { alive = false }
  }, [])

  const selectedProduct = products.find(p => p.id === form.productId)

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  // Form → onay ekranına geç (basit doğrulama tarayıcı required ile yapılır).
  function handleReview(e) {
    e.preventDefault()
    setStep('confirm')
  }

  // Onay ekranından siparişi gönder.
  async function handleConfirm() {
    setSending(true)
    try {
      const result = await submitOrder({
        name: form.name,
        productId: form.productId,
        productName: selectedProduct?.name,
        phone: form.phone,
        email: form.email,
        quantity: Number(form.quantity) || 1,
      })
      setOrderNo(result.id)
      setStep('done')
      setForm(emptyForm)
    } catch (err) {
      alert('Sipariş gönderilemedi, lütfen tekrar deneyin.')
      console.error('[OrderForm] submit hatası:', err)
    } finally {
      setSending(false)
    }
  }

  function resetAll() {
    setForm(emptyForm)
    setOrderNo('')
    setStep('form')
  }

  return (
    <section id="siparis">
      <div className="container">
        <div className="sec-head">
          <div className="kicker">Sipariş</div>
          <h2>Sipariş Ver</h2>
          <p>Bilgilerini bırak, seçtiğin parça için sana dönüş yapalım.</p>
        </div>

        <form className="contact-form" onSubmit={handleReview}>
          {step === 'form' && (
            <>
              <h3>Sipariş Bilgileri</h3>
              <div className="field">
                <label>Ad Soyad</label>
                <input type="text" required placeholder="Adınız Soyadınız"
                  value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div className="field">
                <label>Ürün</label>
                <select required value={form.productId}
                  onChange={e => update('productId', e.target.value)}>
                  <option value="">Seçiniz</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>E-posta</label>
                <input type="email" required placeholder="ornek@mail.com"
                  value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="field-row field-row-2">
                <div className="field">
                  <label>Telefon</label>
                  <input type="tel" required placeholder="+90 5xx xxx xx xx"
                    value={form.phone} onChange={e => update('phone', e.target.value)} />
                </div>
                <div className="field">
                  <label>Adet</label>
                  <input type="number" required min="1"
                    value={form.quantity} onChange={e => update('quantity', e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Devam</button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <h3>Siparişini Onayla</h3>
              <dl className="summary">
                <div><dt>Ad Soyad</dt><dd>{form.name}</dd></div>
                <div><dt>Ürün</dt><dd>{selectedProduct?.name}</dd></div>
                <div><dt>Telefon</dt><dd>{form.phone}</dd></div>
                <div><dt>E-posta</dt><dd>{form.email}</dd></div>
                <div><dt>Adet</dt><dd>{form.quantity}</dd></div>
              </dl>
              <div className="btns">
                <button type="button" className="btn btn-ghost"
                  onClick={() => setStep('form')} disabled={sending}>
                  Geri Düzenle
                </button>
                <button type="button" className="btn btn-primary"
                  onClick={handleConfirm} disabled={sending}>
                  {sending ? 'Gönderiliyor…' : 'Onayla ve Gönder'}
                </button>
              </div>
            </>
          )}

          {step === 'done' && (
            <>
              <h3>Siparişin Alındı 🎉</h3>
              <p className="form-note">
                Talebin bize ulaştı (No: {orderNo}). En kısa sürede telefonla dönüş yapacağız.
              </p>
              <button type="button" className="btn btn-primary" onClick={resetAll}>
                Yeni Sipariş
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  )
}
