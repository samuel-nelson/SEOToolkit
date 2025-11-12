import { PageMetadata } from '@/types'

export interface SEOAnalysis {
  score: number
  issues: string[]
  suggestions: string[]
  characterCounts: {
    title: { current: number; recommended: { min: number; max: number } }
    description: { current: number; recommended: { min: number; max: number } }
  }
  categoryScores: {
    onPage: number
    technical: number
    content: number
    social: number
  }
  priorityIssues: Array<{
    priority: 'high' | 'medium' | 'low'
    issue: string
    category: string
  }>
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

  // Calculate category-based scores
  let onPageScore = 100
  let technicalScore = 100
  let contentScore = 100
  let socialScore = 100
  
  // On-Page scoring
  if (titleLength === 0) onPageScore -= 25
  else if (titleLength < 30 || titleLength > 60) onPageScore -= 10
  
  if (descLength === 0) onPageScore -= 25
  else if (descLength < 120 || descLength > 160) onPageScore -= 10
  
  if (!h1) onPageScore -= 15
  
  // Technical scoring
  if (!canonical) technicalScore -= 20
  
  // Content scoring
  // Would need full page content for accurate scoring
  
  // Social scoring
  if (!ogTitle) socialScore -= 15
  if (!ogDescription) socialScore -= 15
  if (!ogImage) socialScore -= 10
  
  // Create priority issues list
  const priorityIssues: SEOAnalysis['priorityIssues'] = []
  
  if (titleLength === 0) {
    priorityIssues.push({ priority: 'high', issue: 'Missing title tag', category: 'on-page' })
  } else if (titleLength < 30 || titleLength > 60) {
    priorityIssues.push({ priority: 'high', issue: `Title length is ${titleLength < 30 ? 'too short' : 'too long'}`, category: 'on-page' })
  }
  
  if (descLength === 0) {
    priorityIssues.push({ priority: 'high', issue: 'Missing meta description', category: 'on-page' })
  } else if (descLength < 120 || descLength > 160) {
    priorityIssues.push({ priority: 'high', issue: `Description length is ${descLength < 120 ? 'too short' : 'too long'}`, category: 'on-page' })
  }
  
  if (!h1) {
    priorityIssues.push({ priority: 'high', issue: 'Missing H1 tag', category: 'on-page' })
  }
  
  if (!canonical) {
    priorityIssues.push({ priority: 'high', issue: 'Missing canonical URL', category: 'technical' })
  }
  
  if (!ogTitle || !ogDescription || !ogImage) {
    priorityIssues.push({ priority: 'medium', issue: 'Missing Open Graph tags', category: 'social' })
  }
  
  // Sort by priority
  priorityIssues.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
  
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
    },
    categoryScores: {
      onPage: Math.max(0, onPageScore),
      technical: Math.max(0, technicalScore),
      content: Math.max(0, contentScore),
      social: Math.max(0, socialScore)
    },
    priorityIssues
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

