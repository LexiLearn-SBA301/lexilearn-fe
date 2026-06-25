import { Loader2, Plus, Edit, Trash2, User } from 'lucide-react'

export const AdminWorkDetailCharacters = ({
  characters,
  isLoading,
  openForm,
  handleDeleteClick,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-title text-2xl font-bold text-primary">
          Tuyến nhân vật
        </h2>
        <button
          onClick={() => openForm('character')}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {characters?.length === 0 ? (
            <p className="text-center text-on-surface-variant py-10 col-span-full">
              Chưa có nhân vật nào.
            </p>
          ) : null}
          {characters?.map((char) => (
            <div
              key={char.id}
              className="bg-white border border-outline-variant/40 rounded-[20px] p-5 hover:shadow-xl transition-all group relative flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#ab3429]/10 flex items-center justify-center text-[#ab3429] flex-shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-title font-bold text-lg text-primary leading-tight">
                      {char.name}
                    </h4>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md mt-1 ${
                        char.roleType === 'MAIN'
                          ? 'bg-[#ab3429]/10 text-[#ab3429]'
                          : char.roleType === 'ANTAGONIST'
                            ? 'bg-stone-800/10 text-stone-800'
                            : char.roleType === 'NARRATOR'
                              ? 'bg-emerald-700/10 text-emerald-700'
                              : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {char.roleType === 'MAIN'
                        ? 'Nhân vật chính'
                        : char.roleType === 'ANTAGONIST'
                          ? 'Phản diện'
                          : char.roleType === 'NARRATOR'
                            ? 'Người kể chuyện'
                            : 'Nhân vật phụ'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-white/90 backdrop-blur shadow-sm border border-outline-variant/20 rounded-lg p-1">
                  <button
                    onClick={() => openForm('character', char)}
                    className="p-1.5 text-primary hover:bg-surface-container-high rounded-md transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick('character', char)}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mt-2 flex-1">
                {char.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
