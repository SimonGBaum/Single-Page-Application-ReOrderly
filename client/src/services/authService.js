import { api, authApi } from './api'

const SESSION_KEY = 'reorderly_session'

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

function saveSession({ access_token, refresh_token, expires_in }) {
  const expiresAt = Date.now() + expires_in * 1000
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresAt,
  }))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export async function getEmailByUsername(username) {
  const { data } = await api.post('/rpc/get_email_by_username', { p_username: username })
  return data || null
}

export async function signUp({ email, password }) {
  const { data } = await authApi.post('/signup', { email, password })
  if (data.session) {
    saveSession(data.session)
    return data
  }
  // Supabase no longer returns a session on signup — sign in immediately
  // so profile creation (which requires an authenticated token) can proceed.
  const session = await signIn({ email, password })
  return { ...data, session }
}

export async function signIn({ email, password }) {
  const { data } = await authApi.post('/token?grant_type=password', { email, password })
  saveSession(data)
  return data
}

export async function signOut() {
  try {
    await authApi.post('/logout')
  } catch {
    // ignore errors on logout
  }
  clearSession()
}

export async function getAuthUser() {
  const { data } = await authApi.get('/user')
  return data
}

export async function updatePassword(newPassword) {
  const { data } = await authApi.put('/user', { password: newPassword })
  return data
}

export async function updateEmail(newEmail) {
  const { data } = await authApi.put('/user', { email: newEmail })
  return data
}
