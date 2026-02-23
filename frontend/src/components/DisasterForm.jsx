import { useState } from "react";

const DISASTER_TYPES = ["Flood", "Earthquake", "Storm", "Drought", "Wildfire"];

export default function DisasterForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    disaster_type: "Flood",
    deaths: "",
    affected: "",
    damage_usd: "",
    budget: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
      <h2 className="text-2xl font-bold text-gray-800">Disaster Input</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Disaster Type</label>
        <select
          name="disaster_type"
          value={form.disaster_type}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {DISASTER_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {[
        { name: "deaths", label: "Deaths", placeholder: "e.g. 150" },
        { name: "affected", label: "Affected Population", placeholder: "e.g. 50000" },
        { name: "damage_usd", label: "Estimated Damage (USD)", placeholder: "e.g. 5000000" },
        { name: "budget", label: "Budget (USD)", placeholder: "e.g. 1000000" },
      ].map(({ name, label, placeholder }) => (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type="number"
            name={name}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
            required
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Analyzing..." : "Analyze & Optimize"}
      </button>
    </form>
  );
}
