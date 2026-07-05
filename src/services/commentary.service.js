import { apiClient } from '../lib/api'

// PUBLIC API
export const fetchPublicCommentaries = async (workId, params = {}) => {
  const {
    page = 0,
    size = 10,
    sortDir = 'asc',
    sortBy = 'displayOrder',
  } = params
  const res = await apiClient.get(`v1/works/${workId}/commentaries`, {
    params: { page, size, sortDir, sortBy },
  })
  return res.data.result
}

// ADMIN API
export const fetchAdminCommentaries = async (workId, params = {}) => {
  const {
    page = 0,
    size = 10,
    sortDir = 'asc',
    sortBy = 'displayOrder',
  } = params
  const res = await apiClient.get(`v1/works/admin/${workId}/commentaries`, {
    params: { page, size, sortDir, sortBy },
  })
  return res.data.result
}

export const createCommentary = async ({ workId, data }) => {
  const res = await apiClient.post(
    `v1/works/admin/${workId}/commentaries`,
    data,
  )
  return res.data.result
}

export const updateCommentary = async ({ workId, commentaryId, data }) => {
  const res = await apiClient.patch(
    `v1/works/admin/${workId}/commentaries/${commentaryId}`,
    data,
  )
  return res.data.result
}

export const deleteCommentary = async ({ workId, commentaryId }) => {
  const res = await apiClient.delete(
    `v1/works/admin/${workId}/commentaries/${commentaryId}`,
  )
  return res.data
}
