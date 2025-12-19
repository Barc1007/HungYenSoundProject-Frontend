"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { Search as SearchIcon, AlertCircle, Play, Music } from "lucide-react"
import Navbar from "../components/Navbar"

import AudioPlayer from "../components/AudioPlayer"
import LoadingSpinner from "../components/LoadingSpinner"
import TrackCard from "../components/TrackCard"
import { useAudio } from "../context/AudioContext"
import trackService from "../services/trackService"

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { playTrack } = useAudio()

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const query = searchParams.get('q')
    if (query && query.trim()) {
      handleSearch(query)
    }
  }, [searchParams])

  const handleSearch = async (term = null) => {
    const searchQuery = term || searchTerm.trim()
    if (!searchQuery) {
      setError("Please enter a search term")
      return
    }

    // Update URL
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`)

    try {
      setLoading(true)
      setError("")
      // Search tracks from database (works for all users)
      const response = await trackService.getTracks({
        source: "local",
        search: searchQuery,
        limit: 50
      })
      setTracks(response.tracks)
      if (response.tracks.length === 0) {
        setError(`No tracks found for "${searchQuery}"`)
      }
    } catch (err) {
      console.error("Search error:", err)
      setError(err.message || "Failed to search tracks")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSearchClick = () => {
    handleSearch()
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Search Input */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for artists or playlists..."
                className="w-full bg-slate-800/50 text-white px-6 py-4 pr-12 rounded-full text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <SearchIcon className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>
            <button
              onClick={handleSearchClick}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-medium transition flex items-center gap-2"
            >
              <SearchIcon className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && !loading && (
          <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-200">
              {error}
            </div>
          </div>
        )}

        {/* Search Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="ml-3 text-slate-400">Searching...</span>
          </div>
        ) : tracks.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Kết quả tìm kiếm ({tracks.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.map((track) => (
                <TrackCard
                  key={track.id || track.mongoId}
                  track={track}
                  onUpdate={(updated) => {
                    setTracks(tracks.map(t =>
                      (t.id || t.mongoId) === (updated.id || updated.mongoId) ? updated : t
                    ))
                  }}
                />
              ))}
            </div>
          </div>
        ) : searchTerm && !loading ? (
          <div className="text-center py-12 bg-slate-800/40 border border-slate-700 rounded-2xl">
            <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 text-lg">No tracks found</p>
            <p className="text-slate-400 text-sm mt-2">Try searching with different keywords</p>
          </div>
        ) : null}
      </main>
      
      <AudioPlayer />
    </div>
  )
}

