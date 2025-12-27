"use client"
import { Heart, Clock, Play, Globe, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import { useAudio } from "../context/AudioContext"
import { useLanguage, LANGUAGES } from "../context/LanguageContext"
import trackService from "../services/trackService"

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
                setLikedTracks((likedResponse.tracks || []).slice(0, 2))

                const savedHistory = localStorage.getItem(`listeningHistory_${user._id || user.id}`)
                if (savedHistory) {
                    setHistory(JSON.parse(savedHistory).slice(0, 2))
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
            setHistory(trimmedHistory.slice(0, 2))
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

    return (
        <aside className="w-80 flex-shrink-0 hidden xl:block">
            <div className="fixed w-80 top-20 right-[max(1rem,calc((100vw-1280px)/2+1rem))] max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 space-y-6">

                {/* Language Selector */}
                <div className="relative" ref={langDropdownRef}>
                    <button
                        onClick={() => setShowLangDropdown(!showLangDropdown)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 rounded-xl transition"
                    >
                        <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-medium text-slate-300">{t('language')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{currentLanguage.flag}</span>
                            <span className="text-sm text-white">{currentLanguage.name}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {/* Language Dropdown */}
                    {showLangDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl z-50">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition ${language === lang.code ? 'bg-orange-500/10 text-orange-400' : 'text-slate-300'
                                        }`}
                                >
                                    <span className="text-xl">{lang.flag}</span>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium">{lang.label}</p>
                                    </div>
                                    {language === lang.code && (
                                        <div className="w-2 h-2 bg-orange-400 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Only show user-specific sections if logged in */}
                {user && (
                    <>
                        {/* Likes Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Heart className="w-3 h-3" />
                                    {likedTracks.length} {t('likedTracksCount')}
                                </h3>
                                <Link to="/liked" className="text-xs text-slate-500 hover:text-white transition">
                                    {t('viewAll')}
                                </Link>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex gap-3 animate-pulse">
                                            <div className="w-12 h-12 bg-slate-700 rounded" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-slate-700 rounded w-3/4" />
                                                <div className="h-2 bg-slate-700 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : likedTracks.length === 0 ? (
                                <p className="text-slate-500 text-sm">{t('noLikedTracks')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {likedTracks.map((track) => (
                                        <div
                                            key={track._id || track.id}
                                            onClick={() => playTrack(track)}
                                            className="flex gap-3 group cursor-pointer hover:bg-slate-800/30 p-2 -mx-2 rounded-lg transition"
                                        >
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={track.image || "/placeholder.svg"}
                                                    alt={track.title}
                                                    className="w-12 h-12 rounded object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded">
                                                    <Play className="w-4 h-4 text-white" fill="white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-300 group-hover:text-white truncate font-medium">
                                                    {track.artist}
                                                </p>
                                                <p className="text-sm text-white truncate">{track.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Listening History Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {t('listeningHistory')}
                                </h3>
                                <Link to="/history" className="text-xs text-slate-500 hover:text-white transition">
                                    {t('viewAll')}
                                </Link>
                            </div>

                            {history.length === 0 ? (
                                <p className="text-slate-500 text-sm">{t('noRecentPlays')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {history.map((item, index) => (
                                        <div
                                            key={`${item.track._id || item.track.id}-${index}`}
                                            onClick={() => playTrack(item.track)}
                                            className="flex gap-3 group cursor-pointer hover:bg-slate-800/30 p-2 -mx-2 rounded-lg transition"
                                        >
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={item.track.image || "/placeholder.svg"}
                                                    alt={item.track.title}
                                                    className="w-12 h-12 rounded object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded">
                                                    <Play className="w-4 h-4 text-white" fill="white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-300 group-hover:text-white truncate font-medium">
                                                    {item.track.artist}
                                                </p>
                                                <p className="text-sm text-white truncate">{item.track.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </aside>
    )
}
