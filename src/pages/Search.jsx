import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const CATEGORY_ICONS = {
    'Monitors': '🖥️', 'Laptops': '💻', 'Peripherals': '⌨️',
    'Wearables': '⌚', 'Smart Home': '🏠', 'Kitchen': '🍳',
    'Bags': '👜', 'Footwear': '👟', 'Power': '🔌',
    'default': '📦'
}

export default function Search({ goTo }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [tracking, setTracking] = useState({})
    const [error, setError] = useState(null)
    const [searched, setSearched] = useState(false)
    const [catalogLoading, setCatalogLoading] = useState(true)
    const catalogRef = useRef([]) // cache all 1000 products in memory

    // Load entire catalog once on mount
    useEffect(() => {
        async function loadCatalog() {
            try {
                const res = await axios.get(`${API}/search`, {
                    params: { q: 'a' }, // broad query to get all products
                    timeout: 60000
                })
                // This only gets products with 'a' — instead fetch all pages directly
                await fetchAllProducts()
            } catch (err) {
                setError('Could not load product catalog. Try refreshing.')
            }
            setCatalogLoading(false)
        }

        async function fetchAllProducts() {
            const allItems = []
            let page = 1
            let totalPages = 1
            while (page <= totalPages) {
                const res = await axios.get(
                    `https://demo.inelabteamdev.com/api/catalog?page=${page}&pageSize=50`
                )
                totalPages = res.data.pages
                allItems.push(...res.data.items)
                page++
            }
            catalogRef.current = allItems
        }

        loadCatalog()
    }, [])

    function handleSearch() {
        if (!query.trim()) return
        setSearched(true)
        setError(null)

        if (catalogLoading) {
            setError('Catalog still loading, please wait...')
            return
        }

        const q = query.toLowerCase().trim()
        const filtered = catalogRef.current.filter(item =>
            item.name.toLowerCase().includes(q) ||
            item.brand.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        )
        setResults(filtered)
    }

    async function handleTrack(item) {
        setTracking(t => ({ ...t, [item.id]: 'loading' }))
        try {
            await axios.post(`${API}/products`, {
                storeId: item.id, name: item.name, slug: item.slug,
                brand: item.brand, category: item.category,
                sku: item.sku, description: item.description
            })
            setTracking(t => ({ ...t, [item.id]: 'tracked' }))
        } catch (err) {
            if (err.response?.status === 409) {
                setTracking(t => ({ ...t, [item.id]: 'tracked' }))
            } else {
                setTracking(t => ({ ...t, [item.id]: 'error' }))
            }
        }
    }

    const icon = (cat) => CATEGORY_ICONS[cat] || CATEGORY_ICONS['default']

    return (
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '2rem 1rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                    Search Products
                </h1>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>
                    {catalogLoading
                        ? '⏳ Loading product catalog...'
                        : 'Search across 1,000 products from INE\'s mock store'}
                </p>
            </div>

            {/* Search box */}
            <div style={{
                display: 'flex', gap: '0.75rem', marginBottom: '1.5rem',
                background: 'white', padding: '0.5rem',
                borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
                <input
                    type="text"
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value)
                        // Live search as user types
                        if (e.target.value.trim() && !catalogLoading) {
                            const q = e.target.value.toLowerCase().trim()
                            const filtered = catalogRef.current.filter(item =>
                                item.name.toLowerCase().includes(q) ||
                                item.brand.toLowerCase().includes(q) ||
                                item.category.toLowerCase().includes(q)
                            )
                            setResults(filtered)
                            setSearched(true)
                        } else if (!e.target.value.trim()) {
                            setResults([])
                            setSearched(false)
                        }
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder={catalogLoading ? 'Loading catalog...' : 'Search by name, brand or category...'}
                    disabled={catalogLoading}
                    style={{
                        flex: 1, padding: '0.65rem 1rem', fontSize: '0.95rem',
                        border: 'none', outline: 'none', background: 'transparent',
                        color: '#1a1a2e', opacity: catalogLoading ? 0.5 : 1
                    }}
                />
                <button
                    onClick={handleSearch}
                    disabled={catalogLoading}
                    style={{
                        background: catalogLoading ? '#ccc' : '#e94560',
                        color: 'white', border: 'none',
                        padding: '0.65rem 1.5rem', borderRadius: '8px',
                        fontSize: '0.95rem', fontWeight: '600'
                    }}
                >
                    {catalogLoading ? 'Loading...' : 'Search'}
                </button>
            </div>

            {error && (
                <div style={{
                    background: '#fff0f0', border: '1px solid #ffd0d0',
                    borderRadius: '8px', padding: '0.75rem 1rem',
                    color: '#e94560', marginBottom: '1rem', fontSize: '0.9rem'
                }}>
                    {error}
                </div>
            )}

            {searched && !catalogLoading && (
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {results.length === 0
                        ? 'No products found. Try a different search.'
                        : `${results.length} products found`}
                </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {results.map(item => (
                    <div key={item.id} style={{
                        background: 'white', padding: '1rem 1.25rem',
                        borderRadius: '10px', border: '1px solid #eee',
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: '#f0f2f5', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem', flexShrink: 0
                            }}>
                                {icon(item.category)}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                                    {item.name}
                                </div>
                                <div style={{ color: '#888', fontSize: '0.82rem' }}>
                                    {item.brand} · {item.category} · {item.sku}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleTrack(item)}
                            disabled={tracking[item.id] === 'tracked' || tracking[item.id] === 'loading'}
                            style={{
                                background: tracking[item.id] === 'tracked' ? '#22c55e' :
                                    tracking[item.id] === 'error' ? '#ef4444' : '#e94560',
                                color: 'white', border: 'none', flexShrink: 0,
                                padding: '0.45rem 1rem', borderRadius: '7px',
                                fontSize: '0.85rem', fontWeight: '600',
                                opacity: tracking[item.id] === 'loading' ? 0.6 : 1,
                                minWidth: '80px'
                            }}
                        >
                            {tracking[item.id] === 'tracked' ? '✓ Tracked' :
                                tracking[item.id] === 'loading' ? '...' :
                                    tracking[item.id] === 'error' ? 'Error' : 'Track'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}