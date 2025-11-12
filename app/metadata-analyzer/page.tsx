'use client'

import React, { useState, useEffect, useRef } from 'react'
import SitemapInput from '@/components/MetadataAnalyzer/SitemapInput'
import MetadataTable from '@/components/MetadataAnalyzer/MetadataTable'
import BulkEditPanel from '@/components/MetadataAnalyzer/BulkEditPanel'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Toast from '@/components/ui/Toast'
import { parseSitemapFromUrl, parseSitemapFromFile } from '@/lib/sitemap'
import { extractMetadataBatch } from '@/lib/metadata'
import { exportMetadataToCSV, importMetadataFromCSV } from '@/lib/csv'
import { saveMetadataSession, loadMetadataSession } from '@/lib/storage'
import { PageMetadata, SitemapUrl } from '@/types'

export default function MetadataAnalyzerPage() {
  const [metadata, setMetadata] = useState<PageMetadata[]>([])
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0 })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [sessionId] = useState(() => `session-${Date.now()}`)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setExtractionProgress({ current: 0, total: urls.length })

    try {
      const urlList = urls.map((u) => u.loc)
      const extracted = await extractMetadataBatch(urlList, (current, total) => {
        setExtractionProgress({ current, total })
      })

      setMetadata(extracted)
      showToast(`Successfully extracted metadata from ${extracted.length} pages`, 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to extract metadata', 'error')
    } finally {
      setIsExtracting(false)
      setExtractionProgress({ current: 0, total: 0 })
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
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  Extracting metadata...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {extractionProgress.current} of {extractionProgress.total} pages
                </p>
              </div>
            </div>
          </div>
        )}

        {metadata.length > 0 && (
          <>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleExportCSV}>Export CSV</Button>
              <Button 
                variant="secondary" 
                onClick={() => fileInputRef.current?.click()}
              >
                Import CSV
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </div>

            <BulkEditPanel
              selectedCount={selectedRows.size}
              onBulkUpdate={handleBulkUpdate}
              onClearSelection={() => setSelectedRows(new Set())}
            />

            <MetadataTable
              metadata={metadata}
              onUpdate={handleUpdateMetadata}
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
            />
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

