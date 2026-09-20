import { useState } from 'react'
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
    const [loading, setLoading] = useState(false)
    const [tracking, setTracking] = useState({})
    const [error, setError] = useState(null)
    const [searched, setSearched] = useState(false)

    async function handleSearch() {
        if (!query.trim()) return
        setLoading(true)
        setError(null)
        setSearched(true)
        try {
            const res = await axios.get(`${API}/search`, {
                params: { q: query },
                timeout: 60000
            })
            setResults(res.data.items || [])
        } catch (err) {
            // Retry once — Render may have been sleeping
            try {
                const res = await axios.get(`${API}/search`, {
                    params: { q: query },
                    timeout: 60000
                })
                setResults(res.data.items || [])
            } catch (err2) {
                setError('Search failed. Backend may be waking up — try again in 30 seconds.')
            }
        }
        setLoading(false)
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
                    Search across 1,000 products from INE's mock store
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
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by name, brand or category..."
                    style={{
                        flex: 1, padding: '0.65rem 1rem', fontSize: '0.95rem',
                        border: 'none', outline: 'none', background: 'transparent',
                        color: '#1a1a2e'
                    }}
                />
                <button
                    onClick={handleSearch}
                    style={{
                        background: loading ? '#ccc' : '#e94560',
                        color: 'white', border: 'none',
                        padding: '0.65rem 1.5rem', borderRadius: '8px',
                        fontSize: '0.95rem', fontWeight: '600',
                        transition: 'background 0.2s'
                    }}
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
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

            {/* Results count */}
            {searched && !loading && (
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {results.length === 0
                        ? 'No products found. Try a different search.'
                        : `${results.length} products found`}
                </p>
            )}

            {/* Results */}
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