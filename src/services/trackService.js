import axios from "axios";

// Prefer env, else fall back to current origin (useful for deployed/public ports)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.origin.replace(/\/$/, "")}/api`
    : "http://localhost:4000/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const trackService = {
  // Upload local audio file
  async uploadTrack(formData) {
    try {
      const response = await api.post("/uploads/tracks", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Upload failed");
      }

      return response.data.data.track;
    } catch (error) {
      console.error("Upload track error:", error);
      throw error.response?.data || { message: "Failed to upload track" };
    }
  },

  // Get local tracks from DB
  async getLocalTracks(params = {}) {
    try {
      const searchParams = new URLSearchParams({
        source: "local",
        ...params,
      });
      const response = await api.get(`/tracks?${searchParams.toString()}`);

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to fetch tracks");
      }

      return response.data.data.tracks;
    } catch (error) {
      console.error("Get local tracks error:", error);
      throw error.response?.data || { message: "Failed to fetch local tracks" };
    }
  },

  async updateTrack(trackId, updates) {
    try {
      const response = await api.put(`/tracks/${trackId}`, updates);
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to update track");
      }
      return response.data.data.track;
    } catch (error) {
      console.error("Update track error:", error);
      throw error.response?.data || { message: "Failed to update track" };
    }
  },

  async deleteTrack(trackId) {
    try {
      const response = await api.delete(`/tracks/${trackId}`);
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to delete track");
      }
      return true;
    } catch (error) {
      console.error("Delete track error:", error);
      throw error.response?.data || { message: "Failed to delete track" };
    }
  },

  // Get tracks with filters (supports status, includePending for admin)
  async getTracks(params = {}) {
    try {
      // Remove undefined values from params
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );
      const searchParams = new URLSearchParams(cleanParams);
      const response = await api.get(`/tracks?${searchParams.toString()}`);
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to fetch tracks");
      }
      // Return full response for pagination support
      return {
        tracks: response.data.data.tracks,
        total: response.data.total,
        totalPages: response.data.totalPages,
        page: response.data.page,
        count: response.data.count
      };
    } catch (error) {
      console.error("Get tracks error:", error);
      throw error.response?.data || { message: "Failed to fetch tracks" };
    }
  },

  // Approve track (admin only)
  async approveTrack(trackId) {
    try {
      const response = await api.post(`/tracks/${trackId}/approve`);
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to approve track");
      }
      return response.data.data.track;
    } catch (error) {
      console.error("Approve track error:", error);
      throw error.response?.data || { message: "Failed to approve track" };
    }
  },

  // Reject track (admin only)
  async rejectTrack(trackId) {
    try {
      const response = await api.post(`/tracks/${trackId}/reject`);
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to reject track");
      }
      return response.data.data.track;
    } catch (error) {
      console.error("Reject track error:", error);
      throw error.response?.data || { message: "Failed to reject track" };
    }
  },

  // Get single track with comments and like status
  async getTrackById(trackId) {
    try {
      const response = await api.get(`/tracks/${trackId}`);
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to fetch track");
      }
      return response.data.data.track;
    } catch (error) {
      console.error("Get track error:", error);
      throw error.response?.data || { message: "Failed to fetch track" };
    }
  },

  // Like/Unlike a track
  async toggleLike(trackId) {
    try {
      const response = await api.post(`/tracks/${trackId}/like`);
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to like track");
      }
      return response.data.data;
    } catch (error) {
      console.error("Like track error:", error);
      throw error.response?.data || { message: "Failed to like track" };
    }
  },

  // Get comments for a track
  async getComments(trackId, params = {}) {
    try {
      const searchParams = new URLSearchParams(params);
      const response = await api.get(`/tracks/${trackId}/comments?${searchParams.toString()}`);
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to fetch comments");
      }
      return response.data.data.comments;
    } catch (error) {
      console.error("Get comments error:", error);
      throw error.response?.data || { message: "Failed to fetch comments" };
    }
  },

  // Add comment to a track
  async addComment(trackId, content) {
    try {
      const response = await api.post(`/tracks/${trackId}/comments`, { content });
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to add comment");
      }
      return response.data.data.comment;
    } catch (error) {
      console.error("Add comment error:", error);
      throw error.response?.data || { message: "Failed to add comment" };
    }
  },

  // Delete comment
  async deleteComment(commentId) {
    try {
      const response = await api.delete(`/tracks/comments/${commentId}`);
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to delete comment");
      }
      return true;
    } catch (error) {
      console.error("Delete comment error:", error);
      throw error.response?.data || { message: "Failed to delete comment" };
    }
  },

  // Update track cover image
  async updateTrackImage(trackId, imageFile) {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await api.post(`/uploads/track/${trackId}/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to update track image");
      }

      return response.data.data.track;
    } catch (error) {
      console.error("Update track image error:", error);
      throw error.response?.data || { message: "Failed to update track image" };
    }
  },

  // Increment track play count
  async incrementTrackPlayCount(trackId) {
    try {
      const response = await api.post(`/tracks/${trackId}/play`);

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to increment play count");
      }

      return response.data.data.playCount;
    } catch (error) {
      // Silently fail - play count is not critical
      console.warn("Increment track play count error:", error);
      return null;
    }
  },

  // Increment playlist play count
  async incrementPlaylistPlayCount(playlistId) {
    try {
      const response = await api.post(`/playlists/${playlistId}/play`);

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to increment play count");
      }

      return response.data.data.playCount;
    } catch (error) {
      // Silently fail - play count is not critical
      console.warn("Increment playlist play count error:", error);
      return null;
    }
  },

  // Get user's liked tracks
  async getLikedTracks() {
    try {
      const response = await api.get("/auth/liked-tracks");
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to fetch liked tracks");
      }
      return {
        tracks: response.data.data.tracks || [],
        total: response.data.data.total || 0
      };
    } catch (error) {
      console.error("Get liked tracks error:", error);
      // Return empty array instead of throwing to prevent UI errors
      return { tracks: [], total: 0 };
    }
  },

  // Unlike a track
  async unlikeTrack(trackId) {
    try {
      const response = await api.delete(`/tracks/${trackId}/like`);
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Failed to unlike track");
      }
      return true;
    } catch (error) {
      console.error("Unlike track error:", error);
      throw error.response?.data || { message: "Failed to unlike track" };
    }
  },
};

export default trackService;


