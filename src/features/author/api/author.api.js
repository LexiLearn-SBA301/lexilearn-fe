import { apiClient } from '../../../lib/api'

export const fetchAuthors = async (params) => {
  const response = await apiClient.get('/v1/authors', { params })
  return response.data.result
}
export const fetchAuthorDetail = async (slug) => {
  const response = await apiClient.get(`/v1/authors/${slug}`)
  return response.data.result
}
export const createAuthor = async (data) => {
  const response = await apiClient.post('/v1/admin/authors', data)
  return response.data.result
}

export const updateAuthor = async ({ id, data }) => {
  const response = await apiClient.patch(`/v1/admin/authors/${id}`, data)
  return response.data.result
}

export const deleteAuthor = async (id) => {
  const response = await apiClient.delete(`/v1/admin/authors/${id}`)
  return response.data
}
