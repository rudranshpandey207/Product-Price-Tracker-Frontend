import { useState, useEffect } from 'react'
import axios from 'axios'
import Dashboard from './pages/Dashboard'
import ProductDetail from './pages/ProductDetail'
import Search from './pages/Search'
import Navbar from './components/Navbar'

const API = import.meta.env.VITE_API_URL

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Wake up Render on app load
  useEffect(() => {
    axios.get(`${API}/health`).catch(() => { })
  }, [])

  function goTo(pageName, product = null) {
    setPage(pageName)
    setSelectedProduct(product)
  }

  return (
    <div>
      <Navbar goTo={goTo} />
      {page === 'dashboard' && (
        <Dashboard goTo={goTo} />
      )}
      {page === 'search' && (
        <Search goTo={goTo} />
      )}
      {page === 'detail' && (
        <ProductDetail product={selectedProduct} goTo={goTo} />
      )}
    </div>
  )
}