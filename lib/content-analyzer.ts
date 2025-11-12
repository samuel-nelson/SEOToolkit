import { PageMetadata } from '@/types'

export interface ContentQualityMetrics {
  wordCount: number
  readabilityScore: number
  readabilityLevel: string
  h1Count: number
  h2Count: number
  h3Count: number
  headerHierarchyValid: boolean
  imageCount: number
  imagesWithAlt: number
  altTextCompleteness: number
  issues: string[]
  suggestions: string[]
}

// Calculate Flesch Reading Ease score
// Score 90-100: Very Easy, 80-89: Easy, 70-79: Fairly Easy, 60-69: Standard, 50-59: Fairly Difficult, 30-49: Difficult, 0-29: Very Difficult
function calculateReadability(text: string): { score: number; level: string } {
  if (!text || text.trim().length === 0) {
    return { score: 0, level: 'No content' }
  }

  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, ' ')
  
  // Count sentences (periods, exclamation, question marks)
  const sentences = cleanText.match(/[.!?]+/g)?.length || 1
  
  // Count words
  const words = cleanText.split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length
  
  // Count syllables (approximate: count vowel groups)
  let syllables = 0
  words.forEach(word => {
    const lowerWord = word.toLowerCase()
    const vowelGroups = lowerWord.match(/[aeiouy]+/g) || []
    syllables += vowelGroups.length
    // Adjust for silent e
    if (lowerWord.endsWith('e') && vowelGroups.length > 1) {
      syllables--
    }
  })
  
  // Flesch Reading Ease formula
  const avgSentenceLength = wordCount / sentences
  const avgSyllablesPerWord = syllables / wordCount
  
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
  
  let level: string
  if (score >= 90) level = 'Very Easy'
  else if (score >= 80) level = 'Easy'
  else if (score >= 70) level = 'Fairly Easy'
  else if (score >= 60) level = 'Standard'
  else if (score >= 50) level = 'Fairly Difficult'
  else if (score >= 30) level = 'Difficult'
  else level = 'Very Difficult'
  
  return { score: Math.max(0, Math.min(100, score)), level }
}

// Count words in combined text
function countWords(metadata: PageMetadata): number {
  const text = [
    metadata.title,
    metadata.description,
    metadata.h1,
    metadata.ogTitle,
    metadata.ogDescription,
  ].filter(Boolean).join(' ')
  
  return text.split(/\s+/).filter(w => w.length > 0).length
}

export function analyzeContentQuality(metadata: PageMetadata): ContentQualityMetrics {
  const combinedText = [
    metadata.title,
    metadata.description,
    metadata.h1,
  ].filter(Boolean).join(' ')
  
  const wordCount = countWords(metadata)
  const readability = calculateReadability(combinedText)
  
  // Header analysis (would need full page content, using H1 as proxy)
  const h1Count = metadata.h1 ? 1 : 0
  const h2Count = 0 // Would need full page content
  const h3Count = 0 // Would need full page content
  
  // Header hierarchy validation (basic check)
  const headerHierarchyValid = h1Count === 1 // Should have exactly one H1
  
  // Image analysis (would need full page content)
  const imageCount = 0
  const imagesWithAlt = 0
  const altTextCompleteness = imageCount > 0 ? (imagesWithAlt / imageCount) * 100 : 100
  
  const issues: string[] = []
  const suggestions: string[] = []
  
  // Word count analysis
  if (wordCount < 300) {
    issues.push('Low word count (less than 300 words recommended)')
    suggestions.push('Consider adding more content to improve SEO and user engagement')
  }
  
  // Readability analysis
  if (readability.score < 30) {
    issues.push('Content is very difficult to read')
    suggestions.push('Simplify language and sentence structure for better readability')
  } else if (readability.score < 50) {
    issues.push('Content is difficult to read')
    suggestions.push('Consider simplifying language for broader audience')
  }
  
  // H1 analysis
  if (h1Count === 0) {
    issues.push('Missing H1 tag')
    suggestions.push('Add an H1 tag with your primary keyword')
  } else if (h1Count > 1) {
    issues.push('Multiple H1 tags found (should be only one)')
    suggestions.push('Use only one H1 tag per page, use H2-H6 for subheadings')
  }
  
  // Image alt text (if we had image data)
  if (imageCount > 0 && altTextCompleteness < 100) {
    issues.push(`${imageCount - imagesWithAlt} images missing alt text`)
    suggestions.push('Add descriptive alt text to all images for accessibility and SEO')
  }
  
  return {
    wordCount,
    readabilityScore: readability.score,
    readabilityLevel: readability.level,
    h1Count,
    h2Count,
    h3Count,
    headerHierarchyValid,
    imageCount,
    imagesWithAlt,
    altTextCompleteness,
    issues,
    suggestions
  }
}

