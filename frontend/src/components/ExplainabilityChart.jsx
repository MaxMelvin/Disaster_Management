import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BAR_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e'];

const ExplainabilityChart = ({ data }) => {
    if (!data || Object.keys(data).length === 0) return null;

    const chartData = Object.entries(data)
        .map(([name, value]) => ({
            name: name.replace('disaster_type_', '').replace(/_/g, ' '),
            importance: value * 100,
        }))
        .sort((a, b) => b.importance - a.importance);

    return (
        <div className="glass-card-static p-6 animate-fade-in-delay-3">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#94a3b8' }}>
                <span>🧠</span> AI Decision Factors
            </h3>
            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div style={{
                                            background: 'rgba(17,24,39,0.95)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            padding: '8px 14px',
                                            fontSize: '12px',
                                            color: '#67e8f9',
                                            fontWeight: 700,
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                        }}>
                                            {`${payload[0].value.toFixed(1)}% Influence`}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="importance" radius={[0, 6, 6, 0]} barSize={18}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === 0 ? '#06b6d4' : BAR_COLORS[index % BAR_COLORS.length]}
                                    fillOpacity={index === 0 ? 1 : 0.5}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-[10px] mt-2 italic text-center" style={{ color: '#475569' }}>
                Higher percentage → Stronger impact on classification decision.
            </p>
        </div>
    );
};

export default ExplainabilityChart;
