import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import PageWrapper from '../../components/PageWrapper/PageWrapper'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrdersContext'
import * as authService from '../../services/authService'
import * as userService from '../../services/userService'
import * as orderService from '../../services/orderService'
import './Login.css'

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { dispatch } = useAuth()
  const { dispatch: ordersDispatch } = useOrders()

  const prefill = location.state?.prefill || ''
  const [username, setUsername] = useState(prefill)
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const email = await authService.getEmailByUsername(username.trim())
      if (!email) {
        setError('Hmm, that username or password isn\'t right.')
        setPassword('')
        return
      }

      let authData
      try {
        authData = await authService.signIn({ email, password })
      } catch {
        setError('Hmm, that username or password isn\'t right.')
        setPassword('')
        return
      }

      const profile = await userService.getProfile(authData.user.id)
      const user    = { ...profile, email: authData.user.email }

      dispatch({ type: 'LOGIN', payload: user })

      const orders = await orderService.getOrders()
      ordersDispatch({ type: 'SET_ORDERS', payload: orders })

      navigate('/')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper page="voltron">
      <div className="auth-page">
        <div className="auth-card">
          <div className="voltron-stripe auth-stripe" />
          <h1 className="auth-heading">Identify Yourself, Paladin.</h1>
          <p className="auth-subtext">Your orders are waiting. Sign in to check on them.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <p className="form-error-global" role="alert">{error}</p>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username" type="text" autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button className="btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? 'Scanning…' : 'Enter the Bridge'}
            </button>
          </form>

          <p className="auth-switch">
            New to the coalition? <Link to="/signup">Join up.</Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}
