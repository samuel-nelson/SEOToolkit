import { PageMetadata } from '@/types'
import { analyzeSEO } from './seo-optimizer'
import { analyzeKeywords } from './keyword-analyzer'
import { analyzeContentQuality } from './content-analyzer'
import { analyzeTechnicalSEO } from './technical-seo'

export interface ChecklistItem {
  id: string
  category: 'on-page' | 'technical' | 'content' | 'social' | 'mobile'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  status: 'pass' | 'fail' | 'warning'
  action: string
}

export interface SEOChecklist {
  items: ChecklistItem[]
  passed: number
  failed: number
  warnings: number
  score: number
}

export function generateSEOChecklist(metadata: PageMetadata): SEOChecklist {
  const items: ChecklistItem[] = []
  
  const seoAnalysis = analyzeSEO(metadata)
  const keywordAnalysis = analyzeKeywords(metadata)
  const contentQuality = analyzeContentQuality(metadata)
  const technicalSEO = analyzeTechnicalSEO(metadata)
  
  // On-Page SEO Checklist
  items.push({
    id: 'title-present',
    category: 'on-page',
    priority: 'high',
    title: 'Title Tag Present',
    description: 'Page has a title tag',
    status: metadata.title ? 'pass' : 'fail',
    action: metadata.title ? 'Title tag is present' : 'Add a title tag to your page'
  })
  
  items.push({
    id: 'title-length',
    category: 'on-page',
    priority: 'high',
    title: 'Title Length Optimal',
    description: 'Title is between 30-60 characters',
    status: seoAnalysis.characterCounts.title.current >= 30 && seoAnalysis.characterCounts.title.current <= 60 
      ? 'pass' 
      : seoAnalysis.characterCounts.title.current === 0 ? 'fail' : 'warning',
    action: seoAnalysis.characterCounts.title.current === 0 
      ? 'Add a title tag'
      : seoAnalysis.characterCounts.title.current < 30
      ? `Expand title to 30-60 characters (currently ${seoAnalysis.characterCounts.title.current})`
      : `Shorten title to 60 characters or less (currently ${seoAnalysis.characterCounts.title.current})`
  })
  
  items.push({
    id: 'meta-description',
    category: 'on-page',
    priority: 'high',
    title: 'Meta Description Present',
    description: 'Page has a meta description',
    status: metadata.description ? 'pass' : 'fail',
    action: metadata.description ? 'Meta description is present' : 'Add a meta description tag'
  })
  
  items.push({
    id: 'meta-description-length',
    category: 'on-page',
    priority: 'high',
    title: 'Meta Description Length Optimal',
    description: 'Description is between 120-160 characters',
    status: seoAnalysis.characterCounts.description.current >= 120 && seoAnalysis.characterCounts.description.current <= 160
      ? 'pass'
      : seoAnalysis.characterCounts.description.current === 0 ? 'fail' : 'warning',
    action: seoAnalysis.characterCounts.description.current === 0
      ? 'Add a meta description'
      : seoAnalysis.characterCounts.description.current < 120
      ? `Expand description to 120-160 characters (currently ${seoAnalysis.characterCounts.description.current})`
      : `Shorten description to 160 characters or less (currently ${seoAnalysis.characterCounts.description.current})`
  })
  
  items.push({
    id: 'h1-present',
    category: 'on-page',
    priority: 'high',
    title: 'H1 Tag Present',
    description: 'Page has exactly one H1 tag',
    status: contentQuality.h1Count === 1 ? 'pass' : contentQuality.h1Count === 0 ? 'fail' : 'warning',
    action: contentQuality.h1Count === 0 
      ? 'Add an H1 tag with your primary keyword'
      : contentQuality.h1Count > 1
      ? `Use only one H1 tag (found ${contentQuality.h1Count})`
      : 'H1 tag is present'
  })
  
  items.push({
    id: 'keyword-in-title',
    category: 'on-page',
    priority: 'high',
    title: 'Primary Keyword in Title',
    description: 'Primary keyword appears in title tag',
    status: keywordAnalysis.primaryKeyword && keywordAnalysis.keywordPlacement.inTitle ? 'pass' : 'warning',
    action: keywordAnalysis.primaryKeyword
      ? keywordAnalysis.keywordPlacement.inTitle
        ? 'Primary keyword is in title'
        : `Add primary keyword "${keywordAnalysis.primaryKeyword}" to title`
      : 'Identify and add a primary keyword to your title'
  })
  
  items.push({
    id: 'keyword-in-h1',
    category: 'on-page',
    priority: 'medium',
    title: 'Primary Keyword in H1',
    description: 'Primary keyword appears in H1 tag',
    status: keywordAnalysis.primaryKeyword && keywordAnalysis.keywordPlacement.inH1 ? 'pass' : 'warning',
    action: keywordAnalysis.primaryKeyword
      ? keywordAnalysis.keywordPlacement.inH1
        ? 'Primary keyword is in H1'
        : `Add primary keyword "${keywordAnalysis.primaryKeyword}" to H1`
      : 'Identify and add a primary keyword to your H1'
  })
  
  items.push({
    id: 'keyword-in-description',
    category: 'on-page',
    priority: 'medium',
    title: 'Primary Keyword in Description',
    description: 'Primary keyword appears in meta description',
    status: keywordAnalysis.primaryKeyword && keywordAnalysis.keywordPlacement.inDescription ? 'pass' : 'warning',
    action: keywordAnalysis.primaryKeyword
      ? keywordAnalysis.keywordPlacement.inDescription
        ? 'Primary keyword is in description'
        : `Add primary keyword "${keywordAnalysis.primaryKeyword}" to description`
      : 'Identify and add a primary keyword to your description'
  })
  
  items.push({
    id: 'keyword-stuffing',
    category: 'on-page',
    priority: 'high',
    title: 'No Keyword Stuffing',
    description: 'Keyword density is within acceptable range',
    status: keywordAnalysis.keywordStuffing ? 'fail' : 'pass',
    action: keywordAnalysis.keywordStuffing
      ? 'Reduce keyword usage to avoid keyword stuffing penalty'
      : 'Keyword density is optimal'
  })
  
  // Technical SEO Checklist
  items.push({
    id: 'canonical-url',
    category: 'technical',
    priority: 'high',
    title: 'Canonical URL Present',
    description: 'Page has a canonical URL',
    status: technicalSEO.canonicalUrl.present ? 'pass' : 'fail',
    action: technicalSEO.canonicalUrl.present
      ? 'Canonical URL is present'
      : 'Add a canonical URL to prevent duplicate content issues'
  })
  
  items.push({
    id: 'url-structure',
    category: 'technical',
    priority: 'medium',
    title: 'URL Structure Optimized',
    description: 'URL is clean and keyword-rich',
    status: technicalSEO.urlStructure.score >= 80 ? 'pass' : technicalSEO.urlStructure.score >= 60 ? 'warning' : 'fail',
    action: technicalSEO.urlStructure.issues.length > 0
      ? technicalSEO.urlStructure.issues[0]
      : 'URL structure is optimized'
  })
  
  items.push({
    id: 'schema-markup',
    category: 'technical',
    priority: 'medium',
    title: 'Schema Markup Present',
    description: 'Page has structured data markup',
    status: technicalSEO.schemaMarkup.detected ? 'pass' : 'warning',
    action: technicalSEO.schemaMarkup.detected
      ? 'Schema markup is present'
      : 'Add JSON-LD structured data for better rich snippets'
  })
  
  // Social Media Checklist
  items.push({
    id: 'og-title',
    category: 'social',
    priority: 'medium',
    title: 'Open Graph Title',
    description: 'Page has og:title tag',
    status: metadata.ogTitle ? 'pass' : 'warning',
    action: metadata.ogTitle ? 'Open Graph title is present' : 'Add og:title for better social sharing'
  })
  
  items.push({
    id: 'og-description',
    category: 'social',
    priority: 'medium',
    title: 'Open Graph Description',
    description: 'Page has og:description tag',
    status: metadata.ogDescription ? 'pass' : 'warning',
    action: metadata.ogDescription ? 'Open Graph description is present' : 'Add og:description for better social sharing'
  })
  
  items.push({
    id: 'og-image',
    category: 'social',
    priority: 'medium',
    title: 'Open Graph Image',
    description: 'Page has og:image tag',
    status: metadata.ogImage ? 'pass' : 'warning',
    action: metadata.ogImage ? 'Open Graph image is present' : 'Add og:image for better social media previews'
  })
  
  // Content Quality Checklist
  items.push({
    id: 'word-count',
    category: 'content',
    priority: 'medium',
    title: 'Adequate Word Count',
    description: 'Page has sufficient content (300+ words recommended)',
    status: contentQuality.wordCount >= 300 ? 'pass' : contentQuality.wordCount >= 150 ? 'warning' : 'fail',
    action: contentQuality.wordCount >= 300
      ? 'Word count is adequate'
      : `Add more content (currently ${contentQuality.wordCount} words, recommended: 300+)`
  })
  
  items.push({
    id: 'readability',
    category: 'content',
    priority: 'low',
    title: 'Content Readability',
    description: 'Content is easy to read',
    status: contentQuality.readabilityScore >= 60 ? 'pass' : contentQuality.readabilityScore >= 30 ? 'warning' : 'fail',
    action: contentQuality.readabilityScore >= 60
      ? `Content readability is good (${contentQuality.readabilityLevel})`
      : `Improve readability (currently ${contentQuality.readabilityLevel})`
  })
  
  // Mobile Checklist
  items.push({
    id: 'mobile-viewport',
    category: 'mobile',
    priority: 'high',
    title: 'Mobile Viewport Meta Tag',
    description: 'Page has mobile viewport meta tag',
    status: technicalSEO.mobileViewport.present ? 'pass' : 'warning',
    action: technicalSEO.mobileViewport.present
      ? 'Mobile viewport tag is present'
      : 'Add mobile viewport meta tag for mobile SEO'
  })
  
  // Calculate scores
  const passed = items.filter(i => i.status === 'pass').length
  const failed = items.filter(i => i.status === 'fail').length
  const warnings = items.filter(i => i.status === 'warning').length
  const score = Math.round((passed / items.length) * 100)
  
  return {
    items,
    passed,
    failed,
    warnings,
    score
  }
}

