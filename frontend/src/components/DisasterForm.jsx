/**
 * DisasterForm.jsx
 * Input form that collects disaster parameters (deaths, affected, damage_usd)
 * and optional budget override.  Calls onSubmit with the form values.
 */

import React, { useState } from 'react'

const DEFAULT_VALUES = {
  deaths: '',
  affected: '',
  damage_usd: '',
  budget: '',
}

export default function DisasterForm({ onSubmit, loading }) {
  const [values, setValues] = useState(DEFAULT_VALUES)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      deaths: parseFloat(values.deaths) || 0,
      affected: parseFloat(values.affected) || 0,
      damage_usd: parseFloat(values.damage_usd) || 0,
      budget: values.budget !== '' ? parseFloat(values.budget) : undefined,
    })
  }

  const fields = [
    {
      name: 'deaths',
      label: 'Deaths',
      placeholder: 'e.g. 200',
      required: true,
    },
    {
      name: 'affected',
      label: 'People Affected',
      placeholder: 'e.g. 50000',
      required: true,
    },
    {
      name: 'damage_usd',
      label: 'Damage (USD)',
      placeholder: 'e.g. 5000000',
      required: true,
    },
    {
      name: 'budget',
      label: 'Budget Override (USD)',
      placeholder: 'Optional – leave blank for default',
      required: false,
    },
  ]

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-md p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-700">Disaster Parameters</h2>

      {fields.map(({ name, label, placeholder, required }) => (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="number"
            name={name}
            value={values[name]}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            min="0"
            step="any"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                   text-white font-semibold py-2 rounded-lg transition-colors"
      >
        {loading ? 'Analysing…' : 'Allocate Resources'}
      </button>
    </form>
  )
}
