import api from './api'

export const createBooking = async (payload) => {
  const { data } = await api.post('/bookings', payload)
  return data
}

export const approveBooking = async (id) => {
  const { data } = await api.patch(`/bookings/${id}/approve`)
  return data
}

export const rejectBooking = async (id) => {
  const { data } = await api.patch(`/bookings/${id}/reject`)
  return data
}

export const returnBooking = async (id) => {
  const { data } = await api.patch(`/bookings/${id}/return`)
  return data
}

export const approveReturnBooking = async (id) => {
  const { data } = await api.patch(`/bookings/${id}/return/approve`)
  return data
}

export const rejectReturnBooking = async (id) => {
  const { data } = await api.patch(`/bookings/${id}/return/reject`)
  return data
}

export const collectBooking = async (id) => {
  const { data } = await api.patch(`/bookings/${id}/collect`)
  return data
}

export const confirmCollectBooking = async (id) => {
  const { data } = await api.patch(`/bookings/${id}/collect/confirm`)
  return data
}

export const cancelBooking = async (id) => {
  const { data } = await api.patch(`/bookings/${id}/cancel`)
  return data
}

export const getMineBookings = async () => {
  const { data } = await api.get('/bookings/mine')
  return data
}

export const getOwnerBookings = async () => {
  const { data } = await api.get('/bookings/owner')
  return data
}

export const getDashboard = async () => {
  const { data } = await api.get('/dashboard')
  return data
}
