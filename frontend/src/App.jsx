import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DisasterForm from "./components/DisasterForm";
import SeverityBadge from "./components/SeverityBadge";
import ResourceCards from "./components/ResourceCards";
import ResourceChart from './components/ResourceChart';
import DisasterMap from './components/DisasterMap';
import ExplainabilityChart from './components/ExplainabilityChart';
import WarehousePanel from './components/WarehousePanel';
import ParticleBackground from './components/ParticleBackground';
import ToastContainer, { toast } from './components/ToastNotification';
import AlertBanner from './components/AlertBanner';
import StatsBar from './components/StatsBar';
import OnboardingTour from './components/OnboardingTour';
import CommandPalette from './components/CommandPalette';
import axios from 'axios';

const API = 'http://localhost:8000';

// Framer-motion animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] } }),
};

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [systemError, setSystemError] = useState(null);
  const [mapPosition, setMapPosition] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showTour, setShowTour] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  // Check if first visit
  useEffect(() => {
    const visited = localStorage.getItem('disasterOS_visited');
    if (!visited) {
      setTimeout(() => setShowTour(true), 1500);
      localStorage.setItem('disasterOS_visited', 'true');
    }
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    fetchManagementData();
  }, []);

  const fetchManagementData = async () => {
    try {
      const [whRes, histRes, statsRes, alertRes] = await Promise.all([
        axios.get(`${API}/warehouse`),
        axios.get(`${API}/history`),
        axios.get(`${API}/stats`),
        axios.get(`${API}/alerts`),
      ]);
      setWarehouse(whRes.data || null);
      setHistory(Array.isArray(histRes.data) ? histRes.data : []);
      setStats(statsRes.data || null);
      setAlerts(Array.isArray(alertRes.data) ? alertRes.data : []);
    } catch (err) {
      console.error("Management data sync failed", err);
    }
  };

  const handleAnalyze = async (form) => {
    setLoading(true);
    setSystemError(null);
    setResult(null);

    try {
      const predRes = await axios.post(`${API}/predict`, {
        disaster_type: form.disaster_type,
        deaths: parseFloat(form.deaths || 0),
        affected: parseFloat(form.affected || 0),
        damage_usd: parseFloat(form.damage_usd || 0),
      });

      const optRes = await axios.post(`${API}/optimize`, {
        severity_level: predRes.data.severity_level,
        budget: parseFloat(form.budget || 1000000),
      });

      setResult({ ...predRes.data, ...optRes.data });
      fetchManagementData();
      toast.success(`Analysis complete — Severity: ${predRes.data.severity_level}`);
    } catch (err) {
      console.error("Analysis Pipeline Crash:", err);
      const msg = err.response?.data?.detail || err.message || "Unexpected system error";
      setSystemError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Command Palette action handler
  const handlePaletteAction = useCallback((id) => {
    const scrollTo = (elId) => {
      const el = document.getElementById(elId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    switch (id) {
      case 'export':
        window.open(`${API}/export/history`);
        toast.info('Downloading CSV...');
        break;
      case 'tour':
        setShowTour(true);
        break;
      case 'scroll-form':
        scrollTo('onboard-disaster-form');
        break;
      case 'scroll-map':
        scrollTo('onboard-map');
        break;
      case 'scroll-results':
        scrollTo('onboard-results');
        break;
      case 'scroll-monitoring':
        scrollTo('onboard-monitoring');
        break;
      default:
        break;
    }
  }, []);

  return (
    <>
      <ParticleBackground />
      <ToastContainer />

      {/* Onboarding Tour */}
      <AnimatePresence>
        {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
      </AnimatePresence>

      {/* Command Palette */}
      <CommandPalette
        isOpen={showPalette}
        onClose={() => setShowPalette(false)}
        onAction={handlePaletteAction}
      />

      <div className="relative z-10 min-h-screen pb-20">
        {/* ===== HEADER ===== */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card-static py-4 sm:py-6 px-4 sm:px-6 mb-6 sm:mb-8"
          style={{ borderRadius: '0 0 20px 20px', borderTop: 'none' }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: '#f1f5f9' }}>
                <span style={{ color: '#06b6d4' }}>⚡</span> DisasterOS
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold mt-0.5" style={{ color: '#475569' }}>
                AI Resource Allocation & Prediction Platform
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Command Palette Hint */}
              <button onClick={() => setShowPalette(true)} className="cmd-hint">
                <span className="text-[10px] font-bold" style={{ color: '#64748b' }}>⌘</span>
                <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}>
                  Ctrl+K
                </kbd>
              </button>
              {/* Tour Button */}
              <button
                onClick={() => setShowTour(true)}
                className="cmd-hint"
                title="Start Tour"
              >
                <span className="text-xs">🎓</span>
              </button>
              {/* Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline" style={{ color: '#6ee7b7' }}>
                  System Online
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                V3
              </span>
            </div>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* ===== ALERTS ===== */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <AlertBanner alerts={alerts} />
          </motion.div>

          {/* ===== STATS ===== */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            <StatsBar stats={stats} />
          </motion.div>

          {/* ===== ERROR ===== */}
          <AnimatePresence>
            {systemError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card-static p-5 mb-8 flex items-center gap-3"
                style={{ borderColor: 'rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.06)' }}
              >
                <span className="text-xl">🚨</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#fda4af' }}>System Alert</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: '#fecdd3' }}>{systemError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== MAIN GRID ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            {/* ===== LEFT: INPUTS ===== */}
            <motion.div
              className="space-y-6"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={slideInLeft} id="onboard-disaster-form" className="glass-card p-5 sm:p-7">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}>01</span>
                  <h2 className="text-base sm:text-lg font-bold" style={{ color: '#e2e8f0' }}>Disaster Metrics</h2>
                </div>
                <DisasterForm onAnalyze={handleAnalyze} mapPosition={mapPosition} loading={loading} />
              </motion.div>

              <motion.div variants={slideInLeft} id="onboard-map" className="glass-card p-5 sm:p-7">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>02</span>
                  <h2 className="text-base sm:text-lg font-bold" style={{ color: '#e2e8f0' }}>Location Intelligence</h2>
                </div>
                <DisasterMap position={mapPosition} setPosition={setMapPosition} />
              </motion.div>
            </motion.div>

            {/* ===== RIGHT: RESULTS ===== */}
            <motion.div
              className="space-y-6"
              id="onboard-results"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              {/* Loading State */}
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-8"
                  >
                    <div className="flex flex-col items-center justify-center h-56 gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                        <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-violet-500/10 border-b-violet-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>
                        Deploying ML Pipeline...
                      </p>
                      <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)', animation: 'shimmer 1.5s ease-in-out infinite', width: '100%' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Results */}
                {result && !loading && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="glass-card-glow p-5 sm:p-7 relative overflow-hidden">
                      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />

                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-7 relative z-10">
                        <div>
                          <h2 className="text-base sm:text-lg font-bold" style={{ color: '#e2e8f0' }}>Analysis Result</h2>
                          <p className="text-[10px] font-semibold uppercase tracking-widest mt-1" style={{ color: '#475569' }}>
                            ML Prediction + Optimization
                          </p>
                        </div>
                        <SeverityBadge level={result.severity_level} confidence={result.confidence} />
                      </div>

                      {result.error ? (
                        <div className="glass-card-static p-4" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)' }}>
                          <p className="text-xs font-bold" style={{ color: '#fcd34d' }}>⚠ Optimization Alert</p>
                          <p className="text-sm mt-1" style={{ color: '#fde68a' }}>{result.error}</p>
                        </div>
                      ) : (
                        <motion.div
                          className="space-y-6 relative z-10"
                          variants={stagger}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div variants={fadeUp}><ResourceCards plan={result.resource_plan} totalCost={result.total_cost} /></motion.div>
                          <motion.div variants={fadeUp}><ResourceChart plan={result.resource_plan} /></motion.div>
                        </motion.div>
                      )}
                    </div>

                    {result.feature_importance && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mt-6"
                      >
                        <ExplainabilityChart data={result.feature_importance} />
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Empty State */}
                {!result && !loading && !systemError && (
                  <motion.div
                    key="empty"
                    variants={slideInRight}
                    initial="hidden"
                    animate="visible"
                    className="glass-card p-8 sm:p-10 text-center"
                    style={{ minHeight: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="text-5xl mb-5"
                      style={{ filter: 'drop-shadow(0 0 20px rgba(6,182,212,0.2))' }}
                    >
                      📡
                    </motion.div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-3" style={{ color: '#64748b' }}>
                      Awaiting Signal
                    </h3>
                    <p className="text-xs leading-relaxed max-w-xs" style={{ color: '#475569' }}>
                      Connect to Global Disaster Network by inputting metrics and selecting coordinates.
                    </p>
                    <div className="mt-6 w-16 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ===== GLOBAL MONITORING ===== */}
          <motion.section
            id="onboard-monitoring"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="mt-10 sm:mt-12 glass-card p-5 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                <span>🌍</span> Global Response Monitoring
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ color: '#67e8f9', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
                Live
              </span>
            </div>
            <WarehousePanel inventory={warehouse} history={history} />
          </motion.section>

          {/* ===== FOOTER ===== */}
          <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-16 text-center pb-8"
          >
            <div className="w-12 h-0.5 mx-auto mb-4 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#334155' }}>
              DisasterOS · V3 Professional Suite
            </p>
          </motion.footer>
        </main>
      </div>
    </>
  );
}
