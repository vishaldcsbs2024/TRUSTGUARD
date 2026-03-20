import json

from fastapi import FastAPI, Depends, HTTPException

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from typing import List, Optional

from datetime import datetime, timedelta

import random



import models, schemas, scoring_engine, guidewire_sync

from database import engine, get_db



                  

models.Base.metadata.create_all(bind=engine)





def _get_table_columns(table_name: str) -> set[str]:

    with engine.connect() as conn:

        rows = conn.exec_driver_sql(f"PRAGMA table_info({table_name})").fetchall()

    return {row[1] for row in rows}





def _ensure_schema_compatibility() -> None:

    claims_columns = _get_table_columns("claims")

    challenges_columns = _get_table_columns("challenges")



    with engine.begin() as conn:

        if "override_log" not in claims_columns:

            conn.exec_driver_sql("ALTER TABLE claims ADD COLUMN override_log VARCHAR")



        if "attempt_count" not in challenges_columns:

            conn.exec_driver_sql("ALTER TABLE challenges ADD COLUMN attempt_count INTEGER DEFAULT 0")



        if "max_attempts" not in challenges_columns:

            conn.exec_driver_sql("ALTER TABLE challenges ADD COLUMN max_attempts INTEGER DEFAULT 3")



        if "expires_at" not in challenges_columns:

            conn.exec_driver_sql("ALTER TABLE challenges ADD COLUMN expires_at DATETIME")



        if "completed_at" not in challenges_columns:

            conn.exec_driver_sql("ALTER TABLE challenges ADD COLUMN completed_at DATETIME")





_ensure_schema_compatibility()



app = FastAPI(title="TrustGuard API", description="AI Fraud Detection Platform")



CHALLENGE_TEMPLATES = [

    {

        "challenge_type": "ROTATION_CHECK",

        "prompt": "Rotate your phone 360° slowly to confirm liveness.",

        "required_proof": "gyroscope_rotation",

    },

    {

        "challenge_type": "STEP_CHECK",

        "prompt": "Walk at least 5 steps and tap submit.",

        "required_proof": "step_count",

    },

    {

        "challenge_type": "AMBIENT_CHECK",

        "prompt": "Capture one ambient frame classification to verify weather context.",

        "required_proof": "ambient_frame",

    },

]





def _to_challenge_response(challenge: models.Challenge) -> schemas.ChallengeResponse:

    return schemas.ChallengeResponse(

        id=challenge.id,

        claim_id=challenge.claim_id,

        challenge_type=challenge.challenge_type,

        prompt=challenge.prompt,

        required_proof=challenge.required_proof,

        status=challenge.status,

        attempt_count=challenge.attempt_count,

        max_attempts=challenge.max_attempts,

        issued_at=challenge.issued_at,

        expires_at=challenge.expires_at,

        completed_at=challenge.completed_at,

    )





def _get_active_challenge(claim_id: str, db: Session) -> Optional[models.Challenge]:

    return (

        db.query(models.Challenge)

        .filter(models.Challenge.claim_id == claim_id, models.Challenge.status == "PENDING")

        .order_by(models.Challenge.issued_at.desc())

        .first()

    )





def _create_challenge_for_claim(claim_id: str, db: Session) -> models.Challenge:

    existing = _get_active_challenge(claim_id, db)

    if existing:

        return existing



    template = random.choice(CHALLENGE_TEMPLATES)

    now = datetime.utcnow()

    expires_at = now + timedelta(minutes=15)

    challenge = models.Challenge(

        claim_id=claim_id,

        challenge_type=template["challenge_type"],

        prompt=template["prompt"],

        required_proof=template["required_proof"],

        status="PENDING",

        max_attempts=3,

        issued_at=now,

        expires_at=expires_at,

    )

    db.add(challenge)

    db.flush()

    return challenge





def _is_challenge_expired(challenge: models.Challenge) -> bool:

    return challenge.status == "PENDING" and datetime.utcnow() > challenge.expires_at





