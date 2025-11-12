'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageMetadata } from '@/types'
import { analyzeKeywords, getLongTailSuggestions, LongTailKeyword } from '@/lib/keyword-analyzer'

interface KeywordAnalyzerProps {
  metadata: PageMetadata
}

export default function KeywordAnalyzer({ metadata }: KeywordAnalyzerProps) {
  const [analysis, setAnalysis] = useState(analyzeKeywords(metadata))
  const [longTailKeywords, setLongTailKeywords] = useState<LongTailKeyword[]>([])
  const [showLongTail, setShowLongTail] = useState(false)

  // Re-analyze when metadata changes
  React.useEffect(() => {
    setAnalysis(analyzeKeywords(metadata))
    setShowLongTail(false)
  }, [metadata])

  const handleGetLongTail = () => {
    if (analysis.primaryKeyword) {
      setLongTailKeywords(getLongTailSuggestions(analysis.primaryKeyword))
      setShowLongTail(true)
    }
  }

  return (
    <Card title="Keyword Analysis">
      <div className="space-y-4">
        {analysis.primaryKeyword ? (
          <>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Keyword</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{analysis.primaryKeyword}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Density: {analysis.keywordDensity.get(analysis.primaryKeyword)?.toFixed(2) || 0}%
              </p>
            </div>

            {analysis.secondaryKeywords.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.secondaryKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm"
                    >
                      {kw} ({analysis.keywordDensity.get(kw)?.toFixed(1) || 0}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keyword Placement</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={analysis.keywordPlacement.inTitle ? 'text-green-600' : 'text-red-600'}>
                    {analysis.keywordPlacement.inTitle ? '✓' : '✗'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">In Title Tag</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={analysis.keywordPlacement.inH1 ? 'text-green-600' : 'text-red-600'}>
                    {analysis.keywordPlacement.inH1 ? '✓' : '✗'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">In H1 Tag</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={analysis.keywordPlacement.inDescription ? 'text-green-600' : 'text-red-600'}>
                    {analysis.keywordPlacement.inDescription ? '✓' : '✗'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">In Meta Description</span>
                </div>
              </div>
            </div>

            {analysis.keywordStuffing && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  ⚠️ Keyword Stuffing Detected
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Keyword density is too high. Consider reducing usage for better SEO.
                </p>
              </div>
            )}

            {analysis.suggestions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleGetLongTail}
              className="w-full"
            >
              Get Long-Tail Keyword Suggestions
            </Button>

            {showLongTail && longTailKeywords.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Long-Tail Keyword Suggestions
                </p>
                <div className="space-y-1">
                  {longTailKeywords.map((ltk, idx) => (
                    <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                      • {ltk.keyword}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No keywords detected. Add content to title, description, or H1 tags for analysis.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

