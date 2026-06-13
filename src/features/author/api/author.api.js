import { apiClient } from '../../../lib/api'

export const fetchAuthors = async (params) => {
  const response = await apiClient.get('/authors', { params })
  return response.data
}
export const fetchAuthorDetail = async (slug) => {
  const response = await apiClient.get(`/authors/${slug}`)
  return response.data
}
