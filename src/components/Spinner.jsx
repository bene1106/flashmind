export default function Spinner({ size = 24, color = '#6366f1' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
      <div
        style={{
          width: size,
          height: size,
          border: `2px solid rgba(99,102,241,0.2)`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
