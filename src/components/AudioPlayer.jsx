"use client"

import { useAudio } from "../context/AudioContext"
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, List } from "lucide-react"

export default function AudioPlayer() {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    seek,
    skipForward,
    skipBack,
    setVolume,
    formatTime,
  } = useAudio()

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center">
          {/* Track Info */}
          <div className="flex items-center w-full md:w-1/4 mb-4 md:mb-0">
            <img
              src={currentTrack.image || "/placeholder.svg"}
              alt="Now Playing"
              className="w-12 h-12 rounded-md mr-3"
            />
            <div>
              <h4 className="font-medium text-sm">{currentTrack.title}</h4>
              <p className="text-slate-400 text-xs">{currentTrack.artist}</p>
            </div>
            <button className="ml-4 text-slate-400 hover:text-orange-400 transition">
              <Heart className="w-4 h-4" />
            </button>
          </div>

          {/* Player Controls */}
          <div className="w-full md:w-2/4 flex flex-col items-center">
            <div className="flex items-center space-x-4 mb-2">
              <button className="text-slate-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v16.5A2.25 2.25 0 003.75 22.5h6.75m0-21v21m3-21h6.75a2.25 2.25 0 012.25 2.25v16.5a2.25 2.25 0 01-2.25 2.25H13.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </button>
              <button onClick={skipBack} className="text-slate-400 hover:text-white transition">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlayPause}
                className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-lg transition transform hover:scale-110"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={skipForward} className="text-slate-400 hover:text-white transition">
                <SkipForward className="w-5 h-5" />
              </button>
              <button className="text-slate-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </button>
            </div>
            <div className="w-full flex items-center space-x-3">
              <span className="text-xs text-slate-400">{formatTime(currentTime)}</span>
              <div className="progress-bar flex-1 relative">
                <div className="absolute w-full h-1 bg-slate-700 rounded-full"></div>
                <div
                  className="absolute h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercentage}
                  onChange={(e) => seek((e.target.value / 100) * duration)}
                  className="absolute w-full h-1 opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs text-slate-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Options */}
          <div className="w-full md:w-1/4 flex items-center justify-end space-x-4 mt-4 md:mt-0">
            <div className="hidden md:flex items-center space-x-2">
              <Volume2 className="text-slate-400 w-4 h-4" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
                className="w-20 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <button className="text-slate-400 hover:text-white transition">
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
