import uuid



                                                     

def sync_claim_decision(claim_data: dict) -> str:

    print(f"[Guidewire Sync] Syncing claim {claim_data['id']}. Action: {claim_data['status']}")

                                                  

    gw_id = "GW-" + str(uuid.uuid4())[:8].upper()

    return gw_id

