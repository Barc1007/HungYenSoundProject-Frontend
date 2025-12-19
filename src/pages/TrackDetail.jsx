"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Play, Heart, MessageCircle, ImageIcon } from "lucide-react"
import Navbar from "../components/Navbar"

import AudioPlayer from "../components/AudioPlayer"
import CommentSection from "../components/CommentSection"
import LoadingSpinner from "../components/LoadingSpinner"
import UpdateTrackImageModal from "../components/UpdateTrackImageModal"
import { useAudio } from "../context/AudioContext"
import { useUser } from "../context/UserContext"
import { useNotification } from "../context/NotificationContext"
import trackService from "../services/trackService"

export default function TrackDetail() {
  const { id } = useParams()
  const { playTrack } = useAudio()
  const { user } = useUser()
  const { showError, showSuccess } = useNotification()
  const [track, setTrack] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [isUpdateImageModalOpen, setIsUpdateImageModalOpen] = useState(false)

  const isAdmin = user?.role === 'admin'
  const isTrackOwner = user && track && (track.uploadedBy === user._id || track.uploadedBy === user.id)
  const canUpdateImage = isAdmin || isTrackOwner

  useEffect(() => {
    loadTrack()
  }, [id])

  const loadTrack = async () => {
    try {
      setIsLoading(true)
      const data = await trackService.getTrackById(id)
      setTrack(data)
      setIsLiked(data.isLiked || false)
      setLikeCount(data.likeCount || 0)
    } catch (error) {
      console.error("Load track error:", error)
      showError(error.message || "Không thể tải thông tin bài hát")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlay = () => {
    if (track) {
      playTrack(track)
    }
  }

  const handleLike = async () => {
    if (!user) {
      showError("Vui lòng đăng nhập để thích bài hát")
      return
    }

    try {
      setIsLiking(true)
      const result = await trackService.toggleLike(track.mongoId || track.id)
      setIsLiked(result.isLiked)
      setLikeCount(result.likeCount)
      setTrack({ ...track, isLiked: result.isLiked, likeCount: result.likeCount })
    } catch (error) {
      console.error("Like error:", error)
      showError(error.message || "Không thể thích bài hát")
    } finally {
      setIsLiking(false)
    }
  }

  const handleImageUpdated = (updatedTrack) => {
    setTrack(updatedTrack)
    setImageError(false)
    setImageLoading(true)
    showSuccess("Ảnh bìa đã được cập nhật!")
  }

  const getFallbackImage = () => {
    if (!track.image || imageError) {
      const seed = encodeURIComponent(track.title || 'music')
      return `https://picsum.photos/seed/${seed}/320/320`
    }
    return track.image
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col pb-32">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
            <span className="ml-3 text-slate-400">Đang tải...</span>
          </div>
        </main>
        
        <AudioPlayer />
      </div>
    )
  }

  if (!track) {
    return (
      <div className="min-h-screen flex flex-col pb-32">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
          <div className="text-center py-20">
            <p className="text-slate-300 text-lg mb-4">Không tìm thấy bài hát</p>
            <Link
              to="/genres"
              className="text-orange-400 hover:text-orange-300 transition"
            >
              Quay lại trang chủ
            </Link>
          </div>
        </main>
        
        <AudioPlayer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Back Button */}
        <Link
          to="/genres"
          className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </Link>

        {/* Track Info */}
        <div className="bg-slate-800/50 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0 relative group">
              {imageLoading && (
                <div className="absolute inset-0 bg-slate-700 animate-pulse rounded-xl flex items-center justify-center">
                  <LoadingSpinner />
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
                className="w-80 h-80 rounded-xl object-cover"
              />
              {canUpdateImage && (
                <button
                  onClick={() => setIsUpdateImageModalOpen(true)}
                  className="absolute bottom-4 right-4 bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
                  title="Cập nhật ảnh bìa"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{track.title}</h1>
              <p className="text-xl text-orange-300 mb-4">{track.artist}</p>

              {track.description && (
                <p className="text-slate-300 mb-6">{track.description}</p>
              )}

              <div className="flex flex-wrap gap-4 mb-6 text-sm text-slate-400">

                <span>Thời lượng: {track.duration || "0:00"}</span>
                <span>•</span>
                <span>Đăng tải: {formatDate(track.createdAt)}</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlay}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-medium transition"
                >
                  <Play className="w-5 h-5" />
                  Phát
                </button>
                <button
                  onClick={handleLike}
                  disabled={isLiking || !user}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition ${isLiked
                    ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                  {likeCount} Thích
                </button>
                <div className="flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-slate-700 text-slate-300">
                  <MessageCircle className="w-5 h-5" />
                  {track.commentCount || 0} Bình luận
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection
          trackId={track.mongoId || track.id}
          initialComments={track.comments || []}
        />
      </main>
      
      <AudioPlayer />

      {/* Update Image Modal */}
      <UpdateTrackImageModal
        isOpen={isUpdateImageModalOpen}
        onClose={() => setIsUpdateImageModalOpen(false)}
        track={track}
        onUpdated={handleImageUpdated}
      />
    </div>
  )
}
