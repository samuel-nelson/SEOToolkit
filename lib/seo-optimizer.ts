import { PageMetadata } from '@/types'

export interface SEOAnalysis {
  score: number
  issues: string[]
  suggestions: string[]
  characterCounts: {
    title: { current: number; recommended: { min: number; max: number } }
    description: { current: number; recommended: { min: number; max: number } }
  }
}

export function analyzeSEO(metadata: PageMetadata): SEOAnalysis {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  // Title analysis
  const titleLength = metadata.title.length
  if (titleLength === 0) {
    issues.push('Missing title tag')
    score -= 20
  } else if (titleLength < 30) {
    issues.push(`Title too short (${titleLength} chars, recommended: 30-60)`)
    suggestions.push('Expand title to 30-60 characters for better SEO')
    score -= 10
  } else if (titleLength > 60) {
    issues.push(`Title too long (${titleLength} chars, recommended: 30-60)`)
    suggestions.push('Shorten title to 60 characters or less')
    score -= 10
  }

  // Description analysis
  const descLength = metadata.description.length
  if (descLength === 0) {
    issues.push('Missing meta description')
    score -= 20
  } else if (descLength < 120) {
    issues.push(`Description too short (${descLength} chars, recommended: 120-160)`)
    suggestions.push('Expand description to 120-160 characters')
    score -= 10
  } else if (descLength > 160) {
    issues.push(`Description too long (${descLength} chars, recommended: 120-160)`)
    suggestions.push('Shorten description to 160 characters or less')
    score -= 10
  }

  // H1 analysis
  if (!metadata.h1 || metadata.h1.length === 0) {
    issues.push('Missing H1 tag')
    suggestions.push('Add an H1 tag that summarizes the page content')
    score -= 10
  }

  // OG tags analysis
  if (!metadata.ogTitle) {
    issues.push('Missing Open Graph title')
    suggestions.push('Add og:title for better social media sharing')
    score -= 5
  }
  if (!metadata.ogDescription) {
    issues.push('Missing Open Graph description')
    suggestions.push('Add og:description for better social media sharing')
    score -= 5
  }
  if (!metadata.ogImage) {
    issues.push('Missing Open Graph image')
    suggestions.push('Add og:image for better social media previews')
    score -= 5
  }

  // Canonical URL
  if (!metadata.canonical) {
    issues.push('Missing canonical URL')
    suggestions.push('Add canonical URL to prevent duplicate content issues')
    score -= 5
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
    characterCounts: {
      title: {
        current: titleLength,
        recommended: { min: 30, max: 60 }
      },
      description: {
        current: descLength,
        recommended: { min: 120, max: 160 }
      }
    }
  }
}

export function findDuplicates(metadataList: PageMetadata[]): Map<string, number[]> {
  const duplicates = new Map<string, number[]>()
  
  // Check for duplicate titles
  const titleMap = new Map<string, number[]>()
  metadataList.forEach((meta, index) => {
    if (meta.title) {
      const normalized = meta.title.toLowerCase().trim()
      if (!titleMap.has(normalized)) {
        titleMap.set(normalized, [])
      }
      titleMap.get(normalized)!.push(index)
    }
  })
  
  titleMap.forEach((indices, title) => {
    if (indices.length > 1) {
      duplicates.set(`Duplicate title: "${title}"`, indices)
    }
  })
  
  // Check for duplicate descriptions
  const descMap = new Map<string, number[]>()
  metadataList.forEach((meta, index) => {
    if (meta.description) {
      const normalized = meta.description.toLowerCase().trim()
      if (!descMap.has(normalized)) {
        descMap.set(normalized, [])
      }
      descMap.get(normalized)!.push(index)
    }
  })
  
  descMap.forEach((indices, desc) => {
    if (indices.length > 1) {
      duplicates.set(`Duplicate description: "${desc.substring(0, 50)}..."`, indices)
    }
  })
  
  return duplicates
}

