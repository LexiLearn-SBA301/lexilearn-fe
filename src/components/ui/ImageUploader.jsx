import { useState, useRef, useEffect } from 'react'
import { UploadCloud, X } from 'lucide-react'

export const ImageUploader = ({
  label = 'Ảnh đính kèm',
  defaultImage = null,
  onChange,
  maxSizeMB = 5,
}) => {
  const [preview, setPreview] = useState(defaultImage)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    // eslint-disable-next-line
    setPreview(defaultImage)
  }, [defaultImage])

  const handleFile = (file) => {
    setError('')

    if (!file) return

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Dung lượng ảnh vượt quá ${maxSizeMB}MB`)
      return
    }

    // Validate type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedMimeTypes.includes(file.type)) {
      setError('Chỉ hỗ trợ định dạng JPG, PNG hoặc WebP')
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    onChange(file)
  }

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    setPreview(null)
    setError('')
    onChange(null) // null signals that the image was removed (if backend supports deletion)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-primary">{label}</label>

      <div
        className={`relative border-2 border-dashed rounded-xl overflow-hidden flex flex-col items-center justify-center transition-all bg-surface-container-lowest hover:bg-surface-container ${
          error ? 'border-[#ab3429]' : 'border-outline-variant/50'
        } ${preview ? 'h-48' : 'h-32'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg, image/png, image/webp"
          onChange={onSelectFile}
        />

        {preview ? (
          <div className="relative w-full h-full group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain bg-black/5"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                Nhấn để thay đổi
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center p-4 flex flex-col items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <UploadCloud size={20} />
            </div>
            <p className="text-sm font-medium text-on-surface-variant">
              Kéo thả hoặc nhấn để chọn ảnh
            </p>
            <p className="text-xs text-outline-variant">
              (JPEG, PNG, WebP tối đa {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-[#ab3429] font-medium">{error}</p>}
    </div>
  )
}
