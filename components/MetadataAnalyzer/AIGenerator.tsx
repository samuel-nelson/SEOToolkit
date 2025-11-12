'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { PageMetadata } from '@/types'
import { generateMetadataWithAI } from '@/lib/ai-generator'

interface AIGeneratorProps {
  metadata: PageMetadata
  onGenerated: (title: string, description: string) => void
  onError: (error: string) => void
}

export default function AIGenerator({ metadata, onGenerated, onError }: AIGeneratorProps) {
  const [apiKey, setApiKey] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // Load API key from localStorage if available
  React.useEffect(() => {
    const saved = localStorage.getItem('grok-api-key')
    if (saved) {
      setApiKey(saved)
      setShowApiKey(true)
    }
  }, [])

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      onError('Please enter your Grok API key')
      return
    }

    setIsGenerating(true)
    try {
      // Save API key to localStorage
      localStorage.setItem('grok-api-key', apiKey)

      const result = await generateMetadataWithAI({
        apiKey: apiKey.trim(),
        url: metadata.url,
        currentTitle: metadata.title,
        currentDescription: metadata.description,
        h1: metadata.h1,
        keywords: metadata.keywords ? metadata.keywords.split(',').map(k => k.trim()) : []
      })

      onGenerated(result.title, result.description)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to generate metadata')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card title="AI-Powered Metadata Generator">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Generate optimized titles and descriptions using Grok AI. Your API key is stored locally in your browser.
          </p>
          
          {!showApiKey && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKey(true)}
            >
              {apiKey ? 'Change API Key' : 'Add Grok API Key'}
            </Button>
          )}

          {showApiKey && (
            <div className="space-y-2">
              <Input
                label="Grok API Key"
                type="password"
                placeholder="xai-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get your API key from{' '}
                <a
                  href="https://x.ai/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  x.ai/api
                </a>
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !apiKey.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Generating...
            </span>
          ) : (
            'Generate Optimized Title & Description'
          )}
        </Button>

        {metadata.title || metadata.description ? (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Current:</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Title:</strong> {metadata.title || '(empty)'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Description:</strong> {metadata.description || '(empty)'}
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

