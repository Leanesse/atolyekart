import { useEffect, useState } from 'react'
import { getMaterials } from '../services/materialService.js'
import { submitRequest } from '../services/customPrintService.js'
import { site } from '../data/site.js'
import ConsentCheck from './ConsentCheck.jsx'
import ConsentModal from './ConsentModal.jsx'

const info = [
  { icon: '📞', label: 'Telefon',   value: site.phone.display,     href: site.phone.href },
  { icon: '✉️', label: 'E-posta',   value: site.email.display,     href: site.email.href },
  { icon: '📷', label: 'Instagram', value: site.instagram.display, href: site.instagram.href, external: true },
  { icon: '📍', label: 'Adres',     value: site.address.display,   href: site.address.href,   external: true },
]

const emptyForm = { name: '', email: '', materialId: '', color: '', quantity: 1, notes: '', consent: false }

export default function Contact() {
  const [materials, setMaterials] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState({})
  const [consentOpen, setConsentOpen] = useState(false)

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
    if (form.consent !== true) {
      setErrors({ consent: 'Devam için açık rıza gerekli. Aydınlatma Metni\'ni okuyup onayla.' })
      return
    }
    setErrors({})
    setSending(true)
    try {
      await submitRequest({
        name: form.name,
        email: form.email,
        materialId: form.materialId || undefined,
        color: form.color || undefined,
        quantity: Number(form.quantity) || 1,
        notes: form.notes || undefined,
        consent: form.consent,
      })
      alert('Teşekkürler! Talebin alındı. En kısa sürede dönüş yapacağız.')
      setForm(emptyForm)
    } catch (err) {
      alert(err.message || 'Talep gönderilemedi, lütfen tekrar deneyin.')
      console.error('[Contact] submit hatası:', err)
    } finally {
      setSending(false)
    }
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
              <a className="contact-item" href={i.href} key={i.label}
                {...(i.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <span className="ic">{i.icon}</span>
                <div>
                  <b>{i.label}</b>
                  <span>{i.value}</span>
                </div>
              </a>
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
              <textarea rows="3" required placeholder="Parça ölçüleri, STL bağlantısı, özel istekler..."
                value={form.notes} onChange={e => update('notes', e.target.value)}></textarea>
            </div>
            <ConsentCheck
              checked={form.consent}
              error={errors.consent}
              onOpen={() => setConsentOpen(true)}
            >
              Ad ve e-posta bilgilerimin, özel baskı teklifimle ilgili iletişim
              amacıyla işlenmesine açık rıza veriyorum.
            </ConsentCheck>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? 'Gönderiliyor…' : 'Talep Gönder'}
            </button>
          </form>

          <ConsentModal
            open={consentOpen}
            onClose={() => setConsentOpen(false)}
            onAccept={() => {
              update('consent', true)
              setErrors(er => ({ ...er, consent: undefined }))
              setConsentOpen(false)
            }}
          />
        </div>
      </div>
    </section>
  )
}
