import { useQuery } from '@tanstack/react-query'
import { fetchTags, fetchWorks, fetchWorkDetail } from '../api/library.api'

// Hook lấy danh sách Thẻ
export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
    staleTime: 1000 * 60 * 60, // Cache 1 tiếng vì Tags ít khi thay đổi
  })
}
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
    enabled: !!slug, // Chỉ gọi API khi có slug
  })
}
