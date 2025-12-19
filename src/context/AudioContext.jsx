"use client"

import { createContext, useContext, useState, useRef, useEffect } from "react"

const AudioContext = createContext()

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(new Audio())
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState({
    title: "",
    artist: "",
    image: null,
    audio: null,
  })
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)

  // New states for enhanced features
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState(0) // 0: off, 1: repeat all, 2: repeat one
  const [likedTracks, setLikedTracks] = useState([])
  const [showQueue, setShowQueue] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const audio = audioRef.current

  useEffect(() => {
    audio.volume = volume
  }, [volume, audio])

  useEffect(() => {
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
      // Handle repeat and next track
      if (repeatMode === 2) {
        // Repeat one
        audio.currentTime = 0
        audio.play()
      } else if (repeatMode === 1 || currentIndex < queue.length - 1) {
        // Repeat all or has next track
        playNext()
      } else {
        setIsPlaying(false)
      }
    }
    const handleError = (e) => {
      console.error("Audio error:", e)
      setIsPlaying(false)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [audio, currentTrack, repeatMode, currentIndex, queue.length])

  const playTrack = async (track, trackQueue = null, index = 0) => {
    try {
      let src = track.audio || track.filePath
      if (!src) {
        console.error("No audio source for track:", track)
        return
      }

      // Ensure relative paths are properly formatted
      if (!src.startsWith('http') && !src.startsWith('/')) {
        src = `/${src}`
      }

      // Update queue if provided
      if (trackQueue && Array.isArray(trackQueue)) {
        setQueue(trackQueue)
        setCurrentIndex(index)
      }

      // Update audio source if different
      const currentSrc = audio.src ? new URL(audio.src).pathname : ''
      if (currentSrc !== src) {
        audio.src = src
        setCurrentTrack(track)
        // Wait for audio metadata to load
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio load timeout'))
          }, 10000)

          const onLoaded = () => {
            clearTimeout(timeout)
            audio.removeEventListener('loadedmetadata', onLoaded)
            audio.removeEventListener('error', onError)
            resolve()
          }

          const onError = (e) => {
            clearTimeout(timeout)
            audio.removeEventListener('loadedmetadata', onLoaded)
            audio.removeEventListener('error', onError)
            reject(e)
          }

          audio.addEventListener('loadedmetadata', onLoaded, { once: true })
          audio.addEventListener('error', onError, { once: true })

          // If already loaded, resolve immediately
          if (audio.readyState >= 2) {
            onLoaded()
          }
        })
      }

      await audio.play()
      setIsPlaying(true)

    } catch (err) {
      console.error("Playback failed:", err)
      setIsPlaying(false)
    }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Playback failed:", err))
    }
  }

  const seek = (time) => {
    audio.currentTime = time
    setCurrentTime(time)
  }

  const skipForward = () => {
    seek(Math.min(audio.currentTime + 10, audio.duration))
  }

  const skipBack = () => {
    seek(Math.max(audio.currentTime - 10, 0))
  }

  const playNext = () => {
    if (queue.length === 0) return

    let nextIndex
    if (isShuffle) {
      // Random index different from current
      do {
        nextIndex = Math.floor(Math.random() * queue.length)
      } while (nextIndex === currentIndex && queue.length > 1)
    } else {
      nextIndex = (currentIndex + 1) % queue.length
    }

    setCurrentIndex(nextIndex)
    playTrack(queue[nextIndex], queue, nextIndex)
  }

  const playPrevious = () => {
    if (queue.length === 0) return

    // If more than 3 seconds played, restart current track
    if (audio.currentTime > 3) {
      seek(0)
      return
    }

    let prevIndex
    if (isShuffle) {
      // Random index different from current
      do {
        prevIndex = Math.floor(Math.random() * queue.length)
      } while (prevIndex === currentIndex && queue.length > 1)
    } else {
      prevIndex = (currentIndex - 1 + queue.length) % queue.length
    }

    setCurrentIndex(prevIndex)
    playTrack(queue[prevIndex], queue, prevIndex)
  }

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle)
  }

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev + 1) % 3)
  }

  const toggleLike = (track = currentTrack) => {
    const trackId = track._id || track.id
    if (!trackId) return

    setLikedTracks((prev) => {
      const isLiked = prev.some((t) => (t._id || t.id) === trackId)
      if (isLiked) {
        return prev.filter((t) => (t._id || t.id) !== trackId)
      } else {
        return [...prev, track]
      }
    })
  }

  const isTrackLiked = (track = currentTrack) => {
    const trackId = track._id || track.id
    return likedTracks.some((t) => (t._id || t.id) === trackId)
  }

  const toggleQueue = () => {
    setShowQueue(!showQueue)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const addToQueue = (track) => {
    setQueue((prev) => [...prev, track])
  }

  const removeFromQueue = (index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index))
    if (index < currentIndex) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const clearQueue = () => {
    setQueue([])
    setCurrentIndex(0)
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentTrack,
        currentTime,
        duration,
        volume,
        queue,
        currentIndex,
        isShuffle,
        repeatMode,
        likedTracks,
        showQueue,
        isFullscreen,
        playTrack,
        togglePlayPause,
        seek,
        skipForward,
        skipBack,
        playNext,
        playPrevious,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
        isTrackLiked,
        toggleQueue,
        toggleFullscreen,
        addToQueue,
        removeFromQueue,
        clearQueue,
        formatTime,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider")
  }
  return context
}
