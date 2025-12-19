"use client"

import { useState } from "react"
import { Plus, Trash2, Music, Play, ListMusic, Clock, Sparkles } from "lucide-react"
import Navbar from "../components/Navbar"

import AudioPlayer from "../components/AudioPlayer"
import CreatePlaylistModal from "../components/CreatePlaylistModal"
import AddSongsModal from "../components/AddSongsModal"
import { usePlaylist } from "../context/PlaylistContext"
import { useAudio } from "../context/AudioContext"

export default function MyPlaylists() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAddSongsModalOpen, setIsAddSongsModalOpen] = useState(false)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null)
  const { playlists, deletePlaylist, removeSongFromPlaylist } = usePlaylist()
  const { playTrack } = useAudio()

  const handleAddSongs = (playlistId) => {
    setSelectedPlaylistId(playlistId)
    setIsAddSongsModalOpen(true)
  }

  const handleDeletePlaylist = async (playlistId) => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      try {
        await deletePlaylist(playlistId)
      } catch (err) {
        console.error('Error deleting playlist:', err)
      }
    }
  }

  const playPlaylist = (playlist) => {
    if (!playlist.songs || playlist.songs.length === 0) {
      alert("This playlist is empty. Add some songs first!")
      return
    }

    // Play the first track and set the entire playlist as the queue
    playTrack(playlist.songs[0], playlist.songs, 0)
  }

  const getTotalDuration = (songs) => {
    if (!songs || songs.length === 0) return "0:00"
    // This is a simplified calculation - you might need to parse actual durations
    const minutes = songs.length * 3 // Assuming avg 3 min per song
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Hero Section */}
        <div className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/20 via-orange-600/20 to-pink-600/20 p-8 md:p-12 border border-purple-500/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCAyMCAwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC4zIiBvcGFjaXR5PSIwLjEiLz48cGF0aCBkPSJNIDAgMCBMIDAgMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjMiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <ListMusic className="w-8 h-8 text-purple-400" />
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                  My Playlists
                </h1>
              </div>
              <p className="text-slate-300 text-lg max-w-2xl">
                Your personal music collections • {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center gap-3 shadow-xl shadow-orange-500/30 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/40"
            >
              <Plus className="w-6 h-6" />
              <span className="hidden md:inline">Create Playlist</span>
            </button>
          </div>
        </div>

        {/* Playlists Grid */}
        {playlists.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl border border-slate-700/50">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
              <ListMusic className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-slate-300 text-2xl mb-3 font-semibold">No playlists yet</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Create your first playlist to start organizing your favorite tracks
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg shadow-orange-500/30"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Create Your First Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => {
              const playlistId = playlist._id || playlist.id
              return (
                <div
                  key={playlistId}
                  className="group bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 border border-slate-700/50 hover:border-purple-500/30"
                >
                  {/* Header Image */}
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={playlist.image || "/placeholder.svg"}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Play Button */}
                    {playlist.songs.length > 0 && (
                      <button
                        onClick={() => playPlaylist(playlist)}
                        className="absolute bottom-4 right-4 bg-orange-600 hover:bg-orange-500 text-white p-4 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                    )}

                    {/* Title */}
                    <div className="absolute bottom-4 left-4 right-20">
                      <h3 className="font-bold text-xl text-white mb-1 line-clamp-1">
                        {playlist.name}
                      </h3>
                      <div className="flex items-center gap-2 text-purple-300 text-sm">
                        <Music className="w-4 h-4" />
                        <span>{playlist.songs.length} tracks</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Description */}
                    {playlist.description && (
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}

                    {/* Track List Preview */}
                    {playlist.songs.length > 0 ? (
                      <div className="space-y-2 mb-4 max-h-32 overflow-y-auto custom-scrollbar">
                        {playlist.songs.slice(0, 3).map((song, idx) => (
                          <div
                            key={song.id || idx}
                            className="flex items-center justify-between bg-slate-700/30 hover:bg-slate-700/50 p-2 rounded-lg text-sm transition group/song"
                          >
                            <div className="flex-1 min-w-0 mr-2">
                              <p className="font-medium text-white truncate text-xs">
                                {song.title}
                              </p>
                              <p className="text-slate-400 text-xs truncate">
                                {song.artist}
                              </p>
                            </div>
                            <button
                              onClick={() => removeSongFromPlaylist(playlistId, song.id)}
                              className="text-slate-500 hover:text-red-400 transition opacity-0 group-hover/song:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {playlist.songs.length > 3 && (
                          <p className="text-slate-500 text-xs text-center py-1">
                            +{playlist.songs.length - 3} more tracks
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-700/20 rounded-lg p-4 mb-4 text-center">
                        <Music className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-500 text-xs">No tracks yet</p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{getTotalDuration(playlist.songs)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Music className="w-3.5 h-3.5" />
                        <span>{playlist.songs.length} songs</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddSongs(playlistId)}
                        className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white py-2.5 rounded-lg font-medium transition text-sm border border-slate-600/50"
                      >
                        Add Songs
                      </button>
                      <button
                        onClick={() => handleDeletePlaylist(playlistId)}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2.5 rounded-lg font-medium transition border border-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      
      <AudioPlayer />

      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlaylistCreated={() => { }}
      />
      <AddSongsModal
        isOpen={isAddSongsModalOpen}
        onClose={() => setIsAddSongsModalOpen(false)}
        playlistId={selectedPlaylistId}
      />

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.7);
        }
      `}</style>
    </div>
  )
}