def _evaluate_challenge_proof(challenge: models.Challenge, proof_type: str, value) -> bool:

    if proof_type != challenge.required_proof:

        return False



    if proof_type == "gyroscope_rotation":

        return isinstance(value, (int, float)) and float(value) >= 300



    if proof_type == "step_count":

        return isinstance(value, (int, float)) and float(value) >= 5



    if proof_type == "ambient_frame":

        return isinstance(value, dict) and bool(value.get("rain_match", False))



    return False



                     

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

                         

    agent = db.query(models.Agent).filter(models.Agent.id == claim_req.agent_id).first()

    if not agent:

        raise HTTPException(status_code=404, detail="Agent not found")

        

                                         

    score_details = scoring_engine.evaluate_claim(claim_req, agent.reputation_score, db=db)

    

                         

    db_claim = models.Claim(

        agent_id=agent.id,

        status=score_details.action,

        trust_score=score_details.overall_trust

    )

    db.add(db_claim)

    db.flush()         

    

                   

    db_signal = models.ClaimSignal(

        claim_id=db_claim.id,

        env_fingerprint_score=score_details.env_fingerprint,

        device_integrity_score=score_details.device_integrity,

        time_consistency_score=score_details.time_consistency,

        geo_risk_score=score_details.geo_risk,

        graph_risk_flag=score_details.graph_risk_flag,

        raw_data_json=claim_req.model_dump_json()                    

    )

    db.add(db_signal)

    

                             

    if score_details.action == "FLAGGED":

        agent.reputation_score = max(0, agent.reputation_score - 20)

    elif score_details.action == "APPROVED":

        agent.reputation_score = min(100, agent.reputation_score + 2)

        

    db.flush()

    

                         

    gw_sync_data = {

        "id": db_claim.id,

        "status": db_claim.status,

        "trust_score": db_claim.trust_score

    }

    gw_id = guidewire_sync.sync_claim_decision(gw_sync_data)

    db_claim.guidewire_id = gw_id

    

    active_challenge = None

    if score_details.action == "VERIFY":

        active_challenge = _create_challenge_for_claim(db_claim.id, db)



    db.commit()

    db.refresh(db_claim)

    

    response = schemas.ClaimFullDetails(

        id=db_claim.id,

        agent_id=db_claim.agent_id,

        status=db_claim.status,

        trust_score=db_claim.trust_score,

        guidewire_id=db_claim.guidewire_id,

        score_details=score_details,

        active_challenge=_to_challenge_response(active_challenge) if active_challenge else None,

    )

    

    return response





@app.post("/api/demo/seed")

def seed_demo_claims(count: int = 20, db: Session = Depends(get_db)):

    agents = db.query(models.Agent).all()

    if not agents:

        raise HTTPException(status_code=400, detail="No agents found. Create agents before seeding claims.")



    created = 0

    for index in range(max(1, min(count, 200))):

        agent = random.choice(agents)

        risky = index % 5 == 0



        claim_req = schemas.ClaimCreate(

            agent_id=agent.id,

            time_of_event=datetime.utcnow() - timedelta(minutes=random.randint(1, 240)),

            sensor_data=schemas.SensorData(

                temperature_c=36.0 if risky else random.uniform(21.0, 26.0),

                light_lux=1200.0 if risky else random.uniform(250.0, 800.0),

                ambient_noise_db=22.0 if risky else random.uniform(48.0, 78.0),

                gps_lat=13.0827 + random.uniform(-0.02, 0.02),

                gps_lon=80.2707 + random.uniform(-0.02, 0.02),

            ),

            device_data=schemas.DeviceData(

                is_rooted=risky,

                is_emulator=False,

                is_mock_location=risky,

            ),

        )



        score_details = scoring_engine.evaluate_claim(claim_req, agent.reputation_score, db=db)



        db_claim = models.Claim(

            agent_id=agent.id,

            status=score_details.action,

            trust_score=score_details.overall_trust,

        )

        db.add(db_claim)

        db.flush()



        db_signal = models.ClaimSignal(

            claim_id=db_claim.id,

            env_fingerprint_score=score_details.env_fingerprint,

            device_integrity_score=score_details.device_integrity,

            time_consistency_score=score_details.time_consistency,

            geo_risk_score=score_details.geo_risk,

            graph_risk_flag=score_details.graph_risk_flag,

            raw_data_json=claim_req.model_dump_json(),

        )

        db.add(db_signal)



        if score_details.action == "FLAGGED":

            agent.reputation_score = max(0, agent.reputation_score - 10)

        elif score_details.action == "APPROVED":

            agent.reputation_score = min(100, agent.reputation_score + 1)



        gw_sync_data = {

            "id": db_claim.id,

            "status": db_claim.status,

            "trust_score": db_claim.trust_score,

        }

        db_claim.guidewire_id = guidewire_sync.sync_claim_decision(gw_sync_data)

        created += 1



    db.commit()

    return {"ok": True, "created_claims": created}





