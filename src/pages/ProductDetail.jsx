import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const API = import.meta.env.VITE_API_URL

export default function ProductDetail({ product, goTo }) {
    const [history, setHistory] = useState([])
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [product.id])

    async function fetchData() {
        setLoading(true)
        try {
            // Fetch both price history and scrape logs in parallel
            const [histRes, logsRes] = await Promise.all([
                axios.get(`${API}/products/${product.id}/history`),
                axios.get(`${API}/products/${product.id}/logs`)
            ])
            setHistory(histRes.data)
            setLogs(logsRes.data)
        } catch (err) {
            console.error('Failed to load product data', err)
        }
        setLoading(false)
    }

    // Format history data for the chart
    const chartData = history.map(h => ({
        time: new Date(h.scraped_at).toLocaleString(),
        price: h.price
    }))
    function statusColor(status) {
        if (status === 'SUCCESS') return '#22c55e'
        if (status === 'RETRIED') return '#f59e0b'
        if (status === 'FAILED') return '#ef4444'
        return '#999'
    }

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>

    return (
        <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
            {/* Back button */}
            <button
                onClick={() => goTo('dashboard')}
                style={{ background: 'none', border: 'none', color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}
            >
                ← Back to Dashboard
            </button>

            <h1 style={{ marginBottom: '0.25rem' }}>{product.name}</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>{product.brand} · {product.category} · {product.sku}</p>

            {/* Price History Chart */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Price History</h2>
                {chartData.length < 2 ? (
                    <p style={{ color: '#666' }}>Not enough data yet — price history will appear after a few scrape runs.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis
                                tickFormatter={v => `₹${v.toLocaleString('en-IN')}`}
                                width={80}
                            />
                            <Tooltip
                                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Price']}
                                labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke="#e94560"
                                strokeWidth={2}
                                dot={true}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Scrape Logs Table */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginBottom: '1rem' }}>Scrape Log</h2>
                {logs.length === 0 ? (
                    <p style={{ color: '#666' }}>No scrape logs yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem' }}>Time</th>
                                <th style={{ padding: '0.5rem' }}>Status</th>
                                <th style={{ padding: '0.5rem' }}>Attempts</th>
                                <th style={{ padding: '0.5rem' }}>Duration</th>
                                <th style={{ padding: '0.5rem' }}>Error</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem', color: '#666' }}>
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <span style={{
                                            background: statusColor(log.status),
                                            color: 'white', padding: '0.2rem 0.6rem',
                                            borderRadius: '999px', fontSize: '0.8rem'
                                        }}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>{log.attempts}</td>
                                    <td style={{ padding: '0.5rem' }}>{log.duration_ms}ms</td>
                                    <td style={{ padding: '0.5rem', color: '#ef4444', fontSize: '0.85rem' }}>
                                        {log.error_message || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}