import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPublicReviews,
  createWorkReview,
  fetchMyReviews,
  fetchMyReviewDetail,
  updateMyReview,
  deleteMyReview,
  fetchAdminReviewRevisions,
  fetchAdminReviewRevisionDetail,
  moderateReviewRevision,
} from '../../../services/review.service'

// ---------------------------------------------------------
// PUBLIC HOOKS
// ---------------------------------------------------------
export const useGetPublicReviews = (workId, params = {}, enabled = true) => {
  return useQuery({
    queryKey: ['public-reviews', workId, params],
    queryFn: () => fetchPublicReviews(workId, params),
    enabled: !!workId && enabled,
  })
}

// ---------------------------------------------------------
// USER HOOKS
// ---------------------------------------------------------
export const useCreateWorkReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWorkReview,
    onSuccess: (_, variables) => {
      // Invalidate both public reviews for this work and my reviews
      queryClient.invalidateQueries({
        queryKey: ['public-reviews', variables.workId],
      })
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] })
    },
  })
}

export const useGetMyReviews = (params = {}) => {
  return useQuery({
    queryKey: ['my-reviews', params],
    queryFn: () => fetchMyReviews(params),
  })
}

export const useGetMyReviewDetail = (reviewId, enabled = true) => {
  return useQuery({
    queryKey: ['my-review-detail', reviewId],
    queryFn: () => fetchMyReviewDetail(reviewId),
    enabled: !!reviewId && enabled,
  })
}

export const useUpdateMyReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMyReview,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] })
      queryClient.invalidateQueries({
        queryKey: ['my-review-detail', variables.reviewId],
      })
      queryClient.invalidateQueries({ queryKey: ['public-reviews'] })
    },
  })
}

export const useDeleteMyReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMyReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['public-reviews'] })
    },
  })
}

// ---------------------------------------------------------
// ADMIN HOOKS
// ---------------------------------------------------------
export const useGetAdminReviewRevisions = (params = {}) => {
  return useQuery({
    queryKey: ['admin-review-revisions', params],
    queryFn: () => fetchAdminReviewRevisions(params),
  })
}

export const useGetAdminReviewRevisionDetail = (revisionId, enabled = true) => {
  return useQuery({
    queryKey: ['admin-review-revision-detail', revisionId],
    queryFn: () => fetchAdminReviewRevisionDetail(revisionId),
    enabled: !!revisionId && enabled,
  })
}

export const useModerateReviewRevision = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: moderateReviewRevision,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-review-revisions'] })
      queryClient.invalidateQueries({
        queryKey: ['admin-review-revision-detail', variables.revisionId],
      })
      queryClient.invalidateQueries({ queryKey: ['public-reviews'] })
    },
  })
}
