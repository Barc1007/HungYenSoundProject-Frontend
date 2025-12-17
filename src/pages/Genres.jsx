import { Link } from "react-router-dom"
import { useState, useEffect, useMemo } from "react"
import { Music2, Play, UploadCloud } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AudioPlayer from "../components/AudioPlayer"
import LoadingSpinner from "../components/LoadingSpinner"
import TrackCard from "../components/TrackCard"
import trackService from "../services/trackService"
import { useAudio } from "../context/AudioContext"

const defaultGenres = [
  { id: 1, name: "Electronic", image: "http://static.photos/music/640x360/20", description: "Dance, house, techno and more" },
  { id: 2, name: "Hip Hop", image: "http://static.photos/music/640x360/21", description: "Rap, trap and urban beats" },
  { id: 3, name: "Rock", image: "http://static.photos/music/640x360/22", description: "Alternative, indie and classic" },
  { id: 4, name: "Pop", image: "http://static.photos/music/640x360/23", description: "Mainstream hits and top 40" },
  { id: 5, name: "Jazz", image: "http://static.photos/music/640x360/24", description: "Smooth, classic and fusion" },
  { id: 6, name: "Classical", image: "http://static.photos/music/640x360/25", description: "Orchestral and piano masterpieces" },
  { id: 7, name: "R&B", image: "http://static.photos/music/640x360/26", description: "Soulful rhythms and blues" },
  { id: 8, name: "Lo-Fi", image: "http://static.photos/music/640x360/27", description: "Chill beats to study/relax to" },
]

export default function Genres() {
  const [tracks, setTracks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { playTrack } = useAudio()

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setIsLoading(true)
        // Get all approved tracks (works for all users, including non-authenticated)
        const data = await trackService.getTracks({ 
          source: "local",
          limit: 200, 
          sortBy: "createdAt", 
          sortOrder: "desc" 
        })
        setTracks(data)
      } catch (err) {
        console.error("Failed to load tracks:", err)
        setError(err.message || "Failed to load tracks")
      } finally {
        setIsLoading(false)
      }
    }

    loadTracks()
  }, [])

  const genreStats = useMemo(() => {
    const stats = {}
    tracks.forEach((track) => {
      const key = (track.genre || "Unknown").toLowerCase()
      stats[key] = stats[key] || { count: 0, samples: [] }
      stats[key].count += 1
      if (stats[key].samples.length < 3) {
        stats[key].samples.push(track)
      }
    })
    return stats
  }, [tracks])

  const latestUploads = useMemo(() => {
    return [...tracks]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6)
  }, [tracks])

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <section className="bg-gradient-to-r from-orange-500/20 via-purple-500/10 to-slate-800/50 border border-slate-700 rounded-3xl p-8 mb-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest text-orange-300 mb-2">Your Library</p>
              <h1 className="text-4xl font-bold mb-4">Browse uploads by genre</h1>
              <p className="text-slate-300 mb-6">
                Discover music from our community. Explore genres, listen to tracks, and create your perfect playlists.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/playlists"
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition"
                >
                  Browse playlists
                </Link>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-500/20 text-orange-300">
                  <Music2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Uploaded Tracks</p>
                  <p className="text-2xl font-bold">{tracks.length}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-400 mb-1">Genres Covered</p>
                  <p className="text-xl font-semibold">{Object.keys(genreStats).length || 0}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-400 mb-1">New This Week</p>
                  <p className="text-xl font-semibold">
                    {
                      tracks.filter(
                        (track) =>
                          track.createdAt &&
                          new Date(track.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Genres</h2>
            <p className="text-sm text-slate-400">Click any genre to view featured playlists.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {defaultGenres.map((genre) => {
              const key = genre.name.toLowerCase()
              const stats = genreStats[key] || { count: 0, samples: [] }
              return (
                <Link
                  key={genre.id}
                  to={`/playlists?genre=${key}`}
                  className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 hover:border-orange-500/60 transition flex flex-col gap-4"
                >
                  <div className="relative">
                    <img src={genre.image} alt={genre.name} className="rounded-xl w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-semibold">{genre.name}</h3>
                      <p className="text-sm text-orange-300">{stats.count} tracks</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 flex-1">{genre.description}</p>
                  {stats.count > 0 && (
                    <div className="text-xs text-slate-400">
                      {stats.samples.map((track) => track.title).join(" • ")}
                      {stats.count > stats.samples.length ? " • ..." : ""}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Latest Tracks</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3 text-slate-400">Loading tracks...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg text-sm text-red-200">
              {error}
            </div>
          ) : latestUploads.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/40 border border-slate-700 rounded-2xl">
              <p className="text-slate-300 mb-3">No tracks available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestUploads.map((track) => (
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
      </main>
      <Footer />
      <AudioPlayer />
    </div>
  )
}
