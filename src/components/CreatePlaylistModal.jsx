"use client"

import { X, ListMusic, Upload, Image as ImageIcon, Sparkles } from "lucide-react"
import { useState } from "react"
import { usePlaylist } from "../context/PlaylistContext"
import playlistService from "../services/playlistService"
import LoadingSpinner from "./LoadingSpinner"
import { useNotification } from "../context/NotificationContext"

export default function CreatePlaylistModal({ isOpen, onClose, onPlaylistCreated }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createPlaylist } = usePlaylist()
  const { showError, showSuccess } = useNotification()

  const handleImageChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(selected.type)) {
        showError('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)')
        return
      }

      // Validate file size (10MB)
      if (selected.size > 10 * 1024 * 1024) {
        showError('Kích thước ảnh không được vượt quá 10MB')
        return
      }

      setImageFile(selected)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(selected)
    } else {
      setImageFile(null)
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Playlist name is required")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const newPlaylist = await createPlaylist(name, description)

      // Upload image if provided
      if (imageFile && newPlaylist._id) {
        try {
          await playlistService.uploadPlaylistImage(newPlaylist._id, imageFile)
        } catch (imgErr) {
          console.error('Error uploading playlist image:', imgErr)
          // Don't fail the whole operation if image upload fails
          showError('Playlist created but failed to upload image')
        }
      }

      showSuccess('Playlist created successfully! 🎉')

      if (onPlaylistCreated) {
        onPlaylistCreated(newPlaylist)
      }

      // Reset form
      setName("")
      setDescription("")
      setImageFile(null)
      setImagePreview(null)
      setError("")
      onClose()
    } catch (err) {
      setError(err.message || "Failed to create playlist")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    setImageFile(null)
    setImagePreview(null)
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 pb-32 overflow-y-auto animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-lg border border-slate-700 shadow-2xl transform transition-all animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-purple-500/20">
              <ListMusic className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create Playlist</h2>
              <p className="text-slate-400 text-sm">Build your perfect music collection</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors hover:bg-slate-700/50 rounded-lg p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Playlist Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Playlist"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your playlist..."
              rows="3"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none transition"
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-orange-400" />
              Cover Image (Optional)
            </label>

            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border-2 border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <label className="cursor-pointer bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Change Image
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-slate-600 hover:border-orange-500 rounded-xl p-8 transition-all hover:bg-slate-700/30 text-center">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-300 font-medium mb-1">Upload cover image</p>
                  <p className="text-slate-400 text-sm">PNG, JPG, GIF up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 bg-slate-700/50 hover:bg-slate-700 disabled:bg-slate-700/30 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all border border-slate-600/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Playlist
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
