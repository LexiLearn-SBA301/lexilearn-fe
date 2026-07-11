import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchWorkSections,
  fetchWorkSectionDetail,
  fetchWorkSectionsFull,
  fetchWorkCharacters,
  fetchArtisticFeatures,
  createWorkSection,
  updateWorkSection,
  deleteWorkSection,
  createWorkCharacter,
  updateWorkCharacter,
  deleteWorkCharacter,
  createArtisticFeature,
  updateArtisticFeature,
  deleteArtisticFeature,
} from '../../../services/workDetail.service'

// ============================================================================
// 📖 PHẦN 1: USER HOOKS (Dành cho trang Đọc sách / Hiển thị)
// ============================================================================

// Hook lấy danh sách mục lục (Menu Sidebar)
export const useGetSections = (workId) => {
  return useQuery({
    queryKey: ['sections', workId],
    queryFn: () => fetchWorkSections(workId),
    enabled: !!workId, // Chỉ chạy khi đã có workId
  })
}

// Hook lấy chi tiết text để đọc (Main Content)
export const useGetSectionDetail = (workId, sectionId, enabled = true) => {
  return useQuery({
    queryKey: ['section', workId, sectionId],
    queryFn: () => fetchWorkSectionDetail(workId, sectionId),
    enabled: !!workId && !!sectionId && enabled, // Chỉ chạy khi có đủ ID và enabled
  })
}

// Hook lấy toàn bộ nội dung các mục lục (Dành cho tác phẩm thơ thuần)
export const useGetFullSections = (workId, enabled = true) => {
  return useQuery({
    queryKey: ['sections-full', workId],
    queryFn: () => fetchWorkSectionsFull(workId),
    enabled: !!workId && enabled,
  })
}

// Hook lấy danh sách nhân vật
export const useGetCharacters = (workId) => {
  return useQuery({
    queryKey: ['characters', workId],
    queryFn: () => fetchWorkCharacters(workId),
    enabled: !!workId,
  })
}

// Hook lấy danh sách đặc điểm nghệ thuật
export const useGetArtisticFeatures = (workId) => {
  return useQuery({
    queryKey: ['artisticFeatures', workId],
    queryFn: () => fetchArtisticFeatures(workId),
    enabled: !!workId,
  })
}

// ============================================================================
// 🛠️ PHẦN 2: ADMIN HOOKS (Dành cho trang Quản lý / Chỉnh sửa nội dung)
// ============================================================================

// --- ADMIN WORK SECTIONS ---
export const useCreateWorkSection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWorkSection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sections', variables.workId],
      })
      queryClient.invalidateQueries({
        queryKey: ['sections-full', variables.workId],
      })
    },
  })
}

export const useUpdateWorkSection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateWorkSection,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
      queryClient.invalidateQueries({ queryKey: ['sections-full'] })
      queryClient.invalidateQueries({
        queryKey: ['section', variables.sectionId],
      })
    },
  })
}

export const useDeleteWorkSection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWorkSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
      queryClient.invalidateQueries({ queryKey: ['sections-full'] })
    },
  })
}

// --- ADMIN WORK CHARACTERS ---
export const useCreateWorkCharacter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWorkCharacter,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['characters', variables.workId],
      })
    },
  })
}

export const useUpdateWorkCharacter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateWorkCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] })
    },
  })
}

export const useDeleteWorkCharacter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWorkCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] })
    },
  })
}

// --- ADMIN ARTISTIC FEATURES ---
export const useCreateArtisticFeature = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createArtisticFeature,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['artisticFeatures', variables.workId],
      })
    },
  })
}

export const useUpdateArtisticFeature = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateArtisticFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artisticFeatures'] })
    },
  })
}

export const useDeleteArtisticFeature = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteArtisticFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artisticFeatures'] })
    },
  })
}
