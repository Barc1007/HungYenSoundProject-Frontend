"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Play, Heart, MessageCircle } from "lucide-react"
import { useAudio } from "../context/AudioContext"
import { useUser } from "../context/UserContext"
import { useNotification } from "../context/NotificationContext"
import trackService from "../services/trackService"

export default function TrackCard({ track, onUpdate }) {
  const { playTrack } = useAudio()
  const { user } = useUser()
  const { showError, showSuccess } = useNotification()
  const [isLiked, setIsLiked] = useState(track.isLiked || false)
  const [likeCount, setLikeCount] = useState(track.likeCount || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handlePlay = (e) => {
    e.stopPropagation()
    e.preventDefault()
    playTrack(track)
  }

  const handleLike = async (e) => {
    e.stopPropagation()

    if (!user) {
      showError("Vui lòng đăng nhập để thích bài hát")
      return
    }

    try {
      setIsLiking(true)
      const result = await trackService.toggleLike(track.mongoId || track.id)
      setIsLiked(result.isLiked)
      setLikeCount(result.likeCount)

      if (onUpdate) {
        onUpdate({ ...track, isLiked: result.isLiked, likeCount: result.likeCount })
      }
    } catch (error) {
      console.error("Like error:", error)
      showError(error.message || "Không thể thích bài hát")
    } finally {
      setIsLiking(false)
    }
  }

  // Generate fallback image based on track title
  const getFallbackImage = () => {
    if (!track.image || imageError) {
      // Use track title to generate consistent seed for placeholder
      const seed = encodeURIComponent(track.title || 'music')
      return `https://picsum.photos/seed/${seed}/400/400`
    }
    return track.image
  }

  const trackId = track.mongoId || track.id

  return (
    <Link
      to={`/track/${trackId}`}
      className="block bg-slate-800/50 rounded-xl overflow-hidden hover:bg-slate-800/70 transition cursor-pointer group"
    >
      <div className="relative">
        {imageLoading && (
          <div className="absolute inset-0 bg-slate-700 animate-pulse flex items-center justify-center">
            <div className="text-slate-500">Loading...</div>
          </div>
        )}
        <img
          src={getFallbackImage()}
          alt={track.title}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true)
            setImageLoading(false)
          }}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
          <div className="w-full">
            <h3 className="font-bold text-xl mb-1">{track.title}</h3>
            <p className="text-orange-300 text-sm">{track.artist}</p>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <button
            onClick={handlePlay}
            className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full transition shadow-lg"
          >
            <Play className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-4">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{track.duration || "0:00"}</span>
          </div>
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleLike}
              disabled={isLiking || !user}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${isLiked
                ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              {likeCount}
            </button>
            <Link
              to={`/track/${trackId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 hover:bg-slate-700 transition"
            >
              <MessageCircle className="w-4 h-4" />
              {track.commentCount || 0}
            </Link>
          </div>
        </div>
      </div>
    </Link>
  )
}

