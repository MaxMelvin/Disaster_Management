import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WarehousePanel = ({ inventory, history }) => {
    if (!inventory) return null;

    const invItems = [
        { name: 'Food Kits', icon: '🍱', key: 'food_kits', color: '#06b6d4', max: 50000 },
        { name: 'Medical Units', icon: '🏥', key: 'medical_units', color: '#f43f5e', max: 2000 },
        { name: 'Shelters', icon: '🏠', key: 'shelters', color: '#10b981', max: 10000 },
    ];

    const trendData = (history || []).slice(-10).map((h, i) => ({
        time: `#${i + 1}`,
        cost: (h?.optimization?.total_cost || 0) / 1000,
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inventory Panel */}
            <div className="glass-card-static p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: '#94a3b8' }}>
                    <span>🏢</span> Global Warehouse Stock
                </h3>
                <div className="space-y-4">
                    {invItems.map(item => {
                        const current = inventory[item.key] || 0;
                        const pct = Math.max(0, Math.min(100, (current / item.max) * 100));
                        const isLow = pct < 20;
                        return (
                            <div key={item.key} className="glass-card-static p-4" style={{ borderColor: `${item.color}15` }}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{item.icon}</span>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>{item.name}</p>
                                            <p className="text-lg font-black" style={{ color: isLow ? '#fca5a5' : '#f1f5f9' }}>
                                                {current.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold" style={{ color: '#475569' }}>
                                        {Math.round(pct)}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <div
                                        className="progress-bar-animated h-full rounded-full"
                                        style={{
                                            width: `${pct}%`,
                                            background: isLow
                                                ? 'linear-gradient(90deg, #f43f5e, #f97316)'
                                                : `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cost Trends */}
            <div className="glass-card-static p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#94a3b8' }}>
                    <span>📈</span> Response Cost Trends ($K)
                </h3>
                <div className="h-48 w-full mt-2">
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="costGradientV3" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(17,24,39,0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        fontSize: '12px',
                                        color: '#f1f5f9',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="cost"
                                    stroke="#06b6d4"
                                    fill="url(#costGradientV3)"
                                    strokeWidth={2.5}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center" style={{ color: '#475569' }}>
                            <span className="text-sm italic">No cost data yet. Run an analysis to see trends.</span>
                        </div>
                    )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <button
                        onClick={() => window.open('http://localhost:8000/export/history')}
                        className="text-xs font-bold flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                        style={{
                            color: '#67e8f9',
                            background: 'rgba(6,182,212,0.08)',
                            border: '1px solid rgba(6,182,212,0.2)',
                        }}
                        onMouseEnter={e => { e.target.style.background = 'rgba(6,182,212,0.15)'; e.target.style.boxShadow = '0 0 20px rgba(6,182,212,0.15)'; }}
                        onMouseLeave={e => { e.target.style.background = 'rgba(6,182,212,0.08)'; e.target.style.boxShadow = 'none'; }}
                    >
                        📥 Export CSV
                    </button>
                    <p className="text-[10px] font-semibold" style={{ color: '#475569' }}>Last 10 responses</p>
                </div>
            </div>
        </div>
    );
};

export default WarehousePanel;
