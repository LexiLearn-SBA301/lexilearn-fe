import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
} from '../../../services/tag.service'

// Hook lấy danh sách Thẻ
export const useTags = (params) => {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: fetchTags,
    staleTime: 1000 * 60 * 60,
  })
}

// --- ADMIN HOOKS ---

export const useCreateTag = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      // Ép gọi lại API lấy danh sách sau khi tạo thành công
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

export const useUpdateTag = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

export const useDeleteTag = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}
