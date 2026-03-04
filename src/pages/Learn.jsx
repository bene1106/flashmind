import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import Spinner from '../components/Spinner'

export default function Learn() {
  const { topic } = useParams()
  const navigate = useNavigate()
  const decodedTopic = decodeURIComponent(topic)

  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 })
  const [done, setDone] = useState(false)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    loadCards()
  }, [decodedTopic])

  useEffect(() => {
    const handleKey = (e) => {
      if (done) return
      if (e.code === 'Space') {
        e.preventDefault()
        setIsFlipped((f) => !f)
      }
      if (e.code === 'ArrowRight' && isFlipped) handleCorrect()
      if (e.code === 'ArrowLeft' && isFlipped) handleWrong()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isFlipped, done, currentIndex, cards])

  async function loadCards() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('topic', decodedTopic)
        .order('created_at', { ascending: true })
      if (fetchError) throw fetchError
      setCards(shuffleArray(data))
      setCurrentIndex(0)
      setIsFlipped(false)
      setDone(false)
      setSessionStats({ correct: 0, wrong: 0 })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function shuffleArray(arr) {
    return [...arr].sort(() => Math.random() - 0.5)
  }

  const advance = useCallback((isCorrect) => {
    const card = cards[currentIndex]
    supabase
      .from('flashcards')
      .update({
        times_seen: (card.times_seen || 0) + 1,
        times_correct: (card.times_correct || 0) + (isCorrect ? 1 : 0),
      })
      .eq('id', card.id)
      .then(() => {})

    setSessionStats((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      wrong: s.wrong + (isCorrect ? 0 : 1),
    }))

    setDirection(1)
    if (currentIndex + 1 >= cards.length) {
      setDone(true)
    } else {
      setIsFlipped(false)
      setTimeout(() => setCurrentIndex((i) => i + 1), 50)
    }
  }, [cards, currentIndex])

  const handleCorrect = useCallback(() => advance(true), [advance])
  const handleWrong = useCallback(() => advance(false), [advance])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spinner size={40} />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px' }}>
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
        <button onClick={() => navigate('/')} style={btnSecondary}>← Back to Dashboard</button>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px' }}>
        <p style={{ color: '#71717a', marginBottom: '16px', fontSize: '18px' }}>No cards found for "{decodedTopic}"</p>
        <button onClick={() => navigate('/')} style={btnSecondary}>← Back to Dashboard</button>
      </div>
    )
  }

  if (done) {
    const total = sessionStats.correct + sessionStats.wrong
    const pct = total > 0 ? Math.round((sessionStats.correct / total) * 100) : 0
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '32px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '20px',
            padding: '48px',
            textAlign: 'center',
            maxWidth: '420px',
            width: '100%',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>
            {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: '700', color: '#f4f4f5' }}>
            Round complete!
          </h2>
          <p style={{ margin: '0 0 32px', color: '#71717a', fontSize: '15px' }}>
            You scored <strong style={{ color: '#f4f4f5' }}>{pct}%</strong> on "{decodedTopic}"
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#22c55e' }}>{sessionStats.correct}</div>
              <div style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>Correct</div>
            </div>
            <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{sessionStats.wrong}</div>
              <div style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>Wrong</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button onClick={loadCards} style={btnPrimary}>
              Restart Deck
            </button>
            <button onClick={() => navigate('/')} style={btnSecondary}>
              ← Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const card = cards[currentIndex]
  const progress = (currentIndex / cards.length) * 100
  const hasImages = !!(card.front_image_url || card.back_image_url)
  const cardHeight = hasImages ? 420 : 300

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '14px', padding: '0', display: 'flex', alignItems: 'center', gap: '6px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f4f4f5'}
          onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
        >
          ← Dashboard
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#71717a', fontWeight: '500' }}>
            {decodedTopic}
          </div>
          <div style={{ fontSize: '13px', color: '#52525b', marginTop: '2px' }}>
            {currentIndex + 1} / {cards.length}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
          <span style={{ color: '#22c55e', fontWeight: '600' }}>✓ {sessionStats.correct}</span>
          <span style={{ color: '#ef4444', fontWeight: '600' }}>✗ {sessionStats.wrong}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', backgroundColor: '#2a2a2a', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ height: '100%', backgroundColor: '#6366f1', borderRadius: '2px' }}
        />
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 40 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ perspective: '1000px' }}
        >
          <div
            onClick={() => setIsFlipped((f) => !f)}
            style={{
              position: 'relative',
              width: '100%',
              height: `${cardHeight}px`,
              cursor: 'pointer',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 40px',
              gap: '16px',
              overflowY: 'auto',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #1e1e2e 100%)',
            }}>
              <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '600', flexShrink: 0 }}>
                Question
              </div>
              {card.front_image_url && (
                <img
                  src={card.front_image_url}
                  alt=""
                  style={{
                    maxWidth: '100%',
                    maxHeight: '160px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #2a2a2a',
                    flexShrink: 0,
                  }}
                />
              )}
              <p style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#f4f4f5', textAlign: 'center', lineHeight: 1.5 }}>
                {card.front}
              </p>
              <div style={{ position: 'absolute', bottom: '16px', fontSize: '12px', color: '#3f3f46' }}>
                Space to flip
              </div>
            </div>

            {/* Back */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 40px',
              gap: '16px',
              overflowY: 'auto',
              boxShadow: '0 8px 40px rgba(99,102,241,0.1)',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            }}>
              <div style={{ fontSize: '11px', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '600', flexShrink: 0 }}>
                Answer
              </div>
              {card.back_image_url && (
                <img
                  src={card.back_image_url}
                  alt=""
                  style={{
                    maxWidth: '100%',
                    maxHeight: '160px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid rgba(99,102,241,0.2)',
                    flexShrink: 0,
                  }}
                />
              )}
              <p style={{ margin: 0, fontSize: '17px', color: '#d1d5db', textAlign: 'center', lineHeight: 1.6 }}>
                {card.back}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
          >
            <button
              onClick={handleWrong}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(239,68,68,0.3)',
                backgroundColor: 'rgba(239,68,68,0.1)',
                color: '#ef4444',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
            >
              ✗ Wrong
            </button>
            <button
              onClick={handleCorrect}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(34,197,94,0.3)',
                backgroundColor: 'rgba(34,197,94,0.1)',
                color: '#22c55e',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.2)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.1)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)' }}
            >
              ✓ Correct
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard hint */}
      {!isFlipped && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', color: '#3f3f46', fontSize: '13px', margin: 0 }}
        >
          Click the card or press <kbd style={{ backgroundColor: '#2a2a2a', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>Space</kbd> to flip
        </motion.p>
      )}
      {isFlipped && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', color: '#3f3f46', fontSize: '13px', margin: 0 }}
        >
          <kbd style={{ backgroundColor: '#2a2a2a', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>←</kbd> Wrong &nbsp;·&nbsp;
          <kbd style={{ backgroundColor: '#2a2a2a', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>→</kbd> Correct
        </motion.p>
      )}
    </div>
  )
}

const btnPrimary = {
  width: '100%',
  backgroundColor: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 20px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: '600',
  transition: 'background-color 0.15s',
}

const btnSecondary = {
  width: '100%',
  backgroundColor: 'transparent',
  color: '#71717a',
  border: '1px solid #2a2a2a',
  borderRadius: '10px',
  padding: '12px 20px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: '500',
  transition: 'all 0.15s',
}
