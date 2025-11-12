import { PageMetadata } from '@/types'

export interface KeywordAnalysis {
  primaryKeyword?: string
  secondaryKeywords: string[]
  keywordDensity: Map<string, number>
  keywordPlacement: {
    inTitle: boolean
    inH1: boolean
    inDescription: boolean
    inFirstParagraph: boolean
  }
  keywordStuffing: boolean
  suggestions: string[]
}

export interface LongTailKeyword {
  keyword: string
  searchVolume?: number
  difficulty?: number
}

// Extract keywords from text
function extractKeywords(text: string, minLength: number = 3): string[] {
  if (!text) return []
  
  // Remove HTML tags and special characters, convert to lowercase
  const cleanText = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .toLowerCase()
    .trim()
  
  // Split into words and filter
  const words = cleanText
    .split(/\s+/)
    .filter(word => word.length >= minLength && !isStopWord(word))
  
  // Count word frequency
  const wordCount = new Map<string, number>()
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1)
  })
  
  // Return sorted by frequency
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
}

// Common stop words to filter out
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
    'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'than',
    'too', 'very', 'just', 'now'
  ])
  return stopWords.has(word.toLowerCase())
}

// Calculate keyword density
function calculateDensity(text: string, keyword: string): number {
  if (!text || !keyword) return 0
  
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ')
  const cleanKeyword = keyword.toLowerCase()
  
  const words = cleanText.split(/\s+/).filter(w => w.length > 0)
  const keywordCount = words.filter(w => w === cleanKeyword || w.includes(cleanKeyword)).length
  
  return words.length > 0 ? (keywordCount / words.length) * 100 : 0
}

// Detect keyword stuffing (density > 3%)
function detectKeywordStuffing(text: string, keyword: string): boolean {
  return calculateDensity(text, keyword) > 3
}

// Analyze keyword placement
function analyzePlacement(metadata: PageMetadata, keyword: string): KeywordAnalysis['keywordPlacement'] {
  const lowerKeyword = keyword.toLowerCase()
  
  return {
    inTitle: metadata.title.toLowerCase().includes(lowerKeyword),
    inH1: metadata.h1.toLowerCase().includes(lowerKeyword),
    inDescription: metadata.description.toLowerCase().includes(lowerKeyword),
    inFirstParagraph: false // Would need full page content
  }
}

// Generate long-tail keyword suggestions
function generateLongTailKeywords(baseKeyword: string): LongTailKeyword[] {
  const modifiers = [
    'how to', 'what is', 'best', 'top', 'guide to', 'review of',
    'buy', 'price', 'cost', 'cheap', 'affordable', 'premium',
    'near me', 'online', '2024', '2025', 'vs', 'comparison'
  ]
  
  return modifiers.map(modifier => ({
    keyword: `${modifier} ${baseKeyword}`,
  }))
}

export function analyzeKeywords(metadata: PageMetadata): KeywordAnalysis {
  // Combine all text fields for keyword extraction
  const combinedText = [
    metadata.title,
    metadata.description,
    metadata.h1,
    metadata.ogTitle,
    metadata.ogDescription,
  ].filter(Boolean).join(' ')
  
  // Extract potential keywords
  const keywords = extractKeywords(combinedText, 4) // Minimum 4 characters
  
  // Identify primary keyword (most frequent, appears in title)
  const primaryKeyword = keywords.find(kw => 
    metadata.title.toLowerCase().includes(kw.toLowerCase())
  ) || keywords[0]
  
  // Secondary keywords (top 5 excluding primary)
  const secondaryKeywords = keywords
    .filter(kw => kw !== primaryKeyword)
    .slice(0, 5)
  
  // Calculate density for primary keyword
  const densityMap = new Map<string, number>()
  if (primaryKeyword) {
    densityMap.set(primaryKeyword, calculateDensity(combinedText, primaryKeyword))
  }
  secondaryKeywords.forEach(kw => {
    densityMap.set(kw, calculateDensity(combinedText, kw))
  })
  
  // Check for keyword stuffing
  const keywordStuffing = primaryKeyword 
    ? detectKeywordStuffing(combinedText, primaryKeyword)
    : false
  
  // Analyze placement
  const keywordPlacement = primaryKeyword
    ? analyzePlacement(metadata, primaryKeyword)
    : {
        inTitle: false,
        inH1: false,
        inDescription: false,
        inFirstParagraph: false
      }
  
  // Generate suggestions
  const suggestions: string[] = []
  
  if (primaryKeyword) {
    if (!keywordPlacement.inTitle) {
      suggestions.push(`Add primary keyword "${primaryKeyword}" to the title tag`)
    }
    if (!keywordPlacement.inH1) {
      suggestions.push(`Include primary keyword "${primaryKeyword}" in the H1 tag`)
    }
    if (!keywordPlacement.inDescription) {
      suggestions.push(`Include primary keyword "${primaryKeyword}" in the meta description`)
    }
    if (keywordStuffing) {
      suggestions.push(`Warning: Keyword stuffing detected. Reduce usage of "${primaryKeyword}"`)
    }
    if (calculateDensity(combinedText, primaryKeyword) < 0.5) {
      suggestions.push(`Consider increasing usage of primary keyword "${primaryKeyword}" (current density is low)`)
    }
  } else {
    suggestions.push('No clear primary keyword identified. Consider adding a focus keyword to your content.')
  }
  
  return {
    primaryKeyword,
    secondaryKeywords,
    keywordDensity: densityMap,
    keywordPlacement,
    keywordStuffing,
    suggestions
  }
}

export function getLongTailSuggestions(keyword: string): LongTailKeyword[] {
  return generateLongTailKeywords(keyword)
}

