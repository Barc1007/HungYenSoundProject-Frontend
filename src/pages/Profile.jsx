"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Edit2, Save, X, Mail, Calendar, Music, LogOut, Upload, Camera, Eye, EyeOff, Lock, User, Sparkles } from "lucide-react"
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
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
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
        updateUser(response.data.user)
        showSuccess('Cập nhật ảnh đại diện thành công!')
      }
    } catch (error) {
      console.error('Upload avatar error:', error)
      showError(error.message || 'Không thể tải lên ảnh đại diện')
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

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
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-orange-400 hover:text-orange-300 transition mb-6 group">
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 text-green-300 px-6 py-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-lg shadow-green-500/10">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Profile updated successfully!</span>
          </div>
        )}

        {/* Profile Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/20 via-orange-600/20 to-pink-600/20 border border-purple-500/20 mb-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCAyMCAwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC4zIiBvcGFjaXR5PSIwLjEiLz48cGF0aCBkPSJNIDAgMCBMIDAgMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjMiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-orange-500/50 shadow-2xl shadow-orange-500/20">
                  <img
                    src={formData.avatar || "/placeholder.svg?height=128&width=128&query=user"}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 bg-gradient-to-br from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white p-3 rounded-full shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
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

              {/* User Info */}
              <div className="flex-1 w-full">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-3xl font-bold bg-slate-700/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                      placeholder="Your name"
                    />
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="text-slate-300 bg-slate-700/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition resize-none"
                      rows="2"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                      {formData.name}
                    </h2>
                    <p className="text-slate-300 mb-4 text-lg">{formData.bio || "No bio yet"}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        <span className="text-slate-300">Joined {formData.joinDate}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit/Save Buttons */}
              <div className="flex-shrink-0">
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-green-500/30"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-orange-500/30 hover:scale-105"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Information Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-400" />
              Personal Information
            </h3>
            <div className="space-y-4">
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
                    className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-xl border border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                  />
                ) : (
                  <p className="text-white text-lg bg-slate-700/30 px-4 py-3 rounded-xl">{formData.email}</p>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Account Settings Card */}
        <div className="mt-8 bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-400" />
            Account Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/my-playlists"
              className="group flex items-center gap-3 px-5 py-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition border border-slate-600/30 hover:border-orange-500/30"
            >
              <Music className="w-5 h-5 text-orange-400" />
              <span className="text-slate-300 group-hover:text-white transition font-medium">Manage My Playlists</span>
            </Link>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="group flex items-center gap-3 px-5 py-4 bg-orange-600/10 hover:bg-orange-600/20 rounded-xl transition border border-orange-500/20 hover:border-orange-500/40"
            >
              <Upload className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 group-hover:text-orange-200 transition font-medium">Upload Track</span>
            </button>

            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="group flex items-center gap-3 px-5 py-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition border border-slate-600/30 hover:border-orange-500/30"
            >
              <Lock className="w-5 h-5 text-orange-400" />
              <span className="text-slate-300 group-hover:text-white transition font-medium">Change Password</span>
            </button>

            <button
              onClick={() => setIsDeleteAccountModalOpen(true)}
              className="group flex items-center gap-3 px-5 py-4 bg-red-900/10 hover:bg-red-900/20 rounded-xl transition border border-red-500/20 hover:border-red-500/40"
            >
              <X className="w-5 h-5 text-red-400" />
              <span className="text-red-400 group-hover:text-red-300 transition font-medium">Delete Account</span>
            </button>

            <button
              onClick={handleLogout}
              className="md:col-span-2 group flex items-center justify-center gap-3 px-5 py-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 hover:from-orange-600/30 hover:to-red-600/30 rounded-xl transition border border-orange-500/30 hover:border-orange-500/50"
            >
              <LogOut className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 group-hover:text-orange-200 transition font-semibold">Logout</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setIsChangePasswordModalOpen(false)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md relative border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setIsChangePasswordModalOpen(false)
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600/20 to-orange-600/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                <Lock className="w-8 h-8 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Change Password</h2>
              <p className="text-slate-300 mt-2">Enter your current and new password</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    disabled={changingPassword}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    disabled={changingPassword}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center disabled:opacity-50"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="text-slate-400 w-5 h-5" />
                    ) : (
                      <Eye className="text-slate-400 w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    disabled={changingPassword}
                    minLength={8}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    placeholder="Enter new password (min 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    disabled={changingPassword}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center disabled:opacity-50"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="text-slate-400 w-5 h-5" />
                    ) : (
                      <Eye className="text-slate-400 w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    disabled={changingPassword}
                    minLength={8}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    disabled={changingPassword}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center disabled:opacity-50"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="text-slate-400 w-5 h-5" />
                    ) : (
                      <Eye className="text-slate-400 w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:from-orange-600/50 disabled:to-orange-500/50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-orange-500/30"
              >
                {changingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setIsDeleteAccountModalOpen(false)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md relative border border-red-500/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setIsDeleteAccountModalOpen(false)
                setDeletePassword('')
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Delete Account</h2>
              <p className="text-slate-300 mt-2">This action cannot be undone</p>
            </div>

            <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-5 mb-6">
              <p className="text-red-300 text-sm font-semibold mb-3">
                ⚠️ Warning: Deleting your account will permanently remove:
              </p>
              <ul className="text-red-300 text-sm space-y-1 ml-4 list-disc">
                <li>Your profile and personal information</li>
                <li>All uploaded tracks</li>
                <li>All playlists you created</li>
                <li>All your likes and comments</li>
              </ul>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Enter your password to confirm</label>
                <div className="relative">
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                    disabled={deletingAccount}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    disabled={deletingAccount}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center disabled:opacity-50"
                  >
                    {showDeletePassword ? (
                      <EyeOff className="text-slate-400 w-5 h-5" />
                    ) : (
                      <Eye className="text-slate-400 w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteAccountModalOpen(false)
                    setDeletePassword('')
                  }}
                  disabled={deletingAccount}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deletingAccount}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-red-600/50 disabled:to-red-500/50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-red-500/30"
                >
                  {deletingAccount ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
