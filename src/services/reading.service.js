import { apiClient } from '../lib/api'

// -- BOOKMARKS --
export const fetchBookmarks = async () => {
  const response = await apiClient.get('/v1/me/bookmarks')
  return response.data.result
}

export const upsertBookmark = async ({ workId, data }) => {
  const response = await apiClient.put(`/v1/me/bookmarks/${workId}`, data)
  return response.data.result
}

export const deleteBookmark = async (workId) => {
  const response = await apiClient.delete(`/v1/me/bookmarks/${workId}`)
  return response.data
}

// -- NOTES / HIGHLIGHTS --
export const fetchSectionNotes = async (sectionId) => {
  const response = await apiClient.get(`/v1/sections/${sectionId}/notes`)
  return response.data.result
}

export const createNote = async ({ sectionId, data }) => {
  const response = await apiClient.post(`/v1/sections/${sectionId}/notes`, data)
  return response.data.result
}

export const deleteNote = async (noteId) => {
  const response = await apiClient.delete(`/v1/notes/${noteId}`)
  return response.data
}
