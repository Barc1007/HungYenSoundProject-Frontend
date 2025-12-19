"use client"

import { useAudio } from "../context/AudioContext"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, List, Repeat, Shuffle, Maximize2 } from "lucide-react"
import { useState } from "react"

export default function AudioPlayer() {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,
    isTrackLiked,
    showQueue,
    isFullscreen,
    togglePlayPause,
    seek,
    playNext,
    playPrevious,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    toggleQueue,
    toggleFullscreen,
    formatTime,
  } = useAudio()

  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 0.7)
  }

  const handleLikeClick = () => {
    toggleLike()
  }

  // Don't show player if no track is loaded
  if (!currentTrack.audio && !currentTrack.title) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-900/98 to-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 shadow-2xl z-50">
      {/* Progress Bar - Full Width at Top */}
      <div className="absolute top-0 left-0 right-0 group">
        <div className="relative h-1 bg-slate-800/50 overflow-hidden">
          {/* Background glow effect */}
          <div
            className="absolute h-full bg-gradient-to-r from-orange-500/20 via-orange-400/20 to-orange-500/20 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
          {/* Actual progress */}
          <div
            className="absolute h-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 shadow-lg shadow-orange-500/50 transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
          {/* Hover effect */}
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={(e) => seek((e.target.value / 100) * duration)}
            className="absolute w-full h-full opacity-0 cursor-pointer z-10 group-hover:h-2 transition-all"
          />
          {/* Progress thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercentage}%`, transform: `translate(-50%, -50%)` }}
          />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Left Section - Track Info */}
          <div className="flex items-center gap-4 w-[280px] min-w-0">
            <div className="relative group flex-shrink-0">
              <img
                src={currentTrack.image || "/placeholder.svg"}
                alt={currentTrack.title}
                className="w-16 h-16 rounded-lg object-cover shadow-xl ring-2 ring-slate-700/50 group-hover:ring-orange-500/50 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-white truncate group-hover:text-orange-400 transition-colors cursor-pointer">
                {currentTrack.title}
              </h4>
              <p className="text-slate-400 text-sm truncate hover:text-slate-300 transition-colors cursor-pointer">
                {currentTrack.artist}
              </p>
            </div>
            <button
              onClick={handleLikeClick}
              className={`flex-shrink-0 transition-all duration-200 ${isTrackLiked()
                ? 'text-orange-400 scale-110'
                : 'text-slate-400 hover:text-orange-400 hover:scale-110'
                }`}
              title={isTrackLiked() ? "Unlike" : "Like"}
            >
              <Heart className={`w-5 h-5 ${isTrackLiked() ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Center Section - Player Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
            {/* Control Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleShuffle}
                className={`transition-all duration-200 ${isShuffle
                  ? 'text-orange-400 scale-110'
                  : 'text-slate-400 hover:text-white hover:scale-105'
                  }`}
                title={isShuffle ? "Shuffle On" : "Shuffle Off"}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={playPrevious}
                className="text-slate-400 hover:text-white hover:scale-110 transition-all duration-200"
                title="Previous (or restart if > 3s)"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlayPause}
                className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white p-3.5 rounded-full shadow-xl shadow-orange-500/30 transition-all duration-200 transform hover:scale-110 active:scale-95 ring-4 ring-orange-500/20"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ?
                  <Pause className="w-6 h-6 fill-current" /> :
                  <Play className="w-6 h-6 ml-0.5 fill-current" />
                }
              </button>

              <button
                onClick={playNext}
                className="text-slate-400 hover:text-white hover:scale-110 transition-all duration-200"
                title="Next track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`transition-all duration-200 relative ${repeatMode > 0
                  ? 'text-orange-400 scale-110'
                  : 'text-slate-400 hover:text-white hover:scale-105'
                  }`}
                title={
                  repeatMode === 0
                    ? "Repeat Off"
                    : repeatMode === 1
                      ? "Repeat All"
                      : "Repeat One"
                }
              >
                <Repeat className="w-4 h-4" />
                {repeatMode === 2 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full text-[8px] flex items-center justify-center font-bold">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* Time and Progress */}
            <div className="w-full flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium tabular-nums w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative h-1.5 group cursor-pointer">
                {/* Track background */}
                <div className="absolute w-full h-full bg-slate-700/50 rounded-full overflow-hidden">
                  {/* Buffered/loaded shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/30 to-transparent animate-shimmer" />
                </div>
                {/* Progress */}
                <div
                  className="absolute h-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 rounded-full shadow-md shadow-orange-500/50 group-hover:h-2 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
                {/* Interactive overlay */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercentage}
                  onChange={(e) => seek((e.target.value / 100) * duration)}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                {/* Hover thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none"
                  style={{ left: `${progressPercentage}%`, transform: `translate(-50%, -50%)` }}
                />
              </div>
              <span className="text-xs text-slate-400 font-medium tabular-nums w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Section - Volume & Options */}
          <div className="flex items-center gap-4 w-[280px] justify-end">
            <button
              onClick={toggleQueue}
              className={`transition-all duration-200 ${showQueue
                ? 'text-orange-400 scale-110'
                : 'text-slate-400 hover:text-white hover:scale-110'
                }`}
              title="Queue"
            >
              <List className="w-5 h-5" />
            </button>

            <div
              className="flex items-center gap-2 group"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white hover:scale-110 transition-all duration-200"
                title={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <div className={`flex items-center gap-2 transition-all duration-300 overflow-hidden ${showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'
                }`}>
                <div className="relative flex-1 h-1.5 group/volume cursor-pointer">
                  <div className="absolute w-full h-full bg-slate-700/50 rounded-full" />
                  <div
                    className="absolute h-full bg-gradient-to-r from-slate-400 to-slate-300 rounded-full group-hover/volume:h-2 transition-all"
                    style={{ width: `${volume * 100}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md opacity-0 group-hover/volume:opacity-100 transition-opacity pointer-events-none"
                    style={{ left: `${volume * 100}%`, transform: `translate(-50%, -50%)` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={toggleFullscreen}
              className={`transition-all duration-200 ${isFullscreen
                ? 'text-orange-400 scale-110'
                : 'text-slate-400 hover:text-white hover:scale-110'
                }`}
              title="Fullscreen Player"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
