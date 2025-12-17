"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Edit2, Save, X, Mail, Calendar, Music, Users, LogOut, Upload, Camera, Eye, EyeOff, Lock } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AudioPlayer from "../components/AudioPlayer"
import UploadTrackModal from "../components/UploadTrackModal"
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
  const fileInputRef = useRef(null)

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

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showError('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    try {
      setUploadingAvatar(true)
      const response = await authService.uploadAvatar(file)
      
      if (response.success && response.data.user) {
        // Update user context with new avatar
        updateUser(response.data.user)
        showSuccess('Cập nhật ảnh đại diện thành công!')
      }
    } catch (error) {
      console.error('Upload avatar error:', error)
      showError(error.message || 'Không thể tải lên ảnh đại diện')
    } finally {
      setUploadingAvatar(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (passwordData.newPassword.length < 8) {
      showError('Mật khẩu mới phải có ít nhất 8 ký tự')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Mật khẩu mới và xác nhận mật khẩu không khớp')
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      showError('Mật khẩu mới phải khác mật khẩu hiện tại')
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

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/" className="text-orange-400 hover:text-orange-300 transition flex items-center mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-900/30 border border-green-600 text-green-300 px-4 py-3 rounded-lg flex items-center">
            <span>✓ Profile updated successfully!</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-slate-800/50 rounded-2xl p-8 mb-8">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
            <div className="flex-shrink-0 relative">
              <img
                src={formData.avatar || "/placeholder.svg?height=128&width=128&query=user"}
                alt={formData.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-orange-600"
              />
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Cập nhật ảnh đại diện"
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
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="text-3xl font-bold bg-slate-700 text-white px-3 py-2 rounded-lg w-full mb-2"
                />
              ) : (
                <h2 className="text-3xl font-bold mb-2">{formData.name}</h2>
              )}
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="text-slate-300 bg-slate-700 text-white px-3 py-2 rounded-lg w-full"
                  rows="2"
                />
              ) : (
                <p className="text-slate-300 mb-4">{formData.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                  Joined {formData.joinDate}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-orange-400" />
                  {formData.followersCount} followers
                </div>
              </div>
            </div>
            <div>
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700 my-8"></div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email Section */}
            <div>
              <label className="flex items-center text-slate-400 text-sm font-medium mb-2">
                <Mail className="w-4 h-4 mr-2 text-orange-400" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-orange-600 focus:outline-none transition"
                />
              ) : (
                <p className="text-white text-lg">{formData.email}</p>
              )}
            </div>

            {/* Favorite Genre Section */}
            <div>
              <label className="flex items-center text-slate-400 text-sm font-medium mb-2">
                <Music className="w-4 h-4 mr-2 text-orange-400" />
                Favorite Genre
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="favoriteGenre"
                  value={formData.favoriteGenre}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-orange-600 focus:outline-none transition"
                />
              ) : (
                <p className="text-white text-lg">{formData.favoriteGenre}</p>
              )}
            </div>

            {/* Playlists Count */}
            <div>
              <label className="text-slate-400 text-sm font-medium mb-2 block">Total Playlists</label>
              <p className="text-white text-lg">{formData.playlistCount}</p>
            </div>

            {/* Followers Count */}
            <div>
              <label className="text-slate-400 text-sm font-medium mb-2 block">Followers</label>
              <p className="text-white text-lg">{formData.followersCount}</p>
            </div>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="bg-slate-800/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6">Account Settings</h3>
          <div className="space-y-4">
            <Link
              to="/my-playlists"
              className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition text-slate-300 hover:text-white flex items-center"
            >
              <Music className="w-4 h-4 mr-2" />
              Manage My Playlists
            </Link>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full text-left px-4 py-3 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg transition text-orange-300 hover:text-orange-200 flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Track
            </button>
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition text-slate-300 hover:text-white flex items-center"
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition text-slate-300 hover:text-white">
              Privacy Settings
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition text-slate-300 hover:text-white">
              Notification Preferences
            </button>
            <button className="w-full text-left px-4 py-3 bg-red-900/20 hover:bg-red-900/30 rounded-lg transition text-red-400 hover:text-red-300">
              Delete Account
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 bg-orange-900/20 hover:bg-orange-900/30 rounded-lg transition text-orange-400 hover:text-orange-300 flex items-center font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <AudioPlayer />
      <UploadTrackModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={() => {
          setIsUploadModalOpen(false)
        }}
      />

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsChangePasswordModalOpen(false)}>
          <div className="bg-slate-800 rounded-xl p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setIsChangePasswordModalOpen(false)
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Change Password</h2>
              <p className="text-slate-300 mt-2">Enter your current password and new password</p>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    disabled={changingPassword}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    disabled={changingPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="text-slate-400 w-4 h-4" />
                    ) : (
                      <Eye className="text-slate-400 w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    disabled={changingPassword}
                    minLength={8}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter new password (min 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    disabled={changingPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="text-slate-400 w-4 h-4" />
                    ) : (
                      <Eye className="text-slate-400 w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    disabled={changingPassword}
                    minLength={8}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    disabled={changingPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="text-slate-400 w-4 h-4" />
                    ) : (
                      <Eye className="text-slate-400 w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition"
              >
                {changingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
