"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Music, Search, User, Menu, X, LogOut } from "lucide-react"
import LoginModal from "./LoginModal"
import { useUser } from "../context/UserContext"
import { useLanguage } from "../context/LanguageContext"

export default function Navbar() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout } = useUser()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setShowProfileMenu(false)
    navigate("/")
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-orange-900 to-indigo-900 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="HungYenSound" className="w-8 h-8 rounded-full" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-indigo-400">
              HungYenSound
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="bg-slate-800/50 text-white px-4 py-2 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute right-3 top-2.5 text-slate-400 w-4 h-4" />
            </form>
            <div className="space-x-6">
              <Link to="/" className="text-orange-200 hover:text-white transition">
                {t('home')}
              </Link>

              <Link to="/playlists" className="text-orange-200 hover:text-white transition">
                {t('playlists')}
              </Link>
              {user && (
                <Link to="/my-playlists" className="text-orange-200 hover:text-white transition">
                  {t('myPlaylists')}
                </Link>
              )}
              {user?.role === "admin" && (
                <>
                  <Link to="/admin/uploads" className="text-orange-200 hover:text-white transition">
                    {t('uploads')}
                  </Link>
                  <Link to="/admin/users" className="text-orange-200 hover:text-white transition">
                    {t('users')}
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center"
                >
                  <img
                    src={user.avatar || "/placeholder.svg?height=20&width=20&query=user"}
                    alt={user.name}
                    className="w-5 h-5 rounded-full mr-2 object-cover"
                  />
                  {user.name}
                  <span className="ml-2">1234</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-t-lg transition"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      {t('profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-b-lg transition flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center"
              >
                <User className="mr-2 w-4 h-4" />
                {t('signIn')}
              </button>
            )}
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-orange-200">
              {showMobileMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <span className="ml-2">1234</span>

        {showMobileMenu && (
          <div className="md:hidden mt-4 space-y-2">
            <Link to="/" className="block text-orange-200 hover:text-white transition py-2">
              {t('home')}
            </Link>

            <Link to="/playlists" className="block text-orange-200 hover:text-white transition py-2">
              {t('playlists')}
            </Link>
            {user && (
              <>
                <Link to="/profile" className="block text-orange-200 hover:text-white transition py-2">
                  {t('profile')}
                </Link>
                <Link to="/my-playlists" className="block text-orange-200 hover:text-white transition py-2">
                  {t('myPlaylists')}
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin/uploads" className="block text-orange-200 hover:text-white transition py-2">
                    {t('adminPanel')}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-400 hover:text-red-300 transition py-2"
                >
                  {t('signOut')}
                </button>
              </>
            )}
          </div>
        )}
      </nav>
      

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
