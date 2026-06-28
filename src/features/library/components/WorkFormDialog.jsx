import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  workSchema,
  defaultWorkValues,
  currentYear,
} from '../schemas/work.schema'
import { useCreateWork, useUpdateWork } from '../hooks/useLibrary'
import { useAuthors } from '../../author/hooks/useAuthor'
import { useTags } from '../../tag/hooks/useTag'
import { X, Loader2, Save } from 'lucide-react'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { uploadImageDirect } from '../../../services/upload.service'

export const WorkFormDialog = ({ isOpen, onClose, workData }) => {
  const isEditMode = !!workData
  const createMutation = useCreateWork()
  const updateMutation = useUpdateWork()

  const { data: authorsData } = useAuthors({ size: 1000 })
  const { data: tagsData } = useTags({ size: 1000 })

  const [selectedImage, setSelectedImage] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

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
          publishYear: workData.publishYear || '',
          genre: workData.genre || 'Truyện ngắn',
          period: workData.period || 'hien_dai',
          isPublished:
            workData.isPublished !== undefined ? workData.isPublished : true,
          summary: workData.summary || '',
          coverUrl: workData.coverUrl || '',
          originalTitle: workData.originalTitle || '',
          subGenre: workData.subGenre || '',
          grade: workData.grade || '',
          semester: workData.semester || '',
          historicalContext: workData.historicalContext || '',
          realisticValue: workData.realisticValue || '',
          humanisticValue: workData.humanisticValue || '',
          artisticValue: workData.artisticValue || '',
          famousQuote: workData.famousQuote || '',
          quoteAttribution: workData.quoteAttribution || '',
          tagIds: workData.tags?.map((t) => t.id) || workData.tagIds || [],
        })
      } else {
        reset(defaultWorkValues)
      }
      // eslint-disable-next-line
      setSelectedImage(null)
    }
  }, [isOpen, isEditMode, workData, reset])

  const onSubmit = async (data) => {
    try {
      setIsUploading(true)
      const payload = {
        ...data,
        publishYear: data.publishYear ? Number(data.publishYear) : null,
        grade: data.grade ? Number(data.grade) : null,
        semester: data.semester ? Number(data.semester) : null,
      }

      // Upload ảnh trực tiếp nếu có ảnh mới
      if (selectedImage) {
        const coverRef = await uploadImageDirect(selectedImage, 'WORK_COVER')
        payload.cover = coverRef
      }

      delete payload.coverUrl // Không gửi string URL lên API nếu Backend chỉ cần JSON

      if (isEditMode) {
        await updateMutation.mutateAsync({ id: workData.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch (error) {
      console.error('Lỗi khi lưu tác phẩm:', error)
      alert(error.message || 'Có lỗi xảy ra!')
    } finally {
      setIsUploading(false)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thông tin cơ bản */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Tên tác phẩm
                </label>
                <input
                  {...register('title')}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                />
                {errors.title && (
                  <p className="text-xs text-[#ab3429]">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Tên gốc (nếu có)
                </label>
                <input
                  {...register('originalTitle')}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Tác giả
                </label>
                <select
                  {...register('authorId')}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                >
                  <option value="">-- Chọn tác giả --</option>
                  {authorsData?.content?.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
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
                  {...register('publishYear', { valueAsNumber: true })}
                  onKeyDown={blockInvalidChar}
                  min="1000"
                  max={currentYear}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Thể loại chính
                </label>
                <select
                  {...register('genre')}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                >
                  <option value="Truyện ngắn">Truyện ngắn</option>
                  <option value="Tiểu thuyết">Tiểu thuyết</option>
                  <option value="Thơ ca">Thơ ca</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Thể loại phụ
                </label>
                <input
                  {...register('subGenre')}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                />
              </div>
              {/* Danh sách Bộ sưu tập (Tags) */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-primary">
                  Bộ sưu tập (Thẻ)
                </label>
                <div className="flex flex-wrap gap-4 p-4 bg-surface-container rounded-xl border border-outline-variant/30 max-h-48 overflow-y-auto custom-scrollbar">
                  {tagsData?.content?.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-outline-variant/10 p-1.5 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={tag.id}
                        {...register('tagIds')}
                        className="w-4 h-4 text-[#ab3429] rounded border-outline-variant focus:ring-[#ab3429]/30 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-on-surface-variant">
                        {tag.name}
                      </span>
                    </label>
                  ))}

                  {/* Báo lỗi nếu load tag rỗng */}
                  {(!tagsData?.content || tagsData.content.length === 0) && (
                    <span className="text-sm text-outline italic">
                      Chưa có thẻ nào trong hệ thống.
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Thời kỳ văn học
                </label>
                <select
                  {...register('period')}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                >
                  <option value="dan_gian">Văn học dân gian</option>
                  <option value="trung_dai">Văn học trung đại</option>
                  <option value="hien_dai">Văn học hiện đại</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Khối lớp (10-12)
                </label>
                <input
                  type="number"
                  {...register('grade', { valueAsNumber: true })}
                  onKeyDown={blockInvalidChar}
                  min="10"
                  max="12"
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Học kỳ (1-2)
                </label>
                <input
                  type="number"
                  {...register('semester', { valueAsNumber: true })}
                  onKeyDown={blockInvalidChar}
                  min="1"
                  max="2"
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-primary">
                  Tóm tắt
                </label>
                <textarea
                  {...register('summary')}
                  rows={3}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3 custom-scrollbar"
                />
              </div>

              {/* Phân tích chuyên sâu */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Hoàn cảnh sáng tác
                </label>
                <textarea
                  {...register('historicalContext')}
                  rows={2}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Giá trị nghệ thuật
                </label>
                <textarea
                  {...register('artisticValue')}
                  rows={2}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Giá trị hiện thực
                </label>
                <textarea
                  {...register('realisticValue')}
                  rows={2}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Giá trị nhân đạo
                </label>
                <textarea
                  {...register('humanisticValue')}
                  rows={2}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                />
              </div>

              {/* Trích dẫn & Ảnh bìa */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Trích dẫn nổi tiếng
                </label>
                <textarea
                  {...register('famousQuote')}
                  rows={2}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">
                  Nguồn trích dẫn
                </label>
                <input
                  {...register('quoteAttribution')}
                  className="w-full bg-white border border-outline-variant/40 rounded-xl px-4 py-3"
                />
              </div>

              {/* Upload Ảnh bìa */}
              <div className="space-y-2 md:col-span-2">
                <ImageUploader
                  label="Ảnh bìa tác phẩm (Tối đa 5MB, JPG/PNG/WebP)"
                  defaultImage={workData?.coverUrl}
                  onChange={(file) => setSelectedImage(file)}
                  maxSizeMB={5}
                />
              </div>

              {/* Checkbox xuất bản */}
              <div className="md:col-span-2 flex items-center gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant/30">
                <input
                  type="checkbox"
                  id="isPublished"
                  {...register('isPublished')}
                  className="w-5 h-5 text-[#ab3429]"
                />
                <label
                  htmlFor="isPublished"
                  className="text-sm font-bold text-primary cursor-pointer"
                >
                  Xuất bản tác phẩm này
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-outline-variant/30 bg-surface flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="px-6 py-2.5 rounded-xl text-primary font-bold border border-outline-variant/50 hover:bg-outline-variant/20"
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            form="work-form"
            disabled={
              isSubmitting ||
              isUploading ||
              createMutation.isPending ||
              updateMutation.isPending
            }
            className="px-6 py-2.5 bg-[#ab3429] text-white rounded-xl font-bold hover:bg-[#8a1c14] flex items-center gap-2"
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
                : 'Thêm Tác Phẩm'}
          </button>
        </div>
      </div>
    </div>
  )
}
