"use client"

import { createContext, useContext, useState, useRef, useEffect } from "react"

const AudioContext = createContext()

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(new Audio())
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState({
    title: "Summer Vibes",
    artist: "Chill Wave",
    image: "http://static.photos/music/200x200/9",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  })
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)

  const audio = audioRef.current

  useEffect(() => {
    audio.volume = volume
  }, [volume, audio])

  useEffect(() => {
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
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
  }, [audio, currentTrack])

  const playTrack = async (track) => {
    try {
      let src = track.audio || track.filePath
      if (!src) {
        console.error("No audio source for track:", track)
        return
      }

      // Ensure relative paths are properly formatted
      // If it's already a full URL, use it as is
      // If it's a relative path, ensure it starts with /
      if (!src.startsWith('http') && !src.startsWith('/')) {
        src = `/${src}`
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
        playTrack,
        togglePlayPause,
        seek,
        skipForward,
        skipBack,
        setVolume,
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
