"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Filter, ArrowDown, X, Play, Music, Clock, TrendingUp, Sparkles } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AudioPlayer from "../components/AudioPlayer"
import { usePlaylist } from "../context/PlaylistContext"
import { useAudio } from "../context/AudioContext"

export default function Playlists() {
  const [searchParams, setSearchParams] = useSearchParams()
  const genre = searchParams.get("genre")
  const { playlists } = usePlaylist()
  const { playTrack } = useAudio()

  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState("recent") // recent, popular, name

  // Filter public/featured playlists (if you have that property)
  const featuredPlaylists = playlists.filter(p => p.isPublic || p.featured)

  const filteredPlaylists = genre
    ? featuredPlaylists.filter(p => p.genre?.toLowerCase() === genre.toLowerCase())
    : featuredPlaylists

  const sortedPlaylists = [...filteredPlaylists].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.playCount || 0) - (a.playCount || 0)
      case "name":
        return (a.name || "").localeCompare(b.name || "")
      default: // recent
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    }
  })

  const playPlaylist = (playlist) => {
    if (!playlist.songs || playlist.songs.length === 0) {
      return
    }
    playTrack(playlist.songs[0], playlist.songs, 0)
  }

  const genres = ["Pop", "Rock", "Hip Hop", "Jazz", "Electronic", "Classical"]

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Hero Section */}
        <div className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600/20 via-purple-600/20 to-blue-600/20 p-8 md:p-12 border border-orange-500/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCAyMCAwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC4zIiBvcGFjaXR5PSIwLjEiLz48cGF0aCBkPSJNIDAgMCBMIDAgMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjMiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-orange-400" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Featured Playlists
              </h1>
            </div>
            <p className="text-slate-300 text-lg max-w-2xl">
              Discover curated collections of the best tracks, handpicked just for you
            </p>
          </div>
        </div>

        {/* Filters & Sort Bar */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            {genre && (
              <div className="flex items-center gap-2 bg-orange-600/20 border border-orange-500/30 px-4 py-2 rounded-full">
                <span className="text-orange-300 font-medium">{genre}</span>
                <button
                  onClick={() => setSearchParams({})}
                  className="text-orange-400 hover:text-orange-300 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <span className="text-slate-400 text-sm">
              {sortedPlaylists.length} playlists
            </span>
          </div>

          <div className="flex gap-3">
            {/* Genre Filter */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="bg-slate-800/50 hover:bg-slate-700/50 text-white px-5 py-2.5 rounded-full text-sm font-medium transition flex items-center gap-2 border border-slate-700/50"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>

              {filterOpen && (
                <div className="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-3 min-w-[200px] z-20">
                  <p className="text-xs text-slate-400 mb-2 px-2">Genres</p>
                  {genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setSearchParams({ genre: g.toLowerCase() })
                        setFilterOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${genre === g.toLowerCase()
                          ? 'bg-orange-600/20 text-orange-400'
                          : 'text-slate-300 hover:bg-slate-700/50'
                        }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-800/50 hover:bg-slate-700/50 text-white px-5 py-2.5 rounded-full text-sm font-medium transition border border-slate-700/50 cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="name">A-Z</option>
            </select>
          </div>
        </div>

        {/* Playlists Grid */}
        {sortedPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedPlaylists.map((playlist) => {
              const playlistId = playlist._id || playlist.id
              return (
                <div
                  key={playlistId}
                  className="group bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 border border-slate-700/50 hover:border-orange-500/30 hover:scale-[1.02]"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={playlist.image || "/placeholder.svg"}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Play Button */}
                    <button
                      onClick={() => playPlaylist(playlist)}
                      className="absolute bottom-4 right-4 bg-orange-600 hover:bg-orange-500 text-white p-4 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
                    >
                      <Play className="w-6 h-6 fill-current" />
                    </button>

                    {/* Info Overlay */}
                    <div className="absolute bottom-4 left-4 right-20">
                      <h3 className="font-bold text-xl text-white mb-1 line-clamp-1">
                        {playlist.name}
                      </h3>
                      <div className="flex items-center gap-2 text-orange-300 text-sm">
                        <Music className="w-4 h-4" />
                        <span>{playlist.songs?.length || 0} tracks</span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    {playlist.description && (
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4 text-slate-500">
                        {playlist.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{playlist.duration}</span>
                          </div>
                        )}
                        {playlist.playCount && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{playlist.playCount}</span>
                          </div>
                        )}
                      </div>
                      {playlist.genre && (
                        <span className="bg-slate-700/50 px-3 py-1 rounded-full text-slate-400">
                          {playlist.genre}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl border border-slate-700/50">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-300 text-xl mb-2 font-semibold">No playlists found</p>
            <p className="text-slate-400 text-sm mb-6">
              {genre
                ? `No playlists available for ${genre}. Try a different genre.`
                : "Check back later or create your own playlist!"
              }
            </p>
            {genre && (
              <button
                onClick={() => setSearchParams({})}
                className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-full font-medium transition shadow-lg shadow-orange-500/30"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
      <AudioPlayer />
    </div>
  )
}
