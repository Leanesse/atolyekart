import { useState } from 'react'

// Basit admin paneli — #admin ile açılır. Parola → JWT → sipariş listesi.
export default function AdminPanel() {
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

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
  }

  async function loadOrders(tk) {
    const res = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${tk}` } })
    const body = await res.json().catch(() => ({}))
    if (res.ok) setOrders(body.orders || [])
  }

  return (
    <section id="admin">
      <div className="container legal">
        <a className="back-link" href="#">← Ana sayfa</a>
        <h1>Admin — Siparişler</h1>
        {!token ? (
          <form className="contact-form" onSubmit={login}>
            <div className="field">
              <label>Parola</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <p className="field-error">{error}</p>}
            <button className="btn btn-primary" type="submit">Giriş</button>
          </form>
        ) : (
          <ul className="admin-orders">
            {orders.length === 0 && <li>Henüz sipariş yok (bellek sıfırlanmış olabilir).</li>}
            {orders.map(o => (
              <li key={o.id}>{o.createdAt} · {o.name} · {o.productName} · {o.quantity} adet</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
