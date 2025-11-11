import { PageMetadata, LighthouseResult, LighthouseHistory } from '@/types'

const METADATA_STORAGE_PREFIX = 'seo-metadata-'
const LIGHTHOUSE_STORAGE_PREFIX = 'seo-lighthouse-'

export function saveMetadataSession(sessionId: string, metadata: PageMetadata[]): void {
  try {
    localStorage.setItem(`${METADATA_STORAGE_PREFIX}${sessionId}`, JSON.stringify({
      metadata,
      timestamp: Date.now(),
    }))
  } catch (error) {
    console.error('Failed to save metadata session:', error)
  }
}

export function loadMetadataSession(sessionId: string): PageMetadata[] | null {
  try {
    const data = localStorage.getItem(`${METADATA_STORAGE_PREFIX}${sessionId}`)
    if (!data) return null
    
    const parsed = JSON.parse(data)
    return parsed.metadata || null
  } catch (error) {
    console.error('Failed to load metadata session:', error)
    return null
  }
}

export function getAllMetadataSessions(): Array<{ id: string; timestamp: number; count: number }> {
  const sessions: Array<{ id: string; timestamp: number; count: number }> = []
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(METADATA_STORAGE_PREFIX)) {
        const sessionId = key.replace(METADATA_STORAGE_PREFIX, '')
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const parsed = JSON.parse(data)
            sessions.push({
              id: sessionId,
              timestamp: parsed.timestamp || 0,
              count: parsed.metadata?.length || 0,
            })
          } catch {
            // Skip invalid entries
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to get metadata sessions:', error)
  }
  
  return sessions.sort((a, b) => b.timestamp - a.timestamp)
}

export function deleteMetadataSession(sessionId: string): void {
  try {
    localStorage.removeItem(`${METADATA_STORAGE_PREFIX}${sessionId}`)
  } catch (error) {
    console.error('Failed to delete metadata session:', error)
  }
}

export function saveLighthouseResult(result: LighthouseResult): void {
  try {
    const key = `${LIGHTHOUSE_STORAGE_PREFIX}${result.url}`
    const existing = localStorage.getItem(key)
    
    let history: LighthouseHistory
    if (existing) {
      try {
        history = JSON.parse(existing)
      } catch {
        history = { url: result.url, results: [] }
      }
    } else {
      history = { url: result.url, results: [] }
    }
    
    history.results.push(result)
    // Keep only last 50 results per URL
    if (history.results.length > 50) {
      history.results = history.results.slice(-50)
    }
    
    localStorage.setItem(key, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save Lighthouse result:', error)
  }
}

export function getLighthouseHistory(url: string): LighthouseHistory | null {
  try {
    const key = `${LIGHTHOUSE_STORAGE_PREFIX}${url}`
    const data = localStorage.getItem(key)
    if (!data) return null
    
    return JSON.parse(data) as LighthouseHistory
  } catch (error) {
    console.error('Failed to get Lighthouse history:', error)
    return null
  }
}

export function getAllLighthouseUrls(): string[] {
  const urls: string[] = []
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(LIGHTHOUSE_STORAGE_PREFIX)) {
        const url = key.replace(LIGHTHOUSE_STORAGE_PREFIX, '')
        urls.push(url)
      }
    }
  } catch (error) {
    console.error('Failed to get Lighthouse URLs:', error)
  }
  
  return urls
}

export function deleteLighthouseHistory(url: string): void {
  try {
    localStorage.removeItem(`${LIGHTHOUSE_STORAGE_PREFIX}${url}`)
  } catch (error) {
    console.error('Failed to delete Lighthouse history:', error)
  }
}

