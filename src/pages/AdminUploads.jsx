"use client"

import { useEffect, useMemo, useState } from "react"
import { Play, RefreshCw, Upload, CheckCircle, XCircle, Search, Trash2, Clock, Check, X } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AudioPlayer from "../components/AudioPlayer"
import UploadTrackModal from "../components/UploadTrackModal"
import LoadingSpinner from "../components/LoadingSpinner"
import trackService from "../services/trackService"
import { useAudio } from "../context/AudioContext"
import { useNotification } from "../context/NotificationContext"

const statusFilters = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
]

const approvalFilters = [
  { id: "all", label: "All", status: null },
  { id: "pending", label: "Pending", status: "pending" },
  { id: "approved", label: "Approved", status: "approved" },
  { id: "rejected", label: "Rejected", status: "rejected" },
]

export default function AdminUploads() {
  const [tracks, setTracks] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [approvalFilter, setApprovalFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("approved") // "approved" or "pending"
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { playTrack } = useAudio()
  const { showSuccess, showError } = useNotification()

  const fetchTracks = async () => {
    try {
      setIsRefreshing(true)
      const params = {
        source: "local",
        includeInactive: true,
        includePending: activeTab === "pending" ? "true" : undefined,
        status: activeTab === "pending" ? "pending" : activeTab === "approved" ? "approved" : undefined,
        search: searchTerm || undefined,
      }
      const response = await trackService.getTracks(params)
      setTracks(response.tracks)
      setError(null)
    } catch (err) {
      console.error("Failed to load tracks:", err)
      setError(err.message || "Failed to load tracks")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTracks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchTerm])

  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && track.isActive) ||
        (filterStatus === "inactive" && !track.isActive)

      const matchesSearch = searchTerm
        ? track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (track.artist || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (track.genre || "").toLowerCase().includes(searchTerm.toLowerCase())
        : true

      return matchesStatus && matchesSearch
    })
  }, [tracks, filterStatus, searchTerm])

  const stats = useMemo(() => {
    const active = tracks.filter((track) => track.isActive).length
    const inactive = tracks.length - active
    const genres = new Set(tracks.map((track) => (track.genre || "Unknown").toLowerCase()))
    return { total: tracks.length, active, inactive, genres: genres.size }
  }, [tracks])

  const handleToggleStatus = async (track) => {
    try {
      await trackService.updateTrack(track.mongoId || track.id, { isActive: !track.isActive })
      showSuccess(`Track ${!track.isActive ? "activated" : "deactivated"} successfully!`)
      fetchTracks()
    } catch (err) {
      console.error("Failed to update track status:", err)
      showError(err.message || "Failed to update track status")
    }
  }

  const handleApproveTrack = async (track) => {
    if (!window.confirm(`Approve track "${track.title}"?`)) {
      return
    }

    try {
      const { adminService } = await import('../services/adminService')
      await adminService.approveTrack(track.mongoId || track.id)
      showSuccess(`Track approved successfully!`)
      fetchTracks()
    } catch (err) {
      console.error("Failed to approve track:", err)
      showError(err.message || "Failed to approve track")
    }
  }

  const handleRejectTrack = async (track) => {
    if (!window.confirm(`Reject "${track.title}"? This will prevent it from being published.`)) return
    try {
      await trackService.rejectTrack(track.mongoId || track.id)
      showSuccess(`Track "${track.title}" rejected.`)
      fetchTracks()
    } catch (err) {
      console.error("Failed to reject track:", err)
      showError(err.message || "Failed to reject track")
    }
  }

  const handleDeleteTrack = async (track) => {
    // Different messages for hard delete (inactive) vs soft delete (active)
    const confirmMessage = track.isActive
      ? `Deactivate "${track.title}"? This will disable the track for all users.`
      : `PERMANENTLY DELETE "${track.title}"? This will remove all data from the database and CANNOT be undone!`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await trackService.deleteTrack(track.mongoId || track.id);

      // Show different success messages based on track state
      if (track.isActive) {
        showSuccess("Track deactivated successfully!");
      } else {
        showSuccess("Track permanently deleted from database!");
      }

      fetchTracks();
    } catch (err) {
      console.error("Failed to delete track:", err);
      showError(err.message || "Failed to delete track");
    }
  }

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false)
    fetchTracks()
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <div>
            <p className="text-sm text-slate-400 uppercase tracking-widest">Admin</p>
            <h1 className="text-3xl font-bold">Upload Management</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchTracks}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 text-white px-4 py-2 rounded-full text-sm font-medium transition disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-full text-sm font-medium transition"
            >
              <Upload className="w-4 h-4" />
              Upload Track
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
            <p className="text-slate-400 text-sm mb-1">Total Tracks</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
            <p className="text-slate-400 text-sm mb-1">Pending Approval</p>
            <p className="text-xl font-semibold text-yellow-400">{tracks.filter(t => t.status === 'pending').length}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
            <p className="text-slate-400 text-sm mb-1">Approved</p>
            <p className="text-xl font-semibold text-green-400">{tracks.filter(t => t.status === 'approved').length}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
            <p className="text-slate-400 text-sm mb-1">Rejected</p>
            <p className="text-xl font-semibold text-red-400">{tracks.filter(t => t.status === 'rejected').length}</p>
          </div>
        </section>

        {/* Tabs for Pending vs Approved */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 font-medium transition ${activeTab === "pending"
              ? "text-orange-400 border-b-2 border-orange-400"
              : "text-slate-400 hover:text-slate-300"
              }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Approval ({tracks.filter(t => t.status === 'pending').length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-6 py-3 font-medium transition ${activeTab === "approved"
              ? "text-orange-400 border-b-2 border-orange-400"
              : "text-slate-400 hover:text-slate-300"
              }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved Tracks ({tracks.filter(t => t.status === 'approved').length})
            </div>
          </button>
        </div>

        <section className="bg-slate-900/40 border border-slate-700 rounded-3xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {statusFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${filterStatus === filter.id
                    ? "bg-orange-600 border-orange-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tracks..."
                className="bg-slate-800 border border-slate-700 rounded-full w-full py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <LoadingSpinner />
              <span className="ml-2 text-slate-400">Loading uploads...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg text-sm text-red-200">{error}</div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-12 text-slate-300">No tracks found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-700">
                    <th className="py-3">Title</th>
                    <th className="py-3">Artist</th>

                    <th className="py-3">Uploaded</th>
                    <th className="py-3">Status</th>
                    {activeTab === "pending" && <th className="py-3">Approval</th>}
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTracks.map((track) => (
                    <tr key={track.id || track.mongoId} className="border-b border-slate-800">
                      <td className="py-3">
                        <div className="font-medium text-white">{track.title}</div>
                        <div className="text-xs text-slate-400">{track.audio}</div>
                      </td>
                      <td className="py-3 text-slate-300">{track.artist || "Unknown"}</td>

                      <td className="py-3 text-slate-400">
                        {track.createdAt ? new Date(track.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="py-3">
                        {track.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        ) : track.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-green-400 text-xs font-semibold">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 text-xs font-semibold">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </td>
                      {activeTab === "pending" && (
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveTrack(track)}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-green-900/40 text-green-300 hover:bg-green-800/40 transition flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectTrack(track)}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-red-900/40 text-red-300 hover:bg-red-800/40 transition flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => playTrack(track)}
                            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          {activeTab === "approved" && (
                            <button
                              onClick={() => handleToggleStatus(track)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${track.isActive
                                ? "bg-red-900/40 text-red-300 hover:bg-red-800/40"
                                : "bg-green-900/40 text-green-300 hover:bg-green-800/40"
                                }`}
                            >
                              {track.isActive ? "Disable" : "Enable"}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTrack(track)}
                            className="p-2 rounded-full bg-slate-800 hover:bg-red-800/40 text-red-300 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <AudioPlayer />

      <UploadTrackModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={handleUploadSuccess}
      />
    </div>
  )
}


