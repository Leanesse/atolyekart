import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import ProductList from './components/ProductList.jsx'
import OrderForm from './components/OrderForm.jsx'
import StockNotify from './components/StockNotify.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import PrivacyPolicy from './components/PrivacyPolicy.jsx'
import AdminPanel from './components/AdminPanel.jsx'

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (hash === '#gizlilik') return <><Header /><main><PrivacyPolicy /></main><Footer /></>
  if (hash === '#admin') return <><Header /><main><AdminPanel /></main><Footer /></>

  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductList />
        <OrderForm />
        <StockNotify />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
