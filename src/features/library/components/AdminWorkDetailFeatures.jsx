import { Loader2, Plus, Edit, Trash2, Sparkles } from 'lucide-react'

export const AdminWorkDetailFeatures = ({
  features,
  isLoading,
  openForm,
  handleDeleteClick,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-title text-2xl font-bold text-primary">
          Nghệ thuật đặc sắc
        </h2>
        <button
          onClick={() => openForm('feature')}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {features?.length === 0 ? (
            <p className="text-center text-on-surface-variant py-10 col-span-full">
              Chưa có đặc sắc nghệ thuật nào.
            </p>
          ) : null}
          {features?.map((feature) => (
            <div
              key={feature.id}
              className="bg-white border border-outline-variant/40 rounded-[20px] p-5 hover:shadow-xl transition-all group relative flex gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ab3429]/10 flex items-center justify-center text-[#ab3429] flex-shrink-0">
                <Sparkles size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-title font-bold text-lg text-primary truncate max-w-[200px] sm:max-w-[300px]">
                      {feature.title}
                    </h4>
                    <span className="inline-block px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase rounded-md mt-1 mb-2">
                      {feature.featureType === 'NARRATIVE'
                        ? 'Nghệ thuật kể chuyện'
                        : feature.featureType === 'LANGUAGE'
                          ? 'Ngôn ngữ'
                          : feature.featureType === 'IMAGERY'
                            ? 'Hình ảnh & Miêu tả'
                            : feature.featureType === 'STRUCTURE'
                              ? 'Cấu trúc'
                              : 'Biểu tượng'}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-white/90 backdrop-blur shadow-sm border border-outline-variant/20 rounded-lg p-1">
                    <button
                      onClick={() => openForm('feature', feature)}
                      className="p-1.5 text-primary hover:bg-surface-container-high rounded-md transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick('feature', feature)}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
