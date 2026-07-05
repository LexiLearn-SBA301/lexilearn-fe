import { useState } from 'react'
import { MessageSquarePlus, User, Calendar, Loader2, Star } from 'lucide-react'
import { useGetPublicReviews, useCreateWorkReview } from '../hooks/useReview'
import { useAuthStore } from '../../auth/store/auth.store'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export const ReviewSection = ({ workId, isFocusMode }) => {
  const [page, setPage] = useState(0)
  const size = 5

  const { data, isLoading, isError } = useGetPublicReviews(workId, {
    page,
    size,
    sortDir: 'desc',
    sortBy: 'reviewedAt',
  })

  return (
    <div
      className={`mt-16 pt-16 border-t ${isFocusMode ? 'border-white/10 text-[#d4d4d4]' : 'border-[#83746d]/20 text-[#2b211c]'}`}
    >
      <div className="flex items-center gap-3 mb-10">
        <div
          className={`p-3 rounded-xl ${isFocusMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-600/10 text-blue-700'}`}
        >
          <Star size={24} />
        </div>
        <h3
          className={`font-title text-3xl font-extrabold ${isFocusMode ? 'text-white' : 'text-[#412311]'}`}
        >
          Đánh giá từ độc giả
        </h3>
      </div>

      <ReviewForm workId={workId} isFocusMode={isFocusMode} />

      {isLoading ? (
        <div className="py-10 flex justify-center">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : isError || !data || data.content.length === 0 ? (
        <div className="text-center py-10 opacity-70 italic">
          Chưa có đánh giá nào cho tác phẩm này. Hãy là người đầu tiên chia sẻ
          cảm nhận!
        </div>
      ) : (
        <div className="space-y-6 mt-10">
          {data.content.map((review) => (
            <div
              key={review.reviewId}
              className={`p-6 rounded-3xl border transition-all ${
                isFocusMode
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/60 border-[#83746d]/10'
              }`}
            >
              {review.title && (
                <h4
                  className={`text-xl font-bold mb-3 ${isFocusMode ? 'text-blue-400' : 'text-blue-800'}`}
                >
                  {review.title}
                </h4>
              )}

              <div
                className={`text-base leading-relaxed mb-4 whitespace-pre-wrap ${
                  isFocusMode ? 'text-[#e8e6e3]' : 'text-[#50443e]'
                }`}
              >
                {review.content}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-current border-opacity-10 text-sm font-medium opacity-80">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span className="font-bold">{review.reviewerName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    {new Date(review.approvedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFocusMode
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-[#412311]/5 hover:bg-[#412311]/10'
                }`}
              >
                Trang trước
              </button>
              <span className="text-sm font-bold opacity-60">
                {page + 1} / {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFocusMode
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-[#412311]/5 hover:bg-[#412311]/10'
                }`}
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const ReviewForm = ({ workId, isFocusMode }) => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isAuthenticated = Boolean(accessToken)
  const createReview = useCreateWorkReview()
  const [successMsg, setSuccessMsg] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z.object({
        title: z.string().max(300, 'Tiêu đề tối đa 300 ký tự').optional(),
        content: z
          .string()
          .min(1, 'Vui lòng nhập nội dung đánh giá')
          .max(10000, 'Nội dung quá dài'),
      }),
    ),
  })

  const onSubmit = async (data) => {
    try {
      await createReview.mutateAsync({ workId, data })
      setSuccessMsg('Đánh giá của bạn đã được gửi và đang chờ kiểm duyệt.')
      reset()
    } catch (err) {
      console.error(err)
      // Check if it's "Already reviewed" error or similar
      const msg =
        err?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.'
      alert(msg)
    }
  }

  if (!isAuthenticated) {
    return (
      <div
        className={`p-6 rounded-2xl border text-center ${
          isFocusMode
            ? 'bg-white/5 border-white/10'
            : 'bg-surface-container-low border-outline-variant/20'
        }`}
      >
        <p className="font-medium mb-4 opacity-80">
          Bạn cần đăng nhập để gửi đánh giá về tác phẩm này.
        </p>
        <a
          href="/dang-nhap"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Đăng nhập ngay
        </a>
      </div>
    )
  }

  if (successMsg) {
    return (
      <div
        className={`p-6 rounded-2xl border text-center ${
          isFocusMode
            ? 'bg-green-900/20 border-green-500/30 text-green-300'
            : 'bg-green-50 border-green-200 text-green-800'
        }`}
      >
        <p className="font-bold">{successMsg}</p>
        <button
          onClick={() => setSuccessMsg('')}
          className="mt-3 text-sm underline opacity-80 hover:opacity-100"
        >
          Gửi đánh giá khác (nếu hệ thống cho phép)
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`p-6 rounded-3xl border mb-8 ${
        isFocusMode
          ? 'bg-white/5 border-white/10'
          : 'bg-white shadow-sm border-outline-variant/20'
      }`}
    >
      <h4 className="font-bold mb-4 flex items-center gap-2">
        <MessageSquarePlus
          size={20}
          className={isFocusMode ? 'text-blue-400' : 'text-blue-600'}
        />
        Gửi đánh giá của bạn
      </h4>

      <div className="space-y-4">
        <div>
          <input
            {...register('title')}
            placeholder="Tiêu đề đánh giá (không bắt buộc)"
            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
              isFocusMode
                ? 'bg-black/20 border-white/10 focus:border-blue-500 text-white placeholder-white/30'
                : 'bg-surface-container-low border-outline-variant/30 focus:border-blue-500 text-on-surface'
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <textarea
            {...register('content')}
            rows={4}
            placeholder="Chia sẻ cảm nhận của bạn về tác phẩm này..."
            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all resize-y ${
              isFocusMode
                ? 'bg-black/20 border-white/10 focus:border-blue-500 text-white placeholder-white/30'
                : 'bg-surface-container-low border-outline-variant/30 focus:border-blue-500 text-on-surface'
            }`}
          />
          {errors.content && (
            <p className="text-red-500 text-xs mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createReview.isPending}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {createReview.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : null}
            Gửi đánh giá
          </button>
        </div>
      </div>
    </form>
  )
}
