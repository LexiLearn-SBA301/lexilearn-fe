import { apiClient } from '../lib/api'

export const uploadImageDirect = async (file, target) => {
  // 1. Xin chữ ký upload từ BE
  const signatureResponse = await apiClient.post(
    '/v1/uploads/images/signature',
    { target },
  )

  const signed = signatureResponse.data.result

  // 2. Validate file (đã làm ở UI nhưng làm thêm ở đây cho chắc)
  if (file.size > signed.maxFileSize) {
    throw new Error('Dung lượng ảnh không được vượt quá 5 MB')
  }

  const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
  if (!allowedMimeTypes.has(file.type)) {
    throw new Error('Ảnh chỉ hỗ trợ JPEG, PNG hoặc WebP')
  }

  // 3. Chuẩn bị dữ liệu gửi Cloudinary
  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', signed.apiKey)
  formData.append('timestamp', String(signed.timestamp))
  formData.append('public_id', signed.publicId)
  formData.append('allowed_formats', signed.allowedFormats)
  formData.append('signature', signed.signature)

  // 4. Bắn thẳng lên Cloudinary
  const cloudinaryResponse = await fetch(signed.uploadUrl, {
    method: 'POST',
    body: formData,
  })

  const cloudinaryResult = await cloudinaryResponse.json()

  if (!cloudinaryResponse.ok) {
    throw new Error(
      cloudinaryResult?.error?.message || 'Không thể upload ảnh lên Cloudinary',
    )
  }

  // 5. Trả về đúng format BE cần để lưu DB
  return {
    publicId: cloudinaryResult.public_id,
    version: cloudinaryResult.version,
    signature: cloudinaryResult.signature,
  }
}
