import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Loader2,
  X,
  Trash2,
  AlignLeft,
  FileType,
  Feather,
  BookOpen,
  Layers,
  Type,
  Hash,
  Star,
  ChevronDown,
  Check,
  Eye,
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

// ==========================================
// SHARED WRAPPERS
// ==========================================
const DialogWrapper = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
}) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-bright-cream w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8 border-b border-outline-variant/20 flex justify-between items-start bg-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0" />

          <div className="relative z-10 flex gap-4 items-center">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon size={24} />
              </div>
            )}
            <div>
              <h2 className="font-title text-2xl font-extrabold text-primary">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm font-medium text-on-surface-variant mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 p-2 text-on-surface-variant hover:bg-surface-variant hover:text-primary rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden bg-white/50">
          {children}
        </div>
      </div>
    </div>
  )
}

// Input Field Component for consistent premium styling
const Field = ({ label, icon: Icon, error, children }) => (
  <div className="space-y-1.5 group">
    <label className="flex items-center gap-2 text-sm font-bold text-primary ml-1 transition-colors group-focus-within:text-[#ab3429]">
      {Icon && <Icon size={14} className="opacity-70" />}
      {label}
    </label>
    <div className="relative">{children}</div>
    {error && (
      <p className="text-xs font-medium text-destructive ml-1 animate-in slide-in-from-top-1">
        {error.message}
      </p>
    )}
  </div>
)

const inputClasses = (error) => `
  w-full p-3.5 rounded-2xl border-2 transition-all duration-200 outline-none bg-white font-medium
  ${
    error
      ? 'border-destructive/50 focus:border-destructive focus:ring-4 focus:ring-destructive/10 text-destructive'
      : 'border-outline-variant/40 hover:border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10 text-primary'
  }
`

