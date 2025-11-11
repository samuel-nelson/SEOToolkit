'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PageMetadata } from '@/types'

interface BulkEditPanelProps {
  selectedCount: number
  onBulkUpdate: (updates: Partial<PageMetadata>) => void
  onClearSelection: () => void
}

export default function BulkEditPanel({
  selectedCount,
  onBulkUpdate,
  onClearSelection,
}: BulkEditPanelProps) {
  const [updates, setUpdates] = useState<Partial<PageMetadata>>({
    title: '',
    description: '',
    ogTitle: '',
    ogDescription: '',
    h1: '',
  })

  const handleFieldChange = (field: keyof PageMetadata, value: string) => {
    setUpdates((prev) => ({ ...prev, [field]: value }))
  }

  const handleApply = () => {
    // Only include fields that have values
    const nonEmptyUpdates: Partial<PageMetadata> = {}
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.trim()) {
        nonEmptyUpdates[key as keyof PageMetadata] = value.trim()
      }
    })

    if (Object.keys(nonEmptyUpdates).length === 0) {
      return
    }

    onBulkUpdate(nonEmptyUpdates)
    // Reset form
    setUpdates({
      title: '',
      description: '',
      ogTitle: '',
      ogDescription: '',
      h1: '',
    })
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <Card title={`Bulk Edit (${selectedCount} selected)`}>
      <div className="space-y-4">
        <Input
          label="Title"
          value={updates.title || ''}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="Leave empty to skip"
        />
        <Input
          label="Description"
          value={updates.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Leave empty to skip"
        />
        <Input
          label="OG Title"
          value={updates.ogTitle || ''}
          onChange={(e) => handleFieldChange('ogTitle', e.target.value)}
          placeholder="Leave empty to skip"
        />
        <Input
          label="OG Description"
          value={updates.ogDescription || ''}
          onChange={(e) => handleFieldChange('ogDescription', e.target.value)}
          placeholder="Leave empty to skip"
        />
        <Input
          label="H1"
          value={updates.h1 || ''}
          onChange={(e) => handleFieldChange('h1', e.target.value)}
          placeholder="Leave empty to skip"
        />
        <div className="flex gap-2">
          <Button onClick={handleApply}>Apply to Selected</Button>
          <Button variant="outline" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </div>
      </div>
    </Card>
  )
}

