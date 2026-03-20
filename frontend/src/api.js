import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export const getKpis = async () => {
    const response = await axios.get(`${API_URL}/dashboard/kpis`);
    return response.data;
};

export const getClaims = async () => {
    const response = await axios.get(`${API_URL}/claims/`);
    return response.data;
};

export const getClaimDetails = async (claimId) => {
    const response = await axios.get(`${API_URL}/claims/${claimId}`);
    return response.data;
};

export const getAgents = async () => {
    const response = await axios.get(`${API_URL}/agents/`);
    return response.data;
};

export const submitClaim = async (claimData) => {
    const response = await axios.post(`${API_URL}/claims/`, claimData);
    return response.data;
};

export const seedDemoClaims = async (count = 20) => {
    const response = await axios.post(`${API_URL}/demo/seed?count=${count}`);
    return response.data;
};

export const resetDemoData = async () => {
    const response = await axios.post(`${API_URL}/demo/reset`);
    return response.data;
};

export const issueChallenge = async (claimId) => {
    const response = await axios.post(`${API_URL}/challenges/issue`, { claim_id: claimId });
    return response.data;
};

export const completeChallenge = async (challengeId, proofPayload) => {
    const response = await axios.post(`${API_URL}/challenges/${challengeId}/complete`, proofPayload);
    return response.data;
};

export const overrideClaim = async (claimId, overrideRequest) => {
    const response = await axios.post(`${API_URL}/claim/${claimId}/override`, overrideRequest);
    return response.data;
};
