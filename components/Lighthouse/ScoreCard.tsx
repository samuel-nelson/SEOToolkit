'use client'

import React from 'react'
import { LighthouseScore } from '@/types'

interface ScoreCardProps {
  label: string
  score: number
  color?: string
}

export default function ScoreCard({ label, score, color }: ScoreCardProps) {
  const getColor = () => {
    if (color) return color
    if (score >= 90) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  const getRingColor = () => {
    if (score >= 90) return 'stroke-green-600'
    if (score >= 50) return 'stroke-yellow-600'
    return 'stroke-red-600'
  }

  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={`rounded-lg p-6 ${getColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{label}</h3>
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`${getRingColor()} transition-all duration-500`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{score}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

