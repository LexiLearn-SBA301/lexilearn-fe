import { z } from 'zod'

export const workSectionSchema = z.object({
  number: z
    .number()
    .int()
    .positive('Số thứ tự chương phải là số nguyên dương')
    .optional()
    .or(z.nan().transform(() => undefined)),
  title: z.string().optional(),
  content: z.string().min(1, 'Nội dung không được để trống'),
  contentType: z.enum(['PROSE', 'POETRY', 'MIXED'], {
    errorMap: () => ({ message: 'Vui lòng chọn định dạng (Văn xuôi/Thơ)' }),
  }),
})

export const defaultWorkSectionValues = {
  number: '',
  title: '',
  content: '',
  contentType: 'PROSE',
}

export const workCharacterSchema = z.object({
  name: z.string().min(1, 'Tên nhân vật không được để trống'),
  roleType: z.enum(['MAIN', 'SUPPORTING', 'ANTAGONIST', 'NARRATOR'], {
    errorMap: () => ({ message: 'Vui lòng chọn vai trò nhân vật' }),
  }),
  description: z.string().min(1, 'Mô tả không được để trống'),
  analysis: z.string().optional(),
})

export const defaultWorkCharacterValues = {
  name: '',
  roleType: 'MAIN',
  description: '',
  analysis: '',
}

export const artisticFeatureSchema = z.object({
  featureType: z.enum(
    ['NARRATIVE', 'LANGUAGE', 'IMAGERY', 'STRUCTURE', 'SYMBOLISM'],
    {
      errorMap: () => ({ message: 'Vui lòng chọn loại đặc sắc nghệ thuật' }),
    },
  ),
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
})

export const defaultArtisticFeatureValues = {
  featureType: 'NARRATIVE',
  title: '',
  description: '',
}
