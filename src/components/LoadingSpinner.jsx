import { Loader2 } from "lucide-react"

export default function LoadingSpinner({ message = "Loading...", size = "default" }) {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-8 h-8",
    large: "w-12 h-12"
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-orange-400 mb-4`} />
      <p className="text-slate-300 text-sm">{message}</p>
    </div>
  )
}

