import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronLeft,
  FileText,
  Users,
  Sparkles,
  Loader2,
  Feather,
  BookOpen,
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
import { AdminWorkDetailSections } from '../components/AdminWorkDetailSections'
import { AdminWorkDetailCharacters } from '../components/AdminWorkDetailCharacters'
import { AdminWorkDetailFeatures } from '../components/AdminWorkDetailFeatures'

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
        await deleteSection.mutateAsync({ workId: work.id, sectionId: item.id })
      if (type === 'character')
        await deleteChar.mutateAsync({ workId: work.id, characterId: item.id })
      if (type === 'feature')
        await deleteFeature.mutateAsync({ workId: work.id, featureId: item.id })
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
            className="inline-flex items-center text-sm font-bold text-on-surface-variant hover:text-primary mb-6 transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" /> Quay lại kho sách
          </Link>
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {work.coverUrl ? (
              <img
                src={work.coverUrl}
                alt={work.title}
                className="w-28 h-40 object-cover rounded-2xl shadow-xl border border-outline-variant/20"
              />
            ) : (
              <div className="w-28 h-40 rounded-2xl bg-surface-container-high flex items-center justify-center border border-outline-variant/30 shadow-sm">
                <BookOpen size={32} className="text-on-surface-variant/50" />
              </div>
            )}
            <div>
              <div className="inline-block px-3 py-1 bg-[#ab3429]/10 text-[#ab3429] text-xs font-bold uppercase tracking-widest rounded-lg mb-3">
                Quản lý nội dung tác phẩm
              </div>
              <h1 className="font-title text-4xl md:text-5xl font-extrabold text-primary mb-3 leading-tight">
                {work.title}
              </h1>
              <p className="text-lg text-on-surface-variant font-medium flex items-center gap-2">
                <Feather size={18} /> {work.authorName}{' '}
                <span className="opacity-50">•</span> {work.genre}
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
        <div className="min-h-[400px]">
          {/* RENDERING SECTIONS LIST */}
          {activeTab === 'sections' && (
            <AdminWorkDetailSections
              sections={sections}
              isLoading={isSectionsLoading}
              openForm={openForm}
              handleDeleteClick={handleDeleteClick}
              isFetchingDetail={isFetchingDetail}
              fetchingItemId={fetchingItemId}
            />
          )}

          {/* RENDERING CHARACTERS LIST */}
          {activeTab === 'characters' && (
            <AdminWorkDetailCharacters
              characters={characters}
              isLoading={isCharsLoading}
              openForm={openForm}
              handleDeleteClick={handleDeleteClick}
            />
          )}

          {/* RENDERING ARTISTIC FEATURES */}
          {activeTab === 'features' && (
            <AdminWorkDetailFeatures
              features={features}
              isLoading={isFeaturesLoading}
              openForm={openForm}
              handleDeleteClick={handleDeleteClick}
            />
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
