'use client'

import React from 'react'
import Card from '@/components/ui/Card'
import { PageMetadata } from '@/types'
import { analyzeContentQuality } from '@/lib/content-analyzer'

interface ContentQualityProps {
  metadata: PageMetadata
}

export default function ContentQuality({ metadata }: ContentQualityProps) {
  const metrics = analyzeContentQuality(metadata)

  const getReadabilityColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400'
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <Card title="Content Quality Metrics">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">Word Count</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.wordCount}</p>
            {metrics.wordCount < 300 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Below recommended (300+)</p>
            )}
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">Readability</p>
            <p className={`text-2xl font-bold ${getReadabilityColor(metrics.readabilityScore)}`}>
              {Math.round(metrics.readabilityScore)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metrics.readabilityLevel}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content Structure</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">H1 Tags</span>
              <span className={`text-sm font-medium ${
                metrics.h1Count === 1 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metrics.h1Count} {metrics.h1Count === 1 ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Header Hierarchy</span>
              <span className={`text-sm font-medium ${
                metrics.headerHierarchyValid ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {metrics.headerHierarchyValid ? 'Valid ✓' : 'Needs Review'}
              </span>
            </div>
          </div>
        </div>

        {metrics.issues.length > 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Issues Found</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-yellow-700 dark:text-yellow-300">
              {metrics.issues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {metrics.suggestions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {metrics.suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}

