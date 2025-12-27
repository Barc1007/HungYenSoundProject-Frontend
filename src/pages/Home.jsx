"use client"
import { Play, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import AudioPlayer from "../components/AudioPlayer"
import LoadingSpinner from "../components/LoadingSpinner"
import TrackCard from "../components/TrackCard"
import RightSidebar from "../components/RightSidebar"
import { useAudio } from "../context/AudioContext"
import { useLanguage } from "../context/LanguageContext"
import trackService from "../services/trackService"

export default function Home() {
  const { playTrack } = useAudio()
  const { t } = useLanguage()
  const [tracks, setTracks] = useState([])
  const [loadingTracks, setLoadingTracks] = useState(true)
  const [playingRandom, setPlayingRandom] = useState(false)

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setLoadingTracks(true)
        const response = await trackService.getTracks({
          source: "local",
          limit: 6,
          sortBy: "createdAt",
          sortOrder: "desc"
        })
        setTracks(response.tracks)
      } catch (err) {
        console.error("Failed to load tracks:", err)
      } finally {
        setLoadingTracks(false)
      }
    }
    loadTracks()
  }, [])

  const handlePlayRandom = async () => {
    try {
      setPlayingRandom(true)
      // Fetch all tracks for random play
      const response = await trackService.getTracks({
        source: "local",
        limit: 1000, // Get all tracks
        sortBy: "createdAt",
        sortOrder: "desc"
      })
      const allTracks = response.tracks || []
      if (allTracks.length > 0) {
        const randomTrack = allTracks[Math.floor(Math.random() * allTracks.length)]
        playTrack(randomTrack, allTracks, allTracks.indexOf(randomTrack))
      }
    } catch (err) {
      console.error("Failed to play random track:", err)
    } finally {
      setPlayingRandom(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="flex gap-6">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Hero Section */}
            <section className="mb-8">
              <div className="bg-gradient-to-r from-orange-800/30 to-indigo-800/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm border border-slate-700/50">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">{t('heroTitle')}</h1>
                    <p className="text-slate-300 mb-5">{t('heroSubtitle')}</p>
                    <button
                      onClick={handlePlayRandom}
                      disabled={loadingTracks || playingRandom}
                      className="bg-orange-600 hover:bg-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                      <Play className="w-5 h-5" fill="white" />
                      {playingRandom ? t('loading') : t('playNow')}
                    </button>
                  </div>
                  <div className="hidden md:block">
                    <img
                      src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop"
                      alt="Music"
                      className="rounded-xl shadow-xl w-64 h-40 object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Latest Tracks */}
            {tracks.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold">{t('latestTracks')}</h2>
                  <Link to="/tracks" className="text-orange-400 hover:text-orange-300 transition flex items-center text-sm">
                    {t('viewAll')} <ChevronRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
                {loadingTracks ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                    <span className="ml-3 text-slate-400">{t('loading')}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </div>

      <AudioPlayer />
    </div>
  )
}
