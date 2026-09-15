import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService.js'
import { submitOrder } from '../services/orderService.js'
import { validateOrderForm } from '../utils/validation.js'
import ConsentCheck from './ConsentCheck.jsx'
import ConsentModal from './ConsentModal.jsx'

const emptyForm = { name: '', productId: '', color: '', phone: '', email: '', quantity: 1, consent: false }

// Sipariş bölümü — form → onay ekranı → başarı (3 adımlı akış).
export default function OrderForm({ preselect }) {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [step, setStep] = useState('form') // 'form' | 'confirm' | 'done'
  const [sending, setSending] = useState(false)
  const [orderNo, setOrderNo] = useState('')
  const [errors, setErrors] = useState({})
  const [consentOpen, setConsentOpen] = useState(false)

  // Ürünleri servisten yükle (ileride webhook/API olsa da burası değişmez).
  useEffect(() => {
    let alive = true
    getProducts().then(data => { if (alive) setProducts(data) })
    return () => { alive = false }
  }, [])

  // Ürün detay modalından gelinen ürünü önceden seç.
  useEffect(() => {
    if (!preselect?.productId) return
    setForm(f => ({ ...f, productId: preselect.productId, color: '' }))
    setStep('form')
    setErrors({})
  }, [preselect])

  const selectedProduct = products.find(p => p.id === form.productId)
  // Seçili ürünün varyantlarındaki benzersiz renkler.
  const productColors = [...new Set((selectedProduct?.variants ?? []).map(v => v.color))]

  function update(field, value) {
    setForm(f => {
      const next = { ...f, [field]: value }
      // Ürün değişirse seçili renk yeni üründe olmayabilir — temizle.
      if (field === 'productId') {
        const yeni = products.find(p => p.id === value)
        const renkler = [...new Set((yeni?.variants ?? []).map(v => v.color))]
        if (f.color && !renkler.includes(f.color)) next.color = ''
      }
      return next
    })
  }

  // Form → onay ekranına geç (client validasyon + consent kontrolü).
  function handleReview(e) {
    e.preventDefault()
    const { valid, errors } = validateOrderForm(form)
    setErrors(errors)
    if (valid) setStep('confirm')
  }

  // Onay ekranından siparişi gönder.
  async function handleConfirm() {
    setSending(true)
    try {
      const result = await submitOrder({
        name: form.name, productId: form.productId, productName: selectedProduct?.name,
        color: form.color || undefined,
        phone: form.phone, email: form.email, quantity: Number(form.quantity) || 1, consent: form.consent,
      })
      setOrderNo(result.id)
      setStep('done')
      setForm(emptyForm)
    } catch (err) {
      alert(err.message || 'Sipariş gönderilemedi, lütfen tekrar deneyin.')
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
                <label>Renk</label>
                <select value={form.color} onChange={e => update('color', e.target.value)}
                  disabled={!selectedProduct}>
                  <option value="">{selectedProduct ? 'Seçiniz' : 'Önce ürün seç'}</option>
                  {productColors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>E-posta</label>
                <input type="email" required placeholder="ornek@mail.com"
                  value={form.email} onChange={e => update('email', e.target.value)} />
                {errors.email && <p className="field-error">{errors.email}</p>}
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
              <ConsentCheck
                checked={form.consent}
                error={errors.consent}
                onOpen={() => setConsentOpen(true)}
              >
                Ad, telefon ve e-posta bilgilerimin siparişimle ilgili iletişim
                amacıyla işlenmesine açık rıza veriyorum.
              </ConsentCheck>
              <button type="submit" className="btn btn-primary">Devam</button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <h3>Siparişini Onayla</h3>
              <dl className="summary">
                <div><dt>Ad Soyad</dt><dd>{form.name}</dd></div>
                <div><dt>Ürün</dt><dd>{selectedProduct?.name}</dd></div>
                {form.color && <div><dt>Renk</dt><dd>{form.color}</dd></div>}
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

        <ConsentModal
          open={consentOpen}
          onClose={() => setConsentOpen(false)}
          onAccept={() => {
            update('consent', true)
            setErrors(e => ({ ...e, consent: undefined }))
            setConsentOpen(false)
          }}
        />
      </div>
    </section>
  )
}
