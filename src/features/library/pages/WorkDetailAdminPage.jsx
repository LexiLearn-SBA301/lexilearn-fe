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
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useWorkDetail } from '../hooks/useLibrary'
import { fetchWorkSectionDetail } from '../../../services/workDetail.service'
import {
  useGetAdminCommentaries,
  useCreateCommentary,
  useUpdateCommentary,
  useDeleteCommentary,
} from '../hooks/useCommentary'
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
  CommentaryFormDialog,
} from '../components/WorkDetailForms'
import { AdminWorkDetailSections } from '../components/AdminWorkDetailSections'
import { AdminWorkDetailCharacters } from '../components/AdminWorkDetailCharacters'
import { AdminWorkDetailFeatures } from '../components/AdminWorkDetailFeatures'
import { AdminWorkDetailCommentaries } from '../components/AdminWorkDetailCommentaries'
import { MessageSquare } from 'lucide-react'

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

  const { data: commentariesData, isLoading: isCommentariesLoading } =
    useGetAdminCommentaries(work?.id, { page: 0, size: 50 })
  const commentaries = commentariesData?.content || []

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

  const createCommentary = useCreateCommentary()
  const updateCommentary = useUpdateCommentary()
  const deleteCommentary = useDeleteCommentary()

  // -- TOAST NOTIFICATION --
  const [toast, setToast] = useState(null)
  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 3500)
  }

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
        showToast('success', 'Cập nhật chương thành công!')
      } else {
        await createSection.mutateAsync({ workId: work.id, data })
        showToast('success', 'Thêm chương mới thành công!')
      }
      closeForm()
    } catch (e) {
      console.error(e)
      showToast('error', 'Lưu chương thất bại! Vui lòng kiểm tra lại.')
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
        showToast('success', 'Cập nhật nhân vật thành công!')
      } else {
        await createChar.mutateAsync({ workId: work.id, data })
        showToast('success', 'Thêm nhân vật mới thành công!')
      }
      closeForm()
    } catch (e) {
      console.error(e)
      showToast('error', 'Lưu nhân vật thất bại! Vui lòng kiểm tra lại.')
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
        showToast('success', 'Cập nhật đặc sắc nghệ thuật thành công!')
      } else {
        await createFeature.mutateAsync({ workId: work.id, data })
        showToast('success', 'Thêm đặc sắc nghệ thuật thành công!')
      }
      closeForm()
    } catch (e) {
      console.error(e)
      showToast(
        'error',
        'Lưu đặc sắc nghệ thuật thất bại! Vui lòng kiểm tra lại.',
      )
    }
  }

  const onCommentarySubmit = async (data) => {
    try {
      if (editingItem) {
        await updateCommentary.mutateAsync({
          workId: work.id,
          commentaryId: editingItem.id,
          data,
        })
        showToast('success', 'Cập nhật bình phẩm thành công!')
      } else {
        await createCommentary.mutateAsync({ workId: work.id, data })
        showToast('success', 'Thêm bình phẩm mới thành công!')
      }
      closeForm()
    } catch (e) {
      console.error(e)
      showToast('error', 'Lưu bình phẩm thất bại! Vui lòng kiểm tra lại.')
    }
  }

  const handleDeleteClick = (type, item) => {
    setDeleteData({ type, item })
  }

  const confirmDelete = async () => {
    if (!deleteData) return
    const { type, item } = deleteData

    try {
      if (type === 'section') {
        await deleteSection.mutateAsync({ workId: work.id, sectionId: item.id })
        showToast('success', 'Xóa chương thành công!')
      }
      if (type === 'character') {
        await deleteChar.mutateAsync({ workId: work.id, characterId: item.id })
        showToast('success', 'Xóa nhân vật thành công!')
      }
      if (type === 'feature') {
        await deleteFeature.mutateAsync({ workId: work.id, featureId: item.id })
        showToast('success', 'Xóa đặc sắc nghệ thuật thành công!')
      }
      if (type === 'commentary') {
        await deleteCommentary.mutateAsync({
          workId: work.id,
          commentaryId: item.id,
        })
        showToast('success', 'Xóa bình phẩm thành công!')
      }
    } catch (e) {
      console.error(e)
      showToast('error', 'Xóa thất bại! Vui lòng thử lại.')
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
    {
      id: 'commentaries',
      label: 'Bình phẩm',
      icon: MessageSquare,
      count: commentaries?.length || 0,
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

          {/* RENDERING COMMENTARIES */}
          {activeTab === 'commentaries' && (
            <AdminWorkDetailCommentaries
              commentaries={commentaries}
              isLoading={isCommentariesLoading}
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

      <CommentaryFormDialog
        isOpen={formType === 'commentary'}
        onClose={closeForm}
        data={editingItem}
        onSubmit={onCommentarySubmit}
        isPending={createCommentary.isPending || updateCommentary.isPending}
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
          deleteFeature.isPending ||
          deleteCommentary.isPending
        }
      />

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 border ${
            toast.type === 'success'
              ? 'bg-[#004943] text-white border-[#79b8af]/30 shadow-[#004943]/30'
              : 'bg-[#ab3429] text-white border-white/20 shadow-[#ab3429]/30'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={22} className="text-[#79b8af] shrink-0" />
          ) : (
            <AlertCircle size={22} className="text-white shrink-0" />
          )}
          <span className="font-bold text-sm tracking-wide">
            {toast.message}
          </span>
        </div>
      )}
    </div>
  )
}
