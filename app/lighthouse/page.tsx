'use client'

import React, { useState, useEffect } from 'react'
import LighthouseRunner from '@/components/Lighthouse/LighthouseRunner'
import ScoreCard from '@/components/Lighthouse/ScoreCard'
import ScoreChart from '@/components/Lighthouse/ScoreChart'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'
import { runLighthouse } from '@/lib/lighthouse'
import { saveLighthouseResult, getLighthouseHistory, getAllLighthouseUrls, deleteLighthouseHistory, exportLighthouseToCSV } from '@/lib/storage'
import { LighthouseResult, LighthouseHistory } from '@/types'
import { format } from 'date-fns'

export default function LighthousePage() {
  const [currentResult, setCurrentResult] = useState<LighthouseResult | null>(null)
  const [history, setHistory] = useState<LighthouseHistory | null>(null)
  const [allUrls, setAllUrls] = useState<string[]>([])
  const [selectedUrl, setSelectedUrl] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    loadAllUrls()
  }, [])

  useEffect(() => {
    if (selectedUrl) {
      loadHistory(selectedUrl)
    }
  }, [selectedUrl])

  const loadAllUrls = () => {
    const urls = getAllLighthouseUrls()
    setAllUrls(urls)
    if (urls.length > 0 && !selectedUrl) {
      setSelectedUrl(urls[0])
    }
  }

  const loadHistory = (url: string) => {
    const urlHistory = getLighthouseHistory(url)
    setHistory(urlHistory)
    if (urlHistory && urlHistory.results.length > 0) {
      setCurrentResult(urlHistory.results[urlHistory.results.length - 1])
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }

  const handleResult = (result: LighthouseResult) => {
    saveLighthouseResult(result)
    setCurrentResult(result)
    loadHistory(result.url)
    loadAllUrls()
    showToast('Lighthouse audit completed successfully', 'success')
  }

  const handleError = (error: string) => {
    showToast(error, 'error')
  }

  const handleExport = () => {
    if (!history || history.results.length === 0) {
      showToast('No data to export', 'error')
      return
    }

    try {
      exportLighthouseToCSV(history.results)
      showToast('CSV exported successfully', 'success')
    } catch (error) {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleDelete = () => {
    if (!selectedUrl) return

    if (confirm(`Delete all Lighthouse history for ${selectedUrl}?`)) {
      deleteLighthouseHistory(selectedUrl)
      setCurrentResult(null)
      setHistory(null)
      loadAllUrls()
      if (allUrls.length > 1) {
        const remaining = allUrls.filter(u => u !== selectedUrl)
        setSelectedUrl(remaining[0] || '')
      } else {
        setSelectedUrl('')
      }
      showToast('History deleted', 'success')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Lighthouse Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Run Lighthouse audits and track performance scores over time
        </p>
      </div>

      <div className="space-y-6">
        <LighthouseRunner onResult={handleResult} onError={handleError} />

        {allUrls.length > 0 && (
          <Card title="View History">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select URL
                </label>
                <select
                  value={selectedUrl}
                  onChange={(e) => setSelectedUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  {allUrls.map((url) => (
                    <option key={url} value={url}>
                      {url}
                    </option>
                  ))}
                </select>
              </div>
              {selectedUrl && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExport}>
                    Export CSV
                  </Button>
                  <Button variant="danger" onClick={handleDelete}>
                    Delete History
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {currentResult && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ScoreCard label="Performance" score={currentResult.scores.performance} />
              <ScoreCard label="Accessibility" score={currentResult.scores.accessibility} />
              <ScoreCard label="Best Practices" score={currentResult.scores.bestPractices} />
              <ScoreCard label="SEO" score={currentResult.scores.seo} />
            </div>

            <Card title="Latest Audit Details">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">URL</p>
                  <p className="text-gray-900 dark:text-white">{currentResult.url}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-gray-900 dark:text-white">
                    {format(new Date(currentResult.timestamp), 'PPpp')}
                  </p>
                </div>
                {currentResult.metrics && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance Metrics</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {currentResult.metrics.firstContentfulPaint && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">First Contentful Paint</p>
                          <p className="text-gray-900 dark:text-white">
                            {Math.round(currentResult.metrics.firstContentfulPaint)}ms
                          </p>
                        </div>
                      )}
                      {currentResult.metrics.largestContentfulPaint && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Largest Contentful Paint</p>
                          <p className="text-gray-900 dark:text-white">
                            {Math.round(currentResult.metrics.largestContentfulPaint)}ms
                          </p>
                        </div>
                      )}
                      {currentResult.metrics.speedIndex && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Speed Index</p>
                          <p className="text-gray-900 dark:text-white">
                            {Math.round(currentResult.metrics.speedIndex)}ms
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {currentResult.recommendations && currentResult.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {currentResult.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {history && history.results.length > 1 && (
          <Card title="Score History">
            <ScoreChart history={history} />
          </Card>
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

