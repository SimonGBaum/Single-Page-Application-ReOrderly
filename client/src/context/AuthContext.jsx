import { createContext, useContext, useReducer, useEffect } from 'react'
import * as authService from '../services/authService'
import * as userService from '../services/userService'

const AuthContext = createContext(null)

const initialState = { user: null, isLoading: true }

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload, isLoading: false }
    case 'LOGOUT':
      return { user: null, isLoading: false }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    case 'HYDRATE_DONE':
      return { ...state, isLoading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    async function hydrate() {
      const session = authService.getSession()
      if (!session?.accessToken) {
        dispatch({ type: 'HYDRATE_DONE' })
        return
      }
      try {
        const authUser = await authService.getAuthUser()
        const profile  = await userService.getProfile(authUser.id)
        if (profile) {
          dispatch({ type: 'LOGIN', payload: { ...profile, email: authUser.email } })
        } else {
          authService.clearSession()
          dispatch({ type: 'HYDRATE_DONE' })
        }
      } catch {
        authService.clearSession()
        dispatch({ type: 'HYDRATE_DONE' })
      }
    }
    hydrate()
  }, [])

  async function logout() {
    await authService.signOut()
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, dispatch, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
