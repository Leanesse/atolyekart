import { useState } from 'react'

// Admin paneli — #admin ile açılır. Parola → JWT → sipariş/teklif/stok listeleri.
// Sipariş ve talepler n8n Data Table'larından okunur (/api/admin/requests köprüsü).
const TABLAR = [
  { key: 'orders', label: 'Siparişler' },
  { key: 'teklif', label: 'Teklif Talepleri' },
  { key: 'stok', label: 'Stok Bildirimleri' },
]

export default function AdminPanel() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('orders')
  const [lists, setLists] = useState({ orders: null, teklif: null, stok: null })

  async function login(e) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) { setError(body.error || 'Giriş başarısız.'); return }
    setToken(body.token)
    loadOrders(body.token)
    loadList('teklif', body.token)
    loadList('stok', body.token)
  }

  async function loadOrders(tk) {
    const res = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${tk}` } })
    const body = await res.json().catch(() => ({}))
    if (res.ok) setLists(l => ({ ...l, orders: body.orders || [] }))
    else setError(body.error || 'Siparişler yüklenemedi.')
  }

  async function loadList(tablo, tk) {
    const res = await fetch(`/api/admin/requests?tablo=${tablo}`, { headers: { Authorization: `Bearer ${tk}` } })
    const body = await res.json().catch(() => ({}))
    if (res.ok) setLists(l => ({ ...l, [tablo]: body.requests || [] }))
    else setLists(l => ({ ...l, [tablo]: [] }))
  }

  return (
    <section id="admin">
      <div className="container legal">
        <a className="back-link" href="#">← Ana sayfa</a>
        <h1>Admin Panel</h1>
        {!token ? (
          <form className="contact-form" onSubmit={login}>
            <div className="field">
              <label htmlFor="admin-password">Parola</label>
              <input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <p className="field-error">{error}</p>}
            <button className="btn btn-primary" type="submit">Giriş</button>
          </form>
        ) : (
          <>
            <div className="admin-tabs">
              {TABLAR.map(t => (
                <button key={t.key} type="button"
                  className={`admin-tab${tab === t.key ? ' active' : ''}`}
                  onClick={() => setTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'orders' && (
              <ul className="admin-orders">
                {lists.orders === null && <li>Yükleniyor…</li>}
                {lists.orders?.length === 0 && <li>Henüz sipariş yok.</li>}
                {lists.orders?.map(o => (
                  <li key={o.id}>
                    {o.createdAt?.slice(0, 16).replace('T', ' ')} · <b>{o.name}</b> · {o.productName} · {o.quantity} adet
                    {o.email && <> · {o.email}</>}
                  </li>
                ))}
              </ul>
            )}

            {tab === 'teklif' && (
              <ul className="admin-orders">
                {lists.teklif?.length === 0 && <li>Henüz teklif talebi yok.</li>}
                {lists.teklif?.map((r, i) => (
                  <li key={r.id ?? i} className="admin-quote">
                    <span className="q-meta">
                      {r.Tarih?.slice(0, 16).replace('T', ' ')} · <b>{r.Ad}</b> · {r.Email}
                      {r.Detaylar && <> · {r.Detaylar}</>}
                    </span>
                    {r.Mesaj && <span className="q-msg">“{r.Mesaj}”</span>}
                  </li>
                ))}
              </ul>
            )}

            {tab === 'stok' && (
              <ul className="admin-orders">
                {lists.stok?.length === 0 && <li>Henüz stok bildirimi yok.</li>}
                {lists.stok?.map((r, i) => (
                  <li key={r.id ?? i}>
                    {r.Tarih?.slice(0, 16).replace('T', ' ')} · <b>{r.UrunAdi || r.ProductId}</b> · {r.Email}
                    {r.Consent === false && <> · (rıza: hayır)</>}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  )
}