@app.post("/api/demo/reset")

def reset_demo_data(db: Session = Depends(get_db)):

    deleted_challenges = db.query(models.Challenge).delete()

    deleted_signals = db.query(models.ClaimSignal).delete()

    deleted_claims = db.query(models.Claim).delete()



    agents = db.query(models.Agent).all()

    for agent in agents:

        agent.reputation_score = 100.0



    db.commit()

    return {

        "ok": True,

        "deleted_claims": deleted_claims,

        "deleted_signals": deleted_signals,

        "deleted_challenges": deleted_challenges,

        "reset_agents": len(agents),

    }



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

    

    active_challenge = _get_active_challenge(claim_id, db)



    override_log = None

    if claim.override_log:

        try:

            override_log = json.loads(claim.override_log)

        except json.JSONDecodeError:

            override_log = []



    return schemas.ClaimFullDetails(

        id=claim.id,

        agent_id=claim.agent_id,

        status=claim.status,

        trust_score=claim.trust_score,

        guidewire_id=claim.guidewire_id,

        score_details=score_details,

        active_challenge=_to_challenge_response(active_challenge) if active_challenge else None,

        override_log=override_log,

    )





@app.post("/api/challenges/issue", response_model=schemas.ChallengeResponse)

def issue_challenge(request: schemas.ChallengeIssueRequest, db: Session = Depends(get_db)):

    claim = db.query(models.Claim).filter(models.Claim.id == request.claim_id).first()

    if not claim:

        raise HTTPException(status_code=404, detail="Claim not found")



    if claim.status == "APPROVED":

        raise HTTPException(status_code=400, detail="Approved claims do not require challenges")



    challenge = _create_challenge_for_claim(claim.id, db)

    claim.status = "VERIFY"

    db.commit()

    db.refresh(challenge)

    return _to_challenge_response(challenge)





@app.get("/api/challenges/claim/{claim_id}/active", response_model=schemas.ChallengeResponse)

def get_active_challenge(claim_id: str, db: Session = Depends(get_db)):

    challenge = _get_active_challenge(claim_id, db)

    if not challenge:

        raise HTTPException(status_code=404, detail="No active challenge found")

    return _to_challenge_response(challenge)





@app.post("/api/challenges/{challenge_id}/complete")

