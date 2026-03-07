import api from './api'

const serverBase = (api.defaults.baseURL || '').replace(/\/api\/?$/, '')

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null
  return `${serverBase}${imageUrl}`
}

export const getTools = async () => {
  const { data } = await api.get('/tools')
  return data
}

export const getTool = async (id) => {
  const { data } = await api.get(`/tools/${id}`)
  return data
}

export const createTool = async (payload, imageFile) => {
  const formData = new FormData()
  formData.append('tool', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  if (imageFile) {
    formData.append('image', imageFile)
  }
  const { data } = await api.post('/tools', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const updateTool = async (id, payload) => {
  const { data } = await api.put(`/tools/${id}`, payload)
  return data
}

export const deleteTool = async (id) => {
  await api.delete(`/tools/${id}`)
}
