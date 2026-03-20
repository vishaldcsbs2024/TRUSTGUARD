import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ClaimDetails from './pages/ClaimDetails';
import MobileApp from './pages/MobileApp';
import { LayoutDashboard, Smartphone, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <ShieldCheck size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
        TrustGuard
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }}/>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/mobile" className={`nav-link ${location.pathname === '/mobile' ? 'active' : ''}`}>
            <Smartphone size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }}/>
            Mobile App Simulator
          </Link>
        </li>
      </ul>
    </div>
  );
};

const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div style={{ fontWeight: 500 }}>Investigator Portal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              I
            </div>
            <span>Investigator Admin</span>
          </div>
        </div>
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/claim/:id" element={<AppLayout><ClaimDetails /></AppLayout>} />
        <Route path="/mobile" element={<MobileApp />} />
      </Routes>
    </Router>
  );
}

export default App;