// ==========================================
// CUSTOM SELECT COMPONENT
// ==========================================
const CustomSelect = ({ options, value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full p-3.5 rounded-2xl border-2 transition-all duration-200 outline-none font-medium flex justify-between items-center bg-white
          ${
            error
              ? 'border-destructive/50 focus:border-destructive focus:ring-4 focus:ring-destructive/10 text-destructive'
              : isOpen
                ? 'border-primary ring-4 ring-primary/10 text-primary'
                : 'border-outline-variant/40 hover:border-outline-variant text-on-surface'
          }
        `}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 opacity-60 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`
                  w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center justify-between font-medium text-sm
                  ${
                    value === opt.value
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }
                `}
              >
                {opt.label}
                {value === opt.value && (
                  <Check size={16} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 1. SECTION FORM DIALOG
// ==========================================
import {
  workSectionSchema,
  defaultWorkSectionValues,
} from '../schemas/workDetail.schema'

export const SectionFormDialog = ({
  isOpen,
  onClose,
  data,
  onSubmit,
  isPending,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(workSectionSchema),
    defaultValues: defaultWorkSectionValues,
  })

  useEffect(() => {
    if (isOpen) reset(data || defaultWorkSectionValues)
  }, [isOpen, data, reset])

  const contentType = watch('contentType')
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const contentRef = useRef(null)
  const { ref: registerRef, ...restRegister } = register('content')

  const handleInsertPoetry = () => {
    const textarea = contentRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = watch('content') || ''

    const selectedText = currentValue.substring(start, end)
    const newText = `${currentValue.substring(0, start)}\n[THO]\n${selectedText || 'Nhập thơ vào đây...'}\n[/THO]\n${currentValue.substring(end)}`

    setValue('content', newText, { shouldValidate: true })

    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + 7 // length of '\n[THO]\n'
      textarea.setSelectionRange(
        newCursorPos,
        newCursorPos + (selectedText.length || 19),
      )
    }, 0)
  }

  const renderPreview = (content) => {
    if (!content)
      return (
        <div className="text-on-surface-variant italic text-sm text-center">
          Chưa có nội dung...
        </div>
      )

    const parts = content.split('\n\n')
    let isPoetry = false

    return parts.map((p, i) => {
      if (p.includes('[THO]')) isPoetry = true
      const currentIsPoetry = isPoetry
      if (p.includes('[/THO]')) isPoetry = false

      const cleanText = p.replace(/\[THO\]/g, '').replace(/\[\/THO\]/g, '')
      if (!cleanText.trim()) return null

      if (currentIsPoetry) {
        return (
          <div
            key={i}
            className="font-quote italic whitespace-pre-wrap text-center my-6 text-lg text-[#231a0c]"
          >
            {cleanText}
          </div>
        )
      }
      return (
        <p
          key={i}
          className="mb-6 text-justify text-[#231a0c] leading-relaxed font-quote text-lg"
        >
          {cleanText}
        </p>
      )
    })
  }

  return (
    <DialogWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={data ? 'Chỉnh sửa Chương' : 'Thêm Chương mới'}
      subtitle="Quản lý trích đoạn văn xuôi hoặc thơ ca"
      icon={BookOpen}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-4">
              <Field
                label="Số thứ tự (Tùy chọn)"
                icon={Hash}
                error={errors.number}
              >
                <input
                  type="number"
                  placeholder="Tự động"
                  {...register('number', { valueAsNumber: true })}
                  className={inputClasses(errors.number)}
                />
              </Field>
            </div>
            <div className="md:col-span-8">
              <Field label="Định dạng" icon={Layers} error={errors.contentType}>
                <CustomSelect
                  options={[
                    { value: 'PROSE', label: 'Văn xuôi (Đoạn văn tiêu chuẩn)' },
                    {
                      value: 'POETRY',
                      label: 'Thơ ca (Giữ nguyên xuống dòng)',
                    },
                    { value: 'MIXED', label: 'Hỗn hợp' },
                  ]}
                  value={watch('contentType')}
                  onChange={(val) =>
                    setValue('contentType', val, { shouldValidate: true })
                  }
                  error={errors.contentType}
                />
              </Field>
            </div>
          </div>

          <Field
            label="Tiêu đề chương (Tùy chọn)"
            icon={Type}
            error={errors.title}
          >
            <input
              {...register('title')}
              placeholder="Ví dụ: Cảnh ngày xuân, Đoạn trích Trao Duyên..."
              className={inputClasses(errors.title)}
            />
          </Field>

          <Field
            label="Nội dung chi tiết"
            icon={AlignLeft}
            error={errors.content}
          >
            {contentType === 'MIXED' && (
              <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 gap-2">
                <span className="text-[11px] text-on-surface-variant italic leading-tight flex-1">
                  💡 <b>Mẹo Hỗn hợp:</b> Bôi đen chữ và bấm nút bên phải để bọc
                  thẻ định dạng Thơ
                </span>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      isPreviewMode
                        ? 'bg-primary text-on-primary'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    <Eye size={14} />{' '}
                    {isPreviewMode ? 'Tiếp tục Viết' : 'Xem trước'}
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertPoetry}
                    disabled={isPreviewMode}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      isPreviewMode
                        ? 'opacity-50 cursor-not-allowed bg-outline-variant/20 text-on-surface-variant'
                        : 'bg-[#ab3429]/10 text-[#ab3429] hover:bg-[#ab3429]/20'
                    }`}
                  >
                    <Feather size={14} /> Chèn thẻ [THO]
                  </button>
                </div>
              </div>
            )}

            {isPreviewMode && contentType === 'MIXED' ? (
              <div className="border border-outline-variant/30 rounded-xl p-6 min-h-[220px] max-h-[400px] overflow-y-auto bg-[#fff9ef] shadow-inner paper-texture">
                {renderPreview(watch('content'))}
              </div>
            ) : (
              <textarea
                {...restRegister}
                ref={(e) => {
                  registerRef(e)
                  contentRef.current = e
                }}
                rows={contentType === 'POETRY' ? 12 : 8}
                className={`${inputClasses(errors.content)} resize-y leading-relaxed ${contentType === 'POETRY' ? 'text-center font-quote italic text-[#231a0c]' : ''}`}
                placeholder={
                  contentType === 'POETRY'
                    ? 'Nhập thơ vào đây...\nMỗi câu một dòng...'
                    : 'Nhập nội dung văn xuôi vào đây...'
                }
              />
            )}
          </Field>
        </div>
        <div className="p-4 md:px-8 md:py-5 bg-[#fff9ef] border-t border-outline-variant/20 shrink-0 flex justify-end gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-[#8a1c14] hover:shadow-lg hover:shadow-primary/20 transition-all flex gap-2 items-center active:scale-95"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Feather size={18} />
            )}
            {data ? 'Lưu thay đổi' : 'Thêm nội dung'}
          </button>
        </div>
      </form>
    </DialogWrapper>
  )
}

