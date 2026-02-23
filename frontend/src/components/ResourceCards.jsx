import React, { useEffect, useState } from 'react';

const ICONS = { food_kits: "🍱", medical_units: "🏥", shelters: "🏠" };
const LABELS = { food_kits: "Food Kits", medical_units: "Medical Units", shelters: "Shelters" };
const COLORS = { food_kits: '#06b6d4', medical_units: '#f43f5e', shelters: '#10b981' };

const AnimatedNumber = ({ value, duration = 1200 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    const start = 0;
    const diff = value;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
};

export default function ResourceCards({ plan = {}, totalCost = 0 }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(plan || {}).map(([key, value], i) => (
          <div
            key={key}
            className={`glass-card tilt-card p-5 text-center animate-fade-in-delay-${i + 1}`}
            style={{ borderColor: `${COLORS[key]}22` }}
          >
            <div className="text-3xl mb-2" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.1))' }}>
              {ICONS[key]}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>
              {LABELS[key]}
            </div>
            <div className="text-2xl font-black" style={{ color: COLORS[key] }}>
              <AnimatedNumber value={value || 0} />
            </div>
          </div>
        ))}
      </div>

      {/* Total Cost */}
      <div
        className="glass-card-static p-4 text-center animate-fade-in"
        style={{ borderColor: 'rgba(139,92,246,0.2)' }}
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>
          Total Deployment Cost
        </span>
        <div className="text-2xl font-black mt-1" style={{ color: '#a78bfa' }}>
          $<AnimatedNumber value={totalCost || 0} />
        </div>
      </div>
    </div>
  );
}
