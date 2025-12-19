"use client"

import { useState, useEffect } from "react"
import { Users, Search, Shield, UserX, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AudioPlayer from "../components/AudioPlayer"
import LoadingSpinner from "../components/LoadingSpinner"
import { useNotification } from "../context/NotificationContext"
import { adminService } from "../services/adminService"

export default function AdminUsers() {
    console.log('AdminUsers component rendering')

    const [searchParams, setSearchParams] = useSearchParams()
    const [users, setUsers] = useState([])
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, admins: 0 })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1)
    const [totalPages, setTotalPages] = useState(1)
    const { showSuccess, showError } = useNotification()

    useEffect(() => {
        console.log('useEffect triggered, calling loadUsers')
        loadUsers()
    }, [currentPage, searchTerm, roleFilter, statusFilter])

    const loadUsers = async () => {
        try {
            setLoading(true)

            // Build params object, excluding undefined values
            const params = {
                page: currentPage,
                limit: 20
            }

            if (searchTerm) params.search = searchTerm
            if (roleFilter !== "all") params.role = roleFilter
            if (statusFilter !== "all") params.isActive = statusFilter

            console.log('Loading users with params:', params)
            const data = await adminService.getUsers(params)
            console.log('Received data:', data)
            console.log('Users array:', data.users)
            console.log('Users count:', data.users?.length)
            console.log('Stats:', data.stats)

            setUsers(data.users || [])
            setStats(data.stats || { total: 0, active: 0, inactive: 0, admins: 0 })
            setTotalPages(data.pagination?.totalPages || 1)
        } catch (error) {
            console.error("Failed to load users:", error)
            console.error("Error details:", error.response || error)
            showError(error.message || "Failed to load users")
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    const handleChangeRole = async (userId, currentRole) => {
        const newRole = currentRole === "admin" ? "user" : "admin"
        const confirmMessage = `Change user role to ${newRole.toUpperCase()}?`

        if (!window.confirm(confirmMessage)) return

        try {
            await adminService.changeUserRole(userId, newRole)
            showSuccess(`User role changed to ${newRole}`)
            loadUsers()
        } catch (error) {
            console.error("Failed to change role:", error)
            showError(error.message || "Failed to change user role")
        }
    }

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = !currentStatus
        const confirmMessage = `${newStatus ? 'Activate' : 'Deactivate'} this user?`

        if (!window.confirm(confirmMessage)) return

        try {
            await adminService.toggleUserStatus(userId, newStatus)
            showSuccess(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)
            loadUsers()
        } catch (error) {
            console.error("Failed to toggle status:", error)
            showError(error.message || "Failed to change user status")
        }
    }

    const handleDeleteUser = async (userId, userName) => {
        const confirmMessage = `PERMANENTLY DELETE user "${userName}"?\n\nThis will delete:\n- User account\n- All uploaded tracks\n- All playlists\n- All likes and comments\n\nThis action CANNOT be undone!`

        if (!window.confirm(confirmMessage)) return

        try {
            await adminService.deleteUser(userId)
            showSuccess("User deleted successfully")
            loadUsers()
        } catch (error) {
            console.error("Failed to delete user:", error)
            showError(error.message || "Failed to delete user")
        }
    }

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
            setSearchParams({ page: page.toString() })
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    const renderPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${i === currentPage
                        ? "bg-orange-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                >
                    {i}
                </button>
            )
        }

        return pages
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="min-h-screen flex flex-col pb-32">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-sm text-slate-400 uppercase tracking-widest mb-1">Admin</p>
                            <h1 className="text-4xl font-bold">User Management</h1>
                        </div>
                        <button
                            onClick={loadUsers}
                            disabled={loading}
                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-blue-400" />
                                <div>
                                    <p className="text-slate-400 text-sm">Total Users</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-green-400" />
                                <div>
                                    <p className="text-slate-400 text-sm">Active</p>
                                    <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Shield className="w-8 h-8 text-orange-400" />
                                <div>
                                    <p className="text-slate-400 text-sm">Admins</p>
                                    <p className="text-2xl font-bold text-orange-400">{stats.admins}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <UserX className="w-8 h-8 text-red-400" />
                                <div>
                                    <p className="text-slate-400 text-sm">Inactive</p>
                                    <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                                placeholder="Search by name or email..."
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                            />
                        </div>

                        {/* Role Filter */}
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                        >
                            <option value="all">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-slate-900/60 border border-slate-700 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <LoadingSpinner />
                            <span className="ml-3 text-slate-400">Loading users...</span>
                        </div>
                    ) : !users || users.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            No users found
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-800/50 border-b border-slate-700">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Name</th>
                                            <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Email</th>
                                            <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Role</th>
                                            <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                                            <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Joined</th>
                                            <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-slate-800/30 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={user.avatar || "/placeholder.svg?height=40&width=40"}
                                                            alt={user.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <span className="font-medium text-white">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                        ? 'bg-orange-600/20 text-orange-400'
                                                        : 'bg-slate-700 text-slate-300'
                                                        }`}>
                                                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                                                        ? 'bg-green-600/20 text-green-400'
                                                        : 'bg-red-600/20 text-red-400'
                                                        }`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 text-sm">
                                                    {formatDate(user.createdAt)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleChangeRole(user._id, user.role)}
                                                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium transition"
                                                            title="Change role"
                                                        >
                                                            {user.role === 'admin' ? 'Demote' : 'Promote'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${user.isActive
                                                                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                                                                : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                                                }`}
                                                            title={user.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                                            className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
                                                            title="Delete user"
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

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 p-6 border-t border-slate-700">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg font-medium transition bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        <ChevronLeft className="w-5 h-5 mr-1" />
                                        Previous
                                    </button>

                                    {renderPageNumbers()}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-lg font-medium transition bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        Next
                                        <ChevronRight className="w-5 h-5 ml-1" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
            <AudioPlayer />
        </div>
    )
}