// ==========================================
// 2. CHARACTER FORM DIALOG
// ==========================================
import {
  workCharacterSchema,
  defaultWorkCharacterValues,
} from '../schemas/workDetail.schema'

export const CharacterFormDialog = ({
  isOpen,
  onClose,
  data,
  onSubmit,
  isPending,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(workCharacterSchema),
    defaultValues: defaultWorkCharacterValues,
  })

  useEffect(() => {
    if (isOpen) reset(data || defaultWorkCharacterValues)
  }, [isOpen, data, reset])

  return (
    <DialogWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={data ? 'Sửa thông tin Nhân vật' : 'Thêm Nhân vật mới'}
      subtitle="Khai báo tuyến nhân vật trong tác phẩm"
      icon={Star}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-8">
              <Field label="Tên nhân vật" icon={Type} error={errors.name}>
                <input
                  {...register('name')}
                  placeholder="Ví dụ: Thúy Kiều, Lão Hạc..."
                  className={inputClasses(errors.name)}
                />
              </Field>
            </div>
            <div className="md:col-span-4">
              <Field label="Vai trò" icon={Star} error={errors.roleType}>
                <CustomSelect
                  options={[
                    { value: 'MAIN', label: 'Nhân vật chính' },
                    { value: 'SUPPORTING', label: 'Nhân vật phụ/hỗ trợ' },
                    { value: 'ANTAGONIST', label: 'Nhân vật phản diện' },
                    { value: 'NARRATOR', label: 'Người kể chuyện' },
                  ]}
                  value={watch('roleType')}
                  onChange={(val) =>
                    setValue('roleType', val, { shouldValidate: true })
                  }
                  error={errors.roleType}
                />
              </Field>
            </div>
          </div>

          <Field
            label="Mô tả ngắn gọn"
            icon={AlignLeft}
            error={errors.description}
          >
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Tóm tắt tính cách, hoàn cảnh xuất thân..."
              className={inputClasses(errors.description)}
            />
          </Field>

          <Field
            label="Phân tích chuyên sâu (Tùy chọn)"
            icon={BookOpen}
            error={errors.analysis}
          >
            <textarea
              {...register('analysis')}
              rows={5}
              placeholder="Nhập bài phân tích, đánh giá về nhân vật này..."
              className={inputClasses(errors.analysis)}
            />
          </Field>
        </div>
        <div className="p-4 md:px-8 md:py-5 bg-[#fff9ef] border-t border-outline-variant/20 shrink-0 flex justify-end gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-[#8a1c14] hover:shadow-lg transition-all flex gap-2 items-center active:scale-95"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Feather size={18} />
            )}
            {data ? 'Cập nhật' : 'Thêm nhân vật'}
          </button>
        </div>
      </form>
    </DialogWrapper>
  )
}

// ==========================================
// 3. ARTISTIC FEATURE FORM DIALOG
// ==========================================
import {
  artisticFeatureSchema,
  defaultArtisticFeatureValues,
} from '../schemas/workDetail.schema'

