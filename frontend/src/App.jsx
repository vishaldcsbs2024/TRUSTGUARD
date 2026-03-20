import React from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ClaimDetails from './pages/ClaimDetails';
import MobileApp from './pages/MobileApp';
import AIHub from './pages/AIHub';
import {
  ShieldCheck,
  Radar,
  BrainCircuit,
  Network,
  MapPin,
  Clock3,
  Smartphone,
  Camera,
  Lock,
  Activity,
  TrendingUp,
  Users,
  CloudRain,
  Database,
  ArrowRight,
  FileCheck2,
  ShieldAlert,
  Siren,
  Bot,
  Wifi,
} from 'lucide-react';

const layers = [
  {
    title: 'Environmental Fingerprinting',
    desc: 'Builds a Reality Hash from GPS, temperature, sound, light, and magnetometer to validate physical coherence.',
    icon: <Radar size={18} />,
  },
  {
    title: 'Device Integrity Scoring',
    desc: 'Detects rooted devices, mock-location apps, emulator signals, and SDK tampering before trusting any claim data.',
    icon: <Smartphone size={18} />,
  },
  {
    title: 'Dynamic Risk Geo-Fencing',
    desc: 'Applies near-real-time micro-zone risk logic using weather events, fraud hotspots, and traffic concentration.',
    icon: <MapPin size={18} />,
  },
  {
    title: 'Time Consistency Engine',
    desc: 'Cross-checks routes, travel speed, event timelines, and delivery logs to detect impossible stories.',
    icon: <Clock3 size={18} />,
  },
  {
    title: 'Reputation Economy',
    desc: 'Rewards long-term honesty with fast-track payouts and raises verification on repeat-risk patterns.',
    icon: <TrendingUp size={18} />,
  },
  {
    title: 'Randomized Challenge System',
    desc: 'Uses probabilistic liveness checks so fraud workflows cannot be reverse engineered at scale.',
    icon: <Activity size={18} />,
  },
  {
    title: 'Graph Fraud Detection',
    desc: 'Finds coordinated rings via shared devices, synchronized claims, overlapping zones, and IP relationships.',
    icon: <Network size={18} />,
  },
  {
    title: 'Passive Vision Verification',
    desc: 'Runs on-device ambient classification and transmits only structured outputs, never raw images.',
    icon: <Camera size={18} />,
  },
];

const counters = [
  { attack: 'GPS Spoofing Apps', counter: 'Mock-location detection + reality coherence mismatch' },
  { attack: 'Stationary-at-Home Fraud', counter: 'Accelerometer micro-motion and ambient profile checks' },
  { attack: 'Mass Burst Ring Claims', counter: 'Temporal clustering alerts and zone-level payout hold' },
  { attack: 'Cell Tower Mismatch', counter: 'Hardware-level network location cross-reference' },
];

const defenseConsole = [
  {
    title: 'Syndicate Spike Monitor',
    signal: '215 claims in 12 min vs baseline 42',
    action: 'Freeze auto-payout in Zone 7A and queue investigator alerts',
    severity: 'CRITICAL',
    icon: <Siren size={18} />,
  },
  {
    title: 'Reality Coherence Drift',
    signal: 'Temp + light + ambient noise mismatch in 64% of flagged claims',
    action: 'Require passive resampling and stage-3 liveness for unresolved claims',
    severity: 'HIGH',
    icon: <ShieldAlert size={18} />,
  },
  {
    title: 'Automation Fingerprint',
    signal: 'Identical claim text entropy and emulator-like sensor signatures',
    action: 'Escalate to graph ring review and reputation contagion checks',
    severity: 'HIGH',
    icon: <Bot size={18} />,
  },
  {
    title: 'Network Tower Mismatch',
    signal: 'Claimed GPS zone differs from observed tower region cluster',
    action: 'Shift claim to manual verification with pre-filled evidence packet',
    severity: 'MEDIUM',
    icon: <Wifi size={18} />,
  },
];

const defensePipeline = [
  {
    step: 'Detect',
    detail: 'Ring indicators trigger from temporal spikes, device overlap, and coherence mismatch.',
  },
  {
    step: 'Contain',
    detail: 'Zone-level payout guardrail activates while honest claims remain in neutral messaging flow.',
  },
  {
    step: 'Verify',
    detail: 'Passive rechecks + lightweight liveness challenge separate genuine edge cases from scripted fraud.',
  },
  {
    step: 'Resolve',
    detail: 'Guidewire investigator queue receives explainable reasons, risk score, and recommended disposition.',
  },
];

