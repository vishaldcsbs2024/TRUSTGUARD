import json

from collections import Counter

from datetime import datetime, timedelta



import models





def _safe_load_payload(raw_data_json: str) -> dict:

    if not raw_data_json:

        return {}

    try:

        return json.loads(raw_data_json)

    except (TypeError, json.JSONDecodeError):

        return {}





def _is_nearby_zone(candidate: dict, current: dict, tolerance: float = 0.03) -> bool:

    candidate_sensor = candidate.get("sensor_data", {})

    current_sensor = current.get("sensor_data", {})



    candidate_lat = candidate_sensor.get("gps_lat")

    candidate_lon = candidate_sensor.get("gps_lon")

    current_lat = current_sensor.get("gps_lat")

    current_lon = current_sensor.get("gps_lon")



    if None in (candidate_lat, candidate_lon, current_lat, current_lon):

        return False



    return abs(candidate_lat - current_lat) <= tolerance and abs(candidate_lon - current_lon) <= tolerance





def check_fraud_ring(db, claim_req, lookback_minutes: int = 20) -> bool:

    """
    Detect coordinated fraud using recent cluster behavior from persisted claim payloads.

    Heuristics (MVP graph-style signals):
    1) Burst pattern: too many claims in the same geo micro-zone in a short window.
    2) Shared risky-device signature across multiple agents in the same window.
    """

    if db is None:

        return "fraud_" in claim_req.agent_id.lower()



    window_start = datetime.utcnow() - timedelta(minutes=lookback_minutes)

    rows = (

        db.query(models.Claim, models.ClaimSignal)

        .join(models.ClaimSignal, models.Claim.id == models.ClaimSignal.claim_id)

        .filter(models.Claim.created_at >= window_start)

        .all()

    )



    current_payload = claim_req.model_dump()

    nearby_zone_count = 0

    nearby_agents = set()

    nearby_risky_device_count = 0

    risky_device_signatures = Counter()

    risky_signature_agents = {}



    for claim, signal in rows:

        payload = _safe_load_payload(signal.raw_data_json)

        if not payload:

            continue



        if _is_nearby_zone(payload, current_payload):

            nearby_zone_count += 1

            nearby_agents.add(claim.agent_id)



        device_data = payload.get("device_data", {})

        signature = (

            bool(device_data.get("is_rooted")),

            bool(device_data.get("is_emulator")),

            bool(device_data.get("is_mock_location")),

        )



        if any(signature):

            if _is_nearby_zone(payload, current_payload):

                nearby_risky_device_count += 1

            risky_device_signatures[signature] += 1

            risky_signature_agents.setdefault(signature, set()).add(claim.agent_id)



    risky_ratio = (nearby_risky_device_count / nearby_zone_count) if nearby_zone_count > 0 else 0.0

    is_burst_ring = nearby_zone_count >= 8 and len(nearby_agents) >= 3 and risky_ratio >= 0.35



    has_shared_risky_signature = any(

        count >= 3 and len(risky_signature_agents.get(sig, set())) >= 2

        for sig, count in risky_device_signatures.items()

    )



    return is_burst_ring or has_shared_risky_signature

