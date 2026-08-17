import imageCompression from 'browser-image-compression'
import { requireSupabase } from './supabase'
import { isDemoMode } from './demo-store'

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Refuse absurd inputs outright; anything smaller gets compressed down. */
const MAX_INPUT_BYTES = 25 * 1024 * 1024

export function isAcceptedImage(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(file.type)
}

export function isWithinInputLimit(file: File): boolean {
  return file.size <= MAX_INPUT_BYTES
}

/**
 * Shrink an image in the browser before it is ever uploaded.
 *
 * The teacher will be dropping in photos straight off a phone — 8–12MB is
 * normal, and uploading those as-is would be slow for her and slower for
 * every visitor afterwards. This gets them to a few hundred KB at a size
 * that is still generous for full-width display.
 */
export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.82,
  })
}

function extensionFor(file: File): string {
  if (file.type === 'image/webp') return 'webp'
  if (file.type === 'image/png') return 'png'
  return 'jpg'
}

/** Compress, upload to a bucket, and return the public URL. */
export async function uploadImage(
  bucket: string,
  file: File,
  onProgress?: (stage: 'compressing' | 'uploading') => void,
): Promise<string> {
  onProgress?.('compressing')

  if (isDemoMode) {
    // No object storage in demo mode, so the image is inlined as a data URL
    // and lives in localStorage. Compressed much harder than the real path
    // because base64 inflates by ~33% and the quota is only ~5MB.
    const small = await imageCompression(file, {
      maxSizeMB: 0.12,
      maxWidthOrHeight: 1000,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.72,
    })
    onProgress?.('uploading')
    return imageCompression.getDataUrlFromFile(small)
  }

  const compressed = await compressImage(file)

  onProgress?.('uploading')
  const supabase = requireSupabase()
  const path = `${crypto.randomUUID()}.${extensionFor(compressed)}`

  const { error } = await supabase.storage.from(bucket).upload(path, compressed, {
    cacheControl: '31536000',
    upsert: false,
    contentType: compressed.type,
  })
  if (error) throw error

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export const MAX_VIDEO_BYTES = 200 * 1024 * 1024
/** Above this, warn that a YouTube link would serve visitors better. */
export const LARGE_VIDEO_BYTES = 100 * 1024 * 1024

export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

/**
 * Upload a video file. Not compressed — transcoding in the browser is not
 * practical, which is exactly why the admin panel steers toward links.
 */
export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (isDemoMode) {
    // A video is far too large to inline, so demo mode keeps it as an
    // in-memory object URL: playable for this session, gone after a reload.
    onProgress?.(100)
    return URL.createObjectURL(file)
  }

  const supabase = requireSupabase()
  const extension = file.name.split('.').pop()?.toLowerCase() || 'mp4'
  const path = `${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from('videos').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  onProgress?.(100)
  return path
}

/** Human-readable size for the upload warnings. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
