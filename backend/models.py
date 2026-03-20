from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime

from sqlalchemy.orm import relationship

import datetime

import uuid

from database import Base



def generate_uuid():

    return str(uuid.uuid4())



class Agent(Base):

    __tablename__ = "agents"



    id = Column(String, primary_key=True, default=generate_uuid, index=True)

    name = Column(String, index=True)

    reputation_score = Column(Float, default=100.0)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)



    claims = relationship("Claim", back_populates="agent")



class Claim(Base):

    __tablename__ = "claims"



    id = Column(String, primary_key=True, default=generate_uuid, index=True)

    agent_id = Column(String, ForeignKey("agents.id"))

    status = Column(String, default="PENDING")                                      

    trust_score = Column(Float, nullable=True)

    guidewire_id = Column(String, nullable=True)

    override_log = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)



    agent = relationship("Agent", back_populates="claims")

    signals = relationship("ClaimSignal", back_populates="claim", uselist=False)

    challenges = relationship("Challenge", back_populates="claim")



class ClaimSignal(Base):

    __tablename__ = "claim_signals"



    id = Column(String, primary_key=True, default=generate_uuid, index=True)

    claim_id = Column(String, ForeignKey("claims.id"), unique=True)

    

                    

    env_fingerprint_score = Column(Float, nullable=True)

    device_integrity_score = Column(Float, nullable=True)

    time_consistency_score = Column(Float, nullable=True)

    geo_risk_score = Column(Float, nullable=True)

    

           

    graph_risk_flag = Column(Boolean, default=False)

    

                     

    raw_data_json = Column(String, nullable=True)



    claim = relationship("Claim", back_populates="signals")





class Challenge(Base):

    __tablename__ = "challenges"



    id = Column(String, primary_key=True, default=generate_uuid, index=True)

    claim_id = Column(String, ForeignKey("claims.id"), index=True)

    challenge_type = Column(String, nullable=False)

    prompt = Column(String, nullable=False)

    required_proof = Column(String, nullable=False)

    status = Column(String, default="PENDING")                                    

    attempt_count = Column(Integer, default=0)

    max_attempts = Column(Integer, default=3)

    response_json = Column(String, nullable=True)

    issued_at = Column(DateTime, default=datetime.datetime.utcnow)

    expires_at = Column(DateTime, nullable=False)

    completed_at = Column(DateTime, nullable=True)



    claim = relationship("Claim", back_populates="challenges")

