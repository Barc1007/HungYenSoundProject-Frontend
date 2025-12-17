import { Navigate, useLocation } from "react-router-dom"
import { useUser } from "../context/UserContext"
import LoadingSpinner from "./LoadingSpinner"

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useUser()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}
