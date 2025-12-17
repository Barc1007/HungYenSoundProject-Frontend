"use client"

import { useState, useEffect } from "react"
import { Heart, Play } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AudioPlayer from "../components/AudioPlayer"
import TrackCard from "../components/TrackCard"
import LoadingSpinner from "../components/LoadingSpinner"
import trackService from "../services/trackService"
import { useUser } from "../context/UserContext"
import { useNotification } from "../context/NotificationContext"
import { useAudio } from "../context/AudioContext"

export default function LikedSongs() {
    const [tracks, setTracks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { user, isAuthenticated } = useUser()
    const { showError } = useNotification()
    const { playTrack } = useAudio()

    useEffect(() => {
        if (isAuthenticated && user) {
            loadLikedTracks()
        } else {
            setLoading(false)
        }
    }, [isAuthenticated, user])

    const loadLikedTracks = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await trackService.getLikedTracks({ limit: 50 })
            setTracks(data)
        } catch (err) {
            console.error("Failed to load liked tracks:", err)
            setError(err.message || "Không thể tải bài hát yêu thích")
            showError(err.message || "Không thể tải bài hát yêu thích")
        } finally {
            setLoading(false)
        }
    }

    const handleTrackUpdate = (updatedTrack) => {
        // If track is unliked, remove from list
        if (!updatedTrack.isLiked) {
            setTracks(tracks.filter(t => (t.id || t.mongoId) !== (updatedTrack.id || updatedTrack.mongoId)))
        } else {
            // Update track in list
            setTracks(tracks.map(t =>
                (t.id || t.mongoId) === (updatedTrack.id || updatedTrack.mongoId) ? updatedTrack : t
            ))
        }
    }

    const playAllTracks = () => {
        if (tracks.length === 0) {
            showError("Không có bài hát nào để phát")
            return
        }
        // Play the first track and set all tracks as the queue
        playTrack(tracks[0], tracks, 0)
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col pb-32">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
                    <div className="text-center py-20">
                        <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-300 text-lg mb-2">Vui lòng đăng nhập</p>
                        <p className="text-slate-400 text-sm">Bạn cần đăng nhập để xem bài hát yêu thích</p>
                    </div>
                </main>
                <Footer />
                <AudioPlayer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col pb-32">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Heart className="w-8 h-8 text-red-400 fill-current" />
                                <h1 className="text-3xl font-bold">Bài hát yêu thích</h1>
                            </div>
                            <p className="text-slate-400">
                                {loading ? "Đang tải..." : `${tracks.length} bài hát`}
                            </p>
                        </div>
                        {!loading && tracks.length > 0 && (
                            <button
                                onClick={playAllTracks}
                                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-8 py-3 rounded-full font-medium transition flex items-center gap-2 shadow-lg shadow-orange-500/30"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Phát tất cả
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <LoadingSpinner />
                        <span className="ml-3 text-slate-400">Đang tải bài hát yêu thích...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-2xl">
                        <p className="text-red-400 text-lg mb-2">❌ Lỗi</p>
                        <p className="text-slate-400 text-sm">{error}</p>
                    </div>
                ) : tracks.length === 0 ? (
                    <div className="text-center py-20 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-2xl border border-slate-700/50">
                        <Heart className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-300 text-xl mb-2">Chưa có bài hát yêu thích</p>
                        <p className="text-slate-400 text-sm mb-6">
                            Nhấn vào biểu tượng trái tim trên bài hát để thêm vào danh sách yêu thích
                        </p>
                        <a
                            href="/genres"
                            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-medium transition"
                        >
                            Khám phá nhạc
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tracks.map((track) => (
                            <TrackCard
                                key={track.id || track.mongoId}
                                track={track}
                                onUpdate={handleTrackUpdate}
                            />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
            <AudioPlayer />
        </div>
    )
}
