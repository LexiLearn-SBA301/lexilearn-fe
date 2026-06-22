import * as z from 'zod'

// Schema khớp đúng với BE: LoginRequest.java
// - email: @NotBlank + @Email + @Size(max = 255)
// - password: @NotBlank (chỉ cần không để trống, BE login KHÔNG giới hạn độ dài)
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ')
    .max(255, 'Email tối đa 255 ký tự'),

  password: z.string().min(1, 'Mật khẩu không được để trống'),

  rememberMe: z.boolean().optional(),
})

export const defaultLoginValues = {
  email: '',
  password: '',
  rememberMe: false,
}

// Schema khớp với BE: RegisterRequest.java
// - email: @NotBlank + @Email + @Size(max = 255)
// - password: @NotBlank + @Size(min = 8, max = 64)
// Lưu ý: BE chỉ nhận { email, password }. fullName & confirmPassword chỉ phục vụ
// validate phía client (UX), KHÔNG gửi lên BE.
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'Họ và tên không được để trống')
      .max(100, 'Họ và tên tối đa 100 ký tự'),

    email: z
      .string()
      .trim()
      .min(1, 'Email không được để trống')
      .email('Email không hợp lệ')
      .max(255, 'Email tối đa 255 ký tự'),

    password: z
      .string()
      .min(1, 'Mật khẩu không được để trống')
      .min(8, 'Mật khẩu phải từ 8 đến 64 ký tự')
      .max(64, 'Mật khẩu phải từ 8 đến 64 ký tự'),

    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'], // Focus lỗi vào ô xác nhận mật khẩu
  })

export const defaultRegisterValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}
