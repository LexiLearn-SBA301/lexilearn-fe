import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchWorks,
  fetchWorkDetail,
  fetchGenres,
  fetchSubGenres,
  createWork,
  updateWork,
  deleteWork,
} from '../../../services/library.service'

// Hook lấy danh sách Tác phẩm (Tự động fetch lại khi filters thay đổi)
export const useWorks = (filters) => {
  return useQuery({
    queryKey: ['works', filters],
    queryFn: () => fetchWorks(filters),
    keepPreviousData: true, // Giúp giao diện mượt hơn khi chuyển trang/lọc
  })
}
export const useWorkDetail = (slug) => {
  return useQuery({
    queryKey: ['work', slug],
    queryFn: () => fetchWorkDetail(slug),
    enabled: !!slug,
  })
}

export const useGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: fetchGenres,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export const useSubGenres = (genre) => {
  return useQuery({
    queryKey: ['sub-genres', genre],
    queryFn: () => fetchSubGenres(genre),
    staleTime: 1000 * 60 * 60,
  })
}
// --- ADMIN HOOKS ---

export const useCreateWork = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] })
    },
  })
}

export const useUpdateWork = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateWork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] })
      // Nếu bác muốn update chi tiết lập tức thì có thể invalidate thêm ['work']
    },
  })
}

export const useDeleteWork = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] })
    },
  })
}
