import React from 'react';

const SEVERITY_CONFIG = {
  Low: { class: 'severity-low', emoji: '🟢', label: 'LOW' },
  Medium: { class: 'severity-medium', emoji: '🟡', label: 'MED' },
  High: { class: 'severity-high', emoji: '🔴', label: 'HIGH' },
};

export default function SeverityBadge({ level, confidence }) {
  const cfg = SEVERITY_CONFIG[level] || SEVERITY_CONFIG.Low;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Severity Ring */}
      <div className="relative">
        <div
          className={`severity-badge ${cfg.class} px-5 py-2 rounded-full font-black text-sm uppercase tracking-widest`}
        >
          {cfg.emoji} {level || 'Unknown'}
        </div>
        {/* Pulse ring */}
        <div
          className={`absolute inset-0 rounded-full ${cfg.class}`}
          style={{
            animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            border: '2px solid var(--sev-color)',
            opacity: 0.3,
          }}
        />
      </div>

      {/* Confidence Meter */}
      {confidence != null && (
        <div className="flex flex-col items-center gap-1">
          <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.round(confidence * 100)}%`,
                background: `linear-gradient(90deg, var(--sev-color), transparent)`,
              }}
            />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>
            {Math.round(confidence * 100)}% Conf.
          </span>
        </div>
      )}
    </div>
  );
}
