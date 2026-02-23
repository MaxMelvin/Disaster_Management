import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIONS = [
    { id: 'analyze', label: 'Run Analysis', description: 'Analyze current disaster metrics', icon: '⚡', shortcut: 'Enter', category: 'Actions' },
    { id: 'export', label: 'Export CSV', description: 'Download history as CSV file', icon: '📥', shortcut: null, category: 'Actions' },
    { id: 'tour', label: 'Start Tour', description: 'Launch onboarding walkthrough', icon: '🎓', shortcut: null, category: 'Actions' },
    { id: 'scroll-form', label: 'Go to Disaster Form', description: 'Jump to the metrics input section', icon: '📋', shortcut: null, category: 'Navigation' },
    { id: 'scroll-map', label: 'Go to Map', description: 'Jump to the location map', icon: '🗺️', shortcut: null, category: 'Navigation' },
    { id: 'scroll-results', label: 'Go to Results', description: 'Jump to the analysis results', icon: '📊', shortcut: null, category: 'Navigation' },
    { id: 'scroll-monitoring', label: 'Go to Monitoring', description: 'Jump to warehouse & trends', icon: '🌍', shortcut: null, category: 'Navigation' },
    { id: 'type-flood', label: 'Set Flood', description: 'Select disaster type: Flood', icon: '🌊', shortcut: null, category: 'Quick Set' },
    { id: 'type-earthquake', label: 'Set Earthquake', description: 'Select disaster type: Earthquake', icon: '🏚️', shortcut: null, category: 'Quick Set' },
    { id: 'type-storm', label: 'Set Storm', description: 'Select disaster type: Storm', icon: '🌪️', shortcut: null, category: 'Quick Set' },
    { id: 'type-wildfire', label: 'Set Wildfire', description: 'Select disaster type: Wildfire', icon: '🔥', shortcut: null, category: 'Quick Set' },
];

const CommandPalette = ({ isOpen, onClose, onAction }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const filtered = useMemo(() => {
        if (!query.trim()) return ACTIONS;
        const q = query.toLowerCase();
        return ACTIONS.filter(a =>
            a.label.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q)
        );
    }, [query]);

    const grouped = useMemo(() => {
        const groups = {};
        filtered.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [filtered]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && filtered[selectedIndex]) {
            e.preventDefault();
            onAction(filtered[selectedIndex].id);
            onClose();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    let flatIndex = -1;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9990]"
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                        onClick={onClose}
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="fixed z-[9991] left-1/2 -translate-x-1/2"
                        style={{ top: '15%', width: '100%', maxWidth: 560 }}
                    >
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(17,24,39,0.97)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(6,182,212,0.08)',
                            }}
                        >
                            {/* Search Input */}
                            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <span style={{ color: '#64748b', fontSize: 16 }}>🔍</span>
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a command or search..."
                                    className="flex-1 bg-transparent outline-none text-sm font-medium"
                                    style={{ color: '#f1f5f9' }}
                                />
                                <kbd
                                    className="text-[10px] font-bold px-2 py-0.5 rounded"
                                    style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}
                                >
                                    ESC
                                </kbd>
                            </div>

                            {/* Results */}
                            <div className="max-h-80 overflow-y-auto py-2 px-2" style={{ scrollbarWidth: 'thin' }}>
                                {filtered.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-sm" style={{ color: '#475569' }}>No results found</p>
                                    </div>
                                ) : (
                                    Object.entries(grouped).map(([category, items]) => (
                                        <div key={category}>
                                            <p className="text-[10px] font-bold uppercase tracking-widest px-3 pt-3 pb-1" style={{ color: '#475569' }}>
                                                {category}
                                            </p>
                                            {items.map((item) => {
                                                flatIndex++;
                                                const isSelected = flatIndex === selectedIndex;
                                                const idx = flatIndex;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => { onAction(item.id); onClose(); }}
                                                        onMouseEnter={() => setSelectedIndex(idx)}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-150"
                                                        style={{
                                                            background: isSelected ? 'rgba(6,182,212,0.08)' : 'transparent',
                                                            borderLeft: isSelected ? '2px solid #06b6d4' : '2px solid transparent',
                                                        }}
                                                    >
                                                        <span className="text-lg w-7 text-center">{item.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold truncate" style={{ color: isSelected ? '#f1f5f9' : '#94a3b8' }}>
                                                                {item.label}
                                                            </p>
                                                            <p className="text-[11px] truncate" style={{ color: '#475569' }}>
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                        {item.shortcut && (
                                                            <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}>
                                                                {item.shortcut}
                                                            </kbd>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1 text-[10px]" style={{ color: '#475569' }}>
                                        <kbd className="px-1 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(255,255,255,0.06)' }}>↑↓</kbd> Navigate
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px]" style={{ color: '#475569' }}>
                                        <kbd className="px-1 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(255,255,255,0.06)' }}>↵</kbd> Select
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold" style={{ color: '#334155' }}>
                                    DisasterOS Command Palette
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
