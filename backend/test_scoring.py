import pytest
from datetime import datetime
from schemas import ClaimCreate, SensorData, DeviceData
import scoring_engine

def test_honest_claim_score():
    req = ClaimCreate(
        agent_id="test_agent",
        time_of_event=datetime.utcnow(),
        sensor_data=SensorData(
            temperature_c=22.0,
            light_lux=800.0,
            ambient_noise_db=45.0,
            gps_lat=40.7128,
            gps_lon=-74.0060
        ),
        device_data=DeviceData(
            is_rooted=False,
            is_emulator=False,
            is_mock_location=False
        )
    )
    score_details = scoring_engine.evaluate_claim(req, current_agent_rep=100.0)
    assert score_details.overall_trust >= 85
    assert score_details.action == "APPROVED"

def test_device_fraud():
    req = ClaimCreate(
        agent_id="test_agent",
        time_of_event=datetime.utcnow(),
        sensor_data=SensorData(
            temperature_c=22.0,
            light_lux=800.0,
            ambient_noise_db=45.0,
            gps_lat=40.7128,
            gps_lon=-74.0060
        ),
        device_data=DeviceData(
            is_rooted=False,
            is_emulator=False,
            is_mock_location=True
        )
    )
    score_details = scoring_engine.evaluate_claim(req, current_agent_rep=100.0)
    assert score_details.overall_trust < 60
    assert score_details.action == "FLAGGED"
