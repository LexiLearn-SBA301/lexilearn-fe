import { z } from 'zod'

export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên thẻ không được để trống')
    .max(100, 'Tên thẻ không được vượt quá 100 ký tự')
    .trim(),

  description: z.string().optional(), // Cho phép để trống (tương ứng với null/empty dưới DB)
})

export const defaultTagValues = {
  name: '',
  description: '',
}