export const ArtisticFeatureFormDialog = ({
  isOpen,
  onClose,
  data,
  onSubmit,
  isPending,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(artisticFeatureSchema),
    defaultValues: defaultArtisticFeatureValues,
  })

  useEffect(() => {
    if (isOpen) reset(data || defaultArtisticFeatureValues)
  }, [isOpen, data, reset])

  return (
    <DialogWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={data ? 'Sửa Đặc sắc Nghệ thuật' : 'Thêm Đặc sắc Nghệ thuật'}
      subtitle="Phân tích các thủ pháp nghệ thuật được sử dụng"
      icon={FileType}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-4">
              <Field
                label="Loại thủ pháp"
                icon={Layers}
                error={errors.featureType}
              >
                <CustomSelect
                  options={[
                    {
                      value: 'NARRATIVE',
                      label: 'Nghệ thuật kể chuyện (Tự sự)',
                    },
                    { value: 'LANGUAGE', label: 'Ngôn ngữ & Từ vựng' },
                    { value: 'IMAGERY', label: 'Hình ảnh & Miêu tả' },
                    { value: 'STRUCTURE', label: 'Cấu trúc & Bố cục' },
                    { value: 'SYMBOLISM', label: 'Biểu tượng & Ẩn dụ' },
                  ]}
                  value={watch('featureType')}
                  onChange={(val) =>
                    setValue('featureType', val, { shouldValidate: true })
                  }
                  error={errors.featureType}
                />
              </Field>
            </div>
            <div className="md:col-span-8">
              <Field
                label="Tiêu đề nghệ thuật"
                icon={Type}
                error={errors.title}
              >
                <input
                  {...register('title')}
                  placeholder="Ví dụ: Bút pháp tả cảnh ngụ tình"
                  className={inputClasses(errors.title)}
                />
              </Field>
            </div>
          </div>

          <Field
            label="Mô tả & Phân tích chi tiết"
            icon={AlignLeft}
            error={errors.description}
          >
            <textarea
              {...register('description')}
              rows={6}
              placeholder="Phân tích cách tác giả sử dụng thủ pháp này..."
              className={inputClasses(errors.description)}
            />
          </Field>
        </div>
        <div className="p-4 md:px-8 md:py-5 bg-[#fff9ef] border-t border-outline-variant/20 shrink-0 flex justify-end gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-[#8a1c14] hover:shadow-lg transition-all flex gap-2 items-center active:scale-95"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Feather size={18} />
            )}
            {data ? 'Cập nhật' : 'Thêm nghệ thuật'}
          </button>
        </div>
      </form>
    </DialogWrapper>
  )
}

