import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  Tag as TagIcon,
} from 'lucide-react'
import { useTags, useDeleteTag } from '../hooks/useTag'
import { TagFormDialog } from '../components/TagFormDialog'
export const TagAdminPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTag, setEditingTag] = useState(null)

  // State cho Modal Xóa
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState(null)

  const { data: tags, isLoading, isError } = useTags()
  const deleteMutation = useDeleteTag()

  // Lọc thẻ (Tag) trên Frontend dựa vào thanh search
  const filteredTags = useMemo(() => {
    const tagArray = tags?.content || []

    if (!searchQuery.trim()) return tagArray

    const lowerQuery = searchQuery.toLowerCase()
    return tagArray.filter(
      (tag) =>
        tag.name.toLowerCase().includes(lowerQuery) ||
        (tag.description && tag.description.toLowerCase().includes(lowerQuery)),
    )
  }, [tags, searchQuery])

  const handleAddNew = () => {
    setEditingTag(null)
    setIsFormOpen(true)
  }

  const handleEdit = (tag) => {
    setEditingTag(tag)
    setIsFormOpen(true)
  }

  const openDeleteModal = (tag) => {
    setTagToDelete(tag)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return
    try {
      await deleteMutation.mutateAsync(tagToDelete.id)
      setIsDeleteOpen(false)
      setTagToDelete(null)
    } catch (error) {
      console.error('Lỗi khi xóa thẻ:', error)
      alert('Không thể xóa thẻ này!')
    }
  }

  if (isError)
    return (
      <div className="p-8 text-center text-[#ab3429] font-body">
        Có lỗi xảy ra khi tải dữ liệu!
      </div>
    )
  return (
    <div className="bg-background min-h-screen p-6 md:p-10 font-body relative">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Tiêu đề */}
        <div className="mb-10">
          <h1 className="font-title text-4xl md:text-5xl font-bold text-primary mb-3">
            Quản lý Thẻ
          </h1>
          <p className="text-on-surface-variant text-lg">
            Quản lý các thẻ phân loại, chủ đề cho kho tàng văn học.
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
              placeholder="Tìm kiếm thẻ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-outline-variant/40 text-primary rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#004943] transition-all"
            />
          </div>

          <button
            onClick={handleAddNew}
            className="w-full sm:w-auto px-6 py-3 bg-[#ab3429] text-white rounded-xl font-bold hover:bg-[#8a1c14] transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Plus size={20} /> Thêm Thẻ mới
          </button>
        </div>

        {/* Danh sách Thẻ */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-high rounded-[24px] border border-dashed border-outline-variant">
            <p className="text-on-surface-variant font-medium">
              Chưa có thẻ nào phù hợp.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="bg-bright-cream border border-outline-variant/40 rounded-[20px] p-5 flex flex-col hover:shadow-xl transition-all group relative"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-surface-container-high rounded-lg text-primary/60">
                    <TagIcon size={20} />
                  </div>
                  <h3
                    className="font-title text-xl font-bold text-primary line-clamp-2"
                    title={tag.name}
                  >
                    {tag.name}
                  </h3>
                </div>

                <p className="text-sm text-on-surface-variant mb-6 line-clamp-3 flex-grow">
                  {tag.description || (
                    <span className="italic text-outline-variant">
                      Chưa có mô tả
                    </span>
                  )}
                </p>

                <div className="flex justify-between items-center mt-auto pt-3 border-t border-outline-variant/30">
                  <span
                    className="text-xs text-outline-variant font-mono truncate max-w-[120px]"
                    title={tag.slug}
                  >
                    {tag.slug}
                  </span>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="p-2 text-primary hover:bg-surface-container-high rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(tag)}
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

      {/* Form Thêm/Sửa */}
      <TagFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        tagData={editingTag}
      />

      {/* Popup Xóa (Custom Modal) */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[20px] shadow-2xl p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={30} />
            </div>
            <h3 className="font-title text-2xl font-bold text-primary mb-2">
              Xóa thẻ này?
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Bạn có chắc chắn muốn xóa thẻ{' '}
              <strong className="text-primary">"{tagToDelete?.name}"</strong>?
              Việc này không thể hoàn tác.
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
