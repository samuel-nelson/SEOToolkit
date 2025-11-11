import { PageMetadata } from '@/types'

export async function extractMetadata(url: string): Promise<PageMetadata> {
  try {
    // Use a CORS proxy or fetch directly (may fail due to CORS)
    let html: string
    
    try {
      const response = await fetch(url, {
        mode: 'cors',
        headers: {
          'Accept': 'text/html',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      html = await response.text()
    } catch (error) {
      // If CORS fails, try to use a proxy or inform user
      throw new Error(`Failed to fetch page (CORS may be blocking): ${error instanceof Error ? error.message : 'Unknown error'}. Consider using a CORS proxy or browser extension.`)
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const getMetaContent = (name: string, property?: string): string => {
      if (property) {
        const meta = doc.querySelector(`meta[property="${property}"]`)
        if (meta) return meta.getAttribute('content') || ''
      }
      const meta = doc.querySelector(`meta[name="${name}"]`)
      return meta?.getAttribute('content') || ''
    }

    const getTagText = (selector: string): string => {
      const element = doc.querySelector(selector)
      return element?.textContent?.trim() || ''
    }

    const h1Elements = doc.querySelectorAll('h1')
    const h1Text = h1Elements.length > 0 ? h1Elements[0].textContent?.trim() || '' : ''

    return {
      url,
      title: getTagText('title'),
      description: getMetaContent('description'),
      ogTitle: getMetaContent('', 'og:title'),
      ogDescription: getMetaContent('', 'og:description'),
      ogImage: getMetaContent('', 'og:image'),
      ogUrl: getMetaContent('', 'og:url'),
      twitterTitle: getMetaContent('twitter:title') || getMetaContent('', 'twitter:title'),
      twitterDescription: getMetaContent('twitter:description') || getMetaContent('', 'twitter:description'),
      twitterImage: getMetaContent('twitter:image') || getMetaContent('', 'twitter:image'),
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      h1: h1Text,
      keywords: getMetaContent('keywords'),
    }
  } catch (error) {
    throw new Error(`Error extracting metadata from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function extractMetadataBatch(urls: string[], onProgress?: (current: number, total: number) => void): Promise<PageMetadata[]> {
  const results: PageMetadata[] = []
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const metadata = await extractMetadata(urls[i])
      results.push(metadata)
    } catch (error) {
      // Create a partial metadata object with error info
      results.push({
        url: urls[i],
        title: '',
        description: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        ogUrl: '',
        twitterTitle: '',
        twitterDescription: '',
        twitterImage: '',
        canonical: '',
        h1: '',
        keywords: '',
      })
    }
    
    if (onProgress) {
      onProgress(i + 1, urls.length)
    }
    
    // Small delay to avoid overwhelming servers
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return results
}

