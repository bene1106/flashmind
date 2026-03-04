import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, SEED_DATA } from '../lib/supabase'
import Spinner from '../components/Spinner'

const cardStyle = {
  backgroundColor: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '12px',
  padding: '24px',
  transition: 'all 0.2s',
}

const statCard = {
  ...cardStyle,
  textAlign: 'center',
}

export default function Dashboard() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('flashcards')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      if (data.length === 0) {
        await seedDatabase()
        return
      }

      processTopics(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function seedDatabase() {
    setSeeding(true)
    try {
      const { error: insertError } = await supabase.from('flashcards').insert(SEED_DATA)
      if (insertError) throw insertError
      const { data, error: fetchError } = await supabase
        .from('flashcards')
        .select('*')
        .order('created_at', { ascending: false })
      if (fetchError) throw fetchError
      processTopics(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSeeding(false)
      setLoading(false)
    }
  }

  function processTopics(data) {
    const topicMap = {}
    data.forEach((card) => {
      if (!topicMap[card.topic]) {
        topicMap[card.topic] = { cards: [], totalSeen: 0, totalCorrect: 0 }
      }
      topicMap[card.topic].cards.push(card)
      topicMap[card.topic].totalSeen += card.times_seen || 0
      topicMap[card.topic].totalCorrect += card.times_correct || 0
    })
    const topicList = Object.entries(topicMap).map(([name, stats]) => ({
      name,
      count: stats.cards.length,
      totalSeen: stats.totalSeen,
      totalCorrect: stats.totalCorrect,
      accuracy: stats.totalSeen > 0 ? Math.round((stats.totalCorrect / stats.totalSeen) * 100) : null,
    }))
    setTopics(topicList)
  }

  const totalCards = topics.reduce((s, t) => s + t.count, 0)
  const totalSeen = topics.reduce((s, t) => s + t.totalSeen, 0)
  const totalCorrect = topics.reduce((s, t) => s + t.totalCorrect, 0)
  const overallAccuracy = totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : null

  if (loading || seeding) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <Spinner size={40} />
        <p style={{ color: '#71717a', fontSize: '14px' }}>{seeding ? 'Loading example cards…' : 'Loading…'}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠</div>
        <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '16px' }}>{error}</p>
        <button
          onClick={loadData}
          style={{
            backgroundColor: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '700', color: '#f4f4f5', letterSpacing: '-0.03em' }}>
            Dashboard
          </h1>
          <p style={{ margin: 0, color: '#71717a', fontSize: '15px' }}>
            {topics.length} topic{topics.length !== 1 ? 's' : ''} · {totalCards} card{totalCards !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/add"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#4f46e5'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6366f1'}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
          Add Card
        </Link>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Total Cards', value: totalCards, icon: '🗂' },
          { label: 'Topics', value: topics.length, icon: '📚' },
          { label: 'Times Studied', value: totalSeen, icon: '👁' },
          { label: 'Accuracy', value: overallAccuracy !== null ? `${overallAccuracy}%` : '—', icon: '🎯' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            style={statCard}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#f4f4f5', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '12px', color: '#71717a', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Topics Grid */}
      <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#f4f4f5' }}>Topics</h2>

      {topics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...cardStyle, textAlign: 'center', padding: '64px 24px' }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <p style={{ color: '#71717a', marginBottom: '20px', fontSize: '16px' }}>No cards yet.</p>
          <Link
            to="/add"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            + Add your first card
          </Link>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {topics.map((topic, i) => (
            <TopicCard key={topic.name} topic={topic} index={i} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  )
}

function TopicCard({ topic, index, navigate }) {
  const [hovered, setHovered] = useState(false)
  const pct = topic.accuracy

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...cardStyle,
        cursor: 'pointer',
        border: hovered ? '1px solid rgba(99,102,241,0.4)' : '1px solid #2a2a2a',
        boxShadow: hovered ? '0 0 32px rgba(99,102,241,0.08)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#f4f4f5' }}>
            {topic.name}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#71717a' }}>
            {topic.count} card{topic.count !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{
          backgroundColor: 'rgba(99,102,241,0.12)',
          color: '#818cf8',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '12px',
          fontWeight: '600',
        }}>
          {pct !== null ? `${pct}%` : 'New'}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: '#52525b' }}>Progress</span>
          <span style={{ fontSize: '12px', color: '#52525b' }}>
            {topic.totalCorrect}/{topic.totalSeen} correct
          </span>
        </div>
        <div style={{ height: '4px', backgroundColor: '#2a2a2a', borderRadius: '2px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct || 0}%` }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '100%',
              backgroundColor: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#6366f1',
              borderRadius: '2px',
            }}
          />
        </div>
      </div>

      <button
        onClick={() => navigate(`/learn/${encodeURIComponent(topic.name)}`)}
        style={{
          width: '100%',
          backgroundColor: hovered ? '#6366f1' : 'transparent',
          color: hovered ? '#fff' : '#6366f1',
          border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: '8px',
          padding: '9px 16px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          transition: 'all 0.15s',
          letterSpacing: '0.01em',
        }}
      >
        Start Learning →
      </button>
    </motion.div>
  )
}
