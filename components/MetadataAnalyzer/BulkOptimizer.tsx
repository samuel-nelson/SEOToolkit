'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PageMetadata } from '@/types'
import { bulkPatterns, bulkTemplates, applyBulkPattern, applyBulkTemplate, generateFromUrlPattern } from '@/lib/bulk-optimizer'

interface BulkOptimizerProps {
  metadata: PageMetadata[]
  selectedIndices: number[]
  onUpdate: (updates: Map<number, Partial<PageMetadata>>) => void
}

export default function BulkOptimizer({ metadata, selectedIndices, onUpdate }: BulkOptimizerProps) {
  const [activeTab, setActiveTab] = useState<'pattern' | 'template' | 'url'>('pattern')
  const [selectedPattern, setSelectedPattern] = useState<string>('')
  const [patternValue, setPatternValue] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [templateData, setTemplateData] = useState<Record<string, string>>({})
  const [urlTitlePattern, setUrlTitlePattern] = useState('{last-segment} | {domain}')
  const [urlDescPattern, setUrlDescPattern] = useState('Shop {last-segment} at {domain}. Fast shipping and great prices.')

  const selectedMetadata = selectedIndices.map(i => metadata[i]).filter(Boolean)
  const hasSelection = selectedIndices.length > 0

  const handleApplyPattern = () => {
    if (!selectedPattern || !patternValue.trim()) return

    const pattern = bulkPatterns.find(p => p.name === selectedPattern)
    if (!pattern) return

    const updated = applyBulkPattern(selectedMetadata, pattern, patternValue)
    const updates = new Map<number, Partial<PageMetadata>>()
    
    selectedIndices.forEach((idx, i) => {
      updates.set(idx, updated[i])
    })

    onUpdate(updates)
  }

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return

    const template = bulkTemplates.find(t => t.name === selectedTemplate)
    if (!template) return

    const updated = applyBulkTemplate(selectedMetadata, template, templateData)
    const updates = new Map<number, Partial<PageMetadata>>()
    
    selectedIndices.forEach((idx, i) => {
      updates.set(idx, updated[i])
    })

    onUpdate(updates)
  }

  const handleApplyUrlPattern = () => {
    const updates = new Map<number, Partial<PageMetadata>>()
    
    selectedIndices.forEach(idx => {
      const meta = metadata[idx]
      const generated = generateFromUrlPattern(meta.url, urlTitlePattern, urlDescPattern)
      updates.set(idx, generated)
    })

    onUpdate(updates)
  }

  if (!hasSelection) {
    return (
      <Card title="Bulk Optimizer">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Select one or more pages to use bulk optimization tools
        </p>
      </Card>
    )
  }

  return (
    <Card title={`Bulk Optimizer (${selectedIndices.length} selected)`}>
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('pattern')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'pattern'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Patterns
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'template'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'url'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            URL Patterns
          </button>
        </div>

        {activeTab === 'pattern' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Pattern
              </label>
              <select
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">Choose a pattern...</option>
                {bulkPatterns.map((pattern) => (
                  <option key={pattern.name} value={pattern.name}>
                    {pattern.name} - {pattern.description}
                  </option>
                ))}
              </select>
            </div>

            {selectedPattern && (
              <>
                <Input
                  label="Pattern Value"
                  value={patternValue}
                  onChange={(e) => setPatternValue(e.target.value)}
                  placeholder="Enter value for the pattern"
                />
                <Button onClick={handleApplyPattern} className="w-full">
                  Apply Pattern to Selected
                </Button>
              </>
            )}
          </div>
        )}

        {activeTab === 'template' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">Choose a template...</option>
                {bulkTemplates.map((template) => (
                  <option key={template.name} value={template.name}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <>
                {selectedTemplate === 'Product Page Template' && (
                  <div className="space-y-2">
                    <Input
                      label="Product Name"
                      value={templateData.productName || ''}
                      onChange={(e) => setTemplateData({ ...templateData, productName: e.target.value })}
                      placeholder="Product name"
                    />
                    <Input
                      label="Brand"
                      value={templateData.brand || ''}
                      onChange={(e) => setTemplateData({ ...templateData, brand: e.target.value })}
                      placeholder="Brand name"
                    />
                    <Input
                      label="Price"
                      value={templateData.price || ''}
                      onChange={(e) => setTemplateData({ ...templateData, price: e.target.value })}
                      placeholder="Price"
                    />
                    <Input
                      label="Description"
                      value={templateData.description || ''}
                      onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                      placeholder="Additional description"
                    />
                  </div>
                )}

                {selectedTemplate === 'Blog Post Template' && (
                  <div className="space-y-2">
                    <Input
                      label="Post Title"
                      value={templateData.postTitle || ''}
                      onChange={(e) => setTemplateData({ ...templateData, postTitle: e.target.value })}
                      placeholder="Blog post title"
                    />
                    <Input
                      label="Author"
                      value={templateData.author || ''}
                      onChange={(e) => setTemplateData({ ...templateData, author: e.target.value })}
                      placeholder="Author name"
                    />
                    <Input
                      label="Description"
                      value={templateData.description || ''}
                      onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                      placeholder="Post description"
                    />
                  </div>
                )}

                {selectedTemplate === 'Category Page Template' && (
                  <div className="space-y-2">
                    <Input
                      label="Category Name"
                      value={templateData.category || ''}
                      onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}
                      placeholder="Category name"
                    />
                    <Input
                      label="Item Count"
                      value={templateData.itemCount || ''}
                      onChange={(e) => setTemplateData({ ...templateData, itemCount: e.target.value })}
                      placeholder="Number of items"
                    />
                    <Input
                      label="Description"
                      value={templateData.description || ''}
                      onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                      placeholder="Category description"
                    />
                  </div>
                )}

                {selectedTemplate === 'Landing Page Template' && (
                  <div className="space-y-2">
                    <Input
                      label="Page Title"
                      value={templateData.pageTitle || ''}
                      onChange={(e) => setTemplateData({ ...templateData, pageTitle: e.target.value })}
                      placeholder="Landing page title"
                    />
                    <Input
                      label="Brand"
                      value={templateData.brand || ''}
                      onChange={(e) => setTemplateData({ ...templateData, brand: e.target.value })}
                      placeholder="Brand/company name"
                    />
                    <Input
                      label="Description"
                      value={templateData.description || ''}
                      onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                      placeholder="Page description"
                    />
                    <Input
                      label="Call to Action"
                      value={templateData.cta || ''}
                      onChange={(e) => setTemplateData({ ...templateData, cta: e.target.value })}
                      placeholder="CTA text"
                    />
                  </div>
                )}

                <Button onClick={handleApplyTemplate} className="w-full">
                  Apply Template to Selected
                </Button>
              </>
            )}
          </div>
        )}

        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Generate metadata from URL patterns. Use placeholders: {'{url}'}, {'{domain}'}, {'{path}'}, {'{last-segment}'}, {'{first-segment}'}
              </p>
              <Input
                label="Title Pattern"
                value={urlTitlePattern}
                onChange={(e) => setUrlTitlePattern(e.target.value)}
                placeholder="{last-segment} | {domain}"
              />
              <Input
                label="Description Pattern"
                value={urlDescPattern}
                onChange={(e) => setUrlDescPattern(e.target.value)}
                placeholder="Shop {last-segment} at {domain}"
              />
              <Button onClick={handleApplyUrlPattern} className="w-full mt-4">
                Generate from URL Pattern
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

