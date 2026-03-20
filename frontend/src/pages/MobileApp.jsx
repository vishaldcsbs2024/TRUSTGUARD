import React, { useState, useEffect } from 'react';
import { submitClaim, getAgents, issueChallenge, completeChallenge } from '../api';

const MobileApp = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [scenario, setScenario] = useState('HONEST');
  
  const [status, setStatus] = useState('IDLE'); // IDLE, SUBMITTING, CHALLENGE, DONE
  const [result, setResult] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [challengeMessage, setChallengeMessage] = useState('');

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

  const buildChallengeProofPayload = (requiredProof) => {
    if (requiredProof === 'gyroscope_rotation') {
      const rotationValue = scenario === 'FRAUD_DEVICE' ? 120 : 360;
      return { proof_type: 'gyroscope_rotation', value: rotationValue };
    }

    if (requiredProof === 'step_count') {
      const stepCount = scenario === 'FRAUD_RING' ? 2 : 8;
      return { proof_type: 'step_count', value: stepCount };
    }

    if (requiredProof === 'ambient_frame') {
      const rainMatch = scenario !== 'FRAUD_WEATHER';
      return { proof_type: 'ambient_frame', value: { rain_match: rainMatch } };
    }

    return { proof_type: requiredProof, value: null };
  };

  const handleCompleteChallenge = async () => {
    if (!challenge) return;

    setStatus('SUBMITTING');
    setChallengeMessage('Submitting challenge proof...');

    try {
      await new Promise(r => setTimeout(r, 800));
      const proofPayload = buildChallengeProofPayload(challenge.required_proof);
      const response = await completeChallenge(challenge.id, proofPayload);

      setResult((prev) => ({
        ...prev,
        status: response.claim.status,
        trust_score: response.claim.trust_score,
        guidewire_id: response.claim.guidewire_id,
      }));

      setChallenge(response.challenge);
      setChallengeMessage(response.challenge.status === 'PASSED'
        ? 'Challenge passed. Claim promoted for approval.'
        : 'Challenge failed. Claim escalated as flagged.');
      setStatus('DONE');
    } catch (error) {
      console.error(error);
      setChallengeMessage('Unable to complete challenge. Please retry.');
      setStatus('CHALLENGE');
    }
  };

  const handleSubmit = async () => {
    setStatus('SUBMITTING');
    setChallenge(null);
    setChallengeMessage('');
    let payload = {
      agent_id: selectedAgent,
      time_of_event: new Date().toISOString(),
      sensor_data: {
        temperature_c: 22.0,
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
      payload.sensor_data.temperature_c = -5.0;
      payload.sensor_data.ambient_noise_db = 15.0;
    } else if (scenario === 'FRAUD_TIME') {
      let d = new Date();
      d.setDate(d.getDate() - 2);
      payload.time_of_event = d.toISOString();
    } else if (scenario === 'FRAUD_RING') {
      const fraudInst = agents.find(a => a.name.includes("fraud_"));
      if (fraudInst) payload.agent_id = fraudInst.id;
    }

    try {
      await new Promise(r => setTimeout(r, 1500));
      const res = await submitClaim(payload);
      setResult(res);

      if (res.status !== 'APPROVED') {
        const activeChallenge = res.active_challenge || await issueChallenge(res.id);
        setChallenge(activeChallenge);
        setStatus('CHALLENGE');
      } else {
        setStatus('DONE');
      }
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

          {status === 'CHALLENGE' && challenge && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              {challenge.status === 'EXPIRED' ? (
                <>
                  <h2 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Challenge Expired</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Your verification window has closed. Please contact support to request a new challenge.
                  </p>
                  <button className="btn btn-outline btn-mobile" onClick={() => { setStatus('IDLE'); setResult(null); setChallenge(null); setChallengeMessage(''); }}>
                    Back to Home
                  </button>
                </>
              ) : challenge.status === 'FAILED' ? (
                <>
                  <h2 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Challenge Failed</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Maximum attempts exceeded. Your claim has been escalated for manual review.
                  </p>
                  <button className="btn btn-outline btn-mobile" onClick={() => { setStatus('IDLE'); setResult(null); setChallenge(null); setChallengeMessage(''); }}>
                    Back to Home
                  </button>
                </>
              ) : (
                <>
                  <h2 style={{ marginBottom: '1rem', color: 'var(--warning)' }}>Additional Verification Required</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{challenge.prompt}</p>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Required proof: {challenge.required_proof}
                  </p>
                  <button className="btn btn-primary btn-mobile" onClick={handleCompleteChallenge}>
                    Complete Challenge
                  </button>
                  {challengeMessage && <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>{challengeMessage}</p>}
                </>
              )}
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
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.8rem' }}>Trust Score</p>
              {challengeMessage && <p style={{ color: 'var(--text-muted)', marginBottom: '1.2rem' }}>{challengeMessage}</p>}
              
              <button className="btn btn-outline btn-mobile" onClick={() => { setStatus('IDLE'); setResult(null); setChallenge(null); setChallengeMessage(''); }}>
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
