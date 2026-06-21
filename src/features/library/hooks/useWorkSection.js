import { useQuery } from '@tanstack/react-query'
import {
  fetchWorkSections,
  fetchWorkSectionDetail,
  fetchWorkCharacters,
  fetchArtisticFeatures,
} from '../api/workDetail.api'

// Hook lấy danh sách mục lục (Menu Sidebar)
export const useGetSections = (workId) => {
  return useQuery({
    queryKey: ['sections', workId],
    queryFn: () => fetchWorkSections(workId),
    enabled: !!workId, // Chỉ chạy khi đã có workId
  })
}

// Hook lấy chi tiết text để đọc (Main Content)
export const useGetSectionDetail = (sectionId) => {
  return useQuery({
    queryKey: ['section', sectionId],
    queryFn: () => fetchWorkSectionDetail(sectionId),
    enabled: !!sectionId, // Chỉ chạy khi có ID
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
