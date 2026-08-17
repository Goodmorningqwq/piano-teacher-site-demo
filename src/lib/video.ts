import type { Video } from './database.types'
import { publicStorageUrl } from './supabase'

export type ParsedVideoLink = {
  source: 'youtube' | 'vimeo'
  id: string
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const VIMEO_ID = /^\d{6,12}$/

/**
 * Pull a video id out of whatever the teacher pasted.
 *
 * Handles the forms people actually paste: full watch URLs, youtu.be
 * short links, /embed/ and /shorts/ paths, share links carrying tracking
 * params, and a bare id. Returns null when it cannot be sure, so the admin
 * panel can say so rather than silently saving a broken embed.
 */
export function parseVideoLink(input: string): ParsedVideoLink | null {
  const raw = input.trim()
  if (!raw) return null

  // A bare id, pasted without the surrounding URL.
  if (YOUTUBE_ID.test(raw)) return { source: 'youtube', id: raw }
  if (VIMEO_ID.test(raw)) return { source: 'vimeo', id: raw }

  let url: URL
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  const segments = url.pathname.split('/').filter(Boolean)

  if (host === 'youtu.be') {
    const id = segments[0]
    return id && YOUTUBE_ID.test(id) ? { source: 'youtube', id } : null
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const queryId = url.searchParams.get('v')
    if (queryId && YOUTUBE_ID.test(queryId)) return { source: 'youtube', id: queryId }

    // /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
    const [first, second] = segments
    if (['embed', 'shorts', 'live', 'v'].includes(first) && second && YOUTUBE_ID.test(second)) {
      return { source: 'youtube', id: second }
    }
    return null
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = segments.find((segment) => VIMEO_ID.test(segment))
    return id ? { source: 'vimeo', id } : null
  }

  return null
}

/** Embed URL for the lightbox iframe. */
export function embedUrl(video: Video): string | null {
  if (video.source_type === 'youtube' && video.external_id) {
    // youtube-nocookie keeps the embed from writing tracking cookies
    // before the visitor has done anything.
    return `https://www.youtube-nocookie.com/embed/${video.external_id}?autoplay=1&rel=0&modestbranding=1`
  }
  if (video.source_type === 'vimeo' && video.external_id) {
    return `https://player.vimeo.com/video/${video.external_id}?autoplay=1&title=0&byline=0`
  }
  return null
}

/** Direct file URL for an uploaded video. */
export function uploadedVideoUrl(video: Video): string | null {
  if (video.source_type !== 'upload' || !video.storage_path) return null

  // Demo mode stores a ready-made blob: URL rather than a bucket object
  // path, so pass anything already absolute straight through.
  if (/^(blob:|data:|https?:)/.test(video.storage_path)) return video.storage_path

  return publicStorageUrl('videos', video.storage_path)
}

/**
 * Best available still for a video card.
 *
 * An explicit poster always wins — the teacher may have chosen a nicer
 * frame than YouTube's automatic one. Uploads have no automatic option,
 * which is why the admin panel insists on a poster for them.
 */
export function posterUrl(video: Video): string | null {
  if (video.poster_url) return video.poster_url
  if (video.source_type === 'youtube' && video.external_id) {
    return `https://i.ytimg.com/vi/${video.external_id}/hqdefault.jpg`
  }
  return null
}

export function isPlayable(video: Video): boolean {
  return video.source_type !== 'placeholder'
}

/** "4:07" — omits the hour component unless the video actually needs it. */
export function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${mins}:${pad(secs)}`
}
