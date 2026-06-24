import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAuthors,
  fetchAuthorDetail,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../../../services/author.service'
export const useAuthors = (filters) => {
  return useQuery({
    queryKey: ['authors', filters],
    queryFn: () => fetchAuthors(filters),
    keepPreviousData: true,
  })
}
export const useAuthorDetail = (slug) => {
  return useQuery({
    queryKey: ['author', slug],
    queryFn: () => fetchAuthorDetail(slug),
    enabled: !!slug, // Chỉ gọi khi có slug
  })
}
export const useCreateAuthor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAuthor,
    onSuccess: () => {
      // Ép cái GET list tác giả gọi lại API để load data mới
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    },
  })
}

export const useUpdateAuthor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAuthor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      // Ép cái trang chi tiết của tác giả này load lại luôn (dùng slug hoặc id)
      queryClient.invalidateQueries({ queryKey: ['author'] })
    },
  })
}

export const useDeleteAuthor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAuthor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    },
  })
}
