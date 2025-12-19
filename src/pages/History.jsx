"use client"
import { History, Play, Clock, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import AudioPlayer from "../components/AudioPlayer"
import LoadingSpinner from "../components/LoadingSpinner"
import { useAudio } from "../context/AudioContext"
import { useUser } from "../context/UserContext"

export default function ListeningHistory() {
    const { user } = useUser()
    const { playTrack } = useAudio()
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadHistory = () => {
            if (!user) {
                setLoading(false)
                return
            }
            try {
                // Get history from localStorage
                const savedHistory = localStorage.getItem(`listeningHistory_${user._id || user.id}`)
                if (savedHistory) {
                    setHistory(JSON.parse(savedHistory))
                }
            } catch (err) {
                console.error("Failed to load history:", err)
            } finally {
                setLoading(false)
            }
        }
        loadHistory()
    }, [user])

    const clearHistory = () => {
        if (user) {
            localStorage.removeItem(`listeningHistory_${user._id || user.id}`)
            setHistory([])
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now - date
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return "Just now"
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return date.toLocaleDateString()
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Sign in to see your history</h2>
                        <p className="text-slate-400">Track your listening activity</p>
                    </div>
                </main>
                <AudioPlayer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col pb-24">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Listening History</h1>
                            <p className="text-slate-400">{history.length} songs played</p>
                        </div>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear history
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner />
                        <span className="ml-3 text-slate-400">Loading history...</span>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-16">
                        <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No listening history</h2>
                        <p className="text-slate-400">Start playing songs to track your history</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {history.map((item, index) => (
                            <div
                                key={`${item.track._id || item.track.id}-${index}`}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition group"
                            >
                                <div className="relative">
                                    <img
                                        src={item.track.image || "/placeholder.svg"}
                                        alt={item.track.title}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <button
                                        onClick={() => playTrack(item.track)}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg"
                                    >
                                        <Play className="w-5 h-5 text-white" fill="white" />
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{item.track.title}</p>
                                    <p className="text-sm text-slate-400 truncate">{item.track.artist}</p>
                                </div>
                                <span className="text-sm text-slate-500">{formatDate(item.playedAt)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <AudioPlayer />
        </div>
    )
}
