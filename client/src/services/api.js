import axios from 'axios'

const BASE     = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

function getAccessToken() {
  try {
    const raw = localStorage.getItem('reorderly_session')
    return raw ? JSON.parse(raw).accessToken : null
  } catch {
    return null
  }
}

// PostgREST data API
export const api = axios.create({
  baseURL: BASE + '/rest/v1',
  headers: {
    'apikey': ANON_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  },
})

api.interceptors.request.use(config => {
  const token = getAccessToken()
  config.headers['Authorization'] = `Bearer ${token ?? ANON_KEY}`
  return config
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('reorderly_session')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// GoTrue auth API
export const authApi = axios.create({
  baseURL: BASE + '/auth/v1',
  headers: {
    'apikey': ANON_KEY,
    'Content-Type': 'application/json',
  },
})

authApi.interceptors.request.use(config => {
  const token = getAccessToken()
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})
