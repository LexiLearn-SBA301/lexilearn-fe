import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Lock, Loader2, Save, ShieldCheck } from 'lucide-react'
import {
  updateProfileSchema,
  defaultUpdateProfileValues,
  changePasswordSchema,
  defaultChangePasswordValues,
} from '../schemas/auth.schema'
import { useMe, useUpdateProfile, useChangePassword } from '../hooks/useProfile'
import { AuthMessageBanner } from '../components/AuthMessageBanner'
import { PasswordField } from '../components/PasswordField'

// Nhãn tiếng Việt cho role/trạng thái trả về từ BE (chuỗi enum viết hoa)
const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  USER: 'Người dùng',
}

const STATUS_LABELS = {
  ACTIVE: 'Đang hoạt động',
  UNVERIFIED: 'Chưa xác thực email',
  LOCKED: 'Đã bị khóa',
  DISABLED: 'Đã vô hiệu hóa',
}

// Định dạng ngày giờ theo chuẩn Việt Nam, trả về '—' nếu thiếu dữ liệu
const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('vi-VN')
}

// Một dòng thông tin chỉ đọc (email, vai trò, trạng thái, ngày tạo)
const ReadOnlyRow = ({ label, value }) => (
  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between py-3 border-b border-outline-variant/20 last:border-b-0">
    <span className="font-body text-[13px] font-semibold tracking-wide text-on-surface-variant uppercase">
      {label}
    </span>
    <span className="font-body text-[15px] text-on-surface">{value}</span>
  </div>
)

