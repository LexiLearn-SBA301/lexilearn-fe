import { useState } from 'react'
import {
  useGetAdminReviewRevisions,
  useModerateReviewRevision,
} from '../hooks/useReview'
import { Check, X, Loader2, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'

export const AdminReviewPage = () => {
  const [status, setStatus] = useState('PENDING')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useGetAdminReviewRevisions({
    status,
    page,
    size: 10,
    sortDir: 'asc',
    sortBy: 'createdAt',
  })

  const [moderatingRev, setModeratingRev] = useState(null)
  const [modType, setModType] = useState('APPROVE') // 'APPROVE' | 'REJECT'

  const moderate = useModerateReviewRevision()

  const handleModerate = async (decision, rejectionReason = null) => {
    try {
      await moderate.mutateAsync({
        revisionId: moderatingRev.revision.id,
        data: { decision, rejectionReason },
      })
      setModeratingRev(null)
    } catch (e) {
      alert(e?.response?.data?.message || 'Có lỗi xảy ra.')
    }
  }

  const TABS = [
    { id: 'PENDING', label: 'Chờ duyệt' },
    { id: 'APPROVED', label: 'Đã duyệt' },
    { id: 'REJECTED', label: 'Từ chối' },
    { id: 'SUPERSEDED', label: 'Cũ/Bị thay thế' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 w-full py-10">
      <h1 className="text-3xl font-extrabold text-primary mb-8 font-title">
        Quản lý Đánh giá độc giả
      </h1>

      <div className="flex gap-2 border-b border-outline-variant/20 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatus(tab.id)
              setPage(0)
            }}
            className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${
              status === tab.id
                ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-surface-container'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-outline-variant/30">
          <p className="text-on-surface-variant font-medium">
            Không có dữ liệu ở trạng thái này.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.content.map((item) => (
            <div
              key={item.revision.id}
              className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-2 text-sm text-gray-500">
                    Người đăng:{' '}
                    <span className="font-bold text-gray-800">
                      {item.reviewerName}
                    </span>{' '}
                    ({item.reviewerEmail})
                  </div>
                  <div className="mb-4 text-sm text-gray-500">
                    Tác phẩm:{' '}
                    <span className="font-bold text-blue-600">
                      {item.workTitle}
                    </span>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">
                      Phiên bản hiện tại (Version {item.revision.versionNumber})
                    </div>
                    <h4 className="font-bold text-gray-800 mb-1">
                      {item.revision.title || '(Không có tiêu đề)'}
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {item.revision.content}
                    </p>
                  </div>
                </div>

                <div>
                  {item.approvedRevision ? (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 h-full opacity-70">
                      <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                        Bản đang Public (Version{' '}
                        {item.approvedRevision.versionNumber})
                      </div>
                      <h4 className="font-bold text-gray-800 mb-1">
                        {item.approvedRevision.title || '(Không có tiêu đề)'}
                      </h4>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {item.approvedRevision.content}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 h-full flex items-center justify-center opacity-50 italic text-sm">
                      Đây là đánh giá đầu tiên, chưa có bản public nào.
                    </div>
                  )}
                </div>
              </div>

              {status === 'PENDING' && (
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => {
                      setModType('REJECT')
                      setModeratingRev(item)
                    }}
                    className="px-6 py-2 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <X size={18} /> Từ chối
                  </button>
                  <button
                    onClick={() => {
                      setModType('APPROVE')
                      setModeratingRev(item)
                    }}
                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Check size={18} /> Duyệt & Xuất bản
                  </button>
                </div>
              )}
              {status === 'REJECTED' && item.revision.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  Lý do từ chối: {item.revision.rejectionReason}
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

      {/* Moderation Modal */}
      {moderatingRev && (
        <ModerationModal
          type={modType}
          onClose={() => setModeratingRev(null)}
          onSubmit={(reason) => handleModerate(modType, reason)}
          isPending={moderate.isPending}
        />
      )}
    </div>
  )
}

const ModerationModal = ({ type, onClose, onSubmit, isPending }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitWrapper = (data) => {
    onSubmit(data.rejectionReason || null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full">
        <h3
          className={`text-xl font-bold mb-4 ${type === 'APPROVE' ? 'text-green-600' : 'text-red-600'}`}
        >
          {type === 'APPROVE' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
        </h3>

        <form onSubmit={handleSubmit(submitWrapper)}>
          {type === 'APPROVE' ? (
            <p className="mb-6 text-gray-700">
              Đánh giá này sẽ được hiển thị công khai trên trang tác phẩm.
            </p>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">
                Lý do từ chối (bắt buộc) <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('rejectionReason', {
                  required: 'Vui lòng nhập lý do từ chối',
                })}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none resize-y"
                placeholder="Nội dung vi phạm, cần chỉnh sửa..."
              />
              {errors.rejectionReason && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.rejectionReason.message}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold bg-gray-100 rounded-xl hover:bg-gray-200"
              disabled={isPending}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-4 py-2 font-bold text-white rounded-xl flex items-center gap-2 ${
                type === 'APPROVE'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={isPending}
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {type === 'APPROVE' ? 'Duyệt ngay' : 'Từ chối'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
