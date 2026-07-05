import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'

const COMMENTATOR_MAP = {
  CRITIC: 'Nhà phê bình',
  SCHOLAR: 'Học giả',
  WRITER: 'Nhà văn',
  TEACHER: 'Giáo viên',
  EDITORIAL: 'Ban biên tập',
  READER: 'Độc giả',
}

export const AdminWorkDetailCommentaries = ({
  commentaries,
  isLoading,
  openForm,
  handleDeleteClick,
}) => {
  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-on-surface">
          Danh sách Bình phẩm
        </h2>
        <button
          onClick={() => openForm('commentary')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-[#8a1c14] transition-all shadow-md hover:shadow-lg"
        >
          <Plus size={18} /> Thêm bình phẩm
        </button>
      </div>

      {!commentaries || commentaries.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-high rounded-3xl border border-outline-variant/30 border-dashed">
          <p className="text-on-surface-variant font-medium mb-4">
            Chưa có bình phẩm nào cho tác phẩm này.
          </p>
          <button
            onClick={() => openForm('commentary')}
            className="px-6 py-2 bg-primary/10 text-primary font-bold rounded-full hover:bg-primary/20 transition-colors"
          >
            Thêm bình phẩm đầu tiên
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-outline-variant/20">
                  <th className="p-4 text-sm font-bold text-on-surface-variant w-16 text-center">
                    TT
                  </th>
                  <th className="p-4 text-sm font-bold text-on-surface-variant">
                    Người bình phẩm
                  </th>
                  <th className="p-4 text-sm font-bold text-on-surface-variant w-[30%]">
                    Trích dẫn (Tiêu đề)
                  </th>
                  <th className="p-4 text-sm font-bold text-on-surface-variant">
                    Nguồn
                  </th>
                  <th className="p-4 text-sm font-bold text-on-surface-variant text-center">
                    Nổi bật
                  </th>
                  <th className="p-4 text-sm font-bold text-on-surface-variant text-center">
                    Xuất bản
                  </th>
                  <th className="p-4 text-sm font-bold text-on-surface-variant text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {commentaries.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-container-low transition-colors group"
                  >
                    <td className="p-4 text-center font-bold text-on-surface-variant/50">
                      {item.displayOrder}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-on-surface">
                        {item.commentatorName}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {COMMENTATOR_MAP[item.commentatorType] ||
                          item.commentatorType}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-primary truncate max-w-[200px]">
                        {item.title || 'Không có tiêu đề'}
                      </div>
                      <div className="text-sm text-on-surface-variant truncate max-w-[250px]">
                        {item.content}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">
                      {item.sourceTitle || '-'}{' '}
                      {item.publishedYear ? `(${item.publishedYear})` : ''}
                    </td>
                    <td className="p-4 text-center">
                      {item.isFeatured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                          <CheckCircle2 size={12} /> Có
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container text-on-surface-variant/50 text-xs font-bold rounded-full">
                          <XCircle size={12} /> Không
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                          <CheckCircle2 size={12} /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                          <XCircle size={12} /> No
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openForm('commentary', item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa bình phẩm"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick('commentary', item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa bình phẩm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
