import { useState } from 'react'
import { useAuthors, useDeleteAuthor } from '../hooks/useAuthor'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  User,
  AlertTriangle,
} from 'lucide-react'
import { AuthorFormDialog } from '../components/AuthorFormDialog'

export const AuthorAdminPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState(null)

  // State quản lý Popup xóa custom
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [authorToDelete, setAuthorToDelete] = useState(null)
  const [isErrorOpen, setIsErrorOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { data: authorsPage, isLoading } = useAuthors({
    search: searchQuery,
    size: 50,
  })
  const deleteMutation = useDeleteAuthor()

  const handleAddNew = () => {
    setEditingAuthor(null)
    setIsFormOpen(true)
  }

  const handleEdit = (author) => {
    setEditingAuthor(author)
    setIsFormOpen(true)
  }

  // Mở popup xóa custom chứ không dùng window.confirm nữa
  const openDeleteModal = (author) => {
    setAuthorToDelete(author)
    setIsDeleteOpen(true)
    setErrorMessage('')
    setIsErrorOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!authorToDelete) return

    try {
      await deleteMutation.mutateAsync(authorToDelete.id)

      setIsDeleteOpen(false)
      setAuthorToDelete(null)
    } catch (error) {
      console.error('Lỗi khi xóa:', error)

      setIsDeleteOpen(false)

      // mở popup cảnh báo riêng
      setErrorMessage(
        'Không thể xóa tác giả này vì đang có tác phẩm liên kết trong hệ thống.',
      )
      setIsErrorOpen(true)
    }
  }

  const periodMap = {
    dan_gian: 'Dân gian',
    trung_dai: 'Trung đại',
    hien_dai: 'Hiện đại',
  }

  return (
    <div className="bg-background min-h-screen p-6 md:p-10 font-body relative">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Tiêu đề */}
        <div className="mb-10">
          <h1 className="font-title text-4xl md:text-5xl font-bold text-primary mb-3">
            Quản lý Tác giả
          </h1>
          <p className="text-on-surface-variant text-lg">
            Hệ thống phân loại và quản lý danh mục tác giả dành cho di sản văn
            học.
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
              placeholder="Tìm kiếm tác giả, bút danh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-outline-variant/40 text-primary rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#004943] transition-all"
            />
          </div>

          <button
            onClick={handleAddNew}
            className="w-full sm:w-auto px-6 py-3 bg-[#ab3429] text-white rounded-xl font-bold hover:bg-[#8a1c14] transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Plus size={20} /> Thêm Tác giả
          </button>
        </div>

        {/* Danh sách Card Admin */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : authorsPage?.content?.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-high rounded-[24px] border border-dashed border-outline-variant">
            <p className="text-on-surface-variant font-medium">
              Chưa có tác giả nào. Hãy thêm mới!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {authorsPage?.content?.map((author) => (
              <div
                key={author.id}
                className="bg-bright-cream border border-outline-variant/40 rounded-[20px] p-6 flex flex-col hover:shadow-xl transition-all group relative"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline-variant/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {author.portraitUrl ? (
                      <img
                        src={author.portraitUrl}
                        alt={author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-primary/40" size={24} />
                    )}
                  </div>
                  <div>
                    <h3
                      className="font-title text-xl font-bold text-primary line-clamp-1"
                      title={author.name}
                    >
                      {author.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium mt-1 uppercase tracking-wider">
                      {periodMap[author.period] || author.period}
                    </p>
                    <p className="text-xs text-[#ab3429] font-bold mt-0.5">
                      {author.birthYear || '?'} - {author.deathYear || '?'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-on-surface-variant line-clamp-3 mb-6 flex-grow font-quote italic border-l-2 border-outline-variant/50 pl-3">
                  {author.bio || 'Chưa có tiểu sử...'}
                </p>

                <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30 mt-auto">
                  <button
                    onClick={() => handleEdit(author)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-outline-variant/50 text-primary text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors"
                  >
                    <Edit size={14} /> Sửa
                  </button>
                  <button
                    onClick={() => openDeleteModal(author)} // <-- ĐỔI THÀNH GỌI POPUP CUSTOM
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-destructive/30 text-destructive text-xs font-bold rounded-lg hover:bg-destructive hover:text-white transition-colors"
                  >
                    <Trash2 size={14} /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. POPUP THÊM/SỬA TÁC GIẢ */}
      <AuthorFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        authorData={editingAuthor}
      />

      {/* 2. POPUP XÁC NHẬN XÓA CUSTOM */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[20px] shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={30} />
            </div>

            <h3 className="font-title text-2xl font-bold text-primary mb-2">
              Xác nhận xóa tác giả?
            </h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Bạn có chắc chắn muốn gỡ bỏ hồ sơ của tác giả{' '}
              <strong className="text-primary">"{authorToDelete?.name}"</strong>{' '}
              khỏi hệ thống?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-3 border border-outline-variant/50 rounded-xl font-bold text-sm text-primary hover:bg-surface-container transition-colors"
                disabled={deleteMutation.isPending}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 bg-destructive text-white rounded-xl font-bold text-sm hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
                disabled={deleteMutation.isPending}
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
      {isErrorOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[20px] shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={30} />
            </div>

            <h3 className="font-title text-2xl font-bold text-red-600 mb-2">
              Không thể xóa
            </h3>

            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              {errorMessage}
            </p>

            <button
              onClick={() => setIsErrorOpen(false)}
              className="w-full py-3 bg-[#ab3429] text-white rounded-xl font-bold hover:bg-[#8a1c14] transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
