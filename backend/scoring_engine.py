from schemas import ClaimCreate, ScoreDetails

import weather_service

import graph_fraud

from datetime import datetime, timezone



def calculate_env_fingerprint(sensor_data, weather_api_data):

    """
    Compare sensor data (temp, lux) with actual weather API data.
    """

    score = 100.0

    

                                    

    temp_diff = abs(sensor_data.temperature_c - weather_api_data['temperature_c'])

    if temp_diff > 10:

        score -= min(50, temp_diff * 5)

        

                                                                      

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

                                               

        return 0.0

        

    if diff > 86400:             

        return 60.0

        

    return 100.0





def calculate_geo_risk(weather_api_data):

    """
    Dynamic geo-risk approximation based on live weather severity.
    """

    precipitation_mm = weather_api_data.get("precipitation_mm", 0.0)

    if precipitation_mm >= 7:

        return 45.0

    if precipitation_mm >= 2:

        return 65.0

    if precipitation_mm > 0:

        return 80.0

    return 90.0



def evaluate_claim(claim_req: ClaimCreate, current_agent_rep: float, db=None) -> ScoreDetails:

                           

    weather_data = weather_service.get_weather_for_location(

        claim_req.sensor_data.gps_lat, 

        claim_req.sensor_data.gps_lon

    )

    env_score = calculate_env_fingerprint(claim_req.sensor_data, weather_data)

    

                     

    device_score = calculate_device_integrity(claim_req.device_data)

    

                   

    time_score = calculate_time_consistency(claim_req.time_of_event, datetime.utcnow())

    

                       

    geo_score = calculate_geo_risk(weather_data)

    

                          

    graph_flag = graph_fraud.check_fraud_ring(db, claim_req)

    

                     

                         

    overall = 100.0

    

                              

    if device_score == 0:

        overall -= 80

        

                                      

    if env_score < 70:

        overall -= (100 - env_score) * 0.8

        

                      

    if time_score < 100:

        overall -= (100 - time_score) * 0.5

        

                         

    if current_agent_rep > 90:

        overall += 5

        

    overall = max(0.0, min(100.0, overall))

    

                     

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

