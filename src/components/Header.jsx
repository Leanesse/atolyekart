import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header>
      <div className="container nav">
        <div className="logo"><span className="dot"></span>fpvstore</div>
        <nav className={`nav-links${open ? ' open' : ''}`} onClick={() => setOpen(false)}>
          <a href="#urunler">Ürünler</a>
          <a href="#siparis">Sipariş</a>
          <a href="#stok-bildirimi">Stok Bildirimi</a>
          <a href="#hakkimizda">Hakkımızda</a>
          <a href="#iletisim">İletişim</a>
        </nav>
        <button className="menu-btn" onClick={() => setOpen(o => !o)} aria-label="Menü">☰</button>
      </div>
    </header>
  )
}
