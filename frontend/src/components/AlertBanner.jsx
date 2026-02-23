import React, { useState } from 'react';

const AlertBanner = ({ alerts = [] }) => {
    const [dismissed, setDismissed] = useState([]);

    if (!alerts || alerts.length === 0) return null;

    const visible = alerts.filter(a => !dismissed.includes(a.resource));
    if (visible.length === 0) return null;

    return (
        <div className="space-y-3 mb-8 animate-fade-in">
            {visible.map((alert) => (
                <div
                    key={alert.resource}
                    className="alert-banner flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-lg">
                            {alert.type === 'critical' ? '🔴' : '🟡'}
                        </span>
                        <div>
                            <span className="text-sm font-bold" style={{ color: alert.type === 'critical' ? '#fda4af' : '#fcd34d' }}>
                                {alert.type === 'critical' ? 'CRITICAL' : 'WARNING'}
                            </span>
                            <p className="text-sm" style={{ color: '#cbd5e1' }}>
                                {alert.message}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setDismissed([...dismissed, alert.resource])}
                        className="text-xs font-bold px-3 py-1 rounded-lg transition-all"
                        style={{
                            color: '#94a3b8',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        Dismiss
                    </button>
                </div>
            ))}
        </div>
    );
};

export default AlertBanner;
