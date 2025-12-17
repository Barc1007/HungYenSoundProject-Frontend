"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Send, Trash2, User as UserIcon } from "lucide-react"
import { useUser } from "../context/UserContext"
import { useNotification } from "../context/NotificationContext"
import trackService from "../services/trackService"
import LoadingSpinner from "./LoadingSpinner"

export default function CommentSection({ trackId, initialComments = [] }) {
  const { user } = useUser()
  const { showError, showSuccess } = useNotification()
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (initialComments.length > 0) {
      setComments(initialComments)
    } else {
      loadComments()
    }
  }, [trackId])

  const loadComments = async () => {
    try {
      setIsLoading(true)
      const data = await trackService.getComments(trackId, { limit: 20 })
      setComments(data)
    } catch (error) {
      console.error("Load comments error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      showError("Vui lòng đăng nhập để bình luận")
      return
    }

    if (!newComment.trim()) {
      showError("Vui lòng nhập nội dung bình luận")
      return
    }

    if (newComment.length > 500) {
      showError("Bình luận không được vượt quá 500 ký tự")
      return
    }

    try {
      setIsSubmitting(true)
      const comment = await trackService.addComment(trackId, newComment.trim())
      setComments([comment, ...comments])
      setNewComment("")
      showSuccess("Đã thêm bình luận")
    } catch (error) {
      console.error("Add comment error:", error)
      showError(error.message || "Không thể thêm bình luận")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) {
      return
    }

    try {
      setDeletingId(commentId)
      await trackService.deleteComment(commentId)
      setComments(comments.filter(c => c.id !== commentId))
      showSuccess("Đã xóa bình luận")
    } catch (error) {
      console.error("Delete comment error:", error)
      showError(error.message || "Không thể xóa bình luận")
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Vừa xong"
    if (minutes < 60) return `${minutes} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    if (days < 7) return `${days} ngày trước`
    return date.toLocaleDateString("vi-VN")
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-orange-400" />
        <h3 className="text-xl font-bold">Bình luận ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <img
              src={user.avatar || "/placeholder.svg?height=40&width=40"}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                rows={3}
                maxLength={500}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">
                  {newComment.length}/500
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Gửi
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-slate-700/50 rounded-lg text-center text-slate-400">
          <p>Vui lòng đăng nhập để bình luận</p>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-3 text-slate-400">Đang tải bình luận...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwner = user && comment.user && comment.user.id === user._id
            const canDelete = isOwner || user?.role === "admin"

            return (
              <div
                key={comment.id}
                className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={comment.user?.avatar || "/placeholder.svg?height=40&width=40"}
                    alt={comment.user?.name || "User"}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=40&width=40"
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="font-semibold text-sm">
                          {comment.user?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingId === comment.id}
                          className="text-slate-400 hover:text-red-400 transition disabled:opacity-50"
                        >
                          {deletingId === comment.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-slate-200 text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}




