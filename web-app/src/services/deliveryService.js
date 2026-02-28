import axios from 'axios';

const API_URL = `http://${window.location.hostname}:5000/api`;

const getAuthHeader = () => {
    const token = localStorage.getItem('km_token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const deliveryService = {
    getProfile: async () => {
        const response = await axios.get(`${API_URL}/delivery/profile`, getAuthHeader());
        return response.data;
    },
    getApplicationStatus: async () => {
        try {
            const response = await axios.get(`${API_URL}/delivery/application-status`, getAuthHeader());
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) return { success: false, status: 'none' };
            throw error;
        }
    },
    applyForPartner: async (data) => {
        const response = await axios.post(`${API_URL}/delivery/apply`, data, getAuthHeader());
        return response.data;
    },
    toggleAvailability: async () => {
        const response = await axios.put(`${API_URL}/delivery/toggle-availability`, {}, getAuthHeader());
        return response.data;
    },
    getCurrentDelivery: async () => {
        const response = await axios.get(`${API_URL}/delivery/current-delivery`, getAuthHeader());
        return response.data;
    },
    updateStatus: async (orderId, status, note, otp) => {
        const response = await axios.put(`${API_URL}/delivery/status`, { orderId, status, note, otp }, getAuthHeader());
        return response.data;
    },
    getHistory: async () => {
        const response = await axios.get(`${API_URL}/delivery/history`, getAuthHeader());
        return response.data;
    },
    updateLocation: async (latitude, longitude) => {
        const response = await axios.put(`${API_URL}/delivery/location`, { latitude, longitude }, getAuthHeader());
        return response.data;
    }
};

export default deliveryService;
