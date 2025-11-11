'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { LighthouseHistory } from '@/types'
import { format } from 'date-fns'

interface ScoreChartProps {
  history: LighthouseHistory
}

export default function ScoreChart({ history }: ScoreChartProps) {
  if (!history || history.results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No historical data available
      </div>
    )
  }

  const chartData = history.results.map((result) => ({
    date: format(new Date(result.timestamp), 'MMM d, HH:mm'),
    timestamp: result.timestamp,
    Performance: result.scores.performance,
    Accessibility: result.scores.accessibility,
    'Best Practices': result.scores.bestPractices,
    SEO: result.scores.seo,
  }))

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
          <XAxis 
            dataKey="date" 
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            domain={[0, 100]}
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Performance" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="Accessibility" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="Best Practices" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="SEO" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

