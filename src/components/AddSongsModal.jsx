"use client"

import { X, Plus, Check, Search, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { usePlaylist } from "../context/PlaylistContext"
import trackService from "../services/trackService"
import LoadingSpinner from "./LoadingSpinner"

export default function AddSongsModal({ isOpen, onClose, playlistId }) {
  const [selectedSongs, setSelectedSongs] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [availableSongs, setAvailableSongs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const { addSongToPlaylist, playlists } = usePlaylist()

  const playlist = playlists.find((p) => (p._id || p.id) === playlistId)
  const playlistSongIds = playlist?.songs.map((s) => s.id) || []

  // Load some local tracks when modal opens
  useEffect(() => {
    if (isOpen && !hasSearched) {
      loadPopularTracks()
    }
  }, [isOpen, hasSearched])

  const loadPopularTracks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const tracks = await trackService.getLocalTracks({ limit: 20 })
      setAvailableSongs(tracks)
    } catch (err) {
      console.error('Error loading tracks:', err)
      setError('Failed to load tracks from server.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPopularTracks()
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const tracks = await trackService.getLocalTracks({ search: searchTerm, limit: 20 })
      setAvailableSongs(tracks)
      setHasSearched(true)
    } catch (err) {
      console.error('Error searching tracks:', err)
      setError('Failed to search tracks. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSongs = availableSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleToggleSong = (song) => {
    if (selectedSongs.some((s) => s.id === song.id)) {
      setSelectedSongs(selectedSongs.filter((s) => s.id !== song.id))
    } else {
      setSelectedSongs([...selectedSongs, song])
    }
  }

  const handleAddSongs = () => {
    selectedSongs.forEach((song) => {
      if (!playlistSongIds.includes(song.id)) {
        addSongToPlaylist(playlistId, song)
      }
    })
    setSelectedSongs([])
    setSearchTerm("")
    setHasSearched(false)
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-800 pb-4">
          <h2 className="text-2xl font-bold">Add Songs to Playlist</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search your uploaded tracks..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 pr-10 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
        </div>

        {/* Configuration Warning - will show if backend API returns error */}
        {/* Note: Actual config check is done via backend API, this warning appears on errors */}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-red-200 font-medium">Error loading tracks</p>
              <p className="text-red-300/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2 text-slate-400">Loading tracks...</span>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">
                {hasSearched ? 'No tracks found. Try a different search term.' : 'Search for tracks to add to your playlist.'}
              </p>
            </div>
          ) : (
            filteredSongs.map((song) => {
              const isSelected = selectedSongs.some((s) => s.id === song.id)
              const isAlreadyInPlaylist = playlistSongIds.includes(song.id)

              return (
                <div
                  key={song.id}
                  onClick={() => !isAlreadyInPlaylist && handleToggleSong(song)}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition ${
                    isAlreadyInPlaylist
                      ? "bg-slate-700/50 opacity-50 cursor-not-allowed"
                      : isSelected
                        ? "bg-orange-600/20 border border-orange-500"
                        : "bg-slate-700/50 hover:bg-slate-700"
                  }`}
                >
                  <img 
                    src={song.image || "/placeholder.svg"} 
                    alt={song.title} 
                    className="w-12 h-12 rounded object-cover" 
                  />
                  <div className="flex-1">
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-slate-400">{song.artist}</p>
                    {song.genre && (
                      <p className="text-xs text-slate-500">{song.genre}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-slate-400">{song.duration}</span>
                    {song.playCount > 0 && (
                      <p className="text-xs text-slate-500">{song.playCount.toLocaleString()} plays</p>
                    )}
                  </div>
                  <div className="w-6 h-6 rounded border-2 border-slate-500 flex items-center justify-center">
                    {isSelected && <Check className="w-4 h-4 text-orange-500" />}
                    {isAlreadyInPlaylist && <Check className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSongs}
            disabled={selectedSongs.length === 0}
            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add {selectedSongs.length > 0 ? `(${selectedSongs.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  )
}
