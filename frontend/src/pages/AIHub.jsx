import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BrainCircuit, Camera, Clock3, MapPin, Network, Radar, ShieldCheck, Smartphone, TrendingUp } from 'lucide-react';

const layerCatalog = [
  { key: 'environment', title: 'Environmental Fingerprinting', icon: Radar },
  { key: 'device', title: 'Device Integrity Scoring', icon: Smartphone },
  { key: 'geo', title: 'Dynamic Risk Geo-Fencing', icon: MapPin },
  { key: 'time', title: 'Time Consistency Engine', icon: Clock3 },
  { key: 'reputation', title: 'Reputation Economy', icon: TrendingUp },
  { key: 'challenge', title: 'Randomized Challenge System', icon: Activity },
  { key: 'graph', title: 'Graph Fraud Detection', icon: Network },
  { key: 'vision', title: 'Passive Vision Verification', icon: Camera },
];

const scenarios = {
  honest: {
    label: 'Honest Delivery',
    summary: 'All signals align with real-world delivery behavior.',
    score: 94,
    action: 'APPROVED',
    outcomes: {
      environment: 'PASS',
      device: 'PASS',
      geo: 'PASS',
      time: 'PASS',
      reputation: 'PASS',
      challenge: 'SKIP',
      graph: 'PASS',
      vision: 'PASS',
    },
  },
  weatherFraud: {
    label: 'Weather Mismatch Fraud',
    summary: 'Ambient frame and weather telemetry conflict with claim context.',
    score: 58,
    action: 'VERIFY',
    outcomes: {
      environment: 'WARN',
      device: 'PASS',
      geo: 'WARN',
      time: 'PASS',
      reputation: 'WARN',
      challenge: 'RUN',
      graph: 'PASS',
      vision: 'WARN',
    },
  },
  ringFraud: {
    label: 'Coordinated Ring Attempt',
    summary: 'Synchronized behavior and risky-device pattern trigger ring detection.',
    score: 18,
    action: 'FLAGGED',
    outcomes: {
      environment: 'WARN',
      device: 'FAIL',
      geo: 'WARN',
      time: 'WARN',
      reputation: 'FAIL',
      challenge: 'RUN',
      graph: 'FAIL',
      vision: 'WARN',
    },
  },
};

const statusTone = {
  PASS: 'success',
  WARN: 'warning',
  FAIL: 'danger',
  RUN: 'warning',
  SKIP: 'muted',
  PENDING: 'muted',
};

const AIHub = () => {
  const [scenarioKey, setScenarioKey] = useState('honest');
  const [running, setRunning] = useState(false);
  const [stageIndex, setStageIndex] = useState(-1);
  const [progress, setProgress] = useState(0);

  const scenario = useMemo(() => scenarios[scenarioKey], [scenarioKey]);

  useEffect(() => {
    if (!running) return undefined;

    setStageIndex(0);
    setProgress(8);

    const interval = setInterval(() => {
      setStageIndex((current) => {
        const next = current + 1;
        if (next >= layerCatalog.length) {
          setRunning(false);
          setProgress(100);
          clearInterval(interval);
          return current;
        }
        setProgress(Math.min(100, Math.round(((next + 1) / layerCatalog.length) * 100)));
        return next;
      });
    }, 650);

    return () => clearInterval(interval);
  }, [running]);

  const getLayerStatus = (layerKey, idx) => {
    if (!running && stageIndex < 0) return 'PENDING';
    if (running && idx > stageIndex) return 'PENDING';
    return scenario.outcomes[layerKey] || 'PENDING';
  };

  return (
    <section className="section shell ai-hub-wrap">
      <div className="section-head">
        <h2>AI Hub</h2>
        <p>Interactive simulation view to demonstrate feature-level fraud decisions in real time.</p>
      </div>

      <div className="ai-hub-topbar">
        <div className="ai-hub-scenarios">
          {Object.entries(scenarios).map(([key, item]) => (
            <button
              key={key}
              onClick={() => {
                setScenarioKey(key);
                setRunning(false);
                setStageIndex(-1);
                setProgress(0);
              }}
              className={`ai-chip ${scenarioKey === key ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            setRunning(true);
            setStageIndex(-1);
            setProgress(0);
          }}
          disabled={running}
        >
          {running ? 'Running...' : 'Run AI Simulation'}
        </button>
      </div>

      <div className="ai-progress-card">
        <div className="ai-progress-head">
          <span>Pipeline Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="ai-progress-track">
          <div className="ai-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p>{scenario.summary}</p>
      </div>

      <div className="ai-grid">
        {layerCatalog.map((layer, idx) => {
          const Icon = layer.icon;
          const status = getLayerStatus(layer.key, idx);
          return (
            <article key={layer.key} className="ai-layer-card">
              <div className="ai-layer-head">
                <div className="feature-icon"><Icon size={18} /></div>
                <h3>{layer.title}</h3>
              </div>
              <span className={`ai-pill ${statusTone[status]}`}>{status}</span>
            </article>
          );
        })}
      </div>

      <div className="ai-result-card">
        <div className="ai-result-meta">
          <span className="mini-label">Decision</span>
          <h3>{scenario.action}</h3>
        </div>
        <div className="ai-result-meta">
          <span className="mini-label">Trust Score</span>
          <h3>{scenario.score}</h3>
        </div>
        <div className="ai-result-meta">
          <span className="mini-label">Guidewire Sync</span>
          <h3>{running ? 'Processing' : 'Updated'}</h3>
        </div>
      </div>

      <div className="ai-demo-note">
        <ShieldCheck size={16} />
        <span>Video flow: choose scenario → run simulation → show layer outcomes → show decision and trust score.</span>
      </div>
    </section>
  );
};

export default AIHub;
