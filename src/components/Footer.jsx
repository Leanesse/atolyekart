import { site } from '../data/site.js'

const socials = [
  { icon: '📷', title: 'Instagram', href: site.instagram.href, external: true },
  { icon: '✉️', title: 'E-posta', href: site.email.href },
]

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="socials">
          {socials.map(s => (
            <a href={s.href} title={s.title} key={s.title}
              {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{s.icon}</a>
          ))}
        </div>
        <div className="logo"><span className="dot"></span>fpvstore</div>
        <p className="muted">© 2026 fpvstore · {site.tagline} · {site.address.display} · Tüm hakları saklıdır.</p>
        <p className="muted"><a href="#gizlilik">Gizlilik Politikası</a></p>
      </div>
    </footer>
  )
}
