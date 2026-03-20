import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

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
