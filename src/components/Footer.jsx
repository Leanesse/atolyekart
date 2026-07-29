const socials = [
  { icon: '📷', title: 'Instagram' },
  { icon: '▶️', title: 'YouTube' },
  { icon: '💬', title: 'Discord' },
  { icon: '✉️', title: 'E-posta' },
]

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="socials">
          {socials.map(s => (
            <a href="#" title={s.title} key={s.title}>{s.icon}</a>
          ))}
        </div>
        <div className="logo"><span className="dot"></span>fpvstore</div>
        <p className="muted">© 2026 fpvstore · 3D baskı drone parçaları · Tüm hakları saklıdır.</p>
      </div>
    </footer>
  )
}
