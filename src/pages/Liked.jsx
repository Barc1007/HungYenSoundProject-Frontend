"use client"
import { Heart, Play, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import AudioPlayer from "../components/AudioPlayer"
import LoadingSpinner from "../components/LoadingSpinner"
import { useAudio } from "../context/AudioContext"
import { useUser } from "../context/UserContext"
import trackService from "../services/trackService"

export default function LikedSongs() {
    const { user } = useUser()
    const { playTrack } = useAudio()
    const [likedTracks, setLikedTracks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadLikedTracks = async () => {
            if (!user) {
                setLoading(false)
                return
            }
            try {
                const response = await trackService.getLikedTracks()
                setLikedTracks(response.tracks || [])
            } catch (err) {
                console.error("Failed to load liked tracks:", err)
            } finally {
                setLoading(false)
            }
        }
        loadLikedTracks()
    }, [user])

    const handleUnlike = async (trackId) => {
        try {
            await trackService.unlikeTrack(trackId)
            setLikedTracks(likedTracks.filter(t => (t._id || t.id) !== trackId))
        } catch (err) {
            console.error("Failed to unlike track:", err)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Sign in to see your likes</h2>
                        <p className="text-slate-400">Keep track of all your favorite songs</p>
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
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                        <Heart className="w-8 h-8 text-white" fill="white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Liked Songs</h1>
                        <p className="text-slate-400">{likedTracks.length} songs</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner />
                        <span className="ml-3 text-slate-400">Loading liked songs...</span>
                    </div>
                ) : likedTracks.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No liked songs yet</h2>
                        <p className="text-slate-400">Start liking songs to see them here</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {likedTracks.map((track, index) => (
                            <div
                                key={track._id || track.id}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition group"
                            >
                                <span className="text-slate-500 w-6 text-center text-sm">{index + 1}</span>
                                <div className="relative">
                                    <img
                                        src={track.image || "/placeholder.svg"}
                                        alt={track.title}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <button
                                        onClick={() => playTrack(track, likedTracks, index)}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg"
                                    >
                                        <Play className="w-5 h-5 text-white" fill="white" />
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{track.title}</p>
                                    <p className="text-sm text-slate-400 truncate">{track.artist}</p>
                                </div>
                                <button
                                    onClick={() => handleUnlike(track._id || track.id)}
                                    className="text-slate-400 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <AudioPlayer />
        </div>
    )
}
