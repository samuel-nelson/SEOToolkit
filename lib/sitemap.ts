import { SitemapUrl } from '@/types'

export async function parseSitemapFromUrl(sitemapUrl: string): Promise<SitemapUrl[]> {
  try {
    const response = await fetch(sitemapUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.statusText}`)
    }
    const xmlText = await response.text()
    return parseSitemapXml(xmlText)
  } catch (error) {
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
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Invalid XML format')
  }

  const urls: SitemapUrl[] = []
  
  // Handle regular sitemap
  const urlElements = xmlDoc.getElementsByTagName('url')
  for (let i = 0; i < urlElements.length; i++) {
    const urlElement = urlElements[i]
    const loc = urlElement.getElementsByTagName('loc')[0]?.textContent
    const lastmod = urlElement.getElementsByTagName('lastmod')[0]?.textContent
    const changefreq = urlElement.getElementsByTagName('changefreq')[0]?.textContent
    const priority = urlElement.getElementsByTagName('priority')[0]?.textContent
    
    if (loc) {
      urls.push({
        loc: loc.trim(),
        lastmod: lastmod?.trim(),
        changefreq: changefreq?.trim(),
        priority: priority?.trim(),
      })
    }
  }

  // Handle sitemap index (nested sitemaps)
  const sitemapElements = xmlDoc.getElementsByTagName('sitemap')
  for (let i = 0; i < sitemapElements.length; i++) {
    const sitemapElement = sitemapElements[i]
    const loc = sitemapElement.getElementsByTagName('loc')[0]?.textContent
    if (loc) {
      urls.push({
        loc: loc.trim(),
      })
    }
  }

  if (urls.length === 0) {
    throw new Error('No URLs found in sitemap')
  }

  return urls
}

