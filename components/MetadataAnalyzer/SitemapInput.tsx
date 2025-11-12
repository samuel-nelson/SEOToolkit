'use client'

import React, { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { parseSitemapFromUrl, parseSitemapFromFile } from '@/lib/sitemap'
import { SitemapUrl } from '@/types'

interface SitemapInputProps {
  onUrlsExtracted: (urls: SitemapUrl[]) => void
  onError: (error: string) => void
}

export default function SitemapInput({ onUrlsExtracted, onError }: SitemapInputProps) {
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [corsError, setCorsError] = useState(false)

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sitemapUrl.trim()) {
      onError('Please enter a sitemap URL')
      return
    }

    setIsLoading(true)
    setCorsError(false)
    try {
      const urls = await parseSitemapFromUrl(sitemapUrl.trim())
      onUrlsExtracted(urls)
      setCorsError(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse sitemap'
      if (errorMessage.includes('CORS')) {
        setCorsError(true)
      }
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setCorsError(false)
    try {
      const urls = await parseSitemapFromFile(file)
      onUrlsExtracted(urls)
      setCorsError(false)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to parse sitemap file')
    } finally {
      setIsLoading(false)
      e.target.value = '' // Reset input
    }
  }

  return (
    <Card title="Sitemap Input">
      <div className="space-y-4">
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <Input
              label="Sitemap URL"
              type="url"
              placeholder="https://example.com/sitemap.xml"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Note: Some servers may block cross-origin requests. If URL loading fails, try uploading the sitemap file instead.
            </p>
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline">
                CORS Workaround Options
              </summary>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                <p className="font-medium text-gray-700 dark:text-gray-300">To bypass CORS restrictions:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  <li><strong>Browser Extension:</strong> Install a CORS unblocker extension (e.g., &quot;CORS Unblock&quot; or &quot;Allow CORS&quot;)</li>
                  <li><strong>Upload File:</strong> Download the sitemap.xml file and upload it directly (recommended)</li>
                  <li><strong>Same Domain:</strong> If testing your own site, access the tool from the same domain</li>
                  <li><strong>Browser DevTools:</strong> Use browser developer tools to fetch and save the sitemap, then upload</li>
                </ul>
                <p className="text-gray-500 dark:text-gray-500 italic mt-2">
                  Note: CORS is a browser security feature. For metadata extraction, you can manually edit fields if automatic extraction fails.
                </p>
              </div>
            </details>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load from URL'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">OR</span>
          </div>
        </div>

        <div className={corsError ? 'p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg' : ''}>
          <label className={`block text-sm font-medium mb-2 ${corsError ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-700 dark:text-gray-300'}`}>
            Upload Sitemap File
            {corsError && (
              <span className="ml-2 text-xs font-normal">(Recommended when URL fails due to CORS)</span>
            )}
          </label>
          {corsError && (
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
              💡 Tip: Download the sitemap.xml file from the server, then upload it here to bypass CORS restrictions.
            </p>
          )}
          <input
            type="file"
            accept=".xml"
            onChange={handleFileUpload}
            disabled={isLoading}
            className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold ${
              corsError 
                ? 'file:bg-yellow-100 file:text-yellow-800 hover:file:bg-yellow-200 dark:file:bg-yellow-800 dark:file:text-yellow-100' 
                : 'file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300'
            }`}
          />
        </div>
      </div>
    </Card>
  )
}

