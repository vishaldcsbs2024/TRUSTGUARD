import json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas, scoring_engine, guidewire_sync
from database import engine, get_db

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TrustGuard API", description="AI Fraud Detection Platform")

# Allow Frontend CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/agents/", response_model=schemas.AgentResponse)
def create_agent(agent: schemas.AgentCreate, db: Session = Depends(get_db)):
    db_agent = models.Agent(name=agent.name, reputation_score=100.0)
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

@app.get("/api/agents/", response_model=List[schemas.AgentResponse])
def get_agents(db: Session = Depends(get_db)):
    return db.query(models.Agent).all()

@app.post("/api/claims/", response_model=schemas.ClaimFullDetails)
def submit_claim(claim_req: schemas.ClaimCreate, db: Session = Depends(get_db)):
    # Verify agent exists
    agent = db.query(models.Agent).filter(models.Agent.id == claim_req.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    # Evaluate Claim using Scoring Engine
    score_details = scoring_engine.evaluate_claim(claim_req, agent.reputation_score)
    
    # Create Claim Record
    db_claim = models.Claim(
        agent_id=agent.id,
        status=score_details.action,
        trust_score=score_details.overall_trust
    )
    db.add(db_claim)
    db.flush() # get ID
    
    # Store Signals
    db_signal = models.ClaimSignal(
        claim_id=db_claim.id,
        env_fingerprint_score=score_details.env_fingerprint,
        device_integrity_score=score_details.device_integrity,
        time_consistency_score=score_details.time_consistency,
        geo_risk_score=score_details.geo_risk,
        graph_risk_flag=score_details.graph_risk_flag,
        raw_data_json=claim_req.model_dump_json() # Store payload log
    )
    db.add(db_signal)
    
    # Adjust Agent Reputation
    if score_details.action == "FLAGGED":
        agent.reputation_score = max(0, agent.reputation_score - 20)
    elif score_details.action == "APPROVED":
        agent.reputation_score = min(100, agent.reputation_score + 2)
        
    db.flush()
    
    # Sync with Guidewire
    gw_sync_data = {
        "id": db_claim.id,
        "status": db_claim.status,
        "trust_score": db_claim.trust_score
    }
    gw_id = guidewire_sync.sync_claim_decision(gw_sync_data)
    db_claim.guidewire_id = gw_id
    
    db.commit()
    db.refresh(db_claim)
    
    response = schemas.ClaimFullDetails(
        id=db_claim.id,
        agent_id=db_claim.agent_id,
        status=db_claim.status,
        trust_score=db_claim.trust_score,
        guidewire_id=db_claim.guidewire_id,
        score_details=score_details
    )
    
    return response

@app.get("/api/claims/", response_model=List[schemas.ClaimResponse])
def get_recent_claims(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    claims = db.query(models.Claim).order_by(models.Claim.created_at.desc()).offset(skip).limit(limit).all()
    return claims

@app.get("/api/claims/{claim_id}", response_model=schemas.ClaimFullDetails)
def get_claim(claim_id: str, db: Session = Depends(get_db)):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    signal = db.query(models.ClaimSignal).filter(models.ClaimSignal.claim_id == claim_id).first()
    
    score_details = schemas.ScoreDetails(
        env_fingerprint=signal.env_fingerprint_score,
        device_integrity=signal.device_integrity_score,
        time_consistency=signal.time_consistency_score,
        geo_risk=signal.geo_risk_score,
        graph_risk_flag=signal.graph_risk_flag,
        overall_trust=claim.trust_score,
        action=claim.status
    )
    
    return schemas.ClaimFullDetails(
        id=claim.id,
        agent_id=claim.agent_id,
        status=claim.status,
        trust_score=claim.trust_score,
        guidewire_id=claim.guidewire_id,
        score_details=score_details
    )

@app.get("/api/dashboard/kpis")
def get_kpis(db: Session = Depends(get_db)):
    total = db.query(models.Claim).count()
    approved = db.query(models.Claim).filter(models.Claim.status == "APPROVED").count()
    flagged = db.query(models.Claim).filter(models.Claim.status == "FLAGGED").count()
    verify = db.query(models.Claim).filter(models.Claim.status == "VERIFY").count()
    
    approval_rate = (approved / total * 100) if total > 0 else 0
    
    return {
        "total_claims": total,
        "fraud_detected": flagged,
        "approval_rate": round(approval_rate, 1),
        "manual_verification": verify
    }

# Seed DB with mock agents if empty
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        if db.query(models.Agent).count() == 0:
            a1 = models.Agent(name="Honest Driver", reputation_score=95.0)
            a2 = models.Agent(name="Suspicious Driver (fraud_123)", reputation_score=50.0)
            db.add(a1)
            db.add(a2)
            db.commit()
    finally:
        db.close()
