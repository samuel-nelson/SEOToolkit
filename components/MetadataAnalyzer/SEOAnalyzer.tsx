'use client'

import React from 'react'
import Card from '@/components/ui/Card'
import { PageMetadata } from '@/types'
import { analyzeSEO, findDuplicates } from '@/lib/seo-optimizer'

interface SEOAnalyzerProps {
  metadata: PageMetadata[]
}

export default function SEOAnalyzer({ metadata }: SEOAnalyzerProps) {
  if (metadata.length === 0) return null

  const analyses = metadata.map(m => analyzeSEO(m))
  const avgScore = Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
  const duplicates = findDuplicates(metadata)

  const issuesCount = analyses.reduce((sum, a) => sum + a.issues.length, 0)
  const pagesWithIssues = analyses.filter(a => a.issues.length > 0).length

  // Calculate average category scores
  const avgOnPage = Math.round(analyses.reduce((sum, a) => sum + a.categoryScores.onPage, 0) / analyses.length)
  const avgTechnical = Math.round(analyses.reduce((sum, a) => sum + a.categoryScores.technical, 0) / analyses.length)
  const avgContent = Math.round(analyses.reduce((sum, a) => sum + a.categoryScores.content, 0) / analyses.length)
  const avgSocial = Math.round(analyses.reduce((sum, a) => sum + a.categoryScores.social, 0) / analyses.length)

  // Get top priority issues across all pages
  const allPriorityIssues = analyses.flatMap(a => a.priorityIssues)
  const highPriorityIssues = allPriorityIssues.filter(i => i.priority === 'high').slice(0, 5)

  return (
    <Card title="SEO Analysis">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average SEO Score</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{avgScore}/100</p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Issues</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{issuesCount}</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pages with Issues</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{pagesWithIssues}/{metadata.length}</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">High Priority Issues</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{highPriorityIssues.length}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Scores</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">On-Page</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{avgOnPage}/100</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Technical</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{avgTechnical}/100</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Content</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{avgContent}/100</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Social</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{avgSocial}/100</p>
            </div>
          </div>
        </div>

        {highPriorityIssues.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="font-semibold text-red-800 dark:text-red-200 mb-2">High Priority Issues</p>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {highPriorityIssues.map((issue, idx) => (
                <li key={idx}>
                  <span className="font-medium">[{issue.category}]</span> {issue.issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {duplicates.size > 0 && (
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Duplicate Content Detected</p>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              {Array.from(duplicates.entries()).map(([issue, indices]) => (
                <li key={issue}>
                  {issue} - Found on {indices.length} page(s): {indices.map(i => `#${i + 1}`).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-2">Common Issues:</p>
          <ul className="list-disc list-inside space-y-1">
            {analyses.filter(a => a.issues.length > 0).slice(0, 5).map((analysis, idx) => (
              <li key={idx}>{analysis.issues[0]}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}

