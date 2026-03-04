import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/add', label: 'Add Card', icon: '+' },
  { to: '/manage', label: 'Manage', icon: '≡' },
]

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #2a2a2a',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}>
              ⚡
            </div>
            <span style={{ fontWeight: '700', fontSize: '18px', color: '#f4f4f5', letterSpacing: '-0.02em' }}>
              FlashMind
            </span>
          </NavLink>

          <div style={{ display: 'flex', gap: '4px' }}>
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: isActive ? '#6366f1' : '#71717a',
                  border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                })}
              >
                <span style={{ fontSize: '16px' }}>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        {children}
      </main>
    </div>
  )
}
