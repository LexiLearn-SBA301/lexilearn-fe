import { apiClient } from '../../../lib/api'

export const fetchTags = async () => {
  const response = await apiClient.get('/tags')
  return response.data
}
export const fetchWorks = async (params) => {
  const response = await apiClient.get('/works', { params })
  return response.data
}
export const fetchWorkDetail = async (slug) => {
  const response = await apiClient.get(`/works/${slug}`)
  return response.data
}
