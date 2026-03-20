import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClaimDetails, overrideClaim } from '../api';
import ScoreGauge from '../components/ScoreGauge';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

const ClaimDetails = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideAction, setOverrideAction] = useState('APPROVE');
  const [overrideReason, setOverrideReason] = useState('');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const data = await getClaimDetails(id);
        setClaim(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [id]);

  const handleOverride = async () => {
    if (!overrideReason.trim()) {
      alert('Please provide a reason for the override action.');
      return;
    }

    setSubmittingOverride(true);
    try {
      const result = await overrideClaim(id, {
        action: overrideAction,
        reason: overrideReason,
        investigator_id: 'INV_001'
      });
      alert(`Override successful. Claim status: ${result.claim.status}`);
      setShowOverrideModal(false);
      setOverrideReason('');
      
      const updatedClaim = await getClaimDetails(id);
      setClaim(updatedClaim);
    } catch (err) {
      alert('Error applying override: ' + (err.response?.data?.detail || err.message));
      console.error(err);
    } finally {
      setSubmittingOverride(false);
    }
  };

  if (loading) return <div>Loading Claim Details...</div>;
  if (!claim) return <div>Claim not found</div>;

  const { score_details: sd } = claim;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
        </Link>
      </div>

      <div className="claim-header">
        <div>
          <h1 style={{ fontWeight: 600 }}>Claim <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{claim.id.substring(0,8)}</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Agent ID: {claim.agent_id}</p>
        </div>
        <div>
          <span className={`badge ${claim.status}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>{claim.status}</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header" style={{ textAlign: 'center' }}>Overall Trust Score</div>
          <ScoreGauge score={sd.overall_trust} />
          
          <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {sd.overall_trust >= 85 && <div><CheckCircle color="var(--success)" style={{ verticalAlign: 'middle', marginRight: '0.5rem'}}/> High confidence. Fast-tracked for approval.</div>}
            {(sd.overall_trust >= 60 && sd.overall_trust < 85) && <div><AlertTriangle color="var(--warning)" style={{ verticalAlign: 'middle', marginRight: '0.5rem'}}/> Moderate risk. Manual verification recommended.</div>}
            {sd.overall_trust < 60 && <div><XCircle color="var(--danger)" style={{ verticalAlign: 'middle', marginRight: '0.5rem'}}/> High risk. Fraud signaled. Claim rejected.</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Signals Breakdown</div>
          <div>
            <div className="score-breakdown-item">
              <span style={{ fontWeight: 500 }}>Environment Fingerprint</span>
              <span style={{ fontWeight: 'bold', color: sd.env_fingerprint >= 80 ? 'var(--success)' : 'var(--danger)' }}>{Math.round(sd.env_fingerprint)}/100</span>
            </div>
            <div className="score-breakdown-item">
              <span style={{ fontWeight: 500 }}>Device Integrity</span>
              <span style={{ fontWeight: 'bold', color: sd.device_integrity === 100 ? 'var(--success)' : 'var(--danger)' }}>{Math.round(sd.device_integrity)}/100</span>
            </div>
            <div className="score-breakdown-item">
              <span style={{ fontWeight: 500 }}>Time Consistency</span>
              <span style={{ fontWeight: 'bold', color: sd.time_consistency >= 80 ? 'var(--success)' : 'var(--danger)' }}>{Math.round(sd.time_consistency)}/100</span>
            </div>
            <div className="score-breakdown-item">
              <span style={{ fontWeight: 500 }}>Geo-Risk Profile</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{Math.round(sd.geo_risk)}/100</span>
            </div>
            <div className="score-breakdown-item">
              <span style={{ fontWeight: 500 }}>Graph Fraud Ring Flag</span>
              <span style={{ fontWeight: 'bold', color: sd.graph_risk_flag ? 'var(--danger)' : 'var(--success)' }}>{sd.graph_risk_flag ? 'TRUE' : 'FALSE'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Investigator Actions</div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setOverrideAction('APPROVE'); setShowOverrideModal(true); }}
            style={{ 
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--success)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            ✓ Override & Approve
          </button>
          <button 
            onClick={() => { setOverrideAction('REJECT'); setShowOverrideModal(true); }}
            style={{ 
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--danger)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            ✗ Override & Reject
          </button>
          <button 
            onClick={() => { setOverrideAction('REASSIGN'); setShowOverrideModal(true); }}
            style={{ 
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--warning)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            ⟳ Reassign for Manual Review
          </button>
        </div>

        {Array.isArray(claim.override_log) && claim.override_log.length > 0 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>Override History</h4>
            {claim.override_log.map((log, idx) => (
              <div key={idx} style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.9rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  {log.action} by {log.investigator_id} on {new Date(log.timestamp).toLocaleString()}
                </div>
                <div style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                  {log.original_status} → {log.new_status}
                </div>
                <div style={{ marginTop: '0.5rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                  Reason: {log.reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showOverrideModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
              Confirm Override Action
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Action: <strong style={{ color: 'var(--primary)' }}>{overrideAction}</strong>
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-main)' }}>
                Reason for Override
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Enter reason (e.g., 'Customer appeal with supporting documentation', 'Device error detected', etc.)"
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowOverrideModal(false)}
                disabled={submittingOverride}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: 'var(--text-main)',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  opacity: submittingOverride ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleOverride}
                disabled={submittingOverride}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: overrideAction === 'APPROVE' ? 'var(--success)' : 'var(--danger)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: submittingOverride ? 'not-allowed' : 'pointer',
                  opacity: submittingOverride ? 0.7 : 1
                }}
              >
                {submittingOverride ? 'Processing...' : 'Confirm Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimDetails;
