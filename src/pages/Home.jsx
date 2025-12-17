"use client"
import { Play, Heart, MoreHorizontal, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AudioPlayer from "../components/AudioPlayer"
import LoadingSpinner from "../components/LoadingSpinner"
import TrackCard from "../components/TrackCard"
import { useAudio } from "../context/AudioContext"
import trackService from "../services/trackService"


export default function Home() {
  const { playTrack } = useAudio()
  const [tracks, setTracks] = useState([])
  const [loadingTracks, setLoadingTracks] = useState(true)

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setLoadingTracks(true)
        // Get latest approved tracks (works for all users)
        const data = await trackService.getTracks({
          source: "local",
          limit: 6,
          sortBy: "createdAt",
          sortOrder: "desc"
        })
        setTracks(data)
      } catch (err) {
        console.error("Failed to load tracks:", err)
      } finally {
        setLoadingTracks(false)
      }
    }
    loadTracks()
  }, [])

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-orange-800/30 to-indigo-800/30 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Stream Your Favorite Music</h1>
                <p className="text-orange-100 mb-6 text-lg">Millions of songs from SoundCloud. Anytime, anywhere.</p>
                <div className="flex space-x-4">
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-medium transition flex items-center">
                    <Play className="mr-2 w-5 h-5" />
                    Play Now
                  </button>
                  <button className="border border-orange-400 text-orange-400 hover:bg-orange-400/10 px-6 py-3 rounded-full font-medium transition">
                    Explore
                  </button>
                </div>
              </div>
              <div className="md:w-1/2">
                <img
                  src="http://static.photos/music/1024x576/1"
                  alt="Music Illustration"
                  className="rounded-xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Tracks */}
        {tracks.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Latest Tracks</h2>
              <a href="/genres" className="text-orange-400 hover:text-orange-300 transition flex items-center">
                View All <ChevronRight className="ml-1 w-5 h-5" />
              </a>
            </div>
            {loadingTracks ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className="ml-3 text-slate-400">Loading tracks...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            )}
          </section>
        )}
      </main>
      <Footer />
      <AudioPlayer />
    </div>
  )
}
