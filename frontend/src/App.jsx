/**
 * App.jsx – Root component for the Disaster Resource Allocation System.
 *
 * Flow:
 *  1. User fills in DisasterForm with deaths, affected, damage_usd, (optional) budget.
 *  2. POST /optimize is called; response contains severity + resource_plan + total_cost.
 *  3. SeverityBadge displays the predicted class.
 *  4. AllocationCards displays the LP-optimised allocation and total cost.
 */

import React, { useState } from 'react'
import DisasterForm from './components/DisasterForm'
import SeverityBadge from './components/SeverityBadge'
import AllocationCards from './components/AllocationCards'

// Base URL for the FastAPI backend.
// In production, update this to the deployed API URL.
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null) // { severity, resource_plan, total_cost }

  /**
   * Called when the form is submitted.
   * POSTs to /optimize and stores the result in state.
   */
  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const body = { ...formData }
      // Remove budget key if it's undefined to avoid sending null
      if (body.budget === undefined) delete body.budget

      const response = await fetch(`${API_BASE}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail ?? `Server error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-10 px-4">
      {/* Header */}
      <header className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          🌍 Disaster Resource Allocation
        </h1>
        <p className="mt-2 text-gray-500 text-sm">
          AI-powered severity prediction &amp; LP-optimised resource planning
        </p>
      </header>

      <main className="max-w-3xl mx-auto space-y-6">
        {/* Input form */}
        <DisasterForm onSubmit={handleSubmit} loading={loading} />

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            <SeverityBadge severity={result.severity} />
            <AllocationCards
              resourcePlan={result.resource_plan}
              totalCost={result.total_cost}
            />
          </>
        )}
      </main>
    </div>
  )
}
