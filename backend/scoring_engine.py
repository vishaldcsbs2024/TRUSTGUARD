from schemas import ClaimCreate, ScoreDetails
import weather_service
import graph_fraud
from datetime import datetime, timezone

def calculate_env_fingerprint(sensor_data, weather_api_data):
    """
    Compare sensor data (temp, lux) with actual weather API data.
    """
    score = 100.0
    
    # Simple mockup comparison logic
    temp_diff = abs(sensor_data.temperature_c - weather_api_data['temperature_c'])
    if temp_diff > 10:
        score -= min(50, temp_diff * 5)
        
    # E.g. claiming extreme weather but light is high and noise is low
    if weather_api_data['condition'] == 'Rain' and sensor_data.ambient_noise_db < 40:
        score -= 30
        
    return max(0.0, score)

def calculate_device_integrity(device_data):
    """
    Immediate failure if mock location, emulator, or rooted.
    """
    if device_data.is_mock_location or device_data.is_rooted or device_data.is_emulator:
        return 0.0
    return 100.0

def calculate_time_consistency(time_of_event, time_of_submission):
    """
    Flag if the event supposedly happened in the future or way too far in the past without reason.
    """
    diff = (time_of_submission.replace(tzinfo=None) - time_of_event.replace(tzinfo=None)).total_seconds()
    
    if diff < 0:
        # Event time in the future! Impossoble.
        return 0.0
        
    if diff > 86400: # Over a day
        return 60.0
        
    return 100.0

def evaluate_claim(claim_req: ClaimCreate, current_agent_rep: float) -> ScoreDetails:
    # 1. Weather Data Match
    weather_data = weather_service.get_weather_for_location(
        claim_req.sensor_data.gps_lat, 
        claim_req.sensor_data.gps_lon
    )
    env_score = calculate_env_fingerprint(claim_req.sensor_data, weather_data)
    
    # 2. Device Check
    device_score = calculate_device_integrity(claim_req.device_data)
    
    # 3. Time Check
    time_score = calculate_time_consistency(claim_req.time_of_event, datetime.utcnow())
    
    # 4. Geo-Risk Check (Mocked base score of 90)
    geo_score = 90.0
    
    # 5. Graph Fraud Check
    graph_flag = graph_fraud.check_fraud_ring(claim_req.agent_id)
    
    # Aggregate Rules
    # Start with base 100
    overall = 100.0
    
    # Heavy penalty for device
    if device_score == 0:
        overall -= 80
        
    # Penalty for environment mismatch
    if env_score < 70:
        overall -= (100 - env_score) * 0.8
        
    # Penalty for time
    if time_score < 100:
        overall -= (100 - time_score) * 0.5
        
    # Reward for high rep
    if current_agent_rep > 90:
        overall += 5
        
    overall = max(0.0, min(100.0, overall))
    
    # Decision Matrix
    action = "FLAGGED"
    if graph_flag:
        action = "FLAGGED"
    elif overall >= 85:
        action = "APPROVED"
    elif overall >= 60:
        action = "VERIFY"
        
    return ScoreDetails(
        env_fingerprint=env_score,
        device_integrity=device_score,
        time_consistency=time_score,
        geo_risk=geo_score,
        graph_risk_flag=graph_flag,
        overall_trust=overall,
        action=action
    )
