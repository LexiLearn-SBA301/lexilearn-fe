import { apiClient } from '../../../lib/api'

// -- WORK DETAILS (SECTIONS) --
export const fetchWorkSections = async (workId) => {
  const response = await apiClient.get(`/v1/works/${workId}/sections`)
  return response.data.result
}

export const fetchWorkSectionDetail = async (sectionId) => {
  const response = await apiClient.get(`/v1/sections/${sectionId}`)
  return response.data.result
}

// -- WORK DETAILS (CHARACTERS) --
export const fetchWorkCharacters = async (workId) => {
  const response = await apiClient.get(`/v1/works/${workId}/characters`)
  return response.data.result
}

// -- WORK DETAILS (ARTISTIC FEATURES) --
export const fetchArtisticFeatures = async (workId) => {
  const response = await apiClient.get(`/v1/works/${workId}/artistic-features`)
  return response.data.result
}

// ==========================================
// ADMIN APIS
// ==========================================

// -- ADMIN WORK SECTIONS --
export const createWorkSection = async ({ workId, data }) => {
  const response = await apiClient.post(
    `/v1/admin/works/${workId}/sections`,
    data,
  )
  return response.data.result
}
export const updateWorkSection = async ({ sectionId, data }) => {
  const response = await apiClient.patch(
    `/v1/admin/sections/${sectionId}`,
    data,
  )
  return response.data.result
}
export const deleteWorkSection = async (sectionId) => {
  const response = await apiClient.delete(`/v1/admin/sections/${sectionId}`)
  return response.data
}

// -- ADMIN WORK CHARACTERS --
export const createWorkCharacter = async ({ workId, data }) => {
  const response = await apiClient.post(
    `/v1/admin/works/${workId}/characters`,
    data,
  )
  return response.data.result
}
export const updateWorkCharacter = async ({ characterId, data }) => {
  const response = await apiClient.patch(
    `/v1/admin/characters/${characterId}`,
    data,
  )
  return response.data.result
}
export const deleteWorkCharacter = async (characterId) => {
  const response = await apiClient.delete(`/v1/admin/characters/${characterId}`)
  return response.data
}

// -- ADMIN ARTISTIC FEATURES --
export const createArtisticFeature = async ({ workId, data }) => {
  const response = await apiClient.post(
    `/v1/admin/works/${workId}/artistic-features`,
    data,
  )
  return response.data.result
}
export const updateArtisticFeature = async ({ featureId, data }) => {
  const response = await apiClient.patch(
    `/v1/admin/artistic-features/${featureId}`,
    data,
  )
  return response.data.result
}
export const deleteArtisticFeature = async (featureId) => {
  const response = await apiClient.delete(
    `/v1/admin/artistic-features/${featureId}`,
  )
  return response.data
}
