'use client'

import React, { useState, useEffect, useRef } from 'react'
import SitemapInput from '@/components/MetadataAnalyzer/SitemapInput'
import MetadataTable from '@/components/MetadataAnalyzer/MetadataTable'
import BulkEditPanel from '@/components/MetadataAnalyzer/BulkEditPanel'
import SEOAnalyzer from '@/components/MetadataAnalyzer/SEOAnalyzer'
import AIGenerator from '@/components/MetadataAnalyzer/AIGenerator'
import KeywordAnalyzer from '@/components/MetadataAnalyzer/KeywordAnalyzer'
import ContentQuality from '@/components/MetadataAnalyzer/ContentQuality'
import TechnicalSEO from '@/components/MetadataAnalyzer/TechnicalSEO'
import SEOChecklist from '@/components/MetadataAnalyzer/SEOChecklist'
import BulkOptimizer from '@/components/MetadataAnalyzer/BulkOptimizer'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Toast from '@/components/ui/Toast'
import Card from '@/components/ui/Card'
import { generateSEOReport, downloadReport } from '@/lib/report-generator'
import { parseSitemapFromUrl, parseSitemapFromFile } from '@/lib/sitemap'
import { extractMetadataBatch } from '@/lib/metadata'
import { exportMetadataToCSV, importMetadataFromCSV } from '@/lib/csv'
import { saveMetadataSession, loadMetadataSession } from '@/lib/storage'
import { PageMetadata, SitemapUrl } from '@/types'

