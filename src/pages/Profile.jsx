"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Edit2, Save, X, Mail, Calendar, Music, LogOut, Upload, Camera, Eye, EyeOff, Lock, User, Heart, Shield, Trash2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

import AudioPlayer from "../components/AudioPlayer"
import UploadTrackModal from "../components/UploadTrackModal"
import TrackCard from "../components/TrackCard"
import { useUser } from "../context/UserContext"
import { useNotification } from "../context/NotificationContext"
import { authService } from "../services/authService"

export default function Profile() {
  const { user, updateUser, logout } = useUser()
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotification()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(user)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const fileInputRef = useRef(null)
  const [likedTracks, setLikedTracks] = useState([])
  const [loadingLikedTracks, setLoadingLikedTracks] = useState(true)
  const [likedTracksError, setLikedTracksError] = useState(null)

  useEffect(() => {
    setFormData(user)
  }, [user, isEditing])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    updateUser(formData)
    setIsEditing(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleCancel = () => {
    setFormData(user)
    setIsEditing(false)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      showError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showError('Image size must be less than 5MB')
      return
    }

    try {
      setUploadingAvatar(true)
      const response = await authService.uploadAvatar(file)

      if (response.success) {
        const updatedUser = { ...user, avatar: response.data.avatarUrl }
        updateUser(updatedUser)
        setFormData(updatedUser)
        showSuccess('Avatar updated successfully!')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      showError(error.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Mật khẩu mới không khớp')
      return
    }

    if (passwordData.newPassword.length < 8) {
      showError('Mật khẩu mới phải có ít nhất 8 ký tự')
      return
    }

    try {
      setChangingPassword(true)
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (response.success) {
        showSuccess('Đổi mật khẩu thành công!')
        setIsChangePasswordModalOpen(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      console.error('Change password error:', error)
      showError(error.message || 'Không thể đổi mật khẩu')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()

    if (!deletePassword) {
      showError('Vui lòng nhập mật khẩu để xác nhận')
      return
    }

    try {
      setDeletingAccount(true)
      const response = await authService.deleteAccount(deletePassword)

      if (response.success) {
        showSuccess('Tài khoản đã được xóa thành công')
        logout()
        setTimeout(() => {
          navigate('/')
        }, 1500)
      }
    } catch (error) {
      console.error('Delete account error:', error)
      showError(error.message || 'Không thể xóa tài khoản')
    } finally {
      setDeletingAccount(false)
      setDeletePassword('')
    }
  }

  // Load liked tracks
  useEffect(() => {
    const loadLikedTracks = async () => {
      try {
        setLoadingLikedTracks(true)
        const response = await authService.getLikedTracks({ limit: 6 })
        setLikedTracks(response.tracks)
        setLikedTracksError(null)
      } catch (error) {
        console.error('Failed to load liked tracks:', error)
        setLikedTracksError(error.message || 'Failed to load liked tracks')
      } finally {
        setLoadingLikedTracks(false)
      }
    }

    loadLikedTracks()
  }, [])

  const handleLikedTrackUpdate = (updatedTrack) => {
    setLikedTracks(likedTracks.map(t =>
      (t.id || t.mongoId) === (updatedTrack.id || updatedTrack.mongoId) ? updatedTrack : t
    ))
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-orange-400 hover:text-orange-300 transition mb-6 group">
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 text-green-300 px-6 py-4 rounded-xl flex items-center gap-3">
            <Save className="w-5 h-5" />
            <span className="font-medium">Profile updated successfully!</span>
          </div>
        )}

        {/* 2-Column Layout */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* LEFT SIDEBAR */}
          <aside className="lg:sticky lg:top-8 lg:h-fit space-y-6">
            {/* Avatar Card */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6">
              <div className="relative group mx-auto w-40 h-40 mb-4">
                <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-orange-500/30 shadow-2xl">
                  <img
                    src={formData.avatar || "/placeholder.svg?height=160&width=160&query=user"}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute bottom-2 right-2 bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-xl transition disabled:opacity-50"
                  title="Update avatar"
                >
                  {uploadingAvatar ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-1">{formData.name}</h2>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-3">
                  <Mail className="w-4 h-4" />
                  <span>{formData.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(formData.createdAt)}</span>
                </div>
                {user?.role === 'admin' && (
                  <div className="inline-flex items-center gap-2 bg-orange-600/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Admin
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-4 space-y-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-orange-600/10 hover:bg-orange-600/20 rounded-xl transition text-left border border-orange-500/20"
              >
                <Upload className="w-5 h-5 text-orange-400" />
                <span className="text-orange-300 font-medium">Upload Track</span>
              </button>

              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition text-left"
              >
                <Lock className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300 font-medium">Change Password</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700/30 hover:bg-red-900/20 rounded-xl transition text-left border border-transparent hover:border-red-500/30"
              >
                <LogOut className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300 font-medium">Logout</span>
              </button>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <div className="space-y-6">
            {/* Profile Details Card */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Profile Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm font-medium"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                      placeholder="Your name"
                    />
                  ) : (
                    <p className="text-white text-lg">{formData.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition resize-none"
                      rows="3"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-slate-300">{formData.bio || "No bio yet"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Liked Tracks Section */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-bold">Liked Tracks</h3>
                </div>
                <Link
                  to="/liked-songs"
                  className="text-orange-400 hover:text-orange-300 transition text-sm font-medium"
                >
                  View All →
                </Link>
              </div>

              {loadingLikedTracks ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-slate-400">Loading liked tracks...</div>
                </div>
              ) : likedTracksError ? (
                <div className="text-center py-12 text-slate-400">
                  {likedTracksError}
                </div>
              ) : likedTracks.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">You haven't liked any tracks yet</p>
                  <Link
                    to="/tracks"
                    className="inline-block text-orange-400 hover:text-orange-300 transition font-medium"
                  >
                    Discover tracks →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {likedTracks.map((track) => (
                    <TrackCard
                      key={track.id || track.mongoId}
                      track={track}
                      onUpdate={handleLikedTrackUpdate}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-red-900/10 border border-red-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h3>
              <p className="text-slate-400 text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={() => setIsDeleteAccountModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg transition text-red-400 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>

      
      <AudioPlayer />

      {/* Upload Modal */}
      <UploadTrackModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={() => {
          setIsUploadModalOpen(false)
          showSuccess('Track uploaded successfully!')
        }}
      />

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 pr-12 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 pr-12 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 pr-12 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-red-400 mb-4">Delete Account</h3>
            <p className="text-slate-300 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Enter your password to confirm</label>
                <div className="relative">
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 pr-12 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showDeletePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={deletingAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {deletingAccount ? 'Deleting...' : 'Delete My Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteAccountModalOpen(false)}
                  className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
