"use client"
import { Heart, Clock, Play, Globe, ChevronDown, MessageSquare, Headphones } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import { useAudio } from "../context/AudioContext"
import { useLanguage, LANGUAGES } from "../context/LanguageContext"
import trackService from "../services/trackService"

// Format large numbers like SoundCloud (1.2M, 5.1K, etc.)
const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

export default function RightSidebar() {
    const { user } = useUser()
    const { playTrack, currentTrack } = useAudio()
    const { t, language, setLanguage, currentLanguage } = useLanguage()
    const [likedTracks, setLikedTracks] = useState([])
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [showLangDropdown, setShowLangDropdown] = useState(false)
    const langDropdownRef = useRef(null)

    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                setLoading(false)
                return
            }
            try {
                const likedResponse = await trackService.getLikedTracks()
                setLikedTracks((likedResponse.tracks || []).slice(0, 3))

                // Load history from localStorage
                const savedHistory = localStorage.getItem(`listeningHistory_${user._id || user.id}`)
                if (savedHistory) {
                    const historyItems = JSON.parse(savedHistory).slice(0, 3)

                    // Fetch fresh track data from API to get updated playCount
                    const updatedHistory = await Promise.all(
                        historyItems.map(async (item) => {
                            try {
                                const trackId = item.track._id || item.track.id || item.track.mongoId
                                if (trackId) {
                                    const freshTrack = await trackService.getTrackById(trackId)
                                    return { ...item, track: freshTrack || item.track }
                                }
                                return item
                            } catch {
                                return item // Keep original if fetch fails
                            }
                        })
                    )
                    setHistory(updatedHistory)
                }
            } catch (err) {
                console.error("Failed to load sidebar data:", err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [user])

    useEffect(() => {
        if (user && currentTrack?.title && currentTrack?.audio) {
            const historyKey = `listeningHistory_${user._id || user.id}`
            const savedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]')

            const existingIndex = savedHistory.findIndex(
                h => (h.track._id || h.track.id) === (currentTrack._id || currentTrack.id)
            )

            if (existingIndex > -1) {
                savedHistory.splice(existingIndex, 1)
            }

            savedHistory.unshift({
                track: currentTrack,
                playedAt: new Date().toISOString()
            })

            const trimmedHistory = savedHistory.slice(0, 20)
            localStorage.setItem(historyKey, JSON.stringify(trimmedHistory))
            setHistory(trimmedHistory.slice(0, 3))
        }
    }, [currentTrack, user])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setShowLangDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLanguageChange = (langCode) => {
        setLanguage(langCode)
        setShowLangDropdown(false)
    }

    // Track item component - SoundCloud style
    const TrackItem = ({ track, showStats = true }) => (
        <div
            onClick={() => playTrack(track)}
            className="flex gap-3 group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded transition"
        >
            <div className="relative flex-shrink-0">
                <img
                    src={track.image || "/placeholder.svg"}
                    alt={track.title}
                    className="w-12 h-12 rounded object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded">
                    <Play className="w-5 h-5 text-white" fill="white" />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 truncate">
                    {track.artist || 'Unknown Artist'}
                </p>
                <p className="text-sm text-white truncate font-medium leading-tight">
                    {track.title}
                </p>
                {showStats && (
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <Headphones className="w-3 h-3" />
                            {formatNumber(track.playCount || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {formatNumber(track.likeCount || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {formatNumber(track.commentCount || 0)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <aside className="w-80 flex-shrink-0 hidden xl:block">
            <div className="fixed w-80 top-20 right-[max(1rem,calc((100vw-1280px)/2+1rem))] max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

                {/* User sections - only show when logged in */}
                {user && (
                    <>
                        {/* Likes Section - SoundCloud Style */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Heart className="w-3 h-3 text-orange-500" fill="currentColor" />
                                    {likedTracks.length} {t('likedTracksCount')}
                                </h3>
                                <Link to="/liked" className="text-xs text-slate-500 hover:text-orange-400 transition">
                                    {t('viewAll')}
                                </Link>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-3 animate-pulse">
                                            <div className="w-12 h-12 bg-slate-800 rounded" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-2 bg-slate-800 rounded w-1/3" />
                                                <div className="h-3 bg-slate-800 rounded w-3/4" />
                                                <div className="h-2 bg-slate-800 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : likedTracks.length === 0 ? (
                                <p className="text-slate-500 text-sm py-4">{t('noLikedTracks')}</p>
                            ) : (
                                <div className="space-y-1">
                                    {likedTracks.map((track) => (
                                        <TrackItem key={track._id || track.id} track={track} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Listening History Section - SoundCloud Style */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Headphones className="w-3 h-3 text-orange-500" />
                                    {t('listeningHistory')}
                                </h3>
                                <Link to="/history" className="text-xs text-slate-500 hover:text-orange-400 transition">
                                    {t('viewAll')}
                                </Link>
                            </div>

                            {history.length === 0 ? (
                                <p className="text-slate-500 text-sm py-4">{t('noRecentPlays')}</p>
                            ) : (
                                <div className="space-y-1">
                                    {history.map((item, index) => (
                                        <TrackItem
                                            key={`${item.track._id || item.track.id}-${index}`}
                                            track={item.track}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Divider */}
                <div className="border-t border-slate-800" />

                {/* Footer Links - SoundCloud Style */}
                <div className="text-xs text-slate-500 space-y-2">
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                        <a href="#" className="hover:text-slate-300 transition">Legal</a>
                        <span>·</span>
                        <a href="#" className="hover:text-slate-300 transition">Privacy</a>
                        <span>·</span>
                        <a href="#" className="hover:text-slate-300 transition">Cookie Policy</a>
                        <span>·</span>
                        <a href="#" className="hover:text-slate-300 transition">Imprint</a>
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                        <a href="#" className="hover:text-slate-300 transition">Charts</a>
                        <span>·</span>
                        <a href="#" className="hover:text-slate-300 transition">About</a>
                        <span>·</span>
                        <a href="#" className="hover:text-slate-300 transition">Blog</a>
                    </div>
                </div>

                {/* Language Selector - SoundCloud Style */}
                <div className="relative" ref={langDropdownRef}>
                    <button
                        onClick={() => setShowLangDropdown(!showLangDropdown)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                    >
                        <Globe className="w-4 h-4" />
                        <span>{t('language')}:</span>
                        <span className="text-orange-400 hover:underline">
                            {currentLanguage.label}
                        </span>
                    </button>

                    {/* Language Dropdown */}
                    {showLangDropdown && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl z-50">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition text-left ${language === lang.code ? 'bg-orange-500/10 text-orange-400' : 'text-slate-300'
                                        }`}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <span className="text-sm">{lang.label}</span>
                                    {language === lang.code && (
                                        <span className="ml-auto text-orange-400">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Copyright */}
                <p className="text-xs text-slate-600 pb-4">
                    © 2024 HungYenSound
                </p>
            </div>
        </aside>
    )
}
