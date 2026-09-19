export default function Navbar({ goTo }) {
    return (
        <nav style={{
            background: '#1a1a2e',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <span
                onClick={() => goTo('dashboard')}
                style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}
            >
                📦 PriceTracker
            </span>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => goTo('dashboard')}
                    style={{ background: 'none', border: 'none', color: 'white', fontSize: '1rem' }}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => goTo('search')}
                    style={{ background: '#e94560', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '1rem' }}
                >
                    + Track Product
                </button>
            </div>
        </nav>
    )
}