import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    {
        target: 'onboard-disaster-form',
        title: 'Step 1: Enter Disaster Metrics',
        description: 'Input critical data like disaster type, casualties, affected population, and estimated damage to generate a severity prediction.',
        icon: '📋',
        position: 'right',
    },
    {
        target: 'onboard-map',
        title: 'Step 2: Pin the Location',
        description: 'Click on the dark map to pinpoint the disaster location. Coordinates will be automatically captured.',
        icon: '🗺️',
        position: 'right',
    },
    {
        target: 'onboard-results',
        title: 'Step 3: View AI Analysis',
        description: 'After analysis, see the severity prediction, resource allocation, AI decision factors, and cost optimization results here.',
        icon: '🤖',
        position: 'left',
    },
    {
        target: 'onboard-monitoring',
        title: 'Step 4: Global Monitoring',
        description: 'Track real-time warehouse inventory, historical cost trends, and export data as CSV for external reporting.',
        icon: '🌍',
        position: 'top',
    },
];

const OnboardingTour = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const updatePosition = useCallback(() => {
        const el = document.getElementById(STEPS[step]?.target);
        if (el) {
            const rect = el.getBoundingClientRect();
            const scrollY = window.scrollY;
            const stepConfig = STEPS[step];

            let top, left;

            if (stepConfig.position === 'right') {
                top = rect.top + scrollY + rect.height / 2 - 80;
                left = rect.right + 20;
            } else if (stepConfig.position === 'left') {
                top = rect.top + scrollY + rect.height / 2 - 80;
                left = rect.left - 380;
            } else {
                top = rect.top + scrollY - 180;
                left = rect.left + rect.width / 2 - 175;
            }

            // Keep within viewport
            left = Math.max(20, Math.min(left, window.innerWidth - 380));
            top = Math.max(20, top);

            setPosition({ top, left });

            // Scroll into view
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [step]);

    useEffect(() => {
        const timer = setTimeout(updatePosition, 300);
        window.addEventListener('resize', updatePosition);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
        };
    }, [updatePosition]);

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    return (
        <>
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9998]"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}
                onClick={() => onComplete()}
            />

            {/* Highlight the target element */}
            <style>{`
        #${current.target} {
          position: relative;
          z-index: 9999 !important;
          box-shadow: 0 0 0 4px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.2) !important;
          border-radius: 20px;
        }
      `}</style>

            {/* Tooltip */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="fixed z-[10000]"
                    style={{ top: position.top, left: position.left, width: 350 }}
                >
                    <div
                        className="p-6 rounded-2xl"
                        style={{
                            background: 'rgba(17,24,39,0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(6,182,212,0.3)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(6,182,212,0.1)',
                        }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{current.icon}</span>
                            <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: '#67e8f9' }}>
                                {current.title}
                            </h3>
                        </div>
                        <p className="text-sm leading-relaxed mb-5" style={{ color: '#94a3b8' }}>
                            {current.description}
                        </p>

                        {/* Progress */}
                        <div className="flex items-center gap-1.5 mb-4">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className="h-1 rounded-full transition-all duration-300"
                                    style={{
                                        width: i === step ? 24 : 8,
                                        background: i <= step ? '#06b6d4' : 'rgba(255,255,255,0.1)',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={onComplete}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                                style={{ color: '#64748b', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                Skip Tour
                            </button>
                            <div className="flex gap-2">
                                {step > 0 && (
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className="text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                                        style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={() => isLast ? onComplete() : setStep(step + 1)}
                                    className="text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                                    style={{
                                        color: '#0a0e1a',
                                        background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                                    }}
                                >
                                    {isLast ? 'Finish ✓' : 'Next →'}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default OnboardingTour;
