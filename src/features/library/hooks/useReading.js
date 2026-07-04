import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchBookmarks,
  upsertBookmark,
  deleteBookmark,
  fetchSectionNotes,
  createNote,
  deleteNote,
} from '../../../services/reading.service'

// -- BOOKMARKS --
export const useGetBookmarks = (enabled = true) => {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: fetchBookmarks,
    enabled,
  })
}

export const useUpsertBookmark = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertBookmark,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to prevent them from overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] })

      // Snapshot the previous value
      const previousBookmarks = queryClient.getQueryData(['bookmarks'])

      // Optimistically update to the new value
      if (previousBookmarks) {
        queryClient.setQueryData(['bookmarks'], (old) => {
          if (!old) return old
          const existingIdx = old.findIndex(
            (b) => b.work?.id === variables.workId,
          )
          if (existingIdx >= 0) {
            const updated = [...old]
            updated[existingIdx] = {
              ...updated[existingIdx],
              position: variables.data.position,
              progressPercent: variables.data.progressPercent,
              isCompleted: variables.data.isCompleted,
            }
            return updated
          } else {
            return [
              ...old,
              {
                work: { id: variables.workId },
                position: variables.data.position,
                progressPercent: variables.data.progressPercent,
                isCompleted: variables.data.isCompleted,
              },
            ]
          }
        })
      }

      return { previousBookmarks }
    },
    onError: (err, newBookmark, context) => {
      // Rollback to previous state on error
      if (context?.previousBookmarks) {
        queryClient.setQueryData(['bookmarks'], context.previousBookmarks)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is synced
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
}

export const useDeleteBookmark = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
}

// -- NOTES --
export const useGetSectionNotes = (sectionId, enabled = true) => {
  return useQuery({
    queryKey: ['notes', sectionId],
    queryFn: () => fetchSectionNotes(sectionId),
    enabled: !!sectionId && enabled,
  })
}

export const useCreateNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createNote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['notes', variables.sectionId],
      })
    },
  })
}

export const useDeleteNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      // Invalidate both generally and for a specific section if known.
      // Easiest is to invalidate all notes or pass sectionId in variables if needed.
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}
