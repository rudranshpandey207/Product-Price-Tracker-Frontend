import { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function Search({ goTo }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [tracking, setTracking] = useState({}) // productId -> true/false
    const [error, setError] = useState(null)

    // Called when user types and hits Search
    async function handleSearch() {
        if (!query.trim()) return
        setLoading(true)
        setError(null)
        try {
            // Calls GET /search?q=... on our backend
            const res = await axios.get(`${API}/search`, { params: { q: query } })
            setResults(res.data.items || [])
        } catch (err) {
            setError('Search failed. Is the backend running?')
        }
        setLoading(false)
    }

    // Called when user clicks "Track" on a search result
    async function handleTrack(item) {
        setTracking(t => ({ ...t, [item.id]: 'loading' }))
        try {
            // Calls POST /products with the product details
            await axios.post(`${API}/products`, {
                storeId: item.id,
                name: item.name,
                slug: item.slug,
                brand: item.brand,
                category: item.category,
                sku: item.sku,
                description: item.description
            })
            setTracking(t => ({ ...t, [item.id]: 'tracked' }))
        } catch (err) {
            // 409 means already tracked
            if (err.response?.status === 409) {
                setTracking(t => ({ ...t, [item.id]: 'tracked' }))
            } else {
                setTracking(t => ({ ...t, [item.id]: 'error' }))
            }
        }
    }

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
            <h1 style={{ marginBottom: '1rem' }}>Search Products</h1>

            {/* Search box */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by name, brand or category..."
                    style={{
                        flex: 1, padding: '0.75rem 1rem', fontSize: '1rem',
                        border: '1px solid #ddd', borderRadius: '6px'
                    }}
                />
                <button
                    onClick={handleSearch}
                    style={{
                        background: '#e94560', color: 'white', border: 'none',
                        padding: '0.75rem 1.5rem', borderRadius: '6px', fontSize: '1rem'
                    }}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

            {/* Results */}
            {results.length > 0 && (
                <p style={{ marginBottom: '1rem', color: '#666' }}>{results.length} results</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.map(item => (
                    <div key={item.id} style={{
                        background: 'white', padding: '1rem', borderRadius: '8px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                {item.brand} · {item.category} · {item.sku}
                            </div>
                        </div>
                        <button
                            onClick={() => handleTrack(item)}
                            disabled={tracking[item.id] === 'tracked' || tracking[item.id] === 'loading'}
                            style={{
                                background: tracking[item.id] === 'tracked' ? '#22c55e' :
                                    tracking[item.id] === 'error' ? '#ef4444' : '#e94560',
                                color: 'white', border: 'none',
                                padding: '0.5rem 1rem', borderRadius: '6px',
                                opacity: tracking[item.id] === 'loading' ? 0.7 : 1
                            }}
                        >
                            {tracking[item.id] === 'tracked' ? '✓ Tracked' :
                                tracking[item.id] === 'loading' ? 'Adding...' :
                                    tracking[item.id] === 'error' ? 'Error' : 'Track'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}