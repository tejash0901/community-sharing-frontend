import api from './api'

export const getTools = async () => {
  const { data } = await api.get('/tools')
  return data
}

export const getTool = async (id) => {
  const { data } = await api.get(`/tools/${id}`)
  return data
}

export const createTool = async (payload) => {
  const { data } = await api.post('/tools', payload)
  return data
}

export const updateTool = async (id, payload) => {
  const { data } = await api.put(`/tools/${id}`, payload)
  return data
}

export const deleteTool = async (id) => {
  await api.delete(`/tools/${id}`)
}