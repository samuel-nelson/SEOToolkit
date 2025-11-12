import { SitemapUrl } from '@/types'

export async function parseSitemapFromUrl(sitemapUrl: string): Promise<SitemapUrl[]> {
  try {
    // Validate URL
    try {
      new URL(sitemapUrl)
    } catch {
      throw new Error('Invalid URL format')
    }

    const response = await fetch(sitemapUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, text/xml, */*',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: HTTP ${response.status} ${response.statusText}`)
    }
    
    const xmlText = await response.text()
    
    if (!xmlText || xmlText.trim().length === 0) {
      throw new Error('Sitemap is empty')
    }
    
    return parseSitemapXml(xmlText)
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('CORS error: Unable to fetch sitemap. The server may not allow cross-origin requests. Try uploading the sitemap file instead.')
    }
    throw new Error(`Error fetching sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function parseSitemapFromFile(file: File): Promise<SitemapUrl[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const xmlText = e.target?.result as string
        const urls = parseSitemapXml(xmlText)
        resolve(urls)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function parseSitemapXml(xmlText: string): SitemapUrl[] {
  if (!xmlText || xmlText.trim().length === 0) {
    throw new Error('Sitemap XML is empty')
  }

  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror')
  if (parserError) {
    const errorText = parserError.textContent || 'Unknown XML parsing error'
    throw new Error(`Invalid XML format: ${errorText.substring(0, 200)}`)
  }

  const urls: SitemapUrl[] = []
  
  // Sitemap namespace (common in sitemaps)
  const sitemapNS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
  
  // Helper function to get element text, trying both namespaced and non-namespaced
  const getElementText = (parent: Element, tagName: string): string | null => {
    // Try with namespace first (if namespace is available)
    const rootElement = xmlDoc.documentElement
    const namespace = rootElement.namespaceURI
    
    if (namespace) {
      try {
        const nsElements = parent.getElementsByTagNameNS(namespace, tagName)
        if (nsElements.length > 0) {
          return nsElements[0]?.textContent?.trim() || null
        }
      } catch {
        // Namespace lookup failed, continue to fallback
      }
      
      // Also try the standard sitemap namespace
      if (namespace !== sitemapNS) {
        try {
          const nsElements = parent.getElementsByTagNameNS(sitemapNS, tagName)
          if (nsElements.length > 0) {
            return nsElements[0]?.textContent?.trim() || null
          }
        } catch {
          // Continue to fallback
        }
      }
    }
    
    // Fallback to no namespace
    const elements = parent.getElementsByTagName(tagName)
    return elements[0]?.textContent?.trim() || null
  }
  
  // Helper to get all elements (namespaced or not)
  const getAllElements = (parent: Element, tagName: string): Element[] => {
    const elements: Element[] = []
    const rootElement = xmlDoc.documentElement
    const namespace = rootElement.namespaceURI
    
    // Try with namespace
    if (namespace) {
      try {
        const nsElements = parent.getElementsByTagNameNS(namespace, tagName)
        for (let i = 0; i < nsElements.length; i++) {
          elements.push(nsElements[i])
        }
      } catch {
        // Continue
      }
      
      // Also try standard sitemap namespace
      if (namespace !== sitemapNS) {
        try {
          const nsElements = parent.getElementsByTagNameNS(sitemapNS, tagName)
          for (let i = 0; i < nsElements.length; i++) {
            if (!elements.includes(nsElements[i])) {
              elements.push(nsElements[i])
            }
          }
        } catch {
          // Continue
        }
      }
    }
    
    // Add non-namespaced elements
    const noNsElements = parent.getElementsByTagName(tagName)
    for (let i = 0; i < noNsElements.length; i++) {
      if (!elements.includes(noNsElements[i])) {
        elements.push(noNsElements[i])
      }
    }
    
    return elements
  }
  
  // Handle regular sitemap
  const urlElements = getAllElements(xmlDoc.documentElement, 'url')
  for (let i = 0; i < urlElements.length; i++) {
    const urlElement = urlElements[i]
    const loc = getElementText(urlElement, 'loc')
    
    if (loc) {
      urls.push({
        loc: loc,
        lastmod: getElementText(urlElement, 'lastmod') || undefined,
        changefreq: getElementText(urlElement, 'changefreq') || undefined,
        priority: getElementText(urlElement, 'priority') || undefined,
      })
    }
  }

  // Handle sitemap index (nested sitemaps)
  const sitemapElements = getAllElements(xmlDoc.documentElement, 'sitemap')
  for (let i = 0; i < sitemapElements.length; i++) {
    const sitemapElement = sitemapElements[i]
    const loc = getElementText(sitemapElement, 'loc')
    if (loc) {
      urls.push({
        loc: loc,
        lastmod: getElementText(sitemapElement, 'lastmod') || undefined,
      })
    }
  }

  if (urls.length === 0) {
    throw new Error('No URLs found in sitemap. The sitemap may be empty or in an unsupported format.')
  }

  return urls
}