const metrics = [
  { label: 'Fraud Rate Reduction', value: '12% → <4%' },
  { label: 'High-Rep Claim Processing', value: '< 4 hours' },
  { label: 'Manual Review Load', value: '~15%' },
  { label: 'Verification Cost Drop', value: '60–70%' },
];

const personas = [
  {
    title: 'Claims Investigators',
    detail: 'Need explainable triage, structured fraud reasons, and a prioritized queue in ClaimCenter.',
  },
  {
    title: 'Delivery & Gig Agents',
    detail: 'Honest majority should experience low friction, fast payouts, and consistent decisions.',
  },
  {
    title: 'Ops Managers',
    detail: 'Require risk trend visibility, auditability, and fraud savings without harming CX.',
  },
];

const escalationFlow = [
  {
    stage: 'Stage 1 · Silent Hold',
    detail: 'Claim enters a soft-hold queue with neutral messaging — no accusation, no penalty.',
  },
  {
    stage: 'Stage 2 · Passive Re-Verification',
    detail: 'System rechecks motion, environment evolution, and nearby corroborating signals.',
  },
  {
    stage: 'Stage 3 · Lightweight Challenge',
    detail: 'If ambiguity remains, a 10-second liveness action (e.g., phone rotation) is requested.',
  },
  {
    stage: 'Stage 4 · Human Escalation',
    detail: 'Investigator receives reputation context, weather evidence, and appeal-friendly workflow.',
  },
];

const crashResilience = [
  'Dynamic threshold tightening during macro-stress events',
  'Higher reputation penalties for repeat risk behavior',
  'Increased graph sensitivity for early ring interception',
  'Operational cost stays controlled as fraud pressure rises',
];

const techStack = [
  'Mobile SDK: Android/iOS sensor fusion and attestation modules',
  'Backend: Node.js serverless scoring services with async graph jobs',
  'Graph Layer: Neo4j/GDS for cluster and ring detection',
  'ML: On-device vision classifier + risk-scoring model pipeline',
  'Integration: ClaimCenter APIs, workflow hooks, DataHub feedback loop',
  'Storage: PostgreSQL for history + Redis for near-real-time reputation state',
];

const marketingNav = [
  { to: '/', label: 'Overview' },
  { to: '/ai-hub', label: 'AI Hub' },
  { to: '/defense', label: 'Defense' },
  { to: '/architecture', label: 'Architecture' },
  { to: '/impact', label: 'Impact' },
  { to: '/integrations', label: 'Integrations' },
  { to: '/dashboard', label: 'Live Dashboard' },
  { to: '/mobile', label: 'Mobile Demo' },
];

