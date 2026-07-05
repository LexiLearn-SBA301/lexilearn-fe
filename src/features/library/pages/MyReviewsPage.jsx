import { useState } from 'react'
import {
  useGetMyReviews,
  useUpdateMyReview,
  useDeleteMyReview,
} from '../hooks/useReview'
import { Star, Edit2, Trash2, Loader2, X, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export const MyReviewsPage = () => {
  const [page, setPage] = useState(0)
  const size = 10

  const { data, isLoading, isError } = useGetMyReviews({
    page,
    size,
    sortDir: 'desc',
    sortBy: 'updatedAt',
  })

  const [editingReview, setEditingReview] = useState(null)
  const [deletingReview, setDeletingReview] = useState(null)

  const updateReview = useUpdateMyReview()
  const deleteReview = useDeleteMyReview()

  const handleUpdate = async (data) => {
    try {
      await updateReview.mutateAsync({
        reviewId: editingReview.reviewId,
        data,
      })
      setEditingReview(null)
    } catch (e) {
      alert(e?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteReview.mutateAsync(deletingReview.reviewId)
      setDeletingReview(null)
    } catch (e) {
      alert(e?.response?.data?.message || 'Có lỗi xảy ra khi xóa.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 w-full py-10">
      <h1 className="text-3xl font-extrabold text-primary mb-8 font-title flex items-center gap-3">
        <Star size={32} />
        Đánh giá của tôi
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : isError || !data || data.content.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-outline-variant/30">
          <p className="text-on-surface-variant font-medium">
            Bạn chưa viết bài đánh giá nào.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.content.map((review) => (
            <div
              key={review.reviewId}
              className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link
                    to={`/thu-vien/${review.workSlug}/doc`}
                    className="font-bold text-xl text-primary hover:underline"
                  >
                    {review.workTitle}
                  </Link>
                  <div className="text-sm text-on-surface-variant mt-1">
                    Cập nhật lần cuối:{' '}
                    {new Date(
                      review.updatedAt || review.createdAt,
                    ).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingReview(review)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Sửa đánh giá"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setDeletingReview(review)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa đánh giá"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Display pending version if exists */}
              {review.pendingRevision && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">
                    Đang chờ duyệt
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">
                    {review.pendingRevision.title}
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {review.pendingRevision.content}
                  </p>
                </div>
              )}

              {/* Display rejected version if exists */}
              {review.latestRejectedRevision && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlertCircle size={14} /> Bị từ chối
                  </div>
                  <p className="text-red-600 text-sm mb-3">
                    Lý do: {review.latestRejectedRevision.rejectionReason}
                  </p>
                  <div className="opacity-70">
                    <h4 className="font-bold text-gray-800 mb-1">
                      {review.latestRejectedRevision.title}
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {review.latestRejectedRevision.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Display approved version if exists */}
              {review.approvedRevision && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                    Đang công khai
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">
                    {review.approvedRevision.title}
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {review.approvedRevision.content}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-full font-bold text-sm bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Trang trước
              </button>
              <span className="text-sm font-bold opacity-60">
                {page + 1} / {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-full font-bold text-sm bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSubmit={handleUpdate}
          isPending={updateReview.isPending}
        />
      )}

      {/* Delete Confirm */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
              <Trash2 /> Xóa đánh giá
            </h3>
            <p className="mb-6 text-gray-700">
              Bạn có chắc chắn muốn xóa đánh giá cho tác phẩm{' '}
              <b>{deletingReview.workTitle}</b>? Hành động này sẽ xóa toàn bộ
              lịch sử (kể cả bản đang public) và không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingReview(null)}
                className="px-4 py-2 font-bold bg-gray-100 rounded-xl hover:bg-gray-200"
                disabled={deleteReview.isPending}
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2"
                disabled={deleteReview.isPending}
              >
                {deleteReview.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const EditReviewModal = ({ review, onClose, onSubmit, isPending }) => {
  // Use pending, or rejected, or approved as default values
  const currentRevision =
    review.pendingRevision ||
    review.latestRejectedRevision ||
    review.approvedRevision

  const {
    register,
    handleSubmit,
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
    defaultValues: {
      title: currentRevision?.title || '',
      content: currentRevision?.content || '',
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-primary">Sửa đánh giá</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">
              Tiêu đề (tùy chọn)
            </label>
            <input
              {...register('title')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('content')}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none resize-y"
            />
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 font-bold bg-gray-100 rounded-xl hover:bg-gray-200"
              disabled={isPending}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
              disabled={isPending}
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              Lưu thay đổi (Gửi duyệt lại)
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
