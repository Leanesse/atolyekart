import { useEffect, useState } from 'react'
import { getMaterials } from '../services/materialService.js'
import { submitRequest } from '../services/customPrintService.js'

const info = [
  { icon: '📞', label: 'Telefon',   value: '+90 555 000 00 00' },
  { icon: '✉️', label: 'E-posta',   value: 'merhaba@fpvstore.com' },
  { icon: '📷', label: 'Instagram', value: '@fpvstore' },
  { icon: '📍', label: 'Adres',     value: 'Teknopark Cad. No:1, İstanbul' },
]

const emptyForm = { name: '', email: '', materialId: '', color: '', quantity: 1, notes: '' }

export default function Contact() {
  const [materials, setMaterials] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let alive = true
    getMaterials().then(data => { if (alive) setMaterials(data) })
    return () => { alive = false }
  }, [])

  const selectedMaterial = materials.find(m => m.id === form.materialId)

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    const request = await submitRequest({
      name: form.name,
      email: form.email,
      materialId: form.materialId || undefined,
      color: form.color || undefined,
      quantity: Number(form.quantity) || 1,
      notes: form.notes || undefined,
    })
    setSending(false)
    alert(`Teşekkürler! Talebin alındı (No: ${request.id}). En kısa sürede dönüş yapacağız.`)
    setForm(emptyForm)
  }

  return (
    <section id="iletisim">
      <div className="container">
        <div className="sec-head">
          <div className="kicker">İletişim</div>
          <h2>Özel Baskı Talebi</h2>
          <p>Kendi parçanı bastırmak mı istiyorsun? Formu doldur, sana teklif verelim.</p>
        </div>
        <div className="contact-wrap">
          <div className="contact-info">
            {info.map(i => (
              <div className="contact-item" key={i.label}>
                <span className="ic">{i.icon}</span>
                <div>
                  <b>{i.label}</b>
                  <span>{i.value}</span>
                </div>
              </div>
            ))}
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3>Teklif Al</h3>
            <div className="field">
              <label>Ad Soyad</label>
              <input type="text" required placeholder="Adınız"
                value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="field">
              <label>E-posta</label>
              <input type="email" required placeholder="ornek@mail.com"
                value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Malzeme</label>
                <select value={form.materialId} onChange={e => update('materialId', e.target.value)}>
                  <option value="">Seçiniz</option>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Renk</label>
                <select value={form.color} onChange={e => update('color', e.target.value)}
                  disabled={!selectedMaterial}>
                  <option value="">{selectedMaterial ? 'Seçiniz' : 'Önce malzeme'}</option>
                  {selectedMaterial?.colors.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="field field-qty">
                <label>Adet</label>
                <input type="number" min="1" value={form.quantity}
                  onChange={e => update('quantity', e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Notlar / Dosya bilgisi</label>
              <textarea rows="3" placeholder="Parça ölçüleri, STL bağlantısı, özel istekler..."
                value={form.notes} onChange={e => update('notes', e.target.value)}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? 'Gönderiliyor…' : 'Talep Gönder'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
