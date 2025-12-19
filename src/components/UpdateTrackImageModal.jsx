import { useState } from "react"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import trackService from "../services/trackService"
import LoadingSpinner from "./LoadingSpinner"
import { useNotification } from "../context/NotificationContext"

export default function UpdateTrackImageModal({ isOpen, onClose, track, onUpdated }) {
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { showError, showSuccess } = useNotification()

    if (!isOpen || !track) return null

    const handleImageChange = (e) => {
        const selected = e.target.files?.[0]
        if (selected) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(selected.type)) {
                showError('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)')
                return
            }

            // Validate file size (10MB)
            if (selected.size > 10 * 1024 * 1024) {
                showError('Kích thước ảnh không được vượt quá 10MB')
                return
            }

            setImageFile(selected)
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(selected)
        } else {
            setImageFile(null)
            setImagePreview(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!imageFile) {
            const msg = "Vui lòng chọn một ảnh"
            setError(msg)
            showError(msg)
            return
        }

        try {
            setIsSubmitting(true)
            setError("")

            const updatedTrack = await trackService.updateTrackImage(track.mongoId || track.id, imageFile)

            showSuccess("Cập nhật ảnh bìa thành công!")

            if (onUpdated) {
                onUpdated(updatedTrack)
            }

            // Reset state and close
            setImageFile(null)
            setImagePreview(null)
            setError("")
            onClose()
        } catch (err) {
            const msg = err.message || "Không thể cập nhật ảnh"
            setError(msg)
            showError(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (isSubmitting) return
        setImageFile(null)
        setImagePreview(null)
        setError("")
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Cập Nhật Ảnh Bìa</h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-1">Track: <span className="text-white font-medium">{track.title}</span></p>
                    <p className="text-sm text-slate-400">Artist: <span className="text-white">{track.artist}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Ảnh Hiện Tại
                        </label>
                        <div className="w-full h-40 rounded-lg overflow-hidden border border-slate-600">
                            <img
                                src={track.image || '/placeholder.svg'}
                                alt={track.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = '/placeholder.svg' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Ảnh Mới *
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleImageChange}
                            className="w-full text-sm text-slate-200 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                        />
                        {imagePreview && (
                            <div className="mt-3">
                                <p className="text-xs text-slate-400 mb-2">Preview:</p>
                                <div className="w-full h-40 rounded-lg overflow-hidden border border-slate-600">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !imageFile}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Cập Nhật
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
