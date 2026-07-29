const features = [
  { icon: '🧩', title: 'Dayanıklı Malzeme', text: 'PETG, ABS ve TPU seçenekleriyle darbeye dayanıklı baskılar.' },
  { icon: '🎯', title: 'Hassas Tolerans',   text: 'Vida ve montaj deliklerinde milimetrik hassasiyet.' },
  { icon: '🎨', title: 'Renk Seçeneği',     text: 'Kendi takımının renklerinde özel baskı imkanı.' },
]

export default function About() {
  return (
    <section id="hakkimizda">
      <div className="container about-wrap">
        <div className="about-visual">🛩️</div>
        <div className="about-text">
          <h2>Atölyeden pistlere</h2>
          <p>fpvstore, tutkulu FPV pilotları tarafından kurulan küçük bir 3D baskı atölyesidir. Her parçayı tek tek, gerçek uçuş koşullarında test ederek üretiyoruz.</p>
          <p>Amacımız pilotlara hem uygun fiyatlı hem de sahada güvenebilecekleri parçalar sunmak.</p>
          <ul className="feature-list">
            {features.map(f => (
              <li key={f.title}>
                <span className="ic">{f.icon}</span>
                <div>
                  <b>{f.title}</b>
                  <span>{f.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
