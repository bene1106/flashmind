import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { deleteImage } from '../lib/storage'
import { useToast } from '../hooks/useToast'
import Toast from '../components/Toast'
import ImageUpload from '../components/ImageUpload'

function newCardId() {
  return crypto.randomUUID()
}

const emptyForm = (topic = '') => ({
  front: '',
  back: '',
  topic,
  front_image_url: null,
  back_image_url: null,
})

export default function AddCard() {
  const navigate = useNavigate()
  const [existingTopics, setExistingTopics] = useState([])
  const [form, setForm] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [bulkJson, setBulkJson] = useState('')
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('single')
  const { toasts, addToast, removeToast } = useToast()

  // Stable UUID for the current unsaved card — images are stored under this path.
  // Replaced with a fresh UUID after each successful save.
  const cardIdRef = useRef(newCardId())

  useEffect(() => {
    supabase
      .from('flashcards')
      .select('topic')
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map((d) => d.topic))].sort()
          setExistingTopics(unique)
        }
      })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.front.trim() || !form.back.trim() || !form.topic.trim()) {
      addToast('All fields are required', 'error')
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('flashcards').insert([
        {
          id: cardIdRef.current,
          front: form.front.trim(),
          back: form.back.trim(),
          topic: form.topic.trim(),
          front_image_url: form.front_image_url || null,
          back_image_url: form.back_image_url || null,
        },
      ])
      if (error) throw error
      addToast('Card added successfully!')
      const savedTopic = form.topic
      if (!existingTopics.includes(savedTopic.trim())) {
        setExistingTopics((prev) => [...prev, savedTopic.trim()].sort())
      }
      // New UUID so next card's images don't overlap
      cardIdRef.current = newCardId()
      setForm(emptyForm(savedTopic))
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleBulkImport() {
    let parsed
    try {
      parsed = JSON.parse(bulkJson)
      if (!Array.isArray(parsed)) throw new Error('Must be a JSON array')
      for (const item of parsed) {
        if (!item.front || !item.back || !item.topic) {
          throw new Error('Each item must have front, back, and topic')
        }
      }
    } catch (err) {
      addToast(`JSON error: ${err.message}`, 'error')
      return
    }

    setBulkSubmitting(true)
    try {
      const { error } = await supabase.from('flashcards').insert(
        parsed.map((item) => ({
          front: String(item.front).trim(),
          back: String(item.back).trim(),
          topic: String(item.topic).trim(),
        }))
      )
      if (error) throw error
      addToast(`${parsed.length} card${parsed.length !== 1 ? 's' : ''} imported!`)
      setBulkJson('')
      const newTopics = [...new Set(parsed.map((p) => p.topic.trim()))]
      setExistingTopics((prev) => [...new Set([...prev, ...newTopics])].sort())
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setBulkSubmitting(false)
    }
  }

  // When user changes image, delete the old one first
  function handleImageChange(side, newUrl) {
    const oldUrl = side === 'front' ? form.front_image_url : form.back_image_url
    if (oldUrl && oldUrl !== newUrl) deleteImage(oldUrl).catch(() => {})
    setForm((f) => ({ ...f, [`${side}_image_url`]: newUrl }))
  }

  const tabStyle = (isActive) => ({
    padding: '8px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: isActive ? '#6366f1' : 'transparent',
    color: isActive ? '#fff' : '#71717a',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.15s',
  })

  return (
    <>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              margin: '0 0 6px',
              fontSize: '28px',
              fontWeight: '700',
              color: '#f4f4f5',
              letterSpacing: '-0.03em',
            }}
          >
            Add Cards
          </h1>
          <p style={{ margin: 0, color: '#71717a', fontSize: '14px' }}>
            Create individual cards or bulk import from JSON
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '28px',
            width: 'fit-content',
          }}
        >
          <button onClick={() => setActiveTab('single')} style={tabStyle(activeTab === 'single')}>
            Single Card
          </button>
          <button onClick={() => setActiveTab('bulk')} style={tabStyle(activeTab === 'bulk')}>
            Bulk Import
          </button>
        </div>

        {activeTab === 'single' ? (
          <motion.div
            key="single"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Front */}
                  <div>
                    <label style={labelStyle}>Front (Question)</label>
                    <textarea
                      value={form.front}
                      onChange={(e) => setForm((f) => ({ ...f, front: e.target.value }))}
                      placeholder="Enter the question or term…"
                      rows={3}
                      required
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                      onBlur={(e) => (e.target.style.borderColor = '#2a2a2a')}
                    />
                    <div style={{ marginTop: '10px' }}>
                      <ImageUpload
                        cardId={cardIdRef.current}
                        side="front"
                        value={form.front_image_url}
                        onChange={(url) => handleImageChange('front', url)}
                        label="Front image (optional)"
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', backgroundColor: '#2a2a2a' }} />

                  {/* Back */}
                  <div>
                    <label style={labelStyle}>Back (Answer)</label>
                    <textarea
                      value={form.back}
                      onChange={(e) => setForm((f) => ({ ...f, back: e.target.value }))}
                      placeholder="Enter the answer or definition…"
                      rows={3}
                      required
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                      onBlur={(e) => (e.target.style.borderColor = '#2a2a2a')}
                    />
                    <div style={{ marginTop: '10px' }}>
                      <ImageUpload
                        cardId={cardIdRef.current}
                        side="back"
                        value={form.back_image_url}
                        onChange={(url) => handleImageChange('back', url)}
                        label="Back image (optional)"
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', backgroundColor: '#2a2a2a' }} />

                  {/* Topic */}
                  <div>
                    <label style={labelStyle}>Topic</label>
                    <input
                      list="topic-list"
                      value={form.topic}
                      onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                      placeholder="Select or type a topic…"
                      required
                      style={{ ...inputStyle, resize: 'none', height: '42px', paddingTop: '10px', paddingBottom: '10px' }}
                      onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                      onBlur={(e) => (e.target.style.borderColor = '#2a2a2a')}
                    />
                    <datalist id="topic-list">
                      {existingTopics.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                    {existingTopics.length > 0 && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {existingTopics.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, topic: t }))}
                            style={{
                              padding: '3px 10px',
                              borderRadius: '6px',
                              border:
                                form.topic === t
                                  ? '1px solid rgba(99,102,241,0.5)'
                                  : '1px solid #2a2a2a',
                              backgroundColor:
                                form.topic === t ? 'rgba(99,102,241,0.15)' : '#1a1a1a',
                              color: form.topic === t ? '#818cf8' : '#71717a',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => navigate('/')} style={btnSecondary}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ ...btnPrimary, flex: 1, opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Saving…' : 'Add Card'}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="bulk"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={cardStyle}>
              <label style={{ ...labelStyle, marginBottom: '10px', display: 'block' }}>
                JSON Array of Cards
              </label>
              <div
                style={{
                  backgroundColor: '#0f1117',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: '#71717a',
                  fontFamily: 'monospace',
                  lineHeight: 1.6,
                  whiteSpace: 'pre',
                }}
              >
                {`[\n  { "front": "Question 1", "back": "Answer 1", "topic": "My Topic" },\n  { "front": "Question 2", "back": "Answer 2", "topic": "My Topic" }\n]`}
              </div>
              <textarea
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                placeholder="Paste your JSON array here…"
                rows={10}
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.5 }}
                onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                onBlur={(e) => (e.target.style.borderColor = '#2a2a2a')}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => navigate('/')} style={btnSecondary}>
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                disabled={bulkSubmitting || !bulkJson.trim()}
                style={{
                  ...btnPrimary,
                  flex: 1,
                  opacity: bulkSubmitting || !bulkJson.trim() ? 0.6 : 1,
                }}
              >
                {bulkSubmitting ? 'Importing…' : 'Import Cards'}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  )
}

const cardStyle = {
  backgroundColor: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '12px',
  padding: '24px',
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: '#71717a',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '8px',
}

const inputStyle = {
  width: '100%',
  backgroundColor: '#0f0f0f',
  border: '1px solid #2a2a2a',
  borderRadius: '8px',
  color: '#f4f4f5',
  fontSize: '14px',
  padding: '10px 14px',
  fontFamily: 'inherit',
  resize: 'vertical',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const btnPrimary = {
  backgroundColor: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 20px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'background-color 0.15s',
}

const btnSecondary = {
  backgroundColor: 'transparent',
  color: '#71717a',
  border: '1px solid #2a2a2a',
  borderRadius: '10px',
  padding: '12px 20px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.15s',
}
