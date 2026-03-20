import React, { useState, useEffect } from 'react';
import { submitClaim, getAgents } from '../api';

const MobileApp = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  
  // Simulation presets
  const [scenario, setScenario] = useState('HONEST');
  
  const [status, setStatus] = useState('IDLE'); // IDLE, SUBMITTING, DONE
  const [result, setResult] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const ags = await getAgents();
        setAgents(ags);
        if (ags.length > 0) setSelectedAgent(ags[0].id);
      } catch (e) {
        console.error("Make sure backend is running", e);
      }
    };
    init();
  }, []);

  const handleSubmit = async () => {
    setStatus('SUBMITTING');
    
    // Simulate data collection based on chosen scenario
    let payload = {
      agent_id: selectedAgent,
      time_of_event: new Date().toISOString(),
      sensor_data: {
        temperature_c: 22.0, // Weather API mock says 22.5
        light_lux: 800.0,
        ambient_noise_db: 45.0,
        gps_lat: 40.7128,
        gps_lon: -74.0060
      },
      device_data: {
        is_rooted: false,
        is_emulator: false,
        is_mock_location: false
      }
    };

    if (scenario === 'FRAUD_DEVICE') {
      payload.device_data.is_mock_location = true;
    } else if (scenario === 'FRAUD_WEATHER') {
      // Claiming a blizzard while it's sunny
      payload.sensor_data.temperature_c = -5.0; 
      payload.sensor_data.ambient_noise_db = 15.0; // Suspiciously quiet
    } else if (scenario === 'FRAUD_TIME') {
      // Claiming event happened 2 days ago
      let d = new Date();
      d.setDate(d.getDate() - 2);
      payload.time_of_event = d.toISOString();
    } else if (scenario === 'FRAUD_RING') {
      // Pick the suspicious driver if exists
      const fraudInst = agents.find(a => a.name.includes("fraud_"));
      if (fraudInst) payload.agent_id = fraudInst.id;
    }

    try {
      // Add fake latency for UX
      await new Promise(r => setTimeout(r, 1500)); 
      const res = await submitClaim(payload);
      setResult(res);
      setStatus('DONE');
    } catch (e) {
      console.error(e);
      setStatus('IDLE');
      alert("Error submitting claim");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: '#e2e8f0', fontFamily: 'Inter' }}>
      <div className="mobile-app-wrapper">
        <div className="mobile-header">
          Delivery Agent App
        </div>
        
        <div className="mobile-content">
          {status === 'IDLE' && (
            <div>
              <div style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Report an issue or submit a delivery claim.
              </div>

              <div className="form-group">
                <label>Select Agent Identity</label>
                <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name} (Rep: {Math.round(a.reputation_score)})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Simulation Scenario (For Demo)</label>
                <select value={scenario} onChange={(e) => setScenario(e.target.value)}>
                  <option value="HONEST">Honest Claim (Expected: Approved)</option>
                  <option value="FRAUD_DEVICE">Mock GPS / Rooted Device (Expected: Flagged)</option>
                  <option value="FRAUD_WEATHER">Weather Mismatch (Expected: Verify or Flagged)</option>
                  <option value="FRAUD_TIME">Time Manipulation (Expected: Verify)</option>
                  <option value="FRAUD_RING">Fraud Ring Account (Expected: Flagged)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '2rem' }}>
                <button className="btn btn-primary btn-mobile" onClick={handleSubmit}>
                  Submit Claim
                </button>
              </div>
            </div>
          )}

          {status === 'SUBMITTING' && (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <div className="kpi-value" style={{ marginBottom: '1rem' }}>Verifying reality...</div>
              <p style={{ color: 'var(--text-muted)' }}>Checking device integrity</p>
              <p style={{ color: 'var(--text-muted)' }}>Generating environment hash</p>
              <p style={{ color: 'var(--text-muted)' }}>Analyzing timestamps</p>
            </div>
          )}

          {status === 'DONE' && result && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <h2 style={{ marginBottom: '1rem', color: result.status === 'APPROVED' ? 'var(--success)' : result.status === 'FLAGGED' ? 'var(--danger)' : 'var(--warning)' }}>
                {result.status === 'APPROVED' ? 'Claim Approved!' : result.status === 'FLAGGED' ? 'Claim Flagged' : 'Verification Required'}
              </h2>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', color: result.trust_score >= 85 ? 'var(--success)' : result.trust_score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                {Math.round(result.trust_score)}
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Trust Score</p>
              
              <button className="btn btn-outline btn-mobile" onClick={() => { setStatus('IDLE'); setResult(null); }}>
                Submit Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileApp;
