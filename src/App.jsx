import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import ProductList from './components/ProductList.jsx'
import ProductModal from './components/ProductModal.jsx'
import OrderForm from './components/OrderForm.jsx'
import StockNotify from './components/StockNotify.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import PrivacyPolicy from './components/PrivacyPolicy.jsx'
import AdminPanel from './components/AdminPanel.jsx'

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  const [detailProduct, setDetailProduct] = useState(null)
  // Modal'daki "Sipariş Et" → OrderForm'da ürünü önceden seçmek için (nonce ile tekrar tetiklenir).
  const [orderPreselect, setOrderPreselect] = useState(null)

  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Modal → sipariş formu: ürünü seç, formu kapat, #siparis'e kaydır.
  function handleOrder(product) {
    setDetailProduct(null)
    setOrderPreselect({ productId: product.id, at: Date.now() })
    setTimeout(() => {
      document.getElementById('siparis')?.scrollIntoView({ behavior: 'smooth' })
    }, 60)
  }

  if (hash === '#gizlilik') return <><Header /><main><PrivacyPolicy /></main><Footer /></>
  if (hash === '#admin') return <><Header /><main><AdminPanel /></main><Footer /></>

  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductList onDetail={setDetailProduct} />
        <OrderForm preselect={orderPreselect} />
        <StockNotify />
        <About />
        <Contact />
      </main>
      <Footer />
      {detailProduct && (
        <ProductModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onOrder={handleOrder}
        />
      )}
    </>
  )
}