const TopNav = () => (
  <header className="top-nav">
    <div className="brand">
      <ShieldCheck size={20} />
      <span>TrustGuard</span>
    </div>
    <nav className="nav-actions">
      {marketingNav.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={item.to === '/'}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  </header>
);

const AppShell = ({ children }) => (
  <div className="site-root">
    <TopNav />
    <main>{children}</main>
    <footer className="site-footer">
      <Lock size={16} />
      <p>TrustGuard • Built for Guidewire Hackathon • Intelligent, explainable, privacy-first fraud defense</p>
    </footer>
  </div>
);

const OverviewPage = () => (
  <>
    <section className="hero section shell">
      <p className="eyebrow">Guidewire Innovation Challenge • Hackathon Website</p>
      <h1>Intelligent Claims Fraud Detection That Verifies Reality, Not Just GPS</h1>
      <p className="lead">
        TrustGuard is a multi-signal AI fraud layer built for Guidewire ClaimCenter. It protects insurers from
        coordinated ring fraud while keeping honest agents fast, frictionless, and fairly treated.
      </p>
      <div className="hero-cta-row">
        <NavLink className="btn-primary" to="/ai-hub">Explore AI Hub</NavLink>
        <NavLink className="btn-ghost" to="/integrations">See Guidewire Integration</NavLink>
      </div>
      <div className="hero-grid">
        <article className="glass-card">
          <h3>$80B+</h3>
          <p>Annual global insurance fraud burden addressed through multi-layer risk intelligence.</p>
        </article>
        <article className="glass-card">
          <h3>8 AI Layers</h3>
          <p>Environmental, temporal, device, graph, and reputation logic combined in one scoring flow.</p>
        </article>
        <article className="glass-card">
          <h3>Privacy First</h3>
          <p>No raw audio or image storage, on-device processing, explainable score logs, and appeal workflows.</p>
        </article>
      </div>

      <div className="stat-strip">
        <article>
          <p className="mini-label">Reality Coherence</p>
          <h3>5-Signal Hash</h3>
          <p>GPS + temperature + sound + light + magnetometer.</p>
        </article>
        <article>
          <p className="mini-label">Primary Threat</p>
          <h3>Coordinated Ring Bursts</h3>
          <p>Detects synchronized claim activity and shared fraud infrastructure.</p>
        </article>
        <article>
          <p className="mini-label">Decision Mode</p>
          <h3>Innocent Until Escalated</h3>
          <p>Low-friction experience for honest agents under adverse network/weather conditions.</p>
        </article>
      </div>
    </section>

    <section className="section shell split">
      <article className="panel">
        <h2>The Problem</h2>
        <p>
          Rule-based checks fail against modern fraud rings. GPS spoofing, synchronized claim bursts, and scripted
          behavior create large payout leaks that traditional workflows cannot catch early.
        </p>
      </article>
      <article className="panel highlight">
        <h2>The TrustGuard Approach</h2>
        <p>
          Instead of trusting one signal, TrustGuard checks physical coherence across environment, timeline,
          device integrity, behavior, and network relationships to make fraud operationally expensive.
        </p>
      </article>
    </section>

    <section className="section shell">
      <div className="section-head">
        <h2>Designed for Real Users in the Claims Lifecycle</h2>
        <p>TrustGuard aligns model behavior to investigator workflow, claimant experience, and operations governance.</p>
      </div>
      <div className="persona-grid">
        {personas.map((persona) => (
          <article className="feature-card" key={persona.title}>
            <h3>{persona.title}</h3>
            <p>{persona.detail}</p>
          </article>
        ))}
      </div>
    </section>
  </>
);

const LayersPage = () => (
  <section className="section shell">
    <div className="section-head">
      <h2>Eight-Layer AI Detection Stack</h2>
      <p>Designed to stop individual spoofing and coordinated syndicate behavior with explainable outputs.</p>
    </div>
    <div className="layer-grid">
      {layers.map((item) => (
        <article className="feature-card" key={item.title}>
          <div className="feature-icon">{item.icon}</div>
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </article>
      ))}
    </div>
  </section>
);

const DefensePage = () => (
  <section className="section shell defense-page">
    <div className="section-head">
      <h2>Adversarial Defense for Large-Scale Syndicates</h2>
      <p>Built to detect Telegram-style coordinated bursts and spoofed weather claims in tier-1 city scenarios.</p>
    </div>
    <div className="defense-grid">
      {counters.map((item) => (
        <article className="counter-card" key={item.attack}>
          <p className="mini-label">Attack Vector</p>
          <h3>{item.attack}</h3>
          <ArrowRight size={16} />
          <p>{item.counter}</p>
        </article>
      ))}
    </div>

    <div className="section-head">
      <h2>Flag Handling UX for Honest Agents</h2>
      <p>Escalation is progressive, minimally disruptive, and centered on fairness under uncertainty.</p>
    </div>
    <div className="flow-grid">
      {escalationFlow.map((step) => (
        <article className="panel" key={step.stage}>
          <h3>{step.stage}</h3>
          <p>{step.detail}</p>
        </article>
      ))}
    </div>

    <div className="section-head">
      <h2>Defense Frontend Console</h2>
      <p>Operational cards surface active threat signals, automatic actions, and investigation intent in real time.</p>
    </div>
    <div className="defense-console-grid">
      {defenseConsole.map((item) => (
        <article className="defense-console-card" key={item.title}>
          <div className="defense-console-head">
            <div className="feature-icon">{item.icon}</div>
            <span className={`defense-severity ${item.severity.toLowerCase()}`}>{item.severity}</span>
          </div>
          <h3>{item.title}</h3>
          <p><strong>Signal:</strong> {item.signal}</p>
          <p><strong>Auto Action:</strong> {item.action}</p>
        </article>
      ))}
    </div>

    <div className="section-head">
      <h2>Syndicate Response Pipeline</h2>
      <p>Clear workflow from detection to investigator decision, built for high-volume incident windows.</p>
    </div>
    <div className="pipeline-grid">
      {defensePipeline.map((item) => (
        <article className="pipeline-card" key={item.step}>
          <span>{item.step}</span>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  </section>
);

const ArchitecturePage = () => (
  <section className="section shell architecture">
    <div className="section-head">
      <h2>System Architecture</h2>
      <p>Mobile SDK + Cloud Risk Engine + Guidewire ClaimCenter integration with real-time and async pipelines.</p>
    </div>
    <div className="arch-row">
      <div className="arch-node">
        <Smartphone size={20} />
        <span>Mobile SDK</span>
      </div>
      <div className="arch-node">
        <BrainCircuit size={20} />
        <span>Scoring Engine</span>
      </div>
      <div className="arch-node">
        <CloudRain size={20} />
        <span>Weather APIs</span>
      </div>
      <div className="arch-node">
        <Database size={20} />
        <span>Graph + Data Store</span>
      </div>
      <div className="arch-node">
        <Users size={20} />
        <span>ClaimCenter Workflow</span>
      </div>
    </div>

    <div className="section-head">
      <h2>Core Technical Stack</h2>
      <p>Implementation architecture optimized for explainability, resilience, and scalable review operations.</p>
    </div>
    <div className="stack-grid">
      {techStack.map((item) => (
        <article className="feature-card" key={item}>
          <h3>{item}</h3>
        </article>
      ))}
    </div>
  </section>
);

const ImpactPage = () => (
  <>
    <section className="section shell">
      <div className="section-head">
        <h2>Expected Business Impact</h2>
        <p>Operational resilience in market stress while reducing false positives and investigator overload.</p>
      </div>
      <div className="metric-grid">
        {metrics.map((item) => (
          <article className="metric-card" key={item.label}>
            <h3>{item.value}</h3>
            <p>{item.label}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="section shell">
      <div className="section-head">
        <h2>Market Crash Resilience</h2>
        <p>The risk engine is designed to tighten automatically during macro-stress periods when fraud spikes.</p>
      </div>
      <div className="flow-grid">
        {crashResilience.map((item) => (
          <article className="panel" key={item}>
            <p>{item}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="section shell split final">
      <article className="panel">
        <h2>Ethics & Privacy</h2>
        <ul>
          <li>No raw audio retention</li>
          <li>No raw image transmission</li>
          <li>No biometric collection</li>
          <li>Explainable score reasons + appeal path</li>
        </ul>
      </article>
      <article className="panel">
        <h2>Hackathon Team Scope</h2>
        <ul>
          <li>Product & Guidewire Workflow Design</li>
          <li>ML + On-device Signal Intelligence</li>
          <li>Backend Scoring, Reputation, Graph Detection</li>
          <li>Frontend Investigator Experience</li>
        </ul>
      </article>
    </section>
  </>
);

const IntegrationsPage = () => (
  <section className="section shell">
    <div className="section-head">
      <h2>Guidewire Integration Points</h2>
      <p>TrustGuard is designed to plug directly into ClaimCenter workflows and investigator operations.</p>
    </div>
    <div className="layer-grid">
      {[
        'FNOL score attachment at claim submission',
        'Risk-tier based claim assignment routing',
        'Structured fraud signal logs in claim notes',
        'Workflow rules for enhanced verification',
        'DataHub feedback loop for retraining',
        'Cloud event updates to graph intelligence',
        'Live investigator queue with explainable flags',
        'Appeal-friendly audit trail for compliance',
      ].map((item) => (
        <article className="feature-card" key={item}>
          <div className="feature-icon">
            <FileCheck2 size={18} />
          </div>
          <h3>{item}</h3>
        </article>
      ))}
    </div>
  </section>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell><OverviewPage /></AppShell>} />
        <Route path="/ai-hub" element={<AppShell><AIHub /></AppShell>} />
        <Route path="/ai-layers" element={<AppShell><LayersPage /></AppShell>} />
        <Route path="/defense" element={<AppShell><DefensePage /></AppShell>} />
        <Route path="/architecture" element={<AppShell><ArchitecturePage /></AppShell>} />
        <Route path="/impact" element={<AppShell><ImpactPage /></AppShell>} />
        <Route path="/integrations" element={<AppShell><IntegrationsPage /></AppShell>} />
        <Route path="/dashboard" element={<AppShell><section className="section shell"><Dashboard /></section></AppShell>} />
        <Route path="/mobile" element={<MobileApp />} />
        <Route path="/claim/:id" element={<AppShell><section className="section shell"><ClaimDetails /></section></AppShell>} />

        <Route path="/features" element={<Navigate to="/ai-hub" replace />} />
        <Route path="/security" element={<Navigate to="/defense" replace />} />
        <Route path="/results" element={<Navigate to="/impact" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
