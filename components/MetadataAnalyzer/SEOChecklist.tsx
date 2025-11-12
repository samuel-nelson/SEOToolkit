'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageMetadata } from '@/types'
import { generateSEOChecklist, ChecklistItem } from '@/lib/seo-checklist'

interface SEOChecklistProps {
  metadata: PageMetadata
}

const categoryColors = {
  'on-page': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  'technical': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  'content': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  'social': 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200',
  'mobile': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
}

const priorityColors = {
  'high': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  'medium': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  'low': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
}

export default function SEOChecklist({ metadata }: SEOChecklistProps) {
  const checklist = generateSEOChecklist(metadata)
  const [filter, setFilter] = useState<'all' | 'fail' | 'warning' | 'pass'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredItems = checklist.items.filter(item => {
    if (filter !== 'all' && item.status !== filter) return false
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <span className="text-green-600 dark:text-green-400">✓</span>
      case 'fail':
        return <span className="text-red-600 dark:text-red-400">✗</span>
      case 'warning':
        return <span className="text-yellow-600 dark:text-yellow-400">⚠</span>
      default:
        return null
    }
  }

  return (
    <Card title="SEO Checklist">
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{checklist.passed}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Passed</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{checklist.failed}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Failed</p>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{checklist.warnings}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Warnings</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{checklist.score}%</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'fail' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('fail')}
          >
            Failed ({checklist.failed})
          </Button>
          <Button
            variant={filter === 'warning' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('warning')}
          >
            Warnings ({checklist.warnings})
          </Button>
          <Button
            variant={filter === 'pass' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('pass')}
          >
            Passed ({checklist.passed})
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={categoryFilter === 'all' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
          >
            All Categories
          </Button>
          {['on-page', 'technical', 'content', 'social', 'mobile'].map(cat => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
            </Button>
          ))}
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border ${
                item.status === 'pass'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : item.status === 'fail'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(item.status)}
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs ${categoryColors[item.category]}`}>
                      {item.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[item.priority]}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{item.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic">{item.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No items match the current filters
          </div>
        )}
      </div>
    </Card>
  )
}

