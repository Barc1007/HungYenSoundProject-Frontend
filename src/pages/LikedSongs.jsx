"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Heart, Play, ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"

import AudioPlayer from "../components/AudioPlayer"
import TrackCard from "../components/TrackCard"
import LoadingSpinner from "../components/LoadingSpinner"
import { useUser } from "../context/UserContext"
import { useNotification } from "../context/NotificationContext"
import { useAudio } from "../context/AudioContext"
import { authService } from "../services/authService"

export default function LikedSongs() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [tracks, setTracks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalTracks, setTotalTracks] = useState(0)
    const { user, isAuthenticated } = useUser()
    const { showError } = useNotification()
    const { playTrack } = useAudio()

    const tracksPerPage = 12

    useEffect(() => {
        if (isAuthenticated && user) {
            loadLikedTracks()
        } else {
            setLoading(false)
        }
    }, [isAuthenticated, user, currentPage])

    const loadLikedTracks = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await authService.getLikedTracks({
                page: currentPage,
                limit: tracksPerPage
            })
            setTracks(response.tracks)
            setTotalPages(response.totalPages)
            setTotalTracks(response.total)
        } catch (err) {
            console.error("Failed to load liked tracks:", err)
            setError(err.message || "Failed to load liked tracks")
            showError(err.message || "Failed to load liked tracks")
        } finally {
            setLoading(false)
        }
    }

    const handleTrackUpdate = (updatedTrack) => {
        // If track is unliked, remove from list
        if (!updatedTrack.isLiked) {
            setTracks(tracks.filter(t => (t.id || t.mongoId) !== (updatedTrack.id || updatedTrack.mongoId)))
            setTotalTracks(prev => prev - 1)
        } else {
            // Update track in list
            setTracks(tracks.map(t =>
                (t.id || t.mongoId) === (updatedTrack.id || updatedTrack.mongoId) ? updatedTrack : t
            ))
        }
    }

    const playAllTracks = () => {
        if (tracks.length === 0) {
            showError("No tracks to play")
            return
        }
        playTrack(tracks[0], tracks, 0)
    }

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
            setSearchParams({ page: page.toString() })
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    const renderPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${i === currentPage
                            ? "bg-orange-600 text-white"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                >
                    {i}
                </button>
            )
        }

        return pages
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col pb-32">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
                    <div className="text-center py-20 bg-slate-900/40 border border-slate-700 rounded-2xl">
                        <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-300 text-lg mb-2">Please sign in</p>
                        <p className="text-slate-400 text-sm">You need to sign in to view your liked tracks</p>
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
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-gradient-to-br from-red-500 to-pink-500 p-3 rounded-xl shadow-lg">
                                    <Heart className="w-8 h-8 text-white fill-current" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold">Liked Songs</h1>
                                    <p className="text-slate-400 mt-1">
                                        {loading ? "Loading..." : `${totalTracks} ${totalTracks === 1 ? 'track' : 'tracks'}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {!loading && tracks.length > 0 && (
                            <button
                                onClick={playAllTracks}
                                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-8 py-3 rounded-full font-medium transition flex items-center gap-2 shadow-lg shadow-orange-500/30"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Play All
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <LoadingSpinner />
                        <span className="ml-3 text-slate-400">Loading liked tracks...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-slate-900/40 border border-red-500/30 rounded-2xl">
                        <p className="text-red-400 text-lg mb-2">❌ Error</p>
                        <p className="text-slate-400 text-sm">{error}</p>
                    </div>
                ) : tracks.length === 0 ? (
                    <div className="text-center py-20 bg-gradient-to-br from-slate-900/40 to-slate-800/40 rounded-2xl border border-slate-700">
                        <Heart className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-300 text-xl mb-2">No liked tracks yet</p>
                        <p className="text-slate-400 text-sm mb-6">
                            Click the heart icon on tracks to add them to your favorites
                        </p>
                        <Link
                            to="/tracks"
                            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-medium transition"
                        >
                            Discover Music
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {tracks.map((track) => (
                                <TrackCard
                                    key={track.id || track.mongoId}
                                    track={track}
                                    onUpdate={handleTrackUpdate}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                {/* Previous Button */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg font-medium transition bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <ChevronLeft className="w-5 h-5 mr-1" />
                                    Previous
                                </button>

                                {/* Page Numbers */}
                                {renderPageNumbers()}

                                {/* Next Button */}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg font-medium transition bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    Next
                                    <ChevronRight className="w-5 h-5 ml-1" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
            
            <AudioPlayer />
        </div>
    )
}
