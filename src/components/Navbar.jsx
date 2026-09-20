export default function Navbar({ goTo }) {
  return (
    <nav style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: '0 2rem',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div
        onClick={() => goTo('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '1.4rem' }}>📦</span>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
          Price<span style={{ color: '#e94560' }}>Tracker</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          onClick={() => goTo('dashboard')}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
            fontSize: '0.9rem', padding: '0.4rem 0.75rem', borderRadius: '6px',
            transition: 'color 0.2s'
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => goTo('search')}
          style={{
            background: '#e94560', border: 'none', color: 'white',
            padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.9rem',
            fontWeight: '600', boxShadow: '0 2px 8px rgba(233,69,96,0.4)'
          }}
        >
          + Track Product
        </button>
      </div>
    </nav>
  )
}