'use client'

import React from 'react'
import Card from '@/components/ui/Card'
import { PageMetadata } from '@/types'
import { analyzeTechnicalSEO } from '@/lib/technical-seo'

interface TechnicalSEOProps {
  metadata: PageMetadata
}

export default function TechnicalSEO({ metadata }: TechnicalSEOProps) {
  const analysis = analyzeTechnicalSEO(metadata)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <Card title="Technical SEO Analysis">
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Technical SEO Score</p>
          <p className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
            {analysis.overallScore}/100
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL Structure</p>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">URL Length</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {analysis.urlStructure.length} chars
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Score</span>
              <span className={`text-xs font-medium ${getScoreColor(analysis.urlStructure.score)}`}>
                {analysis.urlStructure.score}/100
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className={analysis.urlStructure.hasKeywords ? 'text-green-600' : 'text-red-600'}>
                {analysis.urlStructure.hasKeywords ? '✓ Keywords' : '✗ Keywords'}
              </span>
              <span className={analysis.urlStructure.hasHyphens ? 'text-green-600' : 'text-gray-400'}>
                {analysis.urlStructure.hasHyphens ? '✓ Hyphens' : 'Hyphens'}
              </span>
            </div>
            {analysis.urlStructure.issues.length > 0 && (
              <ul className="list-disc list-inside text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                {analysis.urlStructure.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Canonical URL</p>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className={analysis.canonicalUrl.present ? 'text-green-600' : 'text-red-600'}>
                {analysis.canonicalUrl.present ? '✓' : '✗'}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {analysis.canonicalUrl.present ? 'Present' : 'Missing'}
              </span>
            </div>
            {analysis.canonicalUrl.present && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {metadata.canonical}
              </p>
            )}
            {analysis.canonicalUrl.issues.length > 0 && (
              <ul className="list-disc list-inside text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                {analysis.canonicalUrl.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schema Markup</p>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className={analysis.schemaMarkup.detected ? 'text-green-600' : 'text-yellow-600'}>
                {analysis.schemaMarkup.detected ? '✓' : '⚠'}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {analysis.schemaMarkup.detected ? 'Detected' : 'Not detected (requires page HTML analysis)'}
              </span>
            </div>
            {analysis.schemaMarkup.issues.length > 0 && (
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                {analysis.schemaMarkup.issues[0]}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile Viewport</p>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className={analysis.mobileViewport.present ? 'text-green-600' : 'text-yellow-600'}>
                {analysis.mobileViewport.present ? '✓' : '⚠'}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {analysis.mobileViewport.present ? 'Present' : 'Not detected (requires page HTML analysis)'}
              </span>
            </div>
            {analysis.mobileViewport.issues.length > 0 && (
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                {analysis.mobileViewport.issues[0]}
              </p>
            )}
          </div>
        </div>

        {analysis.suggestions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {analysis.suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}

