import * as z from 'zod'

const currentYear = new Date().getFullYear()

export const authorSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Tên tác giả không được để trống')
      .max(100, 'Tên quá dài (tối đa 100 ký tự)'),

    penName: z
      .string()
      .trim()
      .max(100, 'Bút danh quá dài')
      .optional()
      .or(z.literal('')),

    // Dùng preprocess: Nếu để trống ("") thì gán thành null, nếu có nhập thì mới ép sang Number
    birthYear: z.preprocess(
      (val) => (val === '' || val === null ? null : Number(val)),
      z
        .number()
        .max(
          currentYear,
          `Năm sinh không được lớn hơn năm hiện tại (${currentYear})`,
        )
        .nullable()
        .optional(),
    ),

    deathYear: z.preprocess(
      (val) => (val === '' || val === null ? null : Number(val)),
      z
        .number()
        .max(currentYear, 'Năm mất không được lớn hơn năm hiện tại')
        .nullable()
        .optional(),
    ),

    period: z.enum(['dan_gian', 'trung_dai', 'hien_dai'], {
      errorMap: () => ({ message: 'Vui lòng chọn thời kỳ hợp lệ' }),
    }),

    bio: z
      .string()
      .trim()
      .max(2000, 'Tiểu sử quá dài, vui lòng rút gọn dưới 2000 ký tự')
      .optional()
      .or(z.literal('')),

    // Dùng union để xử lý dứt điểm: hoặc là chuỗi rỗng, hoặc phải là URL hợp lệ
    portraitUrl: z
      .union([
        z.literal(''),
        z
          .string()
          .trim()
          .url('Đường dẫn ảnh không hợp lệ')
          .max(500, 'Đường dẫn quá dài'),
      ])
      .optional(),
  })
  .refine(
    (data) => {
      // Logic: Nếu có năm mất và năm sinh, năm mất phải >= năm sinh
      if (data.birthYear && data.deathYear && data.deathYear < data.birthYear) {
        return false
      }
      return true
    },
    {
      message: 'Năm mất không được nhỏ hơn năm sinh',
      path: ['deathYear'], // Focus thẳng lỗi vào ô Năm mất cho dễ nhìn
    },
  )

export const defaultAuthorValues = {
  name: '',
  penName: '',
  birthYear: '',
  deathYear: '',
  period: 'hien_dai',
  bio: '',
  portraitUrl: '',
}
