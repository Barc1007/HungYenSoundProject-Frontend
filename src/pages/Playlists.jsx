"use client"

import { useSearchParams } from "react-router-dom"
import { Filter, ArrowDown, X } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AudioPlayer from "../components/AudioPlayer"

const allPlaylists = [
  {
    id: 1,
    title: "Chill Vibes",
    image: "http://static.photos/music/640x360/30",
    tracks: 120,
    duration: "8h 42m",
    description: "Relaxing beats for your downtime. Perfect for studying or unwinding.",
    genre: "Electronic",
  },
  {
    id: 2,
    title: "Workout Energy",
    image: "http://static.photos/music/640x360/31",
    tracks: 85,
    duration: "5h 15m",
    description: "High-energy tracks to power through your workout sessions.",
    genre: "Pop",
  },
  {
    id: 3,
    title: "Focus Flow",
    image: "http://static.photos/music/640x360/32",
    tracks: 65,
    duration: "4h 30m",
    description: "Concentration-boosting music to help you stay productive and focused.",
    genre: "Lo-Fi",
  },
  {
    id: 4,
    title: "Indie Discoveries",
    image: "http://static.photos/music/640x360/33",
    tracks: 92,
    duration: "6h 18m",
    description: "Fresh indie tracks from emerging artists.",
    genre: "Indie",
  },
  {
    id: 5,
    title: "Jazz Classics",
    image: "http://static.photos/music/640x360/34",
    tracks: 75,
    duration: "5h 42m",
    description: "Timeless jazz standards and smooth melodies.",
    genre: "Jazz",
  },
  {
    id: 6,
    title: "Hip Hop Essentials",
    image: "http://static.photos/music/640x360/35",
    tracks: 110,
    duration: "7h 25m",
    description: "The most influential hip hop tracks of all time.",
    genre: "Hip Hop",
  },
]

export default function Playlists() {
  const [searchParams, setSearchParams] = useSearchParams()
  const genre = searchParams.get("genre")

  const filteredPlaylists = genre
    ? allPlaylists.filter((p) => p.genre.toLowerCase() === genre.toLowerCase())
    : allPlaylists

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Featured Playlists</h1>
          <div className="flex space-x-4">
            <button className="bg-slate-800/50 hover:bg-slate-700/50 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </button>
            <button className="bg-slate-800/50 hover:bg-slate-700/50 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center">
              <ArrowDown className="w-4 h-4 mr-2" /> Sort
            </button>
          </div>
        </div>

        {genre && (
          <div className="mb-6">
            <p className="text-sm text-slate-400">
              Showing playlists for:
              <span className="text-orange-400 ml-2">{genre.charAt(0).toUpperCase() + genre.slice(1)}</span>
              <button
                onClick={() => setSearchParams({})}
                className="ml-2 text-xs bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full transition inline-flex items-center"
              >
                <X className="w-3 h-3 mr-1" /> Clear
              </button>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              className="playlist-card bg-slate-800/50 rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer"
            >
              <div className="relative">
                <img
                  src={playlist.image || "/placeholder.svg"}
                  alt={playlist.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="font-bold text-xl">{playlist.title}</h3>
                    <p className="text-orange-300 text-sm">
                      {playlist.tracks} tracks • {playlist.duration}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-slate-300 text-sm mb-4">{playlist.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">By HungYenSound</span>
                  <span className="text-xs text-slate-400">{playlist.genre}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <nav className="inline-flex rounded-md shadow">
            <a href="#" className="px-3 py-2 rounded-l-md bg-slate-800/50 text-orange-400 font-medium">
              Previous
            </a>
            <a href="#" className="px-3 py-2 bg-slate-800/50 text-white font-medium">
              1
            </a>
            <a href="#" className="px-3 py-2 bg-slate-800/50 text-slate-300 font-medium">
              2
            </a>
            <a href="#" className="px-3 py-2 bg-slate-800/50 text-slate-300 font-medium">
              3
            </a>
            <a href="#" className="px-3 py-2 rounded-r-md bg-slate-800/50 text-orange-400 font-medium">
              Next
            </a>
          </nav>
        </div>
      </main>
      <Footer />
      <AudioPlayer />
    </div>
  )
}
