import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/PageWrapper/PageWrapper'
import * as authService from '../../services/authService'
import * as userService from '../../services/userService'
import './Signup.css'

const EMPTY = { firstName: '', lastName: '', email: '', username: '', password: '', confirmPassword: '' }

export default function Signup() {
  const navigate = useNavigate()
  const [fields, setFields]  = useState(EMPTY)
  const [errors, setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function set(key) {
    return (e) => {
      setFields(prev => ({ ...prev, [key]: e.target.value }))
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  function validate() {
    const errs = {}
    if (!fields.firstName.trim()) errs.firstName = 'First name is required.'
    if (!fields.lastName.trim())  errs.lastName  = 'Last name is required.'
    if (!/\S+@\S+\.\S+/.test(fields.email)) errs.email = 'Enter a valid email address.'
    if (!fields.username.trim())  errs.username  = 'Username is required.'
    if (fields.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (fields.password !== fields.confirmPassword) errs.confirmPassword = 'Passwords don\'t match.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const authResult = await authService.signUp({
        email:    fields.email.trim().toLowerCase(),
        password: fields.password,
      })

      await userService.createProfile({
        id:        authResult.user.id,
        username:  fields.username.trim(),
        firstName: fields.firstName.trim(),
        lastName:  fields.lastName.trim(),
      })

      setSuccess(true)
      setTimeout(() => navigate('/login', { state: { prefill: fields.username.trim() } }), 1500)
    } catch (err) {
      const body = err.response?.data || {}
      const msg  = body.msg || body.error_description || body.message || ''

      if (body.error_code === 'user_already_exists' || msg.toLowerCase().includes('already registered')) {
        setErrors({ email: 'Email already registered.' })
      } else if (body.code === '23505' || (body.message || '').includes('username')) {
        setErrors({ username: 'Username already taken.' })
      } else {
        setErrors({ form: 'Something went wrong. Try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <PageWrapper page="voltron">
        <div className="auth-page">
          <div className="auth-card">
            <p className="auth-success">Coalition enrolled. Heading to the bridge…</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper page="voltron">
      <div className="auth-page">
        <div className="auth-card">
          <div className="voltron-stripe auth-stripe" />
          <h1 className="auth-heading">Join the Coalition.</h1>
          <p className="auth-subtext">Create your account and keep your orders in formation.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {errors.form && <p className="form-error-global" role="alert">{errors.form}</p>}

            <div className="auth-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName" type="text" autoComplete="given-name"
                  value={fields.firstName} onChange={set('firstName')}
                  className={errors.firstName ? 'has-error' : ''}
                  aria-describedby={errors.firstName ? 'err-firstName' : undefined}
                />
                {errors.firstName && <span className="field-error" id="err-firstName" role="alert">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName" type="text" autoComplete="family-name"
                  value={fields.lastName} onChange={set('lastName')}
                  className={errors.lastName ? 'has-error' : ''}
                  aria-describedby={errors.lastName ? 'err-lastName' : undefined}
                />
                {errors.lastName && <span className="field-error" id="err-lastName" role="alert">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email" type="email" autoComplete="email"
                value={fields.email} onChange={set('email')}
                className={errors.email ? 'has-error' : ''}
                aria-describedby={errors.email ? 'err-email' : undefined}
              />
              {errors.email && <span className="field-error" id="err-email" role="alert">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username" type="text" autoComplete="username"
                value={fields.username} onChange={set('username')}
                className={errors.username ? 'has-error' : ''}
                aria-describedby={errors.username ? 'err-username' : undefined}
              />
              {errors.username && <span className="field-error" id="err-username" role="alert">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" autoComplete="new-password"
                value={fields.password} onChange={set('password')}
                className={errors.password ? 'has-error' : ''}
                aria-describedby={errors.password ? 'err-password' : undefined}
              />
              {errors.password && <span className="field-error" id="err-password" role="alert">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword" type="password" autoComplete="new-password"
                value={fields.confirmPassword} onChange={set('confirmPassword')}
                className={errors.confirmPassword ? 'has-error' : ''}
                aria-describedby={errors.confirmPassword ? 'err-confirm' : undefined}
              />
              {errors.confirmPassword && <span className="field-error" id="err-confirm" role="alert">{errors.confirmPassword}</span>}
            </div>

            <button className="btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? 'Enlisting…' : 'Enlist Now'}
            </button>
          </form>

          <p className="auth-switch">
            Already a Paladin? <Link to="/login">Identify yourself.</Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}
