import { PageMetadata } from '@/types'

export interface BulkOptimizationPattern {
  name: string
  description: string
  apply: (metadata: PageMetadata, pattern: string) => PageMetadata
}

export interface BulkOptimizationTemplate {
  name: string
  description: string
  generate: (url: string, data: Record<string, string>) => Partial<PageMetadata>
}

// Pattern-based optimizations
export const bulkPatterns: BulkOptimizationPattern[] = [
  {
    name: 'Add Brand to Title',
    description: 'Append brand name to all titles',
    apply: (meta, pattern) => ({
      ...meta,
      title: meta.title ? `${meta.title} ${pattern}` : pattern
    })
  },
  {
    name: 'Add Brand to Description',
    description: 'Append brand name to all descriptions',
    apply: (meta, pattern) => ({
      ...meta,
      description: meta.description ? `${meta.description} ${pattern}` : pattern
    })
  },
  {
    name: 'Prefix Title',
    description: 'Add prefix to all titles',
    apply: (meta, pattern) => ({
      ...meta,
      title: meta.title ? `${pattern} ${meta.title}` : pattern
    })
  },
  {
    name: 'Suffix Description',
    description: 'Add suffix to all descriptions',
    apply: (meta, pattern) => ({
      ...meta,
      description: meta.description ? `${meta.description} ${pattern}` : pattern
    })
  },
  {
    name: 'Replace in Title',
    description: 'Replace text in all titles (format: old|new)',
    apply: (meta, pattern) => {
      const [oldText, newText] = pattern.split('|')
      if (!oldText || !newText) return meta
      return {
        ...meta,
        title: meta.title.replace(new RegExp(oldText, 'gi'), newText)
      }
    }
  },
  {
    name: 'Replace in Description',
    description: 'Replace text in all descriptions (format: old|new)',
    apply: (meta, pattern) => {
      const [oldText, newText] = pattern.split('|')
      if (!oldText || !newText) return meta
      return {
        ...meta,
        description: meta.description.replace(new RegExp(oldText, 'gi'), newText)
      }
    }
  }
]

// Template-based generation
export const bulkTemplates: BulkOptimizationTemplate[] = [
  {
    name: 'Product Page Template',
    description: 'Generate metadata for product pages',
    generate: (url, data) => {
      const productName = data.productName || extractFromUrl(url, 'product')
      const brand = data.brand || ''
      const price = data.price || ''
      
      return {
        title: `${productName}${brand ? ` by ${brand}` : ''}${price ? ` - $${price}` : ''} | Buy Online`,
        description: `Shop ${productName}${brand ? ` by ${brand}` : ''}${price ? ` for $${price}` : ''}. ${data.description || 'High quality product with fast shipping.'}`,
        ogTitle: `${productName}${brand ? ` by ${brand}` : ''}`,
        ogDescription: `Shop ${productName}${brand ? ` by ${brand}` : ''} online. ${data.description || ''}`,
        h1: productName
      }
    }
  },
  {
    name: 'Blog Post Template',
    description: 'Generate metadata for blog posts',
    generate: (url, data) => {
      const postTitle = data.postTitle || extractFromUrl(url, 'post')
      const author = data.author || ''
      const date = data.date || new Date().toLocaleDateString()
      
      return {
        title: `${postTitle}${author ? ` by ${author}` : ''} | Blog`,
        description: `Read about ${postTitle.toLowerCase()}. ${data.description || 'Latest blog post with insights and updates.'} Published ${date}.`,
        ogTitle: postTitle,
        ogDescription: `Read about ${postTitle.toLowerCase()}. ${data.description || ''}`,
        h1: postTitle
      }
    }
  },
  {
    name: 'Category Page Template',
    description: 'Generate metadata for category pages',
    generate: (url, data) => {
      const category = data.category || extractFromUrl(url, 'category')
      const itemCount = data.itemCount || ''
      
      return {
        title: `${category}${itemCount ? ` (${itemCount} items)` : ''} | Shop Now`,
        description: `Browse our collection of ${category.toLowerCase()}. ${data.description || 'Find the perfect items with fast shipping and great prices.'}`,
        ogTitle: category,
        ogDescription: `Browse our collection of ${category.toLowerCase()}. ${data.description || ''}`,
        h1: category
      }
    }
  },
  {
    name: 'Landing Page Template',
    description: 'Generate metadata for landing pages',
    generate: (url, data) => {
      const pageTitle = data.pageTitle || extractFromUrl(url, 'page')
      const cta = data.cta || 'Learn More'
      
      return {
        title: `${pageTitle} | ${data.brand || 'Our Company'}`,
        description: `${data.description || `Discover ${pageTitle.toLowerCase()}. ${cta} today!`}`,
        ogTitle: pageTitle,
        ogDescription: data.description || `Discover ${pageTitle.toLowerCase()}. ${cta} today!`,
        h1: pageTitle
      }
    }
  }
]

// Extract meaningful text from URL
function extractFromUrl(url: string, type: string): string {
  try {
    const urlObj = new URL(url)
    const pathSegments = urlObj.pathname.split('/').filter(s => s.length > 0)
    
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1]
      // Convert URL-friendly format to readable text
      return lastSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    
    return urlObj.hostname.replace('www.', '').split('.')[0]
  } catch {
    return 'Page'
  }
}

// Apply pattern to multiple metadata items
export function applyBulkPattern(
  metadataList: PageMetadata[],
  pattern: BulkOptimizationPattern,
  patternValue: string
): PageMetadata[] {
  return metadataList.map(meta => pattern.apply(meta, patternValue))
}

// Apply template to multiple metadata items
export function applyBulkTemplate(
  metadataList: PageMetadata[],
  template: BulkOptimizationTemplate,
  templateData: Record<string, string>
): PageMetadata[] {
  return metadataList.map(meta => ({
    ...meta,
    ...template.generate(meta.url, templateData)
  }))
}

// Generate metadata from URL pattern
export function generateFromUrlPattern(
  url: string,
  titlePattern: string,
  descriptionPattern: string
): Partial<PageMetadata> {
  // Extract variables from URL
  const urlObj = new URL(url)
  const pathSegments = urlObj.pathname.split('/').filter(s => s.length > 0)
  const domain = urlObj.hostname.replace('www.', '')
  
  // Replace placeholders
  let title = titlePattern
    .replace(/{url}/g, url)
    .replace(/{domain}/g, domain)
    .replace(/{path}/g, urlObj.pathname)
    .replace(/{last-segment}/g, pathSegments[pathSegments.length - 1] || '')
    .replace(/{first-segment}/g, pathSegments[0] || '')
  
  let description = descriptionPattern
    .replace(/{url}/g, url)
    .replace(/{domain}/g, domain)
    .replace(/{path}/g, urlObj.pathname)
    .replace(/{last-segment}/g, pathSegments[pathSegments.length - 1] || '')
    .replace(/{first-segment}/g, pathSegments[0] || '')
  
  return {
    title,
    description,
    h1: pathSegments[pathSegments.length - 1]?.split('-').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ') || ''
  }
}

