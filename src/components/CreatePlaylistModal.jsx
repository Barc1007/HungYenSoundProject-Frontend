"use client"

import { X } from "lucide-react"
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
      
      if (onPlaylistCreated) {
        onPlaylistCreated(newPlaylist)
      }
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create Playlist</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Playlist Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Playlist"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your playlist..."
              rows="3"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Cover Image (Optional)</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="w-full text-sm text-slate-200 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-600 file:text-white hover:file:bg-slate-700"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border border-slate-600"
                />
              </div>
            )}
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
