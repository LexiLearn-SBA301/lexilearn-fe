import { apiClient } from '../lib/api'

// ---------------------------------------------------------
// PUBLIC API (Khách)
// ---------------------------------------------------------
export const fetchPublicReviews = async (workId, params = {}) => {
  const {
    page = 0,
    size = 10,
    sortDir = 'desc',
    sortBy = 'reviewedAt',
  } = params
  const res = await apiClient.get(`v1/works/${workId}/reviews`, {
    params: { page, size, sortDir, sortBy },
  })
  return res.data.result
}

// ---------------------------------------------------------
// USER API (Người dùng gửi đánh giá)
// ---------------------------------------------------------
export const createWorkReview = async ({ workId, data }) => {
  const res = await apiClient.post(`v1/works/${workId}/reviews`, data)
  return res.data.result
}

// ---------------------------------------------------------
// ME API (Người dùng quản lý đánh giá của mình)
// ---------------------------------------------------------
export const fetchMyReviews = async (params = {}) => {
  const { page = 0, size = 10, sortDir = 'desc', sortBy = 'updatedAt' } = params
  const res = await apiClient.get(`v1/me/reviews`, {
    params: { page, size, sortDir, sortBy },
  })
  return res.data.result
}

export const fetchMyReviewDetail = async (reviewId) => {
  const res = await apiClient.get(`v1/me/reviews/${reviewId}`)
  return res.data.result
}

export const updateMyReview = async ({ reviewId, data }) => {
  const res = await apiClient.patch(`v1/me/reviews/${reviewId}`, data)
  return res.data.result
}

export const deleteMyReview = async (reviewId) => {
  const res = await apiClient.delete(`v1/me/reviews/${reviewId}`)
  return res.data
}
