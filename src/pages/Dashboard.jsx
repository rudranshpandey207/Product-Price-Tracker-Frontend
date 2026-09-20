import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function Dashboard({ goTo }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [scraping, setScraping] = useState(false)

    useEffect(() => { fetchProducts() }, [])

    async function fetchProducts() {
        setLoading(true)
        try {
            const res = await axios.get(`${API}/products`)
            setProducts(res.data)
        } catch (err) {
            console.error('Failed to load products', err)
        }
        setLoading(false)
    }

    async function handleForceScrape() {
        setScraping(true)
        try {
            await axios.post(`${API}/scrape/run`)
            // Wait 60 seconds then refresh — scraping takes time
            setTimeout(async () => {
                await fetchProducts()
                setScraping(false)
            }, 60000)
        } catch (err) {
            alert('Scrape trigger failed')
            setScraping(false)
        }
    }

    async function handleRemove(productId) {
        if (!confirm('Stop tracking this product?')) return
        try {
            await axios.delete(`${API}/products/${productId}`)
            setProducts(p => p.filter(x => x.id !== productId))
        } catch (err) {
            alert('Failed to remove product')
        }
    }

    const scraped = products.filter(p => p.latestPrice)

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                <p>Loading products...</p>
            </div>
        </div>
    )

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                        Tracked Products
                    </h1>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        {products.length} product{products.length !== 1 ? 's' : ''} tracked
                        {scraped.length > 0 && ` · ${scraped.length} with live prices`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={fetchProducts}
                        style={{
                            background: 'white', border: '1px solid #ddd', color: '#444',
                            padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem',
                            fontWeight: '500'
                        }}
                    >
                        ↻ Refresh
                    </button>
                    <button
                        onClick={handleForceScrape}
                        disabled={scraping}
                        style={{
                            background: scraping ? '#ccc' : '#1a1a2e',
                            border: 'none', color: 'white',
                            padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem',
                            fontWeight: '500', cursor: scraping ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {scraping ? '⏳ Scraping...' : '⚡ Force Scrape'}
                    </button>
                    <button
                        onClick={() => goTo('search')}
                        style={{
                            background: '#e94560', border: 'none', color: 'white',
                            padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.9rem',
                            fontWeight: '600', boxShadow: '0 2px 8px rgba(233,69,96,0.3)'
                        }}
                    >
                        + Add Product
                    </button>
                </div>
            </div>

            {/* Scraping notice */}
            {scraping && (
                <div style={{
                    background: '#fffbeb', border: '1px solid #fde68a',
                    borderRadius: '8px', padding: '0.75rem 1rem',
                    marginBottom: '1.5rem', color: '#b45309', fontSize: '0.9rem'
                }}>
                    ⚡ Scraping all products in the background — prices will update in about 60 seconds. Click Refresh when done.
                </div>
            )}

            {products.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '5rem 2rem',
                    background: 'white', borderRadius: '16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <h2 style={{ marginBottom: '0.5rem', color: '#1a1a2e' }}>No products tracked yet</h2>
                    <p style={{ color: '#888', marginBottom: '1.5rem' }}>
                        Search for a product and click Track to get started
                    </p>
                    <button
                        onClick={() => goTo('search')}
                        style={{
                            background: '#e94560', color: 'white', border: 'none',
                            padding: '0.75rem 2rem', borderRadius: '8px', fontSize: '1rem',
                            fontWeight: '600'
                        }}
                    >
                        Search Products
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onView={() => goTo('detail', product)}
                            onRemove={() => handleRemove(product.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function ProductCard({ product, onView, onRemove }) {
    const isScraped = !!product.latestPrice

    function stockBadge() {
        if (!isScraped) return { label: 'Not scraped yet', color: '#999', bg: '#f5f5f5' }
        if (product.latestStockStatus === 'IN_STOCK') return {
            label: product.latestStockCount
                ? `In Stock · ${product.latestStockCount} left`
                : 'In Stock',
            color: '#15803d', bg: '#f0fdf4'
        }
        if (product.latestStockStatus === 'OUT_OF_STOCK') return {
            label: 'Out of Stock', color: '#dc2626', bg: '#fff0f0'
        }
        return { label: 'Unknown', color: '#999', bg: '#f5f5f5' }
    }

    const stock = stockBadge()

    return (
        <div style={{
            background: 'white', borderRadius: '12px',
            border: '1px solid #eee', overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
            <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        {/* Product name and meta */}
                        <div style={{ marginBottom: '0.75rem' }}>
                            <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.2rem' }}>
                                {product.name}
                            </h3>
                            <span style={{ color: '#888', fontSize: '0.82rem' }}>
                                {product.brand} · {product.category} · {product.sku}
                            </span>
                        </div>

                        {/* Price and stock row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span style={{
                                fontSize: isScraped ? '1.5rem' : '1rem',
                                fontWeight: '800', color: isScraped ? '#1a1a2e' : '#aaa',
                                letterSpacing: '-0.5px'
                            }}>
                                {isScraped
                                    ? `₹${product.latestPrice.toLocaleString('en-IN')}`
                                    : 'Not scraped yet'}
                            </span>

                            <span style={{
                                background: stock.bg, color: stock.color,
                                padding: '0.2rem 0.65rem', borderRadius: '999px',
                                fontSize: '0.78rem', fontWeight: '600'
                            }}>
                                {stock.label}
                            </span>

                            {product.lastScrapedAt && (
                                <span style={{ color: '#bbb', fontSize: '0.78rem' }}>
                                    Updated {new Date(product.lastScrapedAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexShrink: 0 }}>
                        <button
                            onClick={onView}
                            style={{
                                background: '#1a1a2e', color: 'white', border: 'none',
                                padding: '0.5rem 1rem', borderRadius: '8px',
                                fontSize: '0.85rem', fontWeight: '600'
                            }}
                        >
                            View History
                        </button>
                        <button
                            onClick={onRemove}
                            style={{
                                background: 'none', border: '1px solid #eee',
                                color: '#999', padding: '0.5rem 0.75rem',
                                borderRadius: '8px', fontSize: '0.85rem'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}