import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchWorks,
  fetchWorkDetail,
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
