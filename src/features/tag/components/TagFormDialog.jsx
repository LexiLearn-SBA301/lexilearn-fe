import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tagSchema, defaultTagValues } from '../schemas/tag.schema'
import { useCreateTag, useUpdateTag } from '../hooks/useTag'
import { X, Loader2, Save } from 'lucide-react'

export const TagFormDialog = ({ isOpen, onClose, tagData }) => {
  const isEditMode = !!tagData
  const createMutation = useCreateTag()
  const updateMutation = useUpdateTag()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues: defaultTagValues,
    mode: 'onChange',
  })

  // Nếu mở form lên để Sửa, thì nhồi data cũ vào
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && tagData) {
        reset({ name: tagData.name, description: tagData.description || '' })
      } else {
        reset(defaultTagValues)
      }
    }
  }, [isOpen, isEditMode, tagData, reset])

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: tagData.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onClose() // Đóng popup sau khi thành công
    } catch (error) {
      console.error('Lỗi khi lưu Tag:', error)
      alert('Có lỗi xảy ra!')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/30 bg-bright-cream">
          <div>
            <span className="text-xs font-bold text-[#ab3429] uppercase tracking-wider mb-1 block">
              Chế độ quản trị
            </span>
            <h2 className="font-title text-3xl font-bold text-primary">
              {isEditMode ? 'Cập Nhật Thẻ' : 'Thêm Thẻ Mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-outline-variant/20 rounded-full text-on-surface-variant transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form
            id="tag-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary">
                Tên thẻ <span className="text-[#ab3429]">*</span>
              </label>
              <input
                {...register('name')}
                className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                placeholder="VD: Hiện thực phê phán"
              />
              {errors.name && (
                <p className="text-xs text-[#ab3429]">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-primary">Mô tả</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3 custom-scrollbar resize-none"
                placeholder="Mô tả ngắn về thẻ này..."
              ></textarea>
              {errors.description && (
                <p className="text-xs text-[#ab3429]">
                  {errors.description.message}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-outline-variant/30 bg-surface flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-primary font-bold border border-outline-variant/50 hover:bg-outline-variant/20"
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            form="tag-form"
            disabled={
              isSubmitting ||
              createMutation.isPending ||
              updateMutation.isPending
            }
            className="px-6 py-2.5 bg-[#ab3429] text-white rounded-xl font-bold hover:bg-[#8a1c14] flex items-center gap-2"
          >
            {isSubmitting ||
            createMutation.isPending ||
            updateMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isEditMode ? 'Lưu Thay Đổi' : 'Thêm Thẻ'}
          </button>
        </div>
      </div>
    </div>
  )
}
