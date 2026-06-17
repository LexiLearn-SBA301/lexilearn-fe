import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { workSchema, defaultWorkValues } from '../schemas/work.schema'
import { useCreateWork, useUpdateWork } from '../hooks/useLibrary'
import { useAuthors } from '../../author/hooks/useAuthor'
import { X, Loader2, Save } from 'lucide-react'

export const WorkFormDialog = ({ isOpen, onClose, workData }) => {
  const isEditMode = !!workData
  const createMutation = useCreateWork()
  const updateMutation = useUpdateWork()

  const { data: authorsData } = useAuthors({ size: 1000 })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(workSchema),
    defaultValues: defaultWorkValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && workData) {
        reset({
          title: workData.title || '',
          authorId: workData.author?.id || workData.authorId || '',
          publicationYear: workData.publishYear || '',
          genre: workData.genre || 'Truyện ngắn',
          // Hứng thêm 2 trường này từ data cũ lên
          period: workData.period || 'hien_dai',
          isPublished:
            workData.isPublished !== undefined ? workData.isPublished : true,
          summary: workData.summary || '',
          coverUrl: workData.coverUrl || '',
        })
      } else {
        reset(defaultWorkValues)
      }
    }
  }, [isOpen, isEditMode, workData, reset])

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        publishYear: data.publicationYear ? Number(data.publicationYear) : null,
      }
      delete payload.publicationYear

      if (isEditMode) {
        await updateMutation.mutateAsync({ id: workData.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch (error) {
      console.error('Lỗi khi lưu tác phẩm:', error)
      alert('Có lỗi xảy ra!')
    }
  }

  const blockInvalidChar = (e) =>
    ['e', 'E', '-', '+', '.'].includes(e.key) && e.preventDefault()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-3xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/30 bg-bright-cream">
          <div>
            <span className="text-xs font-bold text-[#ab3429] uppercase tracking-wider mb-1 block">
              Chế độ quản trị
            </span>
            <h2 className="font-title text-3xl font-bold text-primary">
              {isEditMode ? 'Cập Nhật Tác Phẩm' : 'Thêm Tác Phẩm Mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-outline-variant/20 rounded-full text-on-surface-variant transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form
            id="work-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-primary">
                  Tên tác phẩm
                </label>
                <input
                  {...register('title')}
                  className={`w-full bg-white border ${errors.title ? 'border-[#ab3429]' : 'border-outline-variant/40'} text-primary rounded-xl px-4 py-3`}
                  placeholder="VD: Chí Phèo, Truyện Kiều..."
                />
                {errors.title && (
                  <p className="text-xs text-[#ab3429]">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Tác giả
                </label>
                <select
                  {...register('authorId')}
                  className={`w-full bg-white border ${errors.authorId ? 'border-[#ab3429]' : 'border-outline-variant/40'} text-primary rounded-xl px-4 py-3`}
                >
                  <option value="">-- Chọn tác giả --</option>
                  {authorsData?.content?.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}{' '}
                      {author.penName ? `(${author.penName})` : ''}
                    </option>
                  ))}
                </select>
                {errors.authorId && (
                  <p className="text-xs text-[#ab3429]">
                    {errors.authorId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Năm xuất bản
                </label>
                <input
                  type="number"
                  min="1"
                  onKeyDown={blockInvalidChar}
                  {...register('publicationYear')}
                  className={`w-full bg-white border ${errors.publicationYear ? 'border-[#ab3429]' : 'border-outline-variant/40'} text-primary rounded-xl px-4 py-3`}
                  placeholder="VD: 1941"
                />
                {errors.publicationYear && (
                  <p className="text-xs text-[#ab3429]">
                    {errors.publicationYear.message}
                  </p>
                )}
              </div>

              {/* ── THÊM Ô THỂ LOẠI VÀ THỜI KỲ ── */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Thể loại
                </label>
                <select
                  {...register('genre')}
                  className="w-full bg-white border border-outline-variant/40 text-primary rounded-xl px-4 py-3"
                >
                  <option value="Truyện ngắn">Truyện ngắn</option>
                  <option value="Tiểu thuyết">Tiểu thuyết</option>
                  <option value="Thơ ca">Thơ ca</option>
                  <option value="Ký sự">Ký sự</option>
                  <option value="Phê bình văn học">Phê bình văn học</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Thời kỳ văn học
                </label>
                <select
                  {...register('period')}
                  className="w-full bg-white border border-outline-variant/40 text-primary rounded-xl px-4 py-3"
                >
                  <option value="dan_gian">Văn học dân gian</option>
                  <option value="trung_dai">Văn học trung đại</option>
                  <option value="hien_dai">Văn học hiện đại</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-primary">
                  Đường dẫn ảnh bìa (URL)
                </label>
                <input
                  {...register('coverUrl')}
                  className={`w-full bg-white border ${errors.coverUrl ? 'border-[#ab3429]' : 'border-outline-variant/40'} text-primary rounded-xl px-4 py-3`}
                  placeholder="https://..."
                />
                {errors.coverUrl && (
                  <p className="text-xs text-[#ab3429]">
                    {errors.coverUrl.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-primary">
                  Tóm tắt nội dung
                </label>
                <textarea
                  {...register('summary')}
                  rows={4}
                  className={`w-full bg-white border ${errors.summary ? 'border-[#ab3429]' : 'border-outline-variant/40'} text-primary rounded-xl px-4 py-3 custom-scrollbar`}
                  placeholder="Nhập đoạn tóm tắt tác phẩm..."
                ></textarea>
                {errors.summary && (
                  <p className="text-xs text-[#ab3429]">
                    {errors.summary.message}
                  </p>
                )}
              </div>

              {/* ── THÊM CHECKBOX IS_PUBLISHED ── */}
              <div className="md:col-span-2 flex items-center gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant/30">
                <input
                  type="checkbox"
                  id="isPublished"
                  {...register('isPublished')}
                  className="w-5 h-5 rounded border-outline-variant/40 text-[#ab3429] focus:ring-[#ab3429] cursor-pointer"
                />
                <label
                  htmlFor="isPublished"
                  className="text-sm font-bold text-primary cursor-pointer select-none"
                >
                  Xuất bản tác phẩm này (Hiển thị công khai trên Thư viện)
                </label>
              </div>
            </div>
          </form>
        </div>

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
            form="work-form"
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
            {isEditMode ? 'Lưu Thay Đổi' : 'Thêm Tác Phẩm'}
          </button>
        </div>
      </div>
    </div>
  )
}
