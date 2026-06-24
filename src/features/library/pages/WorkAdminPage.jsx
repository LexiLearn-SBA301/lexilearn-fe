import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  BookOpen,
  AlertTriangle,
} from 'lucide-react'
import { useWorks, useDeleteWork } from '../hooks/useLibrary'
import { WorkFormDialog } from '../components/WorkFormDialog'
import { fetchWorkDetail } from '../api/library.api'

export const WorkAdminPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingWork, setEditingWork] = useState(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [workToDelete, setWorkToDelete] = useState(null)

  // State quản lý trạng thái loading khi bấm nút Sửa
  const [isFetchingDetail, setIsFetchingDetail] = useState(false)

  const { data: worksPage, isLoading } = useWorks({
    search: searchQuery,
    size: 50,
  })
  const deleteMutation = useDeleteWork()

  const handleAddNew = () => {
    setEditingWork(null)
    setIsFormOpen(true)
  }

  // ĐÃ SỬA LẠI HÀM NÀY: Gọi API lấy detail xong mới mở form
  const handleEdit = async (work) => {
    try {
      setIsFetchingDetail(true)

      // Gọi API lấy full data bằng slug
      const detailData = await fetchWorkDetail(work.slug)

      // Lúc này detailData đã có đủ authorId, summary, genre...
      setEditingWork(detailData)
      setIsFormOpen(true)
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết tác phẩm:', error)
      alert('Không thể lấy chi tiết tác phẩm để chỉnh sửa!')
    } finally {
      setIsFetchingDetail(false)
    }
  }

  const openDeleteModal = (work) => {
    setWorkToDelete(work)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!workToDelete) return
    try {
      await deleteMutation.mutateAsync(workToDelete.id)
      setIsDeleteOpen(false)
      setWorkToDelete(null)
    } catch (error) {
      console.error('Lỗi khi xóa tác phẩm:', error)
      alert('Không thể xóa tác phẩm này!')
    }
  }

  const genreMap = {
    'Truyện ngắn': 'Truyện ngắn',
    'Tiểu thuyết': 'Tiểu thuyết',
    'Thơ ca': 'Thơ ca',
    'Ký sự': 'Ký sự',
    'Phê bình văn học': 'Phê bình văn học',
  }

  return (
    <div className="bg-background min-h-screen p-6 md:p-10 font-body relative">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Tiêu đề */}
        <div className="mb-10">
          <h1 className="font-title text-4xl md:text-5xl font-bold text-primary mb-3">
            Quản lý Tác phẩm
          </h1>
          <p className="text-on-surface-variant text-lg">
            Quản lý kho tàng văn học và di sản của các tác giả.
          </p>
        </div>

        {/* Thanh Công Cụ */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 mb-8 shadow-sm">
          <div className="relative w-full sm:w-96 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm tác phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-outline-variant/40 text-primary rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#004943] transition-all"
            />
          </div>

          <button
            onClick={handleAddNew}
            className="w-full sm:w-auto px-6 py-3 bg-[#ab3429] text-white rounded-xl font-bold hover:bg-[#8a1c14] transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Plus size={20} /> Thêm Tác phẩm
          </button>
        </div>

        {/* Danh sách */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : worksPage?.content?.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-high rounded-[24px] border border-dashed border-outline-variant">
            <p className="text-on-surface-variant font-medium">
              Chưa có tác phẩm nào.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {worksPage?.content?.map((work) => (
              <div
                key={work.id}
                className="bg-bright-cream border border-outline-variant/40 rounded-[20px] p-5 flex gap-4 hover:shadow-xl transition-all group relative"
              >
                {/* Ảnh bìa */}
                <div className="w-24 h-36 rounded-lg bg-surface-container-high border border-outline-variant/30 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
                  {work.coverUrl ? (
                    <img
                      src={work.coverUrl}
                      alt={work.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src =
                          'https://placehold.co/200x300?text=No+Cover'
                      }}
                    />
                  ) : (
                    <BookOpen className="text-primary/40" size={30} />
                  )}
                </div>

                {/* Thông tin */}
                <div className="flex flex-col flex-grow">
                  <h3
                    className="font-title text-xl font-bold text-primary line-clamp-2 mb-1"
                    title={work.title}
                  >
                    {work.title}
                  </h3>
                  {/* Bắt lỗi thiếu tác giả */}
                  <p className="text-sm text-[#ab3429] font-bold mb-2">
                    {work.authorName || 'Chưa rõ tác giả'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-surface-container text-primary text-[10px] font-bold uppercase rounded-md">
                      {genreMap[work.subGenre || work.genre] ||
                        work.subGenre ||
                        work.genre ||
                        'Chưa phân loại'}
                    </span>
                    {work.publishYear && (
                      <span className="px-2 py-1 bg-outline-variant/20 text-on-surface-variant text-[10px] font-bold rounded-md">
                        NXB: {work.publishYear}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-auto pt-2 border-t border-outline-variant/30">
                    <Link
                      to={`/admin/thu-vien/${work.slug}/chi-tiet`}
                      className="p-2 text-[#004943] hover:bg-surface-container-high rounded-lg transition-colors flex items-center justify-center font-bold text-xs gap-1 mr-auto"
                    >
                      <BookOpen size={16} />
                      <span className="hidden sm:inline">Nội dung</span>
                    </Link>
                    {/* Thêm loading spinner cho nút Edit */}
                    <button
                      onClick={() => handleEdit(work)}
                      disabled={isFetchingDetail}
                      className="p-2 text-primary hover:bg-surface-container-high rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isFetchingDetail ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Edit size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => openDeleteModal(work)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <WorkFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        workData={editingWork}
      />

      {/* Popup Xóa */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[20px] shadow-2xl p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={30} />
            </div>
            <h3 className="font-title text-2xl font-bold text-primary mb-2">
              Xóa tác phẩm?
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Bạn có chắc chắn muốn xóa{' '}
              <strong className="text-primary">"{workToDelete?.title}"</strong>?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-3 border border-outline-variant/50 rounded-xl font-bold text-sm text-primary hover:bg-surface-container"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 bg-destructive text-white rounded-xl font-bold text-sm hover:bg-destructive/90 flex justify-center gap-2"
              >
                {deleteMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Vẫn xóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
