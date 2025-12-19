"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AudioPlayer from "../components/AudioPlayer"
import LoadingSpinner from "../components/LoadingSpinner"
import TrackCard from "../components/TrackCard"
import trackService from "../services/trackService"

export default function AllTracks() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [tracks, setTracks] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalTracks, setTotalTracks] = useState(0)

    const tracksPerPage = 6

    useEffect(() => {
        const loadTracks = async () => {
            try {
                setLoading(true)
                const response = await trackService.getTracks({
                    source: "local",
                    limit: tracksPerPage,
                    page: currentPage,
                    sortBy: "createdAt",
                    sortOrder: "desc"
                })

                setTracks(response.tracks || [])
                setTotalPages(response.totalPages || 1)
                setTotalTracks(response.total || 0)
            } catch (err) {
                console.error("Failed to load tracks:", err)
                setTracks([])
            } finally {
                setLoading(false)
            }
        }

        loadTracks()
    }, [currentPage])

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

    return (
        <div className="min-h-screen flex flex-col pb-32">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">All Tracks</h1>
                    <p className="text-slate-400">
                        {loading ? "Loading..." : `${totalTracks} tracks available`}
                    </p>
                </div>

                {/* Tracks Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <LoadingSpinner />
                        <span className="ml-3 text-slate-400">Loading tracks...</span>
                    </div>
                ) : tracks.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-400 text-lg">No tracks available yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {tracks.map((track) => (
                                <TrackCard
                                    key={track.id || track.mongoId}
                                    track={track}
                                    onUpdate={(updated) => {
                                        setTracks(tracks.map(t =>
                                            (t.id || t.mongoId) === (updated.id || updated.mongoId) ? updated : t
                                        ))
                                    }}
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
            <Footer />
            <AudioPlayer />
        </div>
    )
}
