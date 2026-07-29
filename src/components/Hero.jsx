const stats = [
  { value: '120+', label: 'Ürün Çeşidi' },
  { value: '%100', label: 'Atölye Üretimi' },
  { value: '24s',  label: 'Hızlı Kargo' },
  { value: '4.9★', label: 'Müşteri Puanı' },
]

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <span className="badge">3D Baskı · FPV &amp; Drone Parçaları</span>
        <h1>Uçuşun için hafif ve dayanıklı parçalar</h1>
        <p>Kendi atölyemizde, yüksek kaliteli filamentlerle üretiyoruz. Frame'lerden kamera mountlarına, ihtiyacın olan her şey tek yerde.</p>
        <div className="btns">
          <a href="#urunler" className="btn btn-primary">Ürünleri Keşfet</a>
          <a href="#iletisim" className="btn btn-ghost">Özel Baskı İste</a>
        </div>
        <div className="stats">
          {stats.map(s => (
            <div className="stat" key={s.label}>
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
