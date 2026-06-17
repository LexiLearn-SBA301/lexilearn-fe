import * as z from 'zod'

const currentYear = new Date().getFullYear()

export const workSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tên tác phẩm không được để trống')
    .max(200, 'Tên quá dài'),

  authorId: z.string().min(1, 'Vui lòng chọn tác giả'),

  publicationYear: z.preprocess(
    (val) => (val === '' || val === null ? null : Number(val)),
    z
      .number()
      .int('Năm phải là số nguyên')
      .min(1, 'Năm không hợp lệ')
      .max(
        currentYear,
        `Năm xuất bản không được vượt quá năm hiện tại (${currentYear})`,
      )
      .nullable()
      .optional(),
  ),

  genre: z.string().min(1, 'Vui lòng chọn thể loại'),

  // ── THÊM 2 TRƯỜNG NÀY VÀO ───────────────────────
  period: z.enum(['dan_gian', 'trung_dai', 'hien_dai'], {
    errorMap: () => ({ message: 'Vui lòng chọn thời kỳ hợp lệ' }),
  }),

  isPublished: z.boolean().default(true), // Mặc định là cho phép hiển thị
  // ───────────────────────────────────────────────

  summary: z
    .string()
    .trim()
    .max(3000, 'Tóm tắt quá dài (tối đa 3000 ký tự)')
    .optional()
    .or(z.literal('')),

  coverUrl: z
    .union([
      z.literal(''),
      z
        .string()
        .trim()
        .url('Đường dẫn ảnh bìa không hợp lệ')
        .max(500, 'Đường dẫn quá dài'),
    ])
    .optional(),
})

export const defaultWorkValues = {
  title: '',
  authorId: '',
  publicationYear: '',
  genre: 'Truyện ngắn',
  period: 'hien_dai', // Thêm giá trị mặc định
  isPublished: true, // Thêm giá trị mặc định
  summary: '',
  coverUrl: '',
}
