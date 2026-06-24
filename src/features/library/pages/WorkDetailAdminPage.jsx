import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronLeft,
  FileText,
  Users,
  Sparkles,
  Loader2,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'
import { useWorkDetail } from '../hooks/useLibrary'
import { fetchWorkSectionDetail } from '../../../services/workDetail.service'
import {
  useGetSections,
  useGetCharacters,
  useGetArtisticFeatures,
  useCreateWorkSection,
  useUpdateWorkSection,
  useDeleteWorkSection,
  useCreateWorkCharacter,
  useUpdateWorkCharacter,
  useDeleteWorkCharacter,
  useCreateArtisticFeature,
  useUpdateArtisticFeature,
  useDeleteArtisticFeature,
} from '../hooks/useWorkSection'
import {
  SectionFormDialog,
  CharacterFormDialog,
  ArtisticFeatureFormDialog,
  ConfirmDeleteDialog,
} from '../components/WorkDetailForms'

export const WorkDetailAdminPage = () => {
  const { slug } = useParams()
  const [activeTab, setActiveTab] = useState('sections') // 'sections' | 'characters' | 'features'

  const { data: work, isLoading: isWorkLoading } = useWorkDetail(slug)

  const { data: sections, isLoading: isSectionsLoading } = useGetSections(
    work?.id,
  )
  const { data: characters, isLoading: isCharsLoading } = useGetCharacters(
    work?.id,
  )
  const { data: features, isLoading: isFeaturesLoading } =
    useGetArtisticFeatures(work?.id)

  // -- MUTATIONS --
  const createSection = useCreateWorkSection()
  const updateSection = useUpdateWorkSection()
  const deleteSection = useDeleteWorkSection()

  const createChar = useCreateWorkCharacter()
  const updateChar = useUpdateWorkCharacter()
  const deleteChar = useDeleteWorkCharacter()

  const createFeature = useCreateArtisticFeature()
  const updateFeature = useUpdateArtisticFeature()
  const deleteFeature = useDeleteArtisticFeature()

  // -- FORM STATES --
  const [editingItem, setEditingItem] = useState(null)
  const [formType, setFormType] = useState(null) // 'section' | 'character' | 'feature' | null
  const [isFetchingDetail, setIsFetchingDetail] = useState(false)
  const [fetchingItemId, setFetchingItemId] = useState(null)

  // -- DELETE STATES --
  const [deleteData, setDeleteData] = useState(null) // { type: 'section', item: {} }

  const openForm = async (type, item = null) => {
    if (item && type === 'section') {
      try {
        setFetchingItemId(item.id)
        setIsFetchingDetail(true)
        // Gọi API lấy full detail để có được trường `content`
        const detailData = await fetchWorkSectionDetail(work.id, item.id)
        setEditingItem(detailData)
        setFormType(type)
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết chương:', error)
        alert('Không thể lấy nội dung chi tiết để chỉnh sửa!')
      } finally {
        setIsFetchingDetail(false)
        setFetchingItemId(null)
      }
    } else {
      setEditingItem(item)
      setFormType(type)
    }
  }

  const closeForm = () => {
    setFormType(null)
    setEditingItem(null)
  }

  // -- SUBMIT HANDLERS --
  const onSectionSubmit = async (data) => {
    try {
      if (editingItem) {
        await updateSection.mutateAsync({
          workId: work.id,
          sectionId: editingItem.id,
          data,
        })
      } else {
        await createSection.mutateAsync({ workId: work.id, data })
      }
      closeForm()
    } catch (e) {
      console.error(e)
    }
  }

  const onCharSubmit = async (data) => {
    try {
      if (editingItem) {
        await updateChar.mutateAsync({
          workId: work.id,
          characterId: editingItem.id,
          data,
        })
      } else {
        await createChar.mutateAsync({ workId: work.id, data })
      }
      closeForm()
    } catch (e) {
      console.error(e)
    }
  }

  const onFeatureSubmit = async (data) => {
    try {
      if (editingItem) {
        await updateFeature.mutateAsync({
          workId: work.id,
          featureId: editingItem.id,
          data,
        })
      } else {
        await createFeature.mutateAsync({ workId: work.id, data })
      }
      closeForm()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteClick = (type, item) => {
    setDeleteData({ type, item })
  }

  const confirmDelete = async () => {
    if (!deleteData) return
    const { type, item } = deleteData

    try {
      if (type === 'section')
        await deleteSection.mutateAsync({ sectionId: item.id })
      if (type === 'character')
        await deleteChar.mutateAsync({ characterId: item.id })
      if (type === 'feature')
        await deleteFeature.mutateAsync({ featureId: item.id })
    } finally {
      setDeleteData(null)
    }
  }

  if (isWorkLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  if (!work) {
    return <div className="text-center p-20">Không tìm thấy tác phẩm!</div>
  }

  const tabs = [
    {
      id: 'sections',
      label: 'Chương / Trích đoạn',
      icon: FileText,
      count: sections?.length || 0,
    },
    {
      id: 'characters',
      label: 'Tuyến nhân vật',
      icon: Users,
      count: characters?.length || 0,
    },
    {
      id: 'features',
      label: 'Nghệ thuật đặc sắc',
      icon: Sparkles,
      count: features?.length || 0,
    },
  ]

  return (
    <div className="bg-background min-h-screen p-6 md:p-10 font-body">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/thu-vien"
            className="inline-flex items-center text-sm font-bold text-on-surface-variant hover:text-primary mb-4 transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" /> Quay lại kho sách
          </Link>
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-bright-cream p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
            {work.coverUrl && (
              <img
                src={work.coverUrl}
                alt={work.title}
                className="w-20 h-28 object-cover rounded-lg shadow-md"
              />
            )}
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#ab3429] mb-1">
                Quản lý nội dung tác phẩm
              </div>
              <h1 className="font-title text-3xl font-extrabold text-primary mb-2">
                {work.title}
              </h1>
              <p className="text-on-surface-variant font-medium">
                {work.authorName} • {work.genre}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 p-1 bg-surface-container-high rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-white/50 hover:text-primary'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#ab3429]' : ''} />
                {tab.label}
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="bg-bright-cream rounded-3xl border border-outline-variant/30 p-6 md:p-8 shadow-sm min-h-[400px]">
          {/* TOP BAR của mỗi tab */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-title text-2xl font-bold text-primary">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <button
              onClick={() =>
                openForm(
                  activeTab === 'sections'
                    ? 'section'
                    : activeTab === 'characters'
                      ? 'character'
                      : 'feature',
                )
              }
              className="px-4 py-2 bg-[#ab3429] text-white rounded-xl font-bold hover:bg-[#8a1c14] transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} /> Thêm mới
            </button>
          </div>

          {/* RENDERING SECTIONS LIST */}
          {activeTab === 'sections' && (
            <div>
              {isSectionsLoading ? (
                <div className="text-center py-10">
                  <Loader2 className="animate-spin mx-auto text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {sections?.length === 0 ? (
                    <p className="text-center text-on-surface-variant py-10">
                      Chưa có nội dung nào.
                    </p>
                  ) : null}
                  {sections?.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/30 bg-white hover:border-primary/30 transition-colors group"
                    >
                      <div>
                        <h4 className="font-bold text-lg text-primary">
                          {section.title || `Chương ${section.number}`}
                        </h4>
                        <div className="flex gap-3 text-sm text-on-surface-variant mt-1">
                          <span className="font-medium px-2 py-0.5 bg-surface-container rounded-md">
                            Chương {section.number}
                          </span>
                          <span className="font-medium px-2 py-0.5 bg-surface-container rounded-md">
                            {section.contentType === 'POETRY'
                              ? 'Thơ'
                              : 'Văn xuôi'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openForm('section', section)}
                          disabled={
                            isFetchingDetail && fetchingItemId === section.id
                          }
                          className="p-2 text-primary hover:bg-surface-container-high rounded-lg disabled:opacity-50"
                        >
                          {isFetchingDetail && fetchingItemId === section.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Edit size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick('section', section)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RENDERING CHARACTERS LIST */}
          {activeTab === 'characters' && (
            <div>
              {isCharsLoading ? (
                <div className="text-center py-10">
                  <Loader2 className="animate-spin mx-auto text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {characters?.length === 0 ? (
                    <p className="text-center text-on-surface-variant py-10 col-span-full">
                      Chưa có nhân vật nào.
                    </p>
                  ) : null}
                  {characters?.map((char) => (
                    <div
                      key={char.id}
                      className="p-4 rounded-2xl border border-outline-variant/30 bg-white hover:border-primary/30 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-primary">
                          {char.name}
                        </h4>
                        <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openForm('character', char)}
                            className="p-1.5 text-primary hover:bg-surface-container-high rounded-lg"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick('character', char)}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <span
                        className={`inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-md mb-2 ${char.role === 'Chính' ? 'bg-[#ab3429]/10 text-[#ab3429]' : 'bg-surface-container text-on-surface-variant'}`}
                      >
                        {char.role}
                      </span>
                      <p className="text-sm text-on-surface-variant line-clamp-2">
                        {char.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RENDERING ARTISTIC FEATURES */}
          {activeTab === 'features' && (
            <div>
              {isFeaturesLoading ? (
                <div className="text-center py-10">
                  <Loader2 className="animate-spin mx-auto text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {features?.length === 0 ? (
                    <p className="text-center text-on-surface-variant py-10">
                      Chưa có đặc sắc nghệ thuật nào.
                    </p>
                  ) : null}
                  {features?.map((feature) => (
                    <div
                      key={feature.id}
                      className="p-4 rounded-2xl border border-outline-variant/30 bg-white hover:border-primary/30 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-primary">
                          {feature.name}
                        </h4>
                        <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openForm('feature', feature)}
                            className="p-2 text-primary hover:bg-surface-container-high rounded-lg"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClick('feature', feature)
                            }
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-3">
                        {feature.description}
                      </p>
                      {feature.example && (
                        <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 italic text-sm text-[#231a0c] font-quote">
                          "{feature.example}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SectionFormDialog
        isOpen={formType === 'section'}
        onClose={closeForm}
        data={editingItem}
        onSubmit={onSectionSubmit}
        isPending={createSection.isPending || updateSection.isPending}
      />

      <CharacterFormDialog
        isOpen={formType === 'character'}
        onClose={closeForm}
        data={editingItem}
        onSubmit={onCharSubmit}
        isPending={createChar.isPending || updateChar.isPending}
      />

      <ArtisticFeatureFormDialog
        isOpen={formType === 'feature'}
        onClose={closeForm}
        data={editingItem}
        onSubmit={onFeatureSubmit}
        isPending={createFeature.isPending || updateFeature.isPending}
      />

      {/* DELETE CONFIRMATION */}
      <ConfirmDeleteDialog
        isOpen={!!deleteData}
        onClose={() => setDeleteData(null)}
        onConfirm={confirmDelete}
        itemName={
          deleteData?.item?.title ||
          deleteData?.item?.name ||
          `Chương ${deleteData?.item?.number}`
        }
        isPending={
          deleteSection.isPending ||
          deleteChar.isPending ||
          deleteFeature.isPending
        }
      />
    </div>
  )
}
