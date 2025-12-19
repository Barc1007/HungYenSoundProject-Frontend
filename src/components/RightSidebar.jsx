"use client"
import { Heart, Clock, Play, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import { useAudio } from "../context/AudioContext"
import trackService from "../services/trackService"

export default function RightSidebar() {
    const { user } = useUser()
    const { playTrack, currentTrack } = useAudio()
    const [likedTracks, setLikedTracks] = useState([])
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                setLoading(false)
                return
            }
            try {
                // Load liked tracks
                const likedResponse = await trackService.getLikedTracks()
                setLikedTracks((likedResponse.tracks || []).slice(0, 2))

                // Load history from localStorage
                const savedHistory = localStorage.getItem(`listeningHistory_${user._id || user.id}`)
                if (savedHistory) {
                    setHistory(JSON.parse(savedHistory).slice(0, 2))
                }
            } catch (err) {
                console.error("Failed to load sidebar data:", err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [user])

    // Save current track to history when it changes
    useEffect(() => {
        if (user && currentTrack?.title && currentTrack?.audio) {
            const historyKey = `listeningHistory_${user._id || user.id}`
            const savedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]')

            // Check if track already exists in recent history
            const existingIndex = savedHistory.findIndex(
                h => (h.track._id || h.track.id) === (currentTrack._id || currentTrack.id)
            )

            // Remove if exists
            if (existingIndex > -1) {
                savedHistory.splice(existingIndex, 1)
            }

            // Add to beginning
            savedHistory.unshift({
                track: currentTrack,
                playedAt: new Date().toISOString()
            })

            // Keep only last 20 items
            const trimmedHistory = savedHistory.slice(0, 20)
            localStorage.setItem(historyKey, JSON.stringify(trimmedHistory))
            setHistory(trimmedHistory.slice(0, 2))
        }
    }, [currentTrack, user])

    if (!user) return null

    const formatPlays = (num) => {
        if (!num) return "0"
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    return (
        <aside className="w-80 flex-shrink-0 hidden xl:block pl-6">
            <div className="sticky top-24 space-y-6">
                {/* Likes Section */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Heart className="w-3 h-3" />
                            {likedTracks.length} Likes
                        </h3>
                        <Link to="/liked" className="text-xs text-slate-500 hover:text-white transition">
                            View all
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="w-12 h-12 bg-slate-700 rounded" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-slate-700 rounded w-3/4" />
                                        <div className="h-2 bg-slate-700 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : likedTracks.length === 0 ? (
                        <p className="text-slate-500 text-sm">No liked tracks</p>
                    ) : (
                        <div className="space-y-3">
                            {likedTracks.map((track) => (
                                <div
                                    key={track._id || track.id}
                                    onClick={() => playTrack(track)}
                                    className="flex gap-3 group cursor-pointer hover:bg-slate-800/30 p-2 -mx-2 rounded-lg transition"
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={track.image || "/placeholder.svg"}
                                            alt={track.title}
                                            className="w-12 h-12 rounded object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded">
                                            <Play className="w-4 h-4 text-white" fill="white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-300 group-hover:text-white truncate font-medium">
                                            {track.artist}
                                        </p>
                                        <p className="text-sm text-white truncate">{track.title}</p>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                            <span className="flex items-center gap-1">
                                                ▶ {formatPlays(track.playCount)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                ♥ {formatPlays(track.likeCount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Listening History Section */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Listening History
                        </h3>
                        <Link to="/history" className="text-xs text-slate-500 hover:text-white transition">
                            View all
                        </Link>
                    </div>

                    {history.length === 0 ? (
                        <p className="text-slate-500 text-sm">No recent plays</p>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item, index) => (
                                <div
                                    key={`${item.track._id || item.track.id}-${index}`}
                                    onClick={() => playTrack(item.track)}
                                    className="flex gap-3 group cursor-pointer hover:bg-slate-800/30 p-2 -mx-2 rounded-lg transition"
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={item.track.image || "/placeholder.svg"}
                                            alt={item.track.title}
                                            className="w-12 h-12 rounded object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded">
                                            <Play className="w-4 h-4 text-white" fill="white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-300 group-hover:text-white truncate font-medium">
                                            {item.track.artist}
                                        </p>
                                        <p className="text-sm text-white truncate">{item.track.title}</p>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                            <span className="flex items-center gap-1">
                                                ▶ {formatPlays(item.track.playCount)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                ♥ {formatPlays(item.track.likeCount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    )
}
