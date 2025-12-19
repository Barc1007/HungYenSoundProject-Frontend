"use client"

import { useState, useEffect } from "react"
import { useNotification } from "../context/NotificationContext"
import { adminService } from "../services/adminService"
import Navbar from "../components/Navbar"

export default function AdminUsersTest() {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const { showError } = useNotification()

    useEffect(() => {
        const testAPI = async () => {
            console.log('=== ADMIN USERS TEST START ===')
            console.log('1. Component mounted')

            try {
                setLoading(true)
                console.log('2. Calling adminService.getUsers()')

                const result = await adminService.getUsers({ page: 1, limit: 20 })

                console.log('3. API Response:', result)
                console.log('4. Users:', result.users)
                console.log('5. Stats:', result.stats)

                setData(result)
                setError(null)
            } catch (err) {
                console.error('6. ERROR:', err)
                console.error('7. Error message:', err.message)
                console.error('8. Error response:', err.response)
                setError(err.message || 'Failed to load')
                showError(err.message || 'Failed to load users')
            } finally {
                setLoading(false)
                console.log('=== ADMIN USERS TEST END ===')
            }
        }

        testAPI()
    }, [])

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
                <h1 className="text-3xl font-bold mb-6">Admin Users API Test</h1>

                {loading && (
                    <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-4">
                        <p className="text-blue-300">Loading... Check console for logs</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
                        <h2 className="text-red-300 font-bold mb-2">Error:</h2>
                        <pre className="text-red-200 text-sm">{error}</pre>
                    </div>
                )}

                {data && (
                    <div className="space-y-4">
                        <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                            <h2 className="text-green-300 font-bold mb-2">✅ Success!</h2>
                            <p className="text-green-200">API call successful. Check console for full data.</p>
                        </div>

                        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                            <h3 className="text-white font-bold mb-2">Stats:</h3>
                            <pre className="text-slate-300 text-sm">{JSON.stringify(data.stats, null, 2)}</pre>
                        </div>

                        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                            <h3 className="text-white font-bold mb-2">Users Count: {data.users?.length || 0}</h3>
                            {data.users && data.users.length > 0 ? (
                                <div className="space-y-2">
                                    {data.users.map((user, index) => (
                                        <div key={user._id || index} className="bg-slate-700 p-3 rounded">
                                            <p className="text-white font-medium">{user.name}</p>
                                            <p className="text-slate-400 text-sm">{user.email}</p>
                                            <p className="text-slate-500 text-xs">Role: {user.role} | Active: {user.isActive ? 'Yes' : 'No'}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400">No users in response</p>
                            )}
                        </div>

                        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                            <h3 className="text-white font-bold mb-2">Full Response:</h3>
                            <pre className="text-slate-300 text-xs overflow-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>
                        </div>
                    </div>
                )}

                <div className="mt-8 bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
                    <h3 className="text-yellow-300 font-bold mb-2">Instructions:</h3>
                    <ol className="text-yellow-200 text-sm space-y-1 list-decimal list-inside">
                        <li>Open Developer Console (F12)</li>
                        <li>Look for logs starting with "=== ADMIN USERS TEST START ==="</li>
                        <li>Check if API call succeeds or fails</li>
                        <li>If fails, check error message and response</li>
                    </ol>
                </div>
            </main>
        </div>
    )
}
