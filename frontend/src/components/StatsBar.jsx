import React, { useEffect, useState } from 'react';

const AnimatedNumber = ({ value, duration = 1500 }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!value) { setDisplay(0); return; }
        const start = display;
        const diff = value - start;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setDisplay(Math.round(start + diff * eased));
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [value]);

    return <span className="stat-number">{display.toLocaleString()}</span>;
};

const STATS_CONFIG = [
    { key: 'total_analyses', label: 'Analyses Run', icon: '📊', color: '#06b6d4', gradient: 'from-cyan-500/10 to-cyan-500/0' },
    { key: 'total_cost', label: 'Total Budget Used', icon: '💰', color: '#8b5cf6', gradient: 'from-violet-500/10 to-violet-500/0', prefix: '$' },
    { key: 'total_resources_deployed', label: 'Resources Deployed', icon: '📦', color: '#10b981', gradient: 'from-emerald-500/10 to-emerald-500/0' },
];

const StatsBar = ({ stats = {} }) => {
    if (!stats || !stats.total_analyses) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {STATS_CONFIG.map((cfg, i) => (
                <div
                    key={cfg.key}
                    className={`glass-card tilt-card p-5 animate-fade-in-delay-${i + 1}`}
                    style={{ borderColor: `${cfg.color}22` }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{cfg.icon}</span>
                        <span
                            className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: cfg.color }}
                        >
                            {cfg.label}
                        </span>
                    </div>
                    <div className="text-3xl font-black" style={{ color: cfg.color }}>
                        {cfg.prefix || ''}<AnimatedNumber value={stats[cfg.key] || 0} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsBar;
