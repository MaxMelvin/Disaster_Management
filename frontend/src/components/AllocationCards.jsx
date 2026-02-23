/**
 * AllocationCards.jsx
 * Displays the optimised resource allocation plan as individual cards
 * alongside the total cost.
 */

import React from 'react'

const RESOURCE_META = {
  food_kits: {
    label: 'Food Kits',
    icon: '🍱',
    unit: 'kits',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
  },
  medical_units: {
    label: 'Medical Units',
    icon: '🏥',
    unit: 'units',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
  },
  shelters: {
    label: 'Shelters',
    icon: '⛺',
    unit: 'shelters',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
  },
}

export default function AllocationCards({ resourcePlan, totalCost }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Resource Allocation Plan</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(resourcePlan).map(([resource, qty]) => {
          const meta = RESOURCE_META[resource] ?? {
            label: resource,
            icon: '📦',
            unit: 'units',
            bg: 'bg-gray-50',
            border: 'border-gray-300',
          }
          return (
            <div
              key={resource}
              className={`${meta.bg} border ${meta.border} rounded-2xl p-5 flex flex-col
                          items-center shadow-sm`}
            >
              <span className="text-4xl mb-2">{meta.icon}</span>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {meta.label}
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {qty.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">{meta.unit}</p>
            </div>
          )
        })}
      </div>

      {/* Total cost summary */}
      <div className="bg-gray-800 text-white rounded-2xl px-6 py-4 flex justify-between items-center shadow">
        <span className="text-sm font-medium uppercase tracking-wider">Total Cost</span>
        <span className="text-2xl font-bold">
          ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}
