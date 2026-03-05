import api from './api'

export const createAvailability = async (toolId, payload) => {
  const { data } = await api.post(`/tools/${toolId}/availability`, payload)
  return data
}

export const getAvailability = async (toolId) => {
  const { data } = await api.get(`/tools/${toolId}/availability`)
  return data
}

export const getAvailabilityWindows = async (toolId) => {
  const { data } = await api.get(`/tools/${toolId}/availability/windows`)
  return data
}

export const deleteAvailability = async (id) => {
  await api.delete(`/availability/${id}`)
}
