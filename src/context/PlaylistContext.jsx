"use client"

import { createContext, useContext, useState, useEffect } from "react"
import playlistService from "../services/playlistService"
import { useUser } from "./UserContext"
import { useNotification } from "./NotificationContext"

const PlaylistContext = createContext()

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, isAuthenticated } = useUser()
  const { showSuccess, showError } = useNotification()

  // Load playlists from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadPlaylists()
    } else {
      setPlaylists([])
      setLoading(false)
    }
  }, [isAuthenticated, user?._id])

  const loadPlaylists = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await playlistService.getPlaylists()
      setPlaylists(data)
    } catch (err) {
      console.error('Error loading playlists:', err)
      setError(err.message || 'Failed to load playlists')
      showError(err.message || 'Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }

  const createPlaylist = async (name, description = "") => {
    try {
      setError(null)
      const newPlaylist = await playlistService.createPlaylist({
      name,
      description,
        isPublic: true
      })
    setPlaylists([...playlists, newPlaylist])
      showSuccess('Playlist created successfully!')
      return newPlaylist
    } catch (err) {
      console.error('Error creating playlist:', err)
      const errorMsg = err.message || 'Failed to create playlist'
      setError(errorMsg)
      showError(errorMsg)
      throw err
    }
  }

  const addSongToPlaylist = async (playlistId, song) => {
    try {
      setError(null)
      // Find playlist to check if song already exists locally
      const playlist = playlists.find(p => p._id === playlistId || p.id === playlistId)
      if (playlist) {
          const songExists = playlist.songs.some((s) => s.id === song.id)
        if (songExists) {
          showError('Song already exists in playlist')
          return
        }
  }

      const updatedPlaylist = await playlistService.addSongToPlaylist(playlistId, song)
    setPlaylists(
        playlists.map((p) => {
          const id = p._id || p.id
          return id === playlistId ? updatedPlaylist : p
        })
      )
      showSuccess('Song added to playlist!')
    } catch (err) {
      console.error('Error adding song to playlist:', err)
      const errorMsg = err.message || 'Failed to add song to playlist'
      setError(errorMsg)
      showError(errorMsg)
      throw err
    }
  }

  const removeSongFromPlaylist = async (playlistId, songId) => {
    try {
      setError(null)
      const updatedPlaylist = await playlistService.removeSongFromPlaylist(playlistId, songId)
      setPlaylists(
        playlists.map((p) => {
          const id = p._id || p.id
          return id === playlistId ? updatedPlaylist : p
        })
      )
      showSuccess('Song removed from playlist!')
    } catch (err) {
      console.error('Error removing song from playlist:', err)
      const errorMsg = err.message || 'Failed to remove song from playlist'
      setError(errorMsg)
      showError(errorMsg)
      throw err
    }
  }

  const deletePlaylist = async (playlistId) => {
    try {
      setError(null)
      await playlistService.deletePlaylist(playlistId)
      setPlaylists(playlists.filter((p) => {
        const id = p._id || p.id
        return id !== playlistId
      }))
      showSuccess('Playlist deleted successfully!')
    } catch (err) {
      console.error('Error deleting playlist:', err)
      const errorMsg = err.message || 'Failed to delete playlist'
      setError(errorMsg)
      showError(errorMsg)
      throw err
    }
  }

  const updatePlaylist = async (playlistId, updates) => {
    try {
      setError(null)
      const updatedPlaylist = await playlistService.updatePlaylist(playlistId, updates)
    setPlaylists(
        playlists.map((p) => {
          const id = p._id || p.id
          return id === playlistId ? updatedPlaylist : p
        })
      )
      showSuccess('Playlist updated successfully!')
      return updatedPlaylist
    } catch (err) {
      console.error('Error updating playlist:', err)
      const errorMsg = err.message || 'Failed to update playlist'
      setError(errorMsg)
      showError(errorMsg)
      throw err
    }
  }

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        loading,
        error,
        createPlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        deletePlaylist,
        updatePlaylist,
        loadPlaylists,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  )
}

export const usePlaylist = () => {
  const context = useContext(PlaylistContext)
  if (!context) {
    throw new Error("usePlaylist must be used within PlaylistProvider")
  }
  return context
}
