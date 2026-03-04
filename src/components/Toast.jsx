import { motion, AnimatePresence } from 'framer-motion'

export default function Toast({ toasts, removeToast }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={() => removeToast(toast.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 18px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              maxWidth: '360px',
              backgroundColor: toast.type === 'error' ? '#1f0f0f' : '#0f1f0f',
              border: `1px solid ${toast.type === 'error' ? '#7f1d1d' : '#14532d'}`,
              color: toast.type === 'error' ? '#fca5a5' : '#86efac',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <span>{toast.type === 'error' ? '✕' : '✓'}</span>
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
