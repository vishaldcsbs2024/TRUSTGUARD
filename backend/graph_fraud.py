# Mocks a Graph Database checking for coordinated fraud nodes
def check_fraud_ring(agent_id: str) -> bool:
    """
    Returns True if the agent is heavily connected to known fraudulent actors.
    """
    # Simulated logic: if the agent ID starts with "fraud_", flag them
    if "fraud_" in agent_id.lower():
        return True
    return False
