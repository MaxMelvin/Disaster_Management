/**
 * SeverityBadge.jsx
 * Displays the predicted severity class with colour-coded styling.
 */

import React from 'react'

const SEVERITY_STYLES = {
  Low: 'bg-green-100 text-green-800 ring-green-400',
  Medium: 'bg-yellow-100 text-yellow-800 ring-yellow-400',
  High: 'bg-red-100 text-red-800 ring-red-400',
}

const SEVERITY_ICONS = {
  Low: '✅',
  Medium: '⚠️',
  High: '🚨',
}

export default function SeverityBadge({ severity }) {
  const style = SEVERITY_STYLES[severity] ?? 'bg-gray-100 text-gray-800 ring-gray-400'
  const icon = SEVERITY_ICONS[severity] ?? '❓'

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-3">
      <h2 className="text-xl font-semibold text-gray-700">Predicted Severity</h2>
      <span
        className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-2xl
                    font-bold ring-2 ${style}`}
      >
        {icon} {severity}
      </span>
    </div>
  )
}