export const ProfilePage = () => {
  // Tab đang mở: 'info' (thông tin cá nhân) hoặc 'password' (đổi mật khẩu)
  const [activeTab, setActiveTab] = useState('info')

  // Dữ liệu người dùng: lấy từ store làm initialData rồi refetch nền từ /v1/auth/me
  const { data: user, isLoading } = useMe()

  return (
    <div className="max-w-3xl mx-auto px-6 w-full py-10">
      <div className="mb-8">
        <h1 className="font-title text-[32px] font-semibold text-primary mb-2">
          Hồ sơ cá nhân
        </h1>
        <p className="font-body text-base text-on-surface-variant">
          Quản lý thông tin tài khoản và mật khẩu đăng nhập của bạn.
        </p>
      </div>

      {/* Thanh chuyển tab */}
      <div className="flex items-center gap-2 bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/20 mb-6 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded-lg font-body font-semibold text-sm transition-all ${
            activeTab === 'info'
              ? 'bg-[#ab3429] text-white shadow-sm'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 rounded-lg font-body font-semibold text-sm transition-all ${
            activeTab === 'password'
              ? 'bg-[#ab3429] text-white shadow-sm'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {isLoading && !user ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : activeTab === 'info' ? (
        <ProfileInfoSection user={user} />
      ) : (
        <ChangePasswordSection />
      )}
    </div>
  )
}

// --- Phần 1: Thông tin cá nhân (sửa được fullName, phần còn lại chỉ đọc) ---
const ProfileInfoSection = ({ user }) => {
  const {
    mutate: updateProfile,
    isPending,
    isSuccess,
    isError,
    error,
  } = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: defaultUpdateProfileValues,
    mode: 'onChange', // Validate realtime (gõ tới đâu bắt lỗi tới đó)
  })

  // Prefill họ tên khi dữ liệu /me về (hoặc khi được cập nhật từ nơi khác)
  useEffect(() => {
    if (!user) return
    reset({ fullName: user.fullName ?? '' })
  }, [user, reset])

  const onSubmit = (data) => {
    updateProfile({ fullName: data.fullName })
  }

  // Lấy message lỗi từ BE (ApiResponse.message) hoặc fallback nếu không có response
  const serverErrorMessage = isError
    ? (error?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.')
    : null

  const roleLabels = (user?.roles ?? [])
    .map((role) => ROLE_LABELS[role] ?? role)
    .join(', ')

  return (
    <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm">
      {/* Banner thành công — BE trả message "Cập nhật thông tin thành công." */}
      {isSuccess && (
        <AuthMessageBanner
          variant="success"
          reserveSpace={false}
          className="mb-5"
          message="Cập nhật thông tin thành công."
        />
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Thông báo lỗi từ server (BE) */}
        <AuthMessageBanner
          variant="error"
          reserveSpace={false}
          message={serverErrorMessage}
        />

        {/* Ô Họ và tên — trường duy nhất được phép sửa */}
        <div>
          <label
            className="block font-body text-[15px] font-semibold tracking-wide text-primary mb-2"
            htmlFor="profile-full-name"
          >
            Họ và tên
          </label>
          <div className="relative">
            <User
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              className={`w-full pl-10 pr-4 py-3 bg-surface border ${errors.fullName ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-xl focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors font-body text-base text-on-surface placeholder:text-outline-variant`}
              id="profile-full-name"
              placeholder="ví dụ: Nguyễn Văn A"
              type="text"
              maxLength={100}
              autoComplete="name"
              {...register('fullName')}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1.5 text-xs text-[#ab3429] font-medium">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <button
          className="py-3 px-6 bg-gradient-to-r from-secondary to-secondary-container text-on-secondary font-body text-[15px] font-semibold tracking-wide rounded-xl hover:shadow-[0_8px_16px_rgba(171,52,41,0.2)] hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Save size={20} />
          )}
          <span>{isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
        </button>
      </form>

      {/* Thông tin chỉ đọc — do hệ thống quản lý, không sửa được ở đây */}
      <div className="mt-8 pt-6 border-t border-outline-variant/30">
        <h2 className="font-body text-[15px] font-semibold tracking-wide text-primary mb-2 flex items-center gap-2">
          <Mail size={18} />
          Thông tin tài khoản
        </h2>
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/20 px-5">
          <ReadOnlyRow label="Email" value={user?.email ?? '—'} />
          <ReadOnlyRow label="Vai trò" value={roleLabels || '—'} />
          <ReadOnlyRow
            label="Trạng thái"
            value={STATUS_LABELS[user?.status] ?? user?.status ?? '—'}
          />
          <ReadOnlyRow
            label="Ngày tạo"
            value={formatDateTime(user?.createdAt)}
          />
        </div>
      </div>
    </div>
  )
}

// --- Phần 2: Đổi mật khẩu (mật khẩu cũ + mật khẩu mới, không OTP) ---
const ChangePasswordSection = () => {
  const {
    mutate: changePassword,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset: resetMutation,
  } = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: defaultChangePasswordValues,
    mode: 'onChange', // Validate realtime (gõ tới đâu bắt lỗi tới đó)
  })

  const onSubmit = (formValues) => {
    // Chỉ gửi { currentPassword, newPassword } — confirmPassword chỉ dùng validate phía client
    changePassword(
      {
        currentPassword: formValues.currentPassword,
        newPassword: formValues.newPassword,
      },
      {
        // Xóa sạch các ô mật khẩu sau khi đổi thành công.
        // BE KHÔNG thu hồi token → giữ nguyên phiên đăng nhập, không điều hướng.
        onSuccess: () => reset(defaultChangePasswordValues),
      },
    )
  }

  // Lấy message lỗi từ BE (ApiResponse.message) hoặc fallback nếu không có response
  // Các code lỗi nghiệp vụ: password_incorrect, password_same_as_old, validation_error
  const serverErrorMessage = isError
    ? (error?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.')
    : null

  return (
    <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm">
      {/* Banner thành công — dùng message BE trả về nếu có */}
      {isSuccess && (
        <AuthMessageBanner
          variant="success"
          reserveSpace={false}
          className="mb-5"
          message={data?.message ?? 'Đổi mật khẩu thành công.'}
        >
          <p className="text-xs text-[#15803d]">
            Bạn vẫn đang đăng nhập, lần đăng nhập tới hãy dùng mật khẩu mới.
          </p>
        </AuthMessageBanner>
      )}

      <form
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        // Gõ lại sau khi có kết quả → dọn banner cũ để không gây hiểu nhầm
        onChange={() => {
          if (isSuccess || isError) resetMutation()
        }}
      >
        {/* Thông báo lỗi từ server (BE) */}
        <AuthMessageBanner
          variant="error"
          reserveSpace={false}
          message={serverErrorMessage}
        />

        {/* Ô Mật khẩu hiện tại */}
        <PasswordField
          id="current-password"
          label="Mật khẩu hiện tại"
          registration={register('currentPassword')}
          error={errors.currentPassword?.message}
          errorDisplay="inline"
          toggleAriaLabel="Hiện hoặc ẩn mật khẩu hiện tại"
        />

        {/* Ô Mật khẩu mới */}
        <PasswordField
          id="new-password"
          label="Mật khẩu mới"
          registration={register('newPassword')}
          error={errors.newPassword?.message}
          errorDisplay="inline"
          toggleAriaLabel="Hiện hoặc ẩn mật khẩu mới"
          hint="Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số."
        />

        {/* Ô Xác nhận mật khẩu mới */}
        <PasswordField
          id="confirm-new-password"
          label="Xác nhận mật khẩu mới"
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
          errorDisplay="inline"
          toggleAriaLabel="Hiện hoặc ẩn xác nhận mật khẩu"
        />

        <button
          className="py-3 px-6 bg-gradient-to-r from-secondary to-secondary-container text-on-secondary font-body text-[15px] font-semibold tracking-wide rounded-xl hover:shadow-[0_8px_16px_rgba(171,52,41,0.2)] hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Lock size={20} />
          )}
          <span>{isPending ? 'Đang đổi...' : 'Đổi mật khẩu'}</span>
        </button>
      </form>

      <p className="mt-6 flex items-start gap-2 text-xs text-on-surface-variant">
        <ShieldCheck size={16} className="shrink-0 mt-0.5" />
        Vì lý do bảo mật, hãy dùng mật khẩu riêng cho tài khoản này và không
        chia sẻ với người khác.
      </p>
    </div>
  )
}
