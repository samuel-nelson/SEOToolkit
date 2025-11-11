import Papa from 'papaparse'
import { PageMetadata, LighthouseResult } from '@/types'

export function exportMetadataToCSV(metadata: PageMetadata[]): void {
  if (metadata.length === 0) {
    alert('No data to export')
    return
  }

  const csv = Papa.unparse(metadata, {
    columns: [
      'url',
      'title',
      'description',
      'ogTitle',
      'ogDescription',
      'ogImage',
      'ogUrl',
      'twitterTitle',
      'twitterDescription',
      'twitterImage',
      'canonical',
      'h1',
      'keywords',
    ],
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `metadata-export-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function importMetadataFromCSV(file: File): Promise<PageMetadata[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const metadata: PageMetadata[] = results.data.map((row: any) => ({
            url: row.url || '',
            title: row.title || '',
            description: row.description || '',
            ogTitle: row.ogTitle || '',
            ogDescription: row.ogDescription || '',
            ogImage: row.ogImage || '',
            ogUrl: row.ogUrl || '',
            twitterTitle: row.twitterTitle || '',
            twitterDescription: row.twitterDescription || '',
            twitterImage: row.twitterImage || '',
            canonical: row.canonical || '',
            h1: row.h1 || '',
            keywords: row.keywords || '',
          }))
          resolve(metadata)
        } catch (error) {
          reject(new Error('Failed to parse CSV file'))
        }
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

export function exportLighthouseToCSV(results: LighthouseResult[]): void {
  if (results.length === 0) {
    return
  }

  const csvData = results.map(result => ({
    url: result.url,
    timestamp: new Date(result.timestamp).toISOString(),
    performance: result.scores.performance,
    accessibility: result.scores.accessibility,
    bestPractices: result.scores.bestPractices,
    seo: result.scores.seo,
    firstContentfulPaint: result.metrics?.firstContentfulPaint || '',
    largestContentfulPaint: result.metrics?.largestContentfulPaint || '',
    totalBlockingTime: result.metrics?.totalBlockingTime || '',
    cumulativeLayoutShift: result.metrics?.cumulativeLayoutShift || '',
    speedIndex: result.metrics?.speedIndex || '',
  }))

  const csv = Papa.unparse(csvData)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `lighthouse-export-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

