import LegalSections from './LegalSections.jsx'
import { aydinlatmaMetni, acikRizaMetni, dataController } from '../data/legalTexts.js'

// KVKK Aydınlatma + Açık Rıza Metni — #gizlilik ile açılır.
// İçerik legalTexts.js'ten gelir; rıza pop-up'ı da aynı kaynağı kullanır.
export default function PrivacyPolicy() {
  return (
    <section id="gizlilik">
      <div className="container legal">
        <a className="back-link" href="#">← Ana sayfa</a>
        <h1>KVKK Aydınlatma Metni</h1>
        <p><strong>Veri sorumlusu:</strong> {dataController.name} · {dataController.address}</p>
        <LegalSections sections={aydinlatmaMetni} />
        <hr className="legal-sep" />
        <h1>Açık Rıza Metni</h1>
        <LegalSections sections={acikRizaMetni} />
        <p className="legal-note">Bu metin bir taslaktır; yayına almadan önce hukuki gözden geçirme önerilir.</p>
      </div>
    </section>
  )
}
