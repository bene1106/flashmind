import { useRef, useState } from 'react'
import { uploadImage, deleteImage } from '../lib/storage'
import Spinner from './Spinner'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export default function ImageUpload({ cardId, side, value, onChange, label = 'Image (optional)' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, GIF, or WebP images are allowed.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Image must be under 5 MB.')
      return
    }

    setError(null)
    setUploading(true)
    try {
      const url = await uploadImage(file, cardId, side)
      onChange(url)
    } catch (err) {
      const msg = err.message || ''
      if (
        msg.toLowerCase().includes('bucket') ||
        msg.toLowerCase().includes('not authorized') ||
        msg.toLowerCase().includes('row-level') ||
        msg.toLowerCase().includes('policy')
      ) {
        setError(
          'Storage not configured. Create a public "flashcard-images" bucket in Supabase Storage and enable public uploads.'
        )
      } else {
        setError(msg || 'Upload failed.')
      }
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    if (value) await deleteImage(value).catch(() => {})
    onChange(null)
  }

  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          color: '#52525b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
          fontWeight: '600',
        }}
      >
        {label}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {value ? (
        <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={value}
              alt=""
              style={{
                display: 'block',
                maxHeight: '120px',
                maxWidth: '280px',
                borderRadius: '8px',
                border: '1px solid #2a2a2a',
                objectFit: 'contain',
                backgroundColor: '#0a0a0a',
              }}
            />
            {/* Overlay action buttons */}
            <div
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                display: 'flex',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={overlayBtn}
                title="Replace image"
              >
                ↩
              </button>
              <button
                type="button"
                onClick={handleRemove}
                style={{ ...overlayBtn, backgroundColor: 'rgba(200,30,30,0.85)' }}
                title="Remove image"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            backgroundColor: 'transparent',
            border: '1px dashed #3a3a3a',
            borderRadius: '8px',
            color: '#52525b',
            cursor: uploading ? 'default' : 'pointer',
            fontSize: '13px',
            transition: 'all 0.15s',
            opacity: uploading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!uploading) {
              e.currentTarget.style.borderColor = '#6366f1'
              e.currentTarget.style.color = '#818cf8'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#3a3a3a'
            e.currentTarget.style.color = '#52525b'
          }}
        >
          {uploading ? (
            <>
              <Spinner size={14} />
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '15px' }}>🖼</span>
              <span>Add image</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#ef4444', lineHeight: 1.4 }}>
          {error}
        </p>
      )}
    </div>
  )
}

const overlayBtn = {
  width: '26px',
  height: '26px',
  borderRadius: '5px',
  backgroundColor: 'rgba(0,0,0,0.75)',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  backdropFilter: 'blur(4px)',
}
