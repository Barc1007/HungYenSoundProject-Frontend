"use client"

import { useState } from "react"
import { X, Upload, Info } from "lucide-react"
import trackService from "../services/trackService"
import LoadingSpinner from "./LoadingSpinner"
import { useNotification } from "../context/NotificationContext"
import { useUser } from "../context/UserContext"

export default function UploadTrackModal({ isOpen, onClose, onUploaded }) {
  const [file, setFile] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [genre, setGenre] = useState("")
  const [tags, setTags] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showError, showSuccess } = useNotification()
  const { user } = useUser()
  
  const isAdmin = user?.role === 'admin'

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    setFile(selected || null)
    if (selected && !title) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ""))
    }
  }

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
    if (!file) {
      const msg = "Please select an audio file"
      setError(msg)
      showError(msg)
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      const formData = new FormData()
      formData.append("file", file)
      if (imageFile) formData.append("image", imageFile)
      if (title) formData.append("title", title)
      if (artist) formData.append("artist", artist)
      if (genre) formData.append("genre", genre)
      if (tags) formData.append("tags", tags)

      const track = await trackService.uploadTrack(formData)
      
      // Show appropriate message based on user role
      if (isAdmin) {
        showSuccess("Track uploaded successfully!")
      } else {
        showSuccess("Track uploaded successfully! It will be reviewed by an admin before being published.")
      }

      if (onUploaded) {
        onUploaded(track)
      }

      // Reset state and close
      setFile(null)
      setImageFile(null)
      setImagePreview(null)
      setTitle("")
      setArtist("")
      setGenre("")
      setTags("")
      setError("")
      onClose()
    } catch (err) {
      const msg = err.message || "Failed to upload track"
      setError(msg)
      showError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setFile(null)
    setImageFile(null)
    setImagePreview(null)
    setTitle("")
    setArtist("")
    setGenre("")
    setTags("")
    setError("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Upload Track</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Audio File *</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-200 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-600 file:text-white hover:file:bg-orange-700"
            />
          </div>

          <div>
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

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              placeholder="Song title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Artist</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              placeholder="Artist name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                placeholder="Genre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                placeholder="chill, lofi, relax"
              />
            </div>
          </div>

          {!isAdmin && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-200">
                Your track will be reviewed by an admin before being published on the platform.
              </p>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