// ==========================================
// 4. CONFIRM DELETE DIALOG (NEW LUXURY POPUP)
// ==========================================
export const ConfirmDeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isPending,
}) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 size={40} strokeWidth={1.5} />
        </div>
        <h3 className="font-title text-2xl font-extrabold text-primary mb-3">
          Xóa mục này?
        </h3>
        <p className="text-on-surface-variant font-medium mb-8">
          Bạn có chắc chắn muốn xóa{' '}
          <span className="font-bold text-[#ab3429]">"{itemName}"</span> không?
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-6 py-3.5 rounded-2xl border-2 border-outline-variant/30 font-bold text-primary hover:bg-surface-container transition-colors"
          >
            Hủy thao tác
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-6 py-3.5 rounded-2xl bg-destructive text-white font-bold hover:bg-[#ba1a1a] transition-all flex items-center justify-center gap-2 shadow-lg shadow-destructive/20 active:scale-95"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}{' '}
            Xóa vĩnh viễn
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 5. COMMENTARY FORM DIALOG
// ==========================================
import { z } from 'zod'
import { MessageSquare } from 'lucide-react'

export const CommentaryFormDialog = ({
  isOpen,
  onClose,
  data,
  onSubmit,
  isPending,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z.object({
        title: z.string().optional(),
        content: z.string().min(1, 'Vui lòng nhập nội dung bình phẩm'),
        commentatorName: z.string().min(1, 'Vui lòng nhập tên người bình phẩm'),
        commentatorType: z.enum([
          'CRITIC',
          'SCHOLAR',
          'WRITER',
          'TEACHER',
          'EDITORIAL',
          'READER',
        ]),
        sourceTitle: z.string().optional(),
        sourceUrl: z
          .string()
          .url('URL không hợp lệ')
          .optional()
          .or(z.literal('')),
        publishedYear: z.coerce
          .number()
          .min(1, 'Năm không hợp lệ')
          .optional()
          .or(z.literal('')),
        isFeatured: z.boolean(),
        isPublished: z.boolean(),
      }),
    ),
    defaultValues: {
      title: '',
      content: '',
      commentatorName: '',
      commentatorType: 'CRITIC',
      sourceTitle: '',
      sourceUrl: '',
      publishedYear: '',
      isFeatured: false,
      isPublished: true,
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (data) {
        reset({
          title: data.title || '',
          content: data.content || '',
          commentatorName: data.commentatorName || '',
          commentatorType: data.commentatorType || 'CRITIC',
          sourceTitle: data.sourceTitle || '',
          sourceUrl: data.sourceUrl || '',
          publishedYear: data.publishedYear || '',
          isFeatured: data.isFeatured || false,
          isPublished: data.isPublished !== undefined ? data.isPublished : true,
        })
      } else {
        reset({
          title: '',
          content: '',
          commentatorName: '',
          commentatorType: 'CRITIC',
          sourceTitle: '',
          sourceUrl: '',
          publishedYear: '',
          isFeatured: false,
          isPublished: true,
        })
      }
    }
  }, [isOpen, data, reset])

  return (
    <DialogWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={data ? 'Sửa Bình phẩm' : 'Thêm Bình phẩm'}
      subtitle="Quản lý ý kiến, nhận định về tác phẩm"
      icon={MessageSquare}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="Tên người bình phẩm *"
              icon={Type}
              error={errors.commentatorName}
            >
              <input
                {...register('commentatorName')}
                placeholder="Ví dụ: Hoài Thanh, Xuân Diệu..."
                className={inputClasses(errors.commentatorName)}
              />
            </Field>
            <Field
              label="Phân loại / Chức danh *"
              icon={Layers}
              error={errors.commentatorType}
            >
              <CustomSelect
                options={[
                  { value: 'CRITIC', label: 'Nhà phê bình' },
                  { value: 'SCHOLAR', label: 'Học giả' },
                  { value: 'WRITER', label: 'Nhà văn' },
                  { value: 'TEACHER', label: 'Giáo viên' },
                  { value: 'EDITORIAL', label: 'Ban biên tập' },
                  { value: 'READER', label: 'Độc giả' },
                ]}
                value={watch('commentatorType')}
                onChange={(val) =>
                  setValue('commentatorType', val, { shouldValidate: true })
                }
                error={errors.commentatorType}
              />
            </Field>
          </div>

          <Field label="Tiêu đề (Tùy chọn)" icon={Type} error={errors.title}>
            <input
              {...register('title')}
              placeholder="Nhập tiêu đề trích dẫn (nếu có)"
              className={inputClasses(errors.title)}
            />
          </Field>

          <Field
            label="Nội dung bình phẩm *"
            icon={AlignLeft}
            error={errors.content}
          >
            <textarea
              {...register('content')}
              rows={5}
              placeholder="Nhập nội dung chi tiết..."
              className={inputClasses(errors.content)}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="Nguồn / Tác phẩm gốc"
              icon={BookOpen}
              error={errors.sourceTitle}
            >
              <input
                {...register('sourceTitle')}
                placeholder="Ví dụ: Thi nhân Việt Nam"
                className={inputClasses(errors.sourceTitle)}
              />
            </Field>
            <Field
              label="Năm xuất bản"
              icon={Hash}
              error={errors.publishedYear}
            >
              <input
                type="number"
                {...register('publishedYear')}
                placeholder="Ví dụ: 1942"
                className={inputClasses(errors.publishedYear)}
              />
            </Field>
          </div>

          <Field label="Link gốc (URL)" icon={Type} error={errors.sourceUrl}>
            <input
              {...register('sourceUrl')}
              placeholder="https://..."
              className={inputClasses(errors.sourceUrl)}
            />
          </Field>

          <div className="flex gap-8 border-t border-outline-variant/20 pt-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="w-5 h-5 rounded text-primary focus:ring-primary/20 bg-surface-container border-outline-variant/50 transition-all cursor-pointer"
              />
              <span className="font-bold text-on-surface group-hover:text-primary transition-colors">
                Đánh dấu nổi bật
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register('isPublished')}
                className="w-5 h-5 rounded text-primary focus:ring-primary/20 bg-surface-container border-outline-variant/50 transition-all cursor-pointer"
              />
              <span className="font-bold text-on-surface group-hover:text-primary transition-colors">
                Xuất bản (Hiển thị)
              </span>
            </label>
          </div>
        </div>
        <div className="p-4 md:px-8 md:py-5 bg-[#fff9ef] border-t border-outline-variant/20 shrink-0 flex justify-end gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-[#8a1c14] hover:shadow-lg transition-all flex gap-2 items-center active:scale-95"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Feather size={18} />
            )}
            {data ? 'Cập nhật' : 'Thêm bình phẩm'}
          </button>
        </div>
      </form>
    </DialogWrapper>
  )
}
