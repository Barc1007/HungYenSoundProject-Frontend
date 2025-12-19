import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const adminService = {
    // Get all users with filters
    async getUsers(params = {}) {
        try {
            const searchParams = new URLSearchParams(params);
            const response = await api.get(`/admin/users?${searchParams.toString()}`);
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to fetch users');
            }
            return response.data.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch users' };
        }
    },

    // Change user role
    async changeUserRole(userId, role) {
        try {
            const response = await api.put(`/admin/users/${userId}/role`, { role });
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to change user role');
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to change user role' };
        }
    },

    // Toggle user status
    async toggleUserStatus(userId, isActive) {
        try {
            const response = await api.put(`/admin/users/${userId}/status`, { isActive });
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to change user status');
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to change user status' };
        }
    },

    // Delete user
    async deleteUser(userId) {
        try {
            const response = await api.delete(`/admin/users/${userId}`);
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to delete user');
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete user' };
        }
    },

    // Approve track
    async approveTrack(trackId) {
        try {
            const response = await api.put(`/admin/tracks/${trackId}/approve`);
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to approve track');
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to approve track' };
        }
    },

    // Reject track
    async rejectTrack(trackId, reason = '') {
        try {
            const response = await api.put(`/admin/tracks/${trackId}/reject`, { reason });
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to reject track');
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to reject track' };
        }
    }
};

export default api;
