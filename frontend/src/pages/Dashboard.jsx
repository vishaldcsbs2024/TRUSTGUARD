import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getKpis, getClaims } from '../api';

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiData, claimsData] = await Promise.all([
          getKpis(),
          getClaims()
        ]);
        setKpis(kpiData);
        setClaims(claimsData);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Auto-refresh every 5 seconds for reality demo
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading Dashboard...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>TrustGuard Overview</h1>
      
      <div className="grid-4">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">Total Claims</div>
          <div className="kpi-value">{kpis?.total_claims || 0}</div>
          <div className="kpi-label">Lifetime processed</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header" style={{ color: 'var(--success)' }}>Approval Rate</div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>{kpis?.approval_rate}%</div>
          <div className="kpi-label">Auto-approved</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header" style={{ color: 'var(--warning)' }}>Requires Verification</div>
          <div className="kpi-value" style={{ color: 'var(--warning)' }}>{kpis?.manual_verification || 0}</div>
          <div className="kpi-label">Pending Review</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header" style={{ color: 'var(--danger)' }}>Fraud Detected</div>
          <div className="kpi-value" style={{ color: 'var(--danger)' }}>{kpis?.fraud_detected || 0}</div>
          <div className="kpi-label">Flagged / Stopped</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Recent Claims Activity</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Agent ID</th>
                <th>Trust Score</th>
                <th>Status</th>
                <th>Guidewire ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id}>
                  <td style={{ fontFamily: 'monospace' }}>{claim.id.substring(0, 8)}...</td>
                  <td style={{ fontFamily: 'monospace' }}>{claim.agent_id.substring(0,8)}...</td>
                  <td>
                    <span style={{ fontWeight: 'bold', color: claim.trust_score >= 85 ? 'var(--success)' : claim.trust_score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                      {claim.trust_score !== null ? Math.round(claim.trust_score) : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${claim.status}`}>{claim.status}</span>
                  </td>
                  <td>{claim.guidewire_id || '-'}</td>
                  <td>
                    <Link to={`/claim/${claim.id}`} className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>View Detail</Link>
                  </td>
                </tr>
              ))}
              {claims.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No claims processed yet. Use the Simulator to generate some.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
