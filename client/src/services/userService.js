import { api } from './api'

function normalizeProfile(row) {
  return {
    userId:         row.id,
    username:       row.username,
    firstName:      row.first_name,
    lastName:       row.last_name,
    mailingAddress: row.mailing_address ?? null,
    billingAddress: row.billing_address ?? null,
  }
}

export async function createProfile({ id, username, firstName, lastName }) {
  const { data } = await api.post('/users', {
    id,
    username,
    first_name: firstName,
    last_name:  lastName,
  })
  const row = Array.isArray(data) ? data[0] : data
  return normalizeProfile(row)
}

export async function getProfile(userId) {
  const { data } = await api.get(`/users?id=eq.${userId}&select=*`)
  return data.length ? normalizeProfile(data[0]) : null
}

export async function updateProfile(userId, updates) {
  const dbUpdates = {}
  if ('firstName'      in updates) dbUpdates.first_name       = updates.firstName
  if ('lastName'       in updates) dbUpdates.last_name        = updates.lastName
  if ('mailingAddress' in updates) dbUpdates.mailing_address  = updates.mailingAddress
  if ('billingAddress' in updates) dbUpdates.billing_address  = updates.billingAddress

  const { data } = await api.patch(`/users?id=eq.${userId}`, dbUpdates)
  const row = Array.isArray(data) ? data[0] : data
  return normalizeProfile(row)
}
