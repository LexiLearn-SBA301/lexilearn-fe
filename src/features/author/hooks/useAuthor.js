import { useQuery } from '@tanstack/react-query'
import { fetchAuthors, fetchAuthorDetail } from '../api/author.api'

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
