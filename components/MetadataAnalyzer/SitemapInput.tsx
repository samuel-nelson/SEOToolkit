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

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sitemapUrl.trim()) {
      onError('Please enter a sitemap URL')
      return
    }

    setIsLoading(true)
    try {
      const urls = await parseSitemapFromUrl(sitemapUrl.trim())
      onUrlsExtracted(urls)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to parse sitemap')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const urls = await parseSitemapFromFile(file)
      onUrlsExtracted(urls)
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Sitemap File
          </label>
          <input
            type="file"
            accept=".xml"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
          />
        </div>
      </div>
    </Card>
  )
}

