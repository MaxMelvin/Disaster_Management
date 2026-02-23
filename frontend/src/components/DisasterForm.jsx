import { useState } from "react";

const DISASTER_TYPES = [
  { name: "Flood", icon: "🌊" },
  { name: "Earthquake", icon: "🏚️" },
  { name: "Storm", icon: "🌪️" },
  { name: "Drought", icon: "☀️" },
  { name: "Wildfire", icon: "🔥" },
];

export default function DisasterForm({ onAnalyze, mapPosition, loading }) {
  const [formData, setFormData] = useState({
    disaster_type: 'Flood',
    deaths: '',
    affected: '',
    damage_usd: '',
    budget: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Location Badge */}
      {mapPosition && (
        <div className="glass-card-static p-3 flex items-center gap-2 text-xs font-semibold animate-fade-in" style={{ borderColor: 'rgba(6,182,212,0.3)', color: '#67e8f9' }}>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          📍 {mapPosition.lat.toFixed(4)}, {mapPosition.lng.toFixed(4)}
        </div>
      )}

      {/* Disaster Type Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>
          Disaster Type
        </label>
        <div className="grid grid-cols-5 gap-2">
          {DISASTER_TYPES.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setFormData({ ...formData, disaster_type: t.name })}
              className="flex flex-col items-center p-3 rounded-xl transition-all duration-300 cursor-pointer"
              style={{
                background: formData.disaster_type === t.name ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${formData.disaster_type === t.name ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: formData.disaster_type === t.name ? '0 0 20px rgba(6,182,212,0.15)' : 'none',
                transform: formData.disaster_type === t.name ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <span className="text-xl mb-1">{t.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: formData.disaster_type === t.name ? '#67e8f9' : '#64748b' }}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      {[
        { name: "deaths", label: "Deaths", placeholder: "e.g. 150", icon: "💀" },
        { name: "affected", label: "Affected Population", placeholder: "e.g. 50000", icon: "👥" },
        { name: "damage_usd", label: "Estimated Damage (USD)", placeholder: "e.g. 5000000", icon: "💵" },
        { name: "budget", label: "Available Budget (USD)", placeholder: "e.g. 1000000", icon: "🏦" },
      ].map(({ name, label, placeholder, icon }) => (
        <div key={name}>
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
            <span>{icon}</span> {label}
          </label>
          <input
            type="number"
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            required
            min="0"
            className="input-glow"
          />
        </div>
      ))}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-gradient w-full"
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing Signal...
            </>
          ) : (
            <>
              ⚡ Deploy Analysis
            </>
          )}
        </span>
      </button>
    </form>
  );
}
