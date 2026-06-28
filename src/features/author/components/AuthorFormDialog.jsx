import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authorSchema, defaultAuthorValues } from '../schemas/author.schema'
import { useCreateAuthor, useUpdateAuthor } from '../hooks/useAuthor'
import { X, Loader2, Save } from 'lucide-react'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { uploadImageDirect } from '../../../services/upload.service'

export const AuthorFormDialog = ({ isOpen, onClose, authorData }) => {
  const isEditMode = !!authorData
  const createMutation = useCreateAuthor()
  const updateMutation = useUpdateAuthor()

  const [selectedImage, setSelectedImage] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(authorSchema),
    defaultValues: defaultAuthorValues,
    mode: 'onChange', // Bật tính năng validate realtime (gõ tới đâu bắt lỗi tới đó)
  })

  // Đổ dữ liệu vào form khi bấm Sửa
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && authorData) {
        reset({
          name: authorData.name || '',
          penName: authorData.penName || '',
          birthYear: authorData.birthYear || '',
          deathYear: authorData.deathYear || '',
          period: authorData.period || 'hien_dai',
          bio: authorData.bio || '',
          portraitUrl: authorData.portraitUrl || '',
        })
      } else {
        reset(defaultAuthorValues)
      }
      // eslint-disable-next-line
      setSelectedImage(null)
    }
  }, [isOpen, isEditMode, authorData, reset])

  const onSubmit = async (data) => {
    try {
      setIsUploading(true)
      const payload = {
        ...data,
        birthYear: data.birthYear ? Number(data.birthYear) : null,
        deathYear: data.deathYear ? Number(data.deathYear) : null,
      }

      // 1. Upload ảnh trực tiếp nếu có chọn ảnh mới
      if (selectedImage) {
        const portraitRef = await uploadImageDirect(
          selectedImage,
          'AUTHOR_PORTRAIT',
        )
        payload.portrait = portraitRef
      }

      // Xóa trường portraitUrl khỏi payload gửi đi vì BE chỉ cần object portrait nếu cập nhật
      delete payload.portraitUrl

      if (isEditMode) {
        await updateMutation.mutateAsync({ id: authorData.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch (error) {
      console.error('Lỗi khi lưu tác giả:', error)
      alert(error.message || 'Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setIsUploading(false)
    }
  }

  // Hàm chặn gõ ký tự đặc biệt vào ô năm (chặn -, +, e, E, dấu chấm)
  const blockInvalidChar = (e) => {
    if (['e', 'E', '-', '+', '.'].includes(e.key)) {
      e.preventDefault()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-3xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/30 bg-bright-cream">
          <div>
            <span className="text-xs font-bold text-[#ab3429] uppercase tracking-wider mb-1 block">
              Chế độ quản trị
            </span>
            <h2 className="font-title text-3xl font-bold text-primary">
              {isEditMode ? 'Cập Nhật Tác Giả' : 'Thêm Tác Giả Mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-outline-variant/20 rounded-full text-on-surface-variant transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body (Form) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form
            id="author-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên thật */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Tên thật (Bắt buộc)
                </label>
                <input
                  {...register('name')}
                  className={`w-full bg-white border ${errors.name ? 'border-[#ab3429]' : 'border-outline-variant/40'} text-primary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tertiary-container`}
                  placeholder="VD: Trần Hữu Tri..."
                />
                {errors.name && (
                  <p className="text-xs text-[#ab3429] font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Bút danh */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Bút danh (Tên hiển thị chính)
                </label>
                <input
                  {...register('penName')}
                  className={`w-full bg-white border ${errors.penName ? 'border-[#ab3429]' : 'border-outline-variant/40'} text-primary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tertiary-container`}
                  placeholder="VD: Nam Cao..."
                />
                {errors.penName && (
                  <p className="text-xs text-[#ab3429] font-medium">
                    {errors.penName.message}
                  </p>
                )}
              </div>

              {/* Thời kỳ */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-primary">
                  Thời kỳ văn học
                </label>
                <select
                  {...register('period')}
                  className="w-full bg-white border border-outline-variant/40 text-primary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tertiary-container cursor-pointer"
                >
                  <option value="dan_gian">Văn học dân gian</option>
                  <option value="trung_dai">Văn học trung đại</option>
                  <option value="hien_dai">Văn học hiện đại</option>
                </select>
                {errors.period && (
                  <p className="text-xs text-[#ab3429] font-medium">
                    {errors.period.message}
                  </p>
                )}
              </div>

              {/* Năm sinh */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Năm sinh
                </label>
                <input
                  type="number"
                  min="1"
                  onKeyDown={blockInvalidChar}
                  {...register('birthYear')}
                  className={`w-full bg-white border ${errors.birthYear ? 'border-[#ab3429]' : 'border-outline-variant/40'} text-primary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tertiary-container`}
                  placeholder="VD: 1915"
                />
                {errors.birthYear && (
                  <p className="text-xs text-[#ab3429] font-medium">
                    {errors.birthYear.message}
                  </p>
                )}
              </div>

              {/* Năm mất */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Năm mất (để trống nếu còn sống)
                </label>
                <input
                  type="number"
                  min="1"
                  onKeyDown={blockInvalidChar}
                  {...register('deathYear')}
                  className={`w-full bg-white border ${errors.deathYear ? 'border-[#ab3429]' : 'border-outline-variant/40'} text-primary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tertiary-container`}
                  placeholder="VD: 1951"
                />
                {errors.deathYear && (
                  <p className="text-xs text-[#ab3429] font-medium">
                    {errors.deathYear.message}
                  </p>
                )}
              </div>

              {/* Upload Ảnh chân dung */}
              <div className="space-y-2 md:col-span-2">
                <ImageUploader
                  label="Ảnh chân dung (Tối đa 5MB, JPG/PNG/WebP)"
                  defaultImage={authorData?.portraitUrl}
                  onChange={(file) => setSelectedImage(file)}
                  maxSizeMB={5}
                />
              </div>

              {/* Tiểu sử */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-primary">
                  Tiểu sử tóm tắt
                </label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className={`w-full bg-white border ${errors.bio ? 'border-[#ab3429]' : 'border-outline-variant/40'} text-primary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tertiary-container custom-scrollbar`}
                  placeholder="Viết một đoạn tóm tắt về cuộc đời và sự nghiệp..."
                ></textarea>
                {errors.bio && (
                  <p className="text-xs text-[#ab3429] font-medium">
                    {errors.bio.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer (Buttons) */}
        <div className="p-6 border-t border-outline-variant/30 bg-surface flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-primary font-bold hover:bg-outline-variant/20 transition-colors border border-outline-variant/50"
            disabled={isSubmitting || isUploading}
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            form="author-form"
            disabled={
              isSubmitting ||
              isUploading ||
              createMutation.isPending ||
              updateMutation.isPending
            }
            className="px-6 py-2.5 bg-[#ab3429] text-white rounded-xl font-bold hover:bg-[#8a1c14] transition-colors flex items-center gap-2 shadow-md disabled:opacity-70"
          >
            {isSubmitting ||
            isUploading ||
            createMutation.isPending ||
            updateMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isUploading
              ? 'Đang Upload...'
              : isEditMode
                ? 'Lưu Thay Đổi'
                : 'Thêm Tác Giả'}
          </button>
        </div>
      </div>
    </div>
  )
}
