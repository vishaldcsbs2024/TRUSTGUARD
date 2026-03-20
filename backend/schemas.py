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

class ClaimFullDetails(ClaimResponse):
    score_details: ScoreDetails
