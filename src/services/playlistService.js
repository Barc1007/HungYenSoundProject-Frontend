// Playlist API Service (Frontend)
// This service handles all playlist API calls to the backend

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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const playlistService = {
  // Get all playlists
  async getPlaylists(userId = null) {
    try {
      const params = userId ? { userId } : {};
      const response = await api.get('/playlists', { params });
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
      
      return response.data.data.playlists || [];
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error.response?.data || { message: 'Failed to fetch playlists' };
    }
  },

  // Get single playlist by ID
  async getPlaylist(playlistId) {
    try {
      const response = await api.get(`/playlists/${playlistId}`);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
      
      return response.data.data.playlist;
    } catch (error) {
      console.error('Error fetching playlist:', error);
      throw error.response?.data || { message: 'Failed to fetch playlist' };
    }
  },

  // Create new playlist
  async createPlaylist(playlistData) {
    try {
      const response = await api.post('/playlists', playlistData);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
      
      return response.data.data.playlist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error.response?.data || { message: 'Failed to create playlist' };
    }
  },

  // Update playlist
  async updatePlaylist(playlistId, updates) {
    try {
      const response = await api.put(`/playlists/${playlistId}`, updates);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
      
      return response.data.data.playlist;
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw error.response?.data || { message: 'Failed to update playlist' };
    }
  },

  // Delete playlist
  async deletePlaylist(playlistId) {
    try {
      const response = await api.delete(`/playlists/${playlistId}`);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error.response?.data || { message: 'Failed to delete playlist' };
    }
  },

  // Add song to playlist
  async addSongToPlaylist(playlistId, song) {
    try {
      const response = await api.post(`/playlists/${playlistId}/songs`, song);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
      
      return response.data.data.playlist;
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      throw error.response?.data || { message: 'Failed to add song to playlist' };
    }
  },

  // Remove song from playlist
  async removeSongFromPlaylist(playlistId, songId) {
    try {
      const response = await api.delete(`/playlists/${playlistId}/songs/${songId}`);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
      
      return response.data.data.playlist;
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      throw error.response?.data || { message: 'Failed to remove song from playlist' };
    }
  },

  // Upload playlist cover image
  async uploadPlaylistImage(playlistId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post(`/uploads/playlist/${playlistId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
      
      return response.data.data.playlist;
    } catch (error) {
      console.error('Error uploading playlist image:', error);
      throw error.response?.data || { message: 'Failed to upload playlist image' };
    }
  },
};

export default playlistService;

