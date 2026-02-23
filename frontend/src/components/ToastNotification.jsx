import React, { useState, useEffect, useCallback } from 'react';

let toastIdCounter = 0;
const listeners = new Set();
let toasts = [];

function notify(type, message, duration = 4000) {
    const id = ++toastIdCounter;
    const toast = { id, type, message, duration, exiting: false };
    toasts = [...toasts, toast];
    listeners.forEach(fn => fn(toasts));

    setTimeout(() => {
        toasts = toasts.map(t => t.id === id ? { ...t, exiting: true } : t);
        listeners.forEach(fn => fn(toasts));
        setTimeout(() => {
            toasts = toasts.filter(t => t.id !== id);
            listeners.forEach(fn => fn(toasts));
        }, 300);
    }, duration);
}

// Public API
export const toast = {
    success: (msg) => notify('success', msg),
    error: (msg) => notify('error', msg),
    warning: (msg) => notify('warning', msg),
    info: (msg) => notify('info', msg),
};

const ICONS = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
};

const ToastContainer = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        listeners.add(setItems);
        return () => listeners.delete(setItems);
    }, []);

    if (items.length === 0) return null;

    return (
        <div className="toast-container">
            {items.map((t) => (
                <div key={t.id} className={`toast toast-${t.type} ${t.exiting ? 'toast-exit' : ''}`}>
                    <span style={{ fontSize: '16px', fontWeight: 800 }}>{ICONS[t.type]}</span>
                    <span>{t.message}</span>
                    <div
                        className={`toast-progress`}
                        style={{
                            background: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#f43f5e' : t.type === 'warning' ? '#f59e0b' : '#06b6d4',
                            animationDuration: `${t.duration}ms`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