export default function MetadataAnalyzerPage() {
  const [metadata, setMetadata] = useState<PageMetadata[]>([])
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [sessionId] = useState(() => `session-${Date.now()}`)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedRowForAI, setSelectedRowForAI] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'analysis'>('table')

  useEffect(() => {
    // Try to load saved session
    const saved = loadMetadataSession(sessionId)
    if (saved && saved.length > 0) {
      setMetadata(saved)
      showToast('Loaded saved session', 'info')
    }
  }, [sessionId])

  useEffect(() => {
    // Auto-save when metadata changes
    if (metadata.length > 0) {
      saveMetadataSession(sessionId, metadata)
    }
  }, [metadata, sessionId])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  const handleUrlsExtracted = async (urls: SitemapUrl[]) => {
    if (urls.length === 0) {
      showToast('No URLs found in sitemap', 'error')
      return
    }

    showToast(`Found ${urls.length} URLs. Starting metadata extraction...`, 'info')
    setIsExtracting(true)
    setExtractionProgress({ current: 0, total: urls.length, success: 0, failed: 0 })

    try {
      const urlList = urls.map((u) => u.loc)
      const extracted = await extractMetadataBatch(urlList, (current, total, success, failed) => {
        setExtractionProgress({ current, total, success, failed })
      })

      setMetadata(extracted)
      
      const successCount = extracted.filter(m => m.title || m.description).length
      const failedCount = extracted.length - successCount
      
      if (failedCount > 0) {
        showToast(
          `Extracted metadata from ${successCount} pages. ${failedCount} pages failed (likely due to CORS). You can manually edit the metadata.`, 
          failedCount === extracted.length ? 'error' : 'info'
        )
      } else {
        showToast(`Successfully extracted metadata from ${successCount} pages`, 'success')
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to extract metadata', 'error')
    } finally {
      setIsExtracting(false)
      setExtractionProgress({ current: 0, total: 0, success: 0, failed: 0 })
    }
  }

  const handleError = (error: string) => {
    showToast(error, 'error')
  }

  const handleUpdateMetadata = (index: number, field: keyof PageMetadata, value: string) => {
    setMetadata((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSelectRow = (index: number) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
        // Close AI generator if this row was selected
        if (selectedRowForAI === index) {
          setSelectedRowForAI(null)
        }
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedRows.size === metadata.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(metadata.map((_, i) => i)))
    }
  }

  const handleBulkUpdate = (updates: Partial<PageMetadata>) => {
    setMetadata((prev) => {
      const updated = [...prev]
      selectedRows.forEach((index) => {
        updated[index] = { ...updated[index], ...updates }
      })
      return updated
    })
    setSelectedRows(new Set())
    showToast(`Updated ${selectedRows.size} pages`, 'success')
  }

  const handleExportCSV = () => {
    try {
      exportMetadataToCSV(metadata)
      showToast('CSV exported successfully', 'success')
    } catch (error) {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const imported = await importMetadataFromCSV(file)
      setMetadata(imported)
      showToast(`Imported ${imported.length} pages from CSV`, 'success')
    } catch (error) {
      showToast('Failed to import CSV', 'error')
    } finally {
      e.target.value = ''
    }
  }

  const handleRetryFailed = async () => {
    const failedUrls = metadata
      .map((m, index) => ({ url: m.url, index, isEmpty: !m.title && !m.description && !m.h1 }))
      .filter(item => item.isEmpty)
      .map(item => item.url)

    if (failedUrls.length === 0) {
      showToast('No failed extractions to retry', 'info')
      return
    }

    showToast(`Retrying metadata extraction for ${failedUrls.length} pages...`, 'info')
    setIsExtracting(true)
    setExtractionProgress({ current: 0, total: failedUrls.length, success: 0, failed: 0 })

    try {
      const extracted = await extractMetadataBatch(failedUrls, (current, total, success, failed) => {
        setExtractionProgress({ current, total, success, failed })
      })

      // Update only the failed entries
      setMetadata((prev) => {
        const updated = [...prev]
        let extractedIndex = 0
        updated.forEach((item, index) => {
          if (!item.title && !item.description && !item.h1) {
            if (extractedIndex < extracted.length) {
              updated[index] = extracted[extractedIndex]
              extractedIndex++
            }
          }
        })
        return updated
      })

      const successCount = extracted.filter(m => m.title || m.description).length
      const failedCount = extracted.length - successCount

      if (failedCount > 0) {
        showToast(
          `Retried: ${successCount} succeeded, ${failedCount} still failed. You can manually edit the metadata.`,
          failedCount === extracted.length ? 'error' : 'info'
        )
      } else {
        showToast(`Successfully extracted metadata from ${successCount} pages`, 'success')
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to retry extraction', 'error')
    } finally {
      setIsExtracting(false)
      setExtractionProgress({ current: 0, total: 0, success: 0, failed: 0 })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Metadata Analyzer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze and edit metadata from your sitemap
        </p>
      </div>

      <div className="space-y-6">
        <SitemapInput onUrlsExtracted={handleUrlsExtracted} onError={handleError} />

        {isExtracting && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <LoadingSpinner />
              <div className="flex-1">
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  Extracting metadata...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {extractionProgress.current} of {extractionProgress.total} pages
                </p>
                {extractionProgress.success > 0 || extractionProgress.failed > 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    ✓ {extractionProgress.success} succeeded • ✗ {extractionProgress.failed} failed
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {metadata.length > 0 && (
          <>
            <div className="flex gap-2 flex-wrap items-center">
              <Button onClick={handleExportCSV}>Export CSV</Button>
              <Button 
                variant="secondary" 
                onClick={() => fileInputRef.current?.click()}
              >
                Import CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const report = generateSEOReport(metadata)
                  downloadReport(report, 'html')
                  showToast('SEO report downloaded', 'success')
                }}
              >
                Export SEO Report
              </Button>
              {metadata.some(m => !m.title && !m.description) && (
                <Button
                  variant="outline"
                  onClick={handleRetryFailed}
                  disabled={isExtracting}
                >
                  Retry Failed Extraction
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  variant={viewMode === 'table' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  Table View
                </Button>
                <Button
                  variant={viewMode === 'analysis' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('analysis')}
                >
                  Analysis View
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </div>

            <SEOAnalyzer metadata={metadata} />

            {viewMode === 'analysis' && selectedRows.size > 0 && (
              <BulkOptimizer
                metadata={metadata}
                selectedIndices={Array.from(selectedRows)}
                onUpdate={(updates) => {
                  setMetadata((prev) => {
                    const updated = [...prev]
                    updates.forEach((partial, idx) => {
                      updated[idx] = { ...updated[idx], ...partial }
                    })
                    return updated
                  })
                  showToast(`Updated ${updates.size} page(s)`, 'success')
                }}
              />
            )}

            <BulkEditPanel
              selectedCount={selectedRows.size}
              onBulkUpdate={handleBulkUpdate}
              onClearSelection={() => setSelectedRows(new Set())}
            />

            {selectedRowForAI !== null && metadata[selectedRowForAI] && (
              <AIGenerator
                metadata={metadata[selectedRowForAI]}
                onGenerated={(title, description) => {
                  handleUpdateMetadata(selectedRowForAI, 'title', title)
                  handleUpdateMetadata(selectedRowForAI, 'description', description)
                  setSelectedRowForAI(null)
                  showToast('AI-generated metadata applied successfully', 'success')
                }}
                onError={(error) => {
                  showToast(error, 'error')
                }}
              />
            )}

            {selectedRows.size === 1 && selectedRowForAI === null && (
              <Card>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate AI-optimized metadata for the selected page
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRowForAI(Array.from(selectedRows)[0])}
                  >
                    Generate with AI
                  </Button>
                </div>
              </Card>
            )}

            <MetadataTable
              metadata={metadata}
              onUpdate={handleUpdateMetadata}
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
            />

            {viewMode === 'analysis' && (
              <div className="space-y-6 mt-6">
                {selectedRows.size === 1 && metadata[Array.from(selectedRows)[0]] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <KeywordAnalyzer metadata={metadata[Array.from(selectedRows)[0]]} />
                    <ContentQuality metadata={metadata[Array.from(selectedRows)[0]]} />
                    <TechnicalSEO metadata={metadata[Array.from(selectedRows)[0]]} />
                    <SEOChecklist metadata={metadata[Array.from(selectedRows)[0]]} />
                  </div>
                )}
                {selectedRows.size === 0 && (
                  <Card>
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      Select a page from the table above to view detailed SEO analysis
                    </p>
                  </Card>
                )}
                {selectedRows.size > 1 && (
                  <Card>
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      Select a single page to view detailed analysis, or use bulk optimizer above for multiple pages
                    </p>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

