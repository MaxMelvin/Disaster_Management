import React from 'react';

const ParticleBackground = () => {
    return (
        <div className="mesh-bg">
            {/* Animated gradient orbs */}
            <div className="orb orb-cyan" style={{ width: '500px', height: '500px', top: '-5%', right: '-8%' }} />
            <div className="orb orb-violet" style={{ width: '400px', height: '400px', bottom: '10%', left: '-5%' }} />
            <div className="orb orb-emerald" style={{ width: '350px', height: '350px', top: '40%', left: '50%' }} />

            {/* Floating particles */}
            {Array.from({ length: 30 }).map((_, i) => {
                const size = ['particle-sm', 'particle-md', 'particle-lg'][i % 3];
                const colors = ['rgba(6,182,212,0.4)', 'rgba(139,92,246,0.4)', 'rgba(16,185,129,0.3)'];
                return (
                    <div
                        key={i}
                        className={`particle ${size}`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            background: colors[i % 3],
                            animationDuration: `${15 + Math.random() * 25}s`,
                            animationDelay: `${Math.random() * 20}s`,
                        }}
                    />
                );
            })}
        </div>
    );
};

export default ParticleBackground;
