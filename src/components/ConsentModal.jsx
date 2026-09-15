import { useEffect, useRef, useState } from 'react'
import LegalSections from './LegalSections.jsx'
import { aydinlatmaMetni, acikRizaMetni } from '../data/legalTexts.js'

// KVKK açık rıza pop-up'ı — metin iç scroll alanında en alta kadar inmeden
// "Kabul Ediyorum" butonu aktifleşmez. Onay yalnızca butonla verilir.
export default function ConsentModal({ open, onClose, onAccept }) {
  const [atBottom, setAtBottom] = useState(false)
  const scrollRef = useRef(null)

  const checkBottom = () => {
    const el = scrollRef.current
    if (!el) return
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4)
  }

  useEffect(() => {
    if (!open) return
    setAtBottom(false)
    // İçerik konteynerden kısaysa zaten "sonuna ulaşılmış" say.
    const t = setTimeout(checkBottom, 50)

    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', checkBottom)

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', checkBottom)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal consent-modal" role="dialog" aria-modal="true"
        aria-label="KVKK Aydınlatma ve Açık Rıza Metni"
        onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Kapat">×</button>
        <h3>KVKK Aydınlatma ve Açık Rıza Metni</h3>

        <div className="consent-scroll" ref={scrollRef} onScroll={checkBottom}>
          <p className="consent-lead">
            <strong>Veri sorumlusu:</strong> fpvstore atölyesi — Yusuf Karagül
          </p>
          <LegalSections sections={aydinlatmaMetni} tag="h4" />
          <hr className="legal-sep" />
          <h4>Açık Rıza Metni</h4>
          <LegalSections sections={acikRizaMetni} tag="h4" />
        </div>

        <p className="consent-status">
          {atBottom
            ? 'Metnin sonuna ulaştın — artık onay verebilirsin.'
            : 'Devam etmek için metnin tamamını oku ve sonuna kadar kaydır.'}
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Kapat</button>
          <button type="button" className="btn btn-primary" disabled={!atBottom} onClick={onAccept}>
            Kabul Ediyorum
          </button>
        </div>
      </div>
    </div>
  )
}
