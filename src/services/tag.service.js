import { apiClient } from '../lib/api'

export const fetchTags = async () => {
  const response = await apiClient.get('/v1/tags')
  return response.data.result
}

// ==========================================
// ADMIN APIS
// ==========================================

export const createTag = async (data) => {
  const response = await apiClient.post('/v1/admin/tags', data)
  return response.data.result
}

export const updateTag = async ({ id, data }) => {
  const response = await apiClient.patch(`/v1/admin/tags/${id}`, data)
  return response.data.result
}

export const deleteTag = async (id) => {
  const response = await apiClient.delete(`/v1/admin/tags/${id}`)
  return response.data
}
