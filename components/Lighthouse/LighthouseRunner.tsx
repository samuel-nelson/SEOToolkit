'use client'

import React, { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { runLighthouse } from '@/lib/lighthouse'
import { LighthouseResult } from '@/types'

interface LighthouseRunnerProps {
  onResult: (result: LighthouseResult) => void
  onError: (error: string) => void
}

export default function LighthouseRunner({ onResult, onError }: LighthouseRunnerProps) {
  const [url, setUrl] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      onError('Please enter a URL')
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      onError('Please enter a valid URL')
      return
    }

    setIsRunning(true)
    try {
      const result = await runLighthouse(url.trim())
      onResult(result)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to run Lighthouse audit')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Card title="Run Lighthouse Audit">
      <form onSubmit={handleRun} className="space-y-4">
        <Input
          label="URL to Audit"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isRunning}
        />
        <Button type="submit" disabled={isRunning} className="w-full sm:w-auto">
          {isRunning ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Running Audit...
            </span>
          ) : (
            'Run Audit'
          )}
        </Button>
      </form>
      {isRunning && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Analyzing page performance, accessibility, best practices, and SEO...
          </p>
        </div>
      )}
    </Card>
  )
}

