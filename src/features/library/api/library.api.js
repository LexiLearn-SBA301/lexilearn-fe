import { apiClient } from '../../../lib/api'

export const fetchTags = async () => {
  const response = await apiClient.get('/v1/tags')
  return response.data.result
}
export const fetchWorks = async (params) => {
  const response = await apiClient.get('/v1/works', { params })
  return response.data.result
}
export const fetchWorkDetail = async (slug) => {
  const response = await apiClient.get(`/v1/works/${slug}`)
  return response.data.result
}

// ==========================================
// ADMIN APIS
// ==========================================

export const createWork = async (data) => {
  const response = await apiClient.post('/v1/admin/works', data)
  return response.data.result
}

export const updateWork = async ({ id, data }) => {
  const response = await apiClient.patch(`/v1/admin/works/${id}`, data)
  return response.data.result
}

export const deleteWork = async (id) => {
  const response = await apiClient.delete(`/v1/admin/works/${id}`)
  return response.data
}
