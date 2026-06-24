import * as z from 'zod'

export const currentYear = new Date().getFullYear()

export const workSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tên tác phẩm không được để trống')
    .max(200, 'Tên quá dài'),

  authorId: z.string().min(1, 'Vui lòng chọn tác giả'),

  publishYear: z.preprocess(
    (val) => (val === '' || val === null ? null : Number(val)),
    z
      .number()
      .int('Năm phải là số nguyên')
      .min(1000, 'Năm không hợp lệ (trước 1000)') // Chặn số âm, chặn năm quá xa xưa
      .max(currentYear, `Năm không được vượt quá ${currentYear}`)
      .nullable()
      .optional(),
  ),

  genre: z.string().min(1, 'Vui lòng chọn thể loại'),
  period: z.enum(['dan_gian', 'trung_dai', 'hien_dai'], {
    errorMap: () => ({ message: 'Vui lòng chọn thời kỳ hợp lệ' }),
  }),
  tagIds: z.array(z.string()).optional().default([]),

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
  originalTitle: z.string().trim().optional().or(z.literal('')),
  subGenre: z.string().trim().optional().or(z.literal('')),
  grade: z.preprocess(
    (val) => (val === '' || val === null ? null : Number(val)),
    z
      .number({ invalid_type_error: 'Phải là số' })
      .int('Khối lớp phải là số nguyên')
      .min(10, 'Khối lớp chỉ từ 10 đến 12')
      .max(12, 'Khối lớp chỉ từ 10 đến 12')
      .nullable()
      .optional(),
  ),
  semester: z.preprocess(
    (val) => (val === '' || val === null ? null : Number(val)),
    z
      .number({ invalid_type_error: 'Phải là số' })
      .int('Học kỳ phải là số nguyên')
      .min(1, 'Học kỳ chỉ có 1 hoặc 2')
      .max(2, 'Học kỳ chỉ có 1 hoặc 2')
      .nullable()
      .optional(),
  ),

  historicalContext: z.string().trim().optional().or(z.literal('')),
  realisticValue: z.string().trim().optional().or(z.literal('')),
  humanisticValue: z.string().trim().optional().or(z.literal('')),
  artisticValue: z.string().trim().optional().or(z.literal('')),
  famousQuote: z.string().trim().optional().or(z.literal('')),
  quoteAttribution: z.string().trim().optional().or(z.literal('')),
})

export const defaultWorkValues = {
  title: '',
  authorId: '',
  publishYear: '',
  genre: 'Truyện ngắn',
  period: 'hien_dai', // Thêm giá trị mặc định
  isPublished: true, // Thêm giá trị mặc định
  summary: '',
  coverUrl: '',
  originalTitle: '',
  subGenre: '',
  grade: '',
  semester: '',
  historicalContext: '',
  realisticValue: '',
  humanisticValue: '',
  artisticValue: '',
  famousQuote: '',
  quoteAttribution: '',
  tagIds: [],
}
