from pydantic import BaseModel

from typing import Optional, List, Dict, Any

from datetime import datetime



class AgentBase(BaseModel):

    name: str



class AgentCreate(AgentBase):

    pass



class AgentResponse(AgentBase):

    id: str

    reputation_score: float

    created_at: datetime

    

    class Config:

        from_attributes = True



class SensorData(BaseModel):

    temperature_c: float

    light_lux: float

    ambient_noise_db: float

    gps_lat: float

    gps_lon: float



class DeviceData(BaseModel):

    is_rooted: bool

    is_emulator: bool

    is_mock_location: bool



class ClaimCreate(BaseModel):

    agent_id: str

    time_of_event: datetime

    sensor_data: SensorData

    device_data: DeviceData



class ClaimResponse(BaseModel):

    id: str

    agent_id: str

    status: str

    trust_score: Optional[float]

    guidewire_id: Optional[str]



    class Config:

        from_attributes = True



class ScoreDetails(BaseModel):

    env_fingerprint: float

    device_integrity: float

    time_consistency: float

    geo_risk: float

    graph_risk_flag: bool

    overall_trust: float

    action: str





class ChallengeIssueRequest(BaseModel):

    claim_id: str





class ChallengeCompleteRequest(BaseModel):

    proof_type: str

    value: Any





class ChallengeResponse(BaseModel):

    id: str

    claim_id: str

    challenge_type: str

    prompt: str

    required_proof: str

    status: str

    attempt_count: int

    max_attempts: int

    issued_at: datetime

    expires_at: datetime

    completed_at: Optional[datetime] = None



    class Config:

        from_attributes = True





class OverrideRequest(BaseModel):

    action: str                                   

    reason: str

    investigator_id: Optional[str] = None



class ClaimFullDetails(ClaimResponse):

    score_details: ScoreDetails

    active_challenge: Optional[ChallengeResponse] = None

    override_log: Optional[List[Dict[str, Any]]] = None

