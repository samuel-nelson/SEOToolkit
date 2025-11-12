'use client'

import React, { useState } from 'react'
import { PageMetadata } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface MetadataTableProps {
  metadata: PageMetadata[]
  onUpdate: (index: number, field: keyof PageMetadata, value: string) => void
  selectedRows: Set<number>
  onSelectRow: (index: number) => void
  onSelectAll: () => void
}

export default function MetadataTable({
  metadata,
  onUpdate,
  selectedRows,
  onSelectRow,
  onSelectAll,
}: MetadataTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; field: keyof PageMetadata } | null>(null)
  const allSelected = metadata.length > 0 && selectedRows.size === metadata.length

  const handleCellClick = (row: number, field: keyof PageMetadata) => {
    setEditingCell({ row, field })
  }

  const handleCellBlur = (row: number, field: keyof PageMetadata, value: string) => {
    onUpdate(row, field, value)
    setEditingCell(null)
  }

  if (metadata.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No metadata to display. Please load a sitemap first.
        </p>
      </Card>
    )
  }

  const hasEmptyMetadata = metadata.some(m => !m.title && !m.description && !m.h1)

  return (
    <Card title={`Metadata (${metadata.length} pages)`}>
      {hasEmptyMetadata && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Some pages have missing metadata (likely due to CORS restrictions). 
            You can click on any cell to manually edit the metadata, or use the &quot;Retry Failed Extraction&quot; button above.
          </p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                URL
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                OG Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                OG Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                H1
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {metadata.map((item, index) => (
              <tr
                key={index}
                className={selectedRows.has(index) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(index)}
                    onChange={() => onSelectRow(index)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {item.url}
                  </a>
                </td>
                <td
                  className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                  onClick={() => handleCellClick(index, 'title')}
                >
                  {editingCell?.row === index && editingCell?.field === 'title' ? (
                    <input
                      type="text"
                      defaultValue={item.title}
                      onBlur={(e) => handleCellBlur(index, 'title', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCellBlur(index, 'title', e.currentTarget.value)
                        }
                      }}
                      autoFocus
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    <div className={`truncate max-w-xs ${!item.title ? 'text-gray-400 italic' : ''}`}>
                      {item.title || <span className="text-gray-400">(empty - click to edit)</span>}
                    </div>
                  )}
                </td>
                <td
                  className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                  onClick={() => handleCellClick(index, 'description')}
                >
                  {editingCell?.row === index && editingCell?.field === 'description' ? (
                    <textarea
                      defaultValue={item.description}
                      onBlur={(e) => handleCellBlur(index, 'description', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleCellBlur(index, 'description', e.currentTarget.value)
                        }
                      }}
                      autoFocus
                      className="w-full px-2 py-1 border rounded"
                      rows={2}
                    />
                  ) : (
                    <div className={`truncate max-w-xs ${!item.description || item.description.includes('[CORS Error') ? 'text-gray-400 italic' : ''}`}>
                      {item.description || <span className="text-gray-400">(empty - click to edit)</span>}
                    </div>
                  )}
                </td>
                <td
                  className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                  onClick={() => handleCellClick(index, 'ogTitle')}
                >
                  {editingCell?.row === index && editingCell?.field === 'ogTitle' ? (
                    <input
                      type="text"
                      defaultValue={item.ogTitle}
                      onBlur={(e) => handleCellBlur(index, 'ogTitle', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCellBlur(index, 'ogTitle', e.currentTarget.value)
                        }
                      }}
                      autoFocus
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    <div className="truncate max-w-xs">{item.ogTitle || '-'}</div>
                  )}
                </td>
                <td
                  className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                  onClick={() => handleCellClick(index, 'ogDescription')}
                >
                  {editingCell?.row === index && editingCell?.field === 'ogDescription' ? (
                    <textarea
                      defaultValue={item.ogDescription}
                      onBlur={(e) => handleCellBlur(index, 'ogDescription', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleCellBlur(index, 'ogDescription', e.currentTarget.value)
                        }
                      }}
                      autoFocus
                      className="w-full px-2 py-1 border rounded"
                      rows={2}
                    />
                  ) : (
                    <div className="truncate max-w-xs">{item.ogDescription || '-'}</div>
                  )}
                </td>
                <td
                  className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                  onClick={() => handleCellClick(index, 'h1')}
                >
                  {editingCell?.row === index && editingCell?.field === 'h1' ? (
                    <input
                      type="text"
                      defaultValue={item.h1}
                      onBlur={(e) => handleCellBlur(index, 'h1', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCellBlur(index, 'h1', e.currentTarget.value)
                        }
                      }}
                      autoFocus
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    <div className="truncate max-w-xs">{item.h1 || '-'}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Click on any cell to edit. Press Enter to save.
      </p>
    </Card>
  )
}

