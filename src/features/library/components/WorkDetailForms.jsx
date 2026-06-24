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
        <div className="p-6 md:p-8 overflow-y-auto bg-white/50 custom-scrollbar">
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

  return (
    <DialogWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={data ? 'Chỉnh sửa Chương' : 'Thêm Chương mới'}
      subtitle="Quản lý trích đoạn văn xuôi hoặc thơ ca"
      icon={BookOpen}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  { value: 'POETRY', label: 'Thơ ca (Giữ nguyên xuống dòng)' },
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
          <textarea
            {...register('content')}
            rows={contentType === 'POETRY' ? 12 : 8}
            className={`${inputClasses(errors.content)} resize-y leading-relaxed ${contentType === 'POETRY' ? 'text-center font-serif italic' : ''}`}
            placeholder={
              contentType === 'POETRY'
                ? 'Nhập thơ vào đây...\nMỗi câu một dòng...'
                : 'Nhập nội dung văn xuôi vào đây...'
            }
          />
        </Field>

        <div className="pt-6 flex justify-end gap-3 border-t border-outline-variant/20">
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  { value: 'MAIN_CHARACTER', label: 'Nhân vật chính' },
                  { value: 'SUPPORTING_CHARACTER', label: 'Nhân vật phụ' },
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

        <div className="pt-6 flex justify-end gap-3 border-t border-outline-variant/20">
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-4">
            <Field
              label="Loại thủ pháp"
              icon={Layers}
              error={errors.featureType}
            >
              <CustomSelect
                options={[
                  { value: 'PLOT', label: 'Cốt truyện' },
                  { value: 'NARRATIVE_ART', label: 'Nghệ thuật kể chuyện' },
                  { value: 'LANGUAGE', label: 'Ngôn ngữ' },
                  { value: 'OTHER', label: 'Khác' },
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
            <Field label="Tiêu đề nghệ thuật" icon={Type} error={errors.title}>
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

        <div className="pt-6 flex justify-end gap-3 border-t border-outline-variant/20">
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
