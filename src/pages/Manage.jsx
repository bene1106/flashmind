import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import Spinner from '../components/Spinner'
import { useToast } from '../hooks/useToast'
import Toast from '../components/Toast'

export default function Manage() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterTopic, setFilterTopic] = useState('All')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    loadCards()
  }, [])

  async function loadCards() {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('flashcards')
        .select('*')
        .order('created_at', { ascending: false })
      if (fetchError) throw fetchError
      setCards(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const topics = ['All', ...Array.from(new Set(cards.map((c) => c.topic))).sort()]

  const filtered = filterTopic === 'All' ? cards : cards.filter((c) => c.topic === filterTopic)

  function startEdit(card) {
    setEditingId(card.id)
    setEditForm({ front: card.front, back: card.back, topic: card.topic })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({})
  }

  async function saveEdit(id) {
    if (!editForm.front.trim() || !editForm.back.trim() || !editForm.topic.trim()) {
      addToast('All fields are required', 'error')
      return
    }
    setSaving(true)
    try {
      const { error: updateError } = await supabase
        .from('flashcards')
        .update({ front: editForm.front.trim(), back: editForm.back.trim(), topic: editForm.topic.trim() })
        .eq('id', id)
      if (updateError) throw updateError
      setCards((prev) => prev.map((c) => c.id === id ? { ...c, ...editForm } : c))
      setEditingId(null)
      addToast('Card updated successfully')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCard(id) {
    try {
      const { error: deleteError } = await supabase.from('flashcards').delete().eq('id', id)
      if (deleteError) throw deleteError
      setCards((prev) => prev.filter((c) => c.id !== id))
      setDeleteConfirm(null)
      addToast('Card deleted')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Spinner size={40} />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px' }}>
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
        <button onClick={loadCards} style={btnPrimary}>Retry</button>
      </div>
    )
  }

  return (
    <>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '700', color: '#f4f4f5', letterSpacing: '-0.03em' }}>
              Manage Cards
            </h1>
            <p style={{ margin: 0, color: '#71717a', fontSize: '14px' }}>
              {filtered.length} of {cards.length} card{cards.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Topic filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setFilterTopic(t)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: filterTopic === t ? '1px solid rgba(99,102,241,0.5)' : '1px solid #2a2a2a',
                  backgroundColor: filterTopic === t ? 'rgba(99,102,241,0.15)' : '#1a1a1a',
                  color: filterTopic === t ? '#818cf8' : '#71717a',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.15s',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            padding: '64px 24px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#71717a', fontSize: '16px' }}>No cards found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence>
              {filtered.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ delay: i < 20 ? i * 0.03 : 0, duration: 0.25 }}
                >
                  {editingId === card.id ? (
                    <EditRow
                      form={editForm}
                      setForm={setEditForm}
                      onSave={() => saveEdit(card.id)}
                      onCancel={cancelEdit}
                      saving={saving}
                      allTopics={topics.filter((t) => t !== 'All')}
                    />
                  ) : (
                    <CardRow
                      card={card}
                      onEdit={() => startEdit(card)}
                      onDelete={() => setDeleteConfirm(card.id)}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '24px',
            }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑</div>
              <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '600', color: '#f4f4f5' }}>Delete card?</h3>
              <p style={{ margin: '0 0 24px', color: '#71717a', fontSize: '14px' }}>This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{ ...btnSecondary, flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteCard(deleteConfirm)}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(239,68,68,0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px',
                    padding: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  )
}

function CardRow({ card, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const accuracy = card.times_seen > 0
    ? `${Math.round((card.times_correct / card.times_seen) * 100)}%`
    : '—'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#1a1a1a',
        border: hovered ? '1px solid #3a3a3a' : '1px solid #2a2a2a',
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr auto auto auto',
        gap: '12px',
        alignItems: 'center',
        transition: 'all 0.15s',
      }}
    >
      <div>
        <div style={{ fontSize: '12px', color: '#52525b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Front</div>
        <div style={{ fontSize: '14px', color: '#f4f4f5', lineHeight: 1.4 }}>{card.front}</div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#52525b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Back</div>
        <div style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: 1.4 }}>{card.back}</div>
      </div>
      <div style={{
        backgroundColor: 'rgba(99,102,241,0.1)',
        color: '#818cf8',
        borderRadius: '6px',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: '500',
        whiteSpace: 'nowrap',
      }}>
        {card.topic}
      </div>
      <div style={{ textAlign: 'center', minWidth: '48px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#f4f4f5' }}>{accuracy}</div>
        <div style={{ fontSize: '11px', color: '#52525b' }}>accuracy</div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={onEdit}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #2a2a2a',
            borderRadius: '6px',
            color: '#71717a',
            cursor: 'pointer',
            fontSize: '13px',
            padding: '6px 12px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#71717a' }}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #2a2a2a',
            borderRadius: '6px',
            color: '#71717a',
            cursor: 'pointer',
            fontSize: '13px',
            padding: '6px 12px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#71717a' }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function EditRow({ form, setForm, onSave, onCancel, saving, allTopics }) {
  return (
    <div style={{
      backgroundColor: '#1e1e2e',
      border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: '10px',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Front</label>
          <textarea
            value={form.front}
            onChange={(e) => setForm((f) => ({ ...f, front: e.target.value }))}
            rows={2}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Back</label>
          <textarea
            value={form.back}
            onChange={(e) => setForm((f) => ({ ...f, back: e.target.value }))}
            rows={2}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Topic</label>
          <input
            list="topic-list-edit"
            value={form.topic}
            onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
            style={{ ...inputStyle, width: '160px' }}
          />
          <datalist id="topic-list-edit">
            {allTopics.map((t) => <option key={t} value={t} />)}
          </datalist>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={btnSecondary}>Cancel</button>
        <button onClick={onSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  color: '#52525b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
  fontWeight: '600',
}

const inputStyle = {
  width: '100%',
  backgroundColor: '#0f0f0f',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  color: '#f4f4f5',
  fontSize: '13px',
  padding: '8px 12px',
  fontFamily: 'inherit',
  resize: 'vertical',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const btnPrimary = {
  backgroundColor: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 18px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600',
}

const btnSecondary = {
  backgroundColor: 'transparent',
  color: '#71717a',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  padding: '8px 18px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
}
