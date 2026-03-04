import { supabase } from './supabase'

const BUCKET = 'flashcard-images'

/**
 * Upload an image file to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadImage(file, cardId, side) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${cardId}/${side}_${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete an image from Supabase Storage by its public URL.
 * Silently ignores missing files.
 */
export async function deleteImage(url) {
  if (!url) return
  const marker = `/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return
  const path = decodeURIComponent(url.slice(idx + marker.length).split('?')[0])
  await supabase.storage.from(BUCKET).remove([path])
}
