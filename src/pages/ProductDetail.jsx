import { useState, useEffect } from 'react'
import axios from 'axios'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const API = import.meta.env.VITE_API_URL

export default function ProductDetail({ product, goTo }) {
    const [history, setHistory] = useState([])
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [product.id])

    async function fetchData() {
        setLoading(true)
        try {
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

    const chartData = history.map(h => ({
        time: new Date(h.scraped_at).toLocaleString('en-IN', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }),
        price: h.price
    }))

    const prices = history.map(h => h.price)
    const minPrice = prices.length ? Math.min(...prices) : 0
    const maxPrice = prices.length ? Math.max(...prices) : 0
    const currentPrice = product.latestPrice

    function statusStyle(status) {
        if (status === 'SUCCESS') return { color: '#15803d', bg: '#f0fdf4' }
        if (status === 'RETRIED') return { color: '#b45309', bg: '#fffbeb' }
        if (status === 'FAILED') return { color: '#dc2626', bg: '#fff0f0' }
        return { color: '#999', bg: '#f5f5f5' }
    }

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                <p>Loading data...</p>
            </div>
        </div>
    )

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
            {/* Back */}
            <button
                onClick={() => goTo('dashboard')}
                style={{
                    background: 'none', border: 'none', color: '#888',
                    fontSize: '0.9rem', marginBottom: '1.25rem',
                    display: 'flex', alignItems: 'center', gap: '0.3rem'
                }}
            >
                ← Back to Dashboard
            </button>

            {/* Product header */}
            <div style={{
                background: 'white', borderRadius: '14px',
                padding: '1.5rem', marginBottom: '1.25rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #eee'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.3rem' }}>
                            {product.name}
                        </h1>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>
                            {product.brand} · {product.category} · {product.sku}
                        </p>
                    </div>
                    {currentPrice && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#e94560', letterSpacing: '-1px' }}>
                                ₹{currentPrice.toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Current Price</div>
                        </div>
                    )}
                </div>

                {/* Stats row */}
                {prices.length > 0 && (
                    <div style={{
                        display: 'flex', gap: '1.5rem', marginTop: '1.25rem',
                        paddingTop: '1.25rem', borderTop: '1px solid #f0f0f0',
                        flexWrap: 'wrap'
                    }}>
                        <Stat label="Lowest Price" value={`₹${minPrice.toLocaleString('en-IN')}`} color="#15803d" />
                        <Stat label="Highest Price" value={`₹${maxPrice.toLocaleString('en-IN')}`} color="#dc2626" />
                        <Stat label="Data Points" value={prices.length} color="#1a1a2e" />
                        <Stat label="Scrape Runs" value={logs.length} color="#1a1a2e" />
                    </div>
                )}
            </div>

            {/* Chart */}
            <div style={{
                background: 'white', borderRadius: '14px',
                padding: '1.5rem', marginBottom: '1.25rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #eee'
            }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>
                    Price History
                </h2>
                {chartData.length < 2 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                        <p>Not enough data yet — check back after a few scrape runs.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 11, fill: '#aaa' }}
                                tickLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                                tick={{ fontSize: 11, fill: '#aaa' }}
                                tickLine={false}
                                axisLine={false}
                                width={55}
                                domain={[
                                    dataMin => Math.floor(dataMin * 0.97),
                                    dataMax => Math.ceil(dataMax * 1.03)
                                ]}
                            />
                            <Tooltip
                                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Price']}
                                labelStyle={{ color: '#666', fontSize: '0.85rem' }}
                                contentStyle={{
                                    borderRadius: '8px', border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Line
                                type="monotone" dataKey="price" stroke="#e94560"
                                strokeWidth={2.5} dot={{ r: 3, fill: '#e94560' }}
                                activeDot={{ r: 5 }} isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Scrape Logs */}
            <div style={{
                background: 'white', borderRadius: '14px',
                padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #eee'
            }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>
                    Scrape Log
                    <span style={{
                        marginLeft: '0.5rem', background: '#f0f2f5',
                        padding: '0.15rem 0.5rem', borderRadius: '999px',
                        fontSize: '0.8rem', fontWeight: '600', color: '#666'
                    }}>
                        {logs.length}
                    </span>
                </h2>

                {logs.length === 0 ? (
                    <p style={{ color: '#aaa', textAlign: 'center', padding: '2rem' }}>No scrape logs yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                                    {['Time', 'Status', 'Attempts', 'Duration', 'Error'].map(h => (
                                        <th key={h} style={{
                                            padding: '0.6rem 0.75rem', textAlign: 'left',
                                            color: '#888', fontWeight: '600', fontSize: '0.8rem',
                                            textTransform: 'uppercase', letterSpacing: '0.5px'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => {
                                    const s = statusStyle(log.status)
                                    return (
                                        <tr key={log.id} style={{
                                            borderBottom: i < logs.length - 1 ? '1px solid #f5f5f5' : 'none',
                                            background: i % 2 === 0 ? 'white' : '#fafafa'
                                        }}>
                                            <td style={{ padding: '0.7rem 0.75rem', color: '#666' }}>
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.7rem 0.75rem' }}>
                                                <span style={{
                                                    background: s.bg, color: s.color,
                                                    padding: '0.2rem 0.6rem', borderRadius: '999px',
                                                    fontSize: '0.78rem', fontWeight: '700'
                                                }}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.7rem 0.75rem', color: '#444' }}>
                                                {log.attempts}
                                            </td>
                                            <td style={{ padding: '0.7rem 0.75rem', color: '#444' }}>
                                                {(log.duration_ms / 1000).toFixed(1)}s
                                            </td>
                                            <td style={{
                                                padding: '0.7rem 0.75rem', color: '#dc2626',
                                                fontSize: '0.8rem', maxWidth: '250px',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                            }}>
                                                {log.error_message || <span style={{ color: '#aaa' }}>—</span>}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

function Stat({ label, value, color }) {
    return (
        <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.1rem' }}>{label}</div>
        </div>
    )
}