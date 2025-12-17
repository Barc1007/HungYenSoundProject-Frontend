import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"

const Notification = ({ message, type = "info", onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 250) // wait for exit animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 250)
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-300" />
      default:
        return <AlertCircle className="w-5 h-5 text-sky-300" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-emerald-900/85 border-emerald-500/40"
      case "error":
        return "bg-red-900/85 border-red-500/40"
      case "warning":
        return "bg-amber-900/85 border-amber-500/40"
      default:
        return "bg-sky-900/85 border-sky-500/40"
    }
  }

  const getTitle = () => {
    switch (type) {
      case "success":
        return "Thành công"
      case "error":
        return "Đã xảy ra lỗi"
      case "warning":
        return "Lưu ý"
      default:
        return "Thông báo"
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`max-w-sm w-full rounded-xl border shadow-lg shadow-black/40 backdrop-blur-md ${getBgColor()} p-4 transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-slate-200/80 mb-0.5">{getTitle()}</p>
          <p className="text-sm text-slate-100">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="text-slate-400 hover:text-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Notification

