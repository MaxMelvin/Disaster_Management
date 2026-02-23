import { useState } from "react";
import DisasterForm from "./components/DisasterForm";
import SeverityBadge from "./components/SeverityBadge";
import ResourceCards from "./components/ResourceCards";
import ResourceChart from "./components/ResourceChart";
import { predictSeverity, optimizeResources } from "./services/api";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (form) => {
    setLoading(true);
    setError(null);
    setSeverity(null);
    setOptimization(null);

    try {
      // Step 1: Predict severity
      const predResult = await predictSeverity({
        disaster_type: form.disaster_type,
        deaths: form.deaths,
        affected: form.affected,
        damage_usd: form.damage_usd,
      });
      setSeverity(predResult.severity_level);

      // Step 2: Optimize resources
      const optResult = await optimizeResources({
        severity_level: predResult.severity_level,
        budget: form.budget,
      });

      if (optResult.error) {
        setError(optResult.error);
      } else {
        setOptimization(optResult);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            🚨 Disaster Resource Allocation
          </h1>
          <p className="mt-2 text-gray-500">
            AI-powered severity prediction &amp; optimized relief distribution
          </p>
        </header>

        <DisasterForm onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
            {error}
          </div>
        )}

        {severity && (
          <div className="text-center">
            <SeverityBadge level={severity} />
          </div>
        )}

        {optimization && optimization.resource_plan && (
          <>
            <ResourceCards
              plan={optimization.resource_plan}
              totalCost={optimization.total_cost}
            />
            <ResourceChart plan={optimization.resource_plan} />
          </>
        )}
      </div>
    </div>
  );
}
