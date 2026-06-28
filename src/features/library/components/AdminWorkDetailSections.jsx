import { Loader2, Plus, Edit, Trash2, FileText } from 'lucide-react'

export const AdminWorkDetailSections = ({
  sections,
  isLoading,
  openForm,
  handleDeleteClick,
  isFetchingDetail,
  fetchingItemId,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-title text-2xl font-bold text-primary">
          Chương / Trích đoạn
        </h2>
        <button
          onClick={() => openForm('section')}
          className="px-4 py-2 bg-[#ab3429] text-white rounded-xl font-bold hover:bg-[#8a1c14] transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Thêm mới
        </button>
      </div>
      {isLoading ? (
        <div className="text-center py-10">
          <Loader2 className="animate-spin mx-auto text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections?.length === 0 ? (
            <p className="text-center text-on-surface-variant py-10 col-span-full">
              Chưa có nội dung nào.
            </p>
          ) : null}
          {sections?.map((section) => (
            <div
              key={section.id}
              className="bg-white border border-outline-variant/40 rounded-[20px] p-5 hover:shadow-xl transition-all group relative flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#ab3429]/10 flex items-center justify-center text-[#ab3429] flex-shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-title font-bold text-lg text-primary leading-tight truncate max-w-[150px] sm:max-w-[200px]">
                      {section.title || `Chương ${section.number}`}
                    </h4>
                    <div className="flex gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-surface-container text-on-surface-variant">
                        Chương {section.number}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${section.contentType === 'POETRY' ? 'bg-sky-800/10 text-sky-800' : section.contentType === 'MIXED' ? 'bg-violet-800/10 text-violet-800' : 'bg-[#ab3429]/10 text-[#ab3429]'}`}
                      >
                        {section.contentType === 'POETRY'
                          ? 'Thơ'
                          : section.contentType === 'MIXED'
                            ? 'Hỗn hợp'
                            : 'Văn xuôi'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-white/90 backdrop-blur shadow-sm border border-outline-variant/20 rounded-lg p-1">
                  <button
                    onClick={() => openForm('section', section)}
                    disabled={isFetchingDetail && fetchingItemId === section.id}
                    className="p-1.5 text-primary hover:bg-surface-container-high rounded-md transition-colors disabled:opacity-50"
                  >
                    {isFetchingDetail && fetchingItemId === section.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Edit size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteClick('section', section)}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
