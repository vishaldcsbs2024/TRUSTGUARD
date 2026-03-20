import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClaimDetails } from '../api';
import ScoreGauge from '../components/ScoreGauge';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

const ClaimDetails = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading Claim Details...</div>;
  if (!claim) return <div>Claim not found</div>;

  const { score_details: sd } = claim;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>
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
        <div className="card-header">Guidewire Integration Sync</div>
        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontFamily: 'monospace', color: 'var(--text-main)' }}>
          <div>[POST] /ClaimCenter/API/v1/Claims</div>
          <br/>
          <div>JSON Payload:</div>
          <pre style={{ color: 'var(--primary)' }}>
{JSON.stringify({
  action: "UPDATE_STATUS",
  status: claim.status,
  fraud_score: Math.round(sd.overall_trust),
  guidewire_id: claim.guidewire_id,
  system: "TrustGuard"
}, null, 2)}
          </pre>
        </div>
      </div>

    </div>
  );
};

export default ClaimDetails;
