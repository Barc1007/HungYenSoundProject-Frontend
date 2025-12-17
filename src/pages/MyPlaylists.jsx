"use client"

import { useState } from "react"
import { Plus, Trash2, Music } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AudioPlayer from "../components/AudioPlayer"
import CreatePlaylistModal from "../components/CreatePlaylistModal"
import AddSongsModal from "../components/AddSongsModal"
import { usePlaylist } from "../context/PlaylistContext"

export default function MyPlaylists() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAddSongsModalOpen, setIsAddSongsModalOpen] = useState(false)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null)
  const { playlists, deletePlaylist, removeSongFromPlaylist } = usePlaylist()

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

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Playlists</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full font-medium transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Playlist
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No playlists yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => {
              const playlistId = playlist._id || playlist.id
              return (
              <div key={playlistId} className="bg-slate-800/50 rounded-xl overflow-hidden">
                <div className="relative">
                  <img
                    src={playlist.image || "/placeholder.svg"}
                    alt={playlist.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <div>
                      <h3 className="font-bold text-xl">{playlist.name}</h3>
                      <p className="text-orange-300 text-sm">{playlist.songs.length} songs</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  {playlist.description && <p className="text-slate-300 text-sm mb-4">{playlist.description}</p>}
                  <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                    {playlist.songs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center justify-between bg-slate-700/50 p-2 rounded text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-white">{song.title}</p>
                          <p className="text-slate-400 text-xs">{song.artist}</p>
                        </div>
                        <button
                          onClick={() => removeSongFromPlaylist(playlistId, song.id)}
                          className="text-slate-400 hover:text-red-400 transition ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddSongs(playlistId)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition text-sm"
                    >
                      Add Songs
                    </button>
                    <button
                      onClick={() => handleDeletePlaylist(playlistId)}
                      className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg font-medium transition"
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
      <Footer />
      <AudioPlayer />

      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlaylistCreated={() => {}}
      />
      <AddSongsModal
        isOpen={isAddSongsModalOpen}
        onClose={() => setIsAddSongsModalOpen(false)}
        playlistId={selectedPlaylistId}
      />
    </div>
  )
}
