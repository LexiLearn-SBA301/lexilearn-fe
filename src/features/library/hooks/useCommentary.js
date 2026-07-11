import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPublicCommentaries,
  fetchAdminCommentaries,
  createCommentary,
  updateCommentary,
  deleteCommentary,
} from '../../../services/commentary.service'

export const useGetPublicCommentaries = (
  workId,
  params = {},
  enabled = true,
) => {
  return useQuery({
    queryKey: ['public-commentaries', workId, params],
    queryFn: () => fetchPublicCommentaries(workId, params),
    enabled: !!workId && enabled,
  })
}

export const useGetAdminCommentaries = (
  workId,
  params = {},
  enabled = true,
) => {
  return useQuery({
    queryKey: ['admin-commentaries', workId, params],
    queryFn: () => fetchAdminCommentaries(workId, params),
    enabled: !!workId && enabled,
  })
}

export const useCreateCommentary = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCommentary,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-commentaries', variables.workId],
      })
      queryClient.invalidateQueries({
        queryKey: ['public-commentaries', variables.workId],
      })
    },
  })
}

export const useUpdateCommentary = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCommentary,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-commentaries', variables.workId],
      })
      queryClient.invalidateQueries({
        queryKey: ['public-commentaries', variables.workId],
      })
    },
  })
}

export const useDeleteCommentary = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCommentary,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-commentaries', variables.workId],
      })
      queryClient.invalidateQueries({
        queryKey: ['public-commentaries', variables.workId],
      })
    },
  })
}