def complete_challenge(challenge_id: str, payload: schemas.ChallengeCompleteRequest, db: Session = Depends(get_db)):

    challenge = db.query(models.Challenge).filter(models.Challenge.id == challenge_id).first()

    if not challenge:

        raise HTTPException(status_code=404, detail="Challenge not found")



    if challenge.status != "PENDING":

        raise HTTPException(status_code=400, detail=f"Challenge already {challenge.status.lower()}")



    if _is_challenge_expired(challenge):

        challenge.status = "EXPIRED"

        challenge.completed_at = datetime.utcnow()

        db.commit()

        raise HTTPException(status_code=400, detail="Challenge has expired. Please request a new one.")



    if challenge.attempt_count >= challenge.max_attempts:

        challenge.status = "FAILED"

        challenge.completed_at = datetime.utcnow()

        db.commit()

        raise HTTPException(status_code=400, detail="Maximum attempts exceeded")



    claim = db.query(models.Claim).filter(models.Claim.id == challenge.claim_id).first()

    if not claim:

        raise HTTPException(status_code=404, detail="Associated claim not found")



    agent = db.query(models.Agent).filter(models.Agent.id == claim.agent_id).first()



    challenge.attempt_count += 1

    challenge.response_json = json.dumps({"proof_type": payload.proof_type, "value": payload.value})



    passed = _evaluate_challenge_proof(challenge, payload.proof_type, payload.value)

    

    if passed:

        challenge.status = "PASSED"

        challenge.completed_at = datetime.utcnow()

        claim.status = "APPROVED"

        claim.trust_score = min(100.0, (claim.trust_score or 0) + 10.0)

        if agent:

            agent.reputation_score = min(100.0, agent.reputation_score + 2)

    elif challenge.attempt_count >= challenge.max_attempts:

        challenge.status = "FAILED"

        challenge.completed_at = datetime.utcnow()

        claim.status = "FLAGGED"

        claim.trust_score = max(0.0, (claim.trust_score or 0) - 15.0)

        if agent:

            agent.reputation_score = max(0.0, agent.reputation_score - 5)

    else:

        challenge.completed_at = datetime.utcnow()



    gw_sync_data = {

        "id": claim.id,

        "status": claim.status,

        "trust_score": claim.trust_score,

    }

    claim.guidewire_id = guidewire_sync.sync_claim_decision(gw_sync_data)



    db.commit()



    return {

        "ok": True,

        "challenge": _to_challenge_response(challenge),

        "claim": {

            "id": claim.id,

            "status": claim.status,

            "trust_score": claim.trust_score,

            "guidewire_id": claim.guidewire_id,

        },

    }





@app.post("/api/claim/{claim_id}/override")

def override_claim(claim_id: str, request: schemas.OverrideRequest, db: Session = Depends(get_db)):

    """Allow investigator to manually override claim decision (APPROVE/REJECT/REASSIGN)."""

    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()

    if not claim:

        raise HTTPException(status_code=404, detail="Claim not found")



    original_status = claim.status

    

    if request.action == "APPROVE":

        claim.status = "APPROVED"

        claim.trust_score = min(100.0, (claim.trust_score or 0) + 15.0)

    elif request.action == "REJECT":

        claim.status = "FLAGGED"

        claim.trust_score = max(0.0, (claim.trust_score or 0) - 20.0)

    elif request.action == "REASSIGN":

        claim.status = "VERIFY"

        claim.trust_score = (claim.trust_score or 50.0)

    else:

        raise HTTPException(status_code=400, detail="Invalid override action")



    override_entry = {

        "action": request.action,

        "reason": request.reason,

        "investigator_id": request.investigator_id or "SYSTEM",

        "timestamp": datetime.utcnow().isoformat(),

        "original_status": original_status,

        "new_status": claim.status,

    }

    

    override_log = []

    if claim.override_log:

        try:

            override_log = json.loads(claim.override_log)

        except:

            override_log = []

    override_log.append(override_entry)

    claim.override_log = json.dumps(override_log)



    gw_sync_data = {

        "id": claim.id,

        "status": claim.status,

        "trust_score": claim.trust_score,

        "override_action": request.action,

        "override_reason": request.reason,

    }

    claim.guidewire_id = guidewire_sync.sync_claim_decision(gw_sync_data)



    db.commit()



    return {

        "ok": True,

        "claim": {

            "id": claim.id,

            "status": claim.status,

            "trust_score": claim.trust_score,

            "override_log": json.loads(claim.override_log),

            "guidewire_id": claim.guidewire_id,

        },

    }





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

