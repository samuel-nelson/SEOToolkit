import { PageMetadata } from '@/types'

export interface TechnicalSEOAnalysis {
  urlStructure: {
    score: number
    length: number
    hasKeywords: boolean
    hasHyphens: boolean
    hasNumbers: boolean
    issues: string[]
  }
  canonicalUrl: {
    present: boolean
    valid: boolean
    selfReferencing: boolean
    issues: string[]
  }
  robotsMeta: {
    present: boolean
    noindex: boolean
    nofollow: boolean
    issues: string[]
  }
  schemaMarkup: {
    detected: boolean
    type?: string
    issues: string[]
  }
  mobileViewport: {
    present: boolean
    issues: string[]
  }
  overallScore: number
  suggestions: string[]
}

// Analyze URL structure
function analyzeURLStructure(url: string): TechnicalSEOAnalysis['urlStructure'] {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    
    const issues: string[] = []
    let score = 100
    
    // URL length check
    const fullUrlLength = url.length
    if (fullUrlLength > 100) {
      issues.push(`URL is too long (${fullUrlLength} chars, recommended: < 100)`)
      score -= 20
    } else if (fullUrlLength > 75) {
      issues.push(`URL is getting long (${fullUrlLength} chars)`)
      score -= 10
    }
    
    // Path length
    const pathLength = path.length
    if (pathLength > 60) {
      issues.push(`Path is too long (${pathLength} chars)`)
      score -= 15
    }
    
    // Check for keywords in URL
    const hasKeywords = path.split('/').some(segment => 
      segment.length > 3 && /[a-z]{3,}/.test(segment.toLowerCase())
    )
    
    if (!hasKeywords && path !== '/') {
      issues.push('URL path lacks descriptive keywords')
      score -= 15
    }
    
    // Check for hyphens (good) vs underscores (bad)
    const hasHyphens = path.includes('-')
    const hasUnderscores = path.includes('_')
    
    if (hasUnderscores) {
      issues.push('URL contains underscores (use hyphens instead)')
      score -= 10
    }
    
    // Check for numbers (can be okay, but might indicate dynamic URLs)
    const hasNumbers = /\d/.test(path)
    if (hasNumbers && path.match(/\d{4,}/)) {
      issues.push('URL contains long number sequences (may indicate dynamic URLs)')
      score -= 5
    }
    
    // Check for special characters
    if (/[^a-z0-9\-_\/]/i.test(path)) {
      issues.push('URL contains special characters (use only alphanumeric, hyphens, and slashes)')
      score -= 10
    }
    
    return {
      score: Math.max(0, score),
      length: fullUrlLength,
      hasKeywords,
      hasHyphens,
      hasNumbers,
      issues
    }
  } catch {
    return {
      score: 0,
      length: url.length,
      hasKeywords: false,
      hasHyphens: false,
      hasNumbers: false,
      issues: ['Invalid URL format']
    }
  }
}

// Analyze canonical URL
function analyzeCanonical(metadata: PageMetadata): TechnicalSEOAnalysis['canonicalUrl'] {
  const issues: string[] = []
  const present = !!metadata.canonical && metadata.canonical.trim().length > 0
  
  if (!present) {
    issues.push('Missing canonical URL')
    return { present: false, valid: false, selfReferencing: false, issues }
  }
  
  let valid = true
  try {
    new URL(metadata.canonical)
  } catch {
    valid = false
    issues.push('Canonical URL is not a valid URL')
  }
  
  const selfReferencing = metadata.canonical === metadata.url || 
                          metadata.canonical.replace(/\/$/, '') === metadata.url.replace(/\/$/, '')
  
  if (!selfReferencing && valid) {
    // Canonical points to different URL - this is okay for consolidation
    // but we should note it
  }
  
  return {
    present,
    valid,
    selfReferencing,
    issues
  }
}

// Analyze robots meta tag (would need full page HTML, using metadata as proxy)
function analyzeRobotsMeta(metadata: PageMetadata): TechnicalSEOAnalysis['robotsMeta'] {
  // In a real implementation, we'd parse the HTML for robots meta tag
  // For now, we'll check if we can infer from other data
  const issues: string[] = []
  const present = false // Would need to fetch page HTML
  
  // If we had the HTML, we'd check for:
  // <meta name="robots" content="noindex, nofollow">
  
  return {
    present,
    noindex: false,
    nofollow: false,
    issues: present ? [] : ['Unable to detect robots meta tag (requires page HTML)']
  }
}

// Check for schema markup (would need full page HTML)
function analyzeSchemaMarkup(metadata: PageMetadata): TechnicalSEOAnalysis['schemaMarkup'] {
  // In a real implementation, we'd parse the HTML for JSON-LD or microdata
  const issues: string[] = []
  const detected = false // Would need to fetch page HTML
  
  if (!detected) {
    issues.push('No schema markup detected (add JSON-LD for better rich snippets)')
  }
  
  return {
    detected,
    issues
  }
}

// Check for mobile viewport meta tag (would need full page HTML)
function analyzeMobileViewport(metadata: PageMetadata): TechnicalSEOAnalysis['mobileViewport'] {
  const issues: string[] = []
  // In a real implementation, we'd check for:
  // <meta name="viewport" content="width=device-width, initial-scale=1">
  const present = false // Would need to fetch page HTML
  
  if (!present) {
    issues.push('Mobile viewport meta tag not detected (required for mobile SEO)')
  }
  
  return {
    present,
    issues
  }
}

export function analyzeTechnicalSEO(metadata: PageMetadata): TechnicalSEOAnalysis {
  const urlStructure = analyzeURLStructure(metadata.url)
  const canonicalUrl = analyzeCanonical(metadata)
  const robotsMeta = analyzeRobotsMeta(metadata)
  const schemaMarkup = analyzeSchemaMarkup(metadata)
  const mobileViewport = analyzeMobileViewport(metadata)
  
  // Calculate overall score
  const scores = [
    urlStructure.score,
    canonicalUrl.present ? 100 : 0,
    robotsMeta.present ? 100 : 50, // Partial credit if we can't detect
    schemaMarkup.detected ? 100 : 0,
    mobileViewport.present ? 100 : 0
  ]
  
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  
  // Generate suggestions
  const suggestions: string[] = []
  
  if (!canonicalUrl.present) {
    suggestions.push('Add a canonical URL to prevent duplicate content issues')
  }
  
  if (urlStructure.issues.length > 0) {
    suggestions.push('Optimize URL structure: ' + urlStructure.issues[0])
  }
  
  if (!schemaMarkup.detected) {
    suggestions.push('Add structured data (JSON-LD) for better search result appearance')
  }
  
  if (!mobileViewport.present) {
    suggestions.push('Add mobile viewport meta tag for mobile-friendly SEO')
  }
  
  return {
    urlStructure,
    canonicalUrl,
    robotsMeta,
    schemaMarkup,
    mobileViewport,
    overallScore,
    suggestions
  }
}

