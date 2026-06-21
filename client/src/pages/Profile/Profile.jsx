import { useState } from 'react'
import { IconUser } from '@tabler/icons-react'
import PageWrapper from '../../components/PageWrapper/PageWrapper'
import { useAuth }   from '../../context/AuthContext'
import * as userService from '../../services/userService'
import * as authService from '../../services/authService'
import './Profile.css'

export default function Profile() {
  const { user, dispatch } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    firstName:      user?.firstName      || '',
    lastName:       user?.lastName       || '',
    email:          user?.email          || '',
    username:       user?.username       || '',
    mailingAddress: user?.mailingAddress || '',
    billingAddress: user?.billingAddress || '',
  })
  const [pwForm, setPwForm]     = useState({ current: '', next: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwSuccess, setPwSuccess] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)
  const [pwSaving, setPwSaving] = useState(false)

  function set(key) {
    return (e) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }))
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'First name is required.'
    if (!form.lastName.trim())  errs.lastName  = 'Last name is required.'
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const updated = await userService.updateProfile(user.userId, {
        firstName:      form.firstName.trim(),
        lastName:       form.lastName.trim(),
        mailingAddress: form.mailingAddress.trim() || null,
        billingAddress: form.billingAddress.trim() || null,
      })

      // Update email via auth if it changed
      if (form.email.trim().toLowerCase() !== user.email) {
        await authService.updateEmail(form.email.trim().toLowerCase())
      }

      dispatch({ type: 'UPDATE_USER', payload: { ...updated, email: form.email.trim().toLowerCase() } })
      setSaveSuccess(true)
      setEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setErrors({ form: 'Failed to save changes. Try again.' })
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    const errs = {}
    if (pwForm.next.length < 8) errs.next = 'New password must be at least 8 characters.'
    if (pwForm.next !== pwForm.confirm) errs.confirm = 'Passwords don\'t match.'
    if (!pwForm.current) errs.current = 'Enter your current password.'
    if (Object.keys(errs).length) { setPwErrors(errs); return }

    setPwSaving(true)
    try {
      // Verify current password by re-signing in
      await authService.signIn({ email: user.email, password: pwForm.current })
      await authService.updatePassword(pwForm.next)
      setPwForm({ current: '', next: '', confirm: '' })
      setPwErrors({})
      setPwSuccess(true)
      setTimeout(() => setPwSuccess(false), 3000)
    } catch {
      setPwErrors({ current: 'Current password is wrong.' })
    } finally {
      setPwSaving(false)
    }
  }

  const addressNudge = !user?.mailingAddress || !user?.billingAddress

  return (
    <PageWrapper page="voltron">
      <div className="page-content">
        <div className="profile-header">
          <div className="profile-avatar" aria-hidden="true">
            <IconUser size={40} stroke={1.5} />
          </div>
          <div>
            <h1 className="profile-name">{user?.firstName} {user?.lastName}</h1>
            <p className="profile-username data-text">@{user?.username}</p>
          </div>
        </div>

        {saveSuccess && <div className="profile-flash" role="status">Profile updated!</div>}

        {addressNudge && !editing && (
          <div className="profile-nudge">
            Your profile's missing address info. Add it to keep your orders organised.
            <button className="btn-secondary btn-sm" onClick={() => setEditing(true)}>Fill It In</button>
          </div>
        )}

        {/* Info section */}
        <div className="profile-section card">
          <div className="profile-section__header">
            <h2>Personal Info</h2>
            {!editing && (
              <button className="btn-secondary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            )}
          </div>

          {editing ? (
            <form className="profile-form" onSubmit={handleSave} noValidate>
              {errors.form && <p className="form-error-global" role="alert">{errors.form}</p>}
              <div className="profile-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input id="firstName" type="text" value={form.firstName} onChange={set('firstName')}
                    className={errors.firstName ? 'has-error' : ''}
                    aria-describedby={errors.firstName ? 'err-fn' : undefined} />
                  {errors.firstName && <span className="field-error" id="err-fn" role="alert">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input id="lastName" type="text" value={form.lastName} onChange={set('lastName')}
                    className={errors.lastName ? 'has-error' : ''}
                    aria-describedby={errors.lastName ? 'err-ln' : undefined} />
                  {errors.lastName && <span className="field-error" id="err-ln" role="alert">{errors.lastName}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={form.email} onChange={set('email')}
                  className={errors.email ? 'has-error' : ''}
                  aria-describedby={errors.email ? 'err-em' : undefined} />
                {errors.email && <span className="field-error" id="err-em" role="alert">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="mailingAddress">Mailing Address</label>
                <input id="mailingAddress" type="text" value={form.mailingAddress} onChange={set('mailingAddress')} />
              </div>
              <div className="form-group">
                <label htmlFor="billingAddress">Billing Address</label>
                <input id="billingAddress" type="text" value={form.billingAddress} onChange={set('billingAddress')} />
              </div>
              <div className="profile-form__actions">
                <button type="submit" className="btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <dl className="profile-dl">
              <ProfileField term="Email"           def={user?.email} />
              <ProfileField term="Username"        def={`@${user?.username}`} />
              <ProfileField term="Mailing Address" def={user?.mailingAddress} />
              <ProfileField term="Billing Address" def={user?.billingAddress} />
            </dl>
          )}
        </div>

        {/* Password section */}
        <div className="profile-section card">
          <h2>Change Password</h2>
          {pwSuccess && <p className="profile-pw-success" role="status">Password updated!</p>}
          <form className="profile-form" onSubmit={handlePasswordChange} noValidate>
            <div className="form-group">
              <label htmlFor="current">Current Password</label>
              <input id="current" type="password" value={pwForm.current}
                onChange={e => { setPwForm(p => ({ ...p, current: e.target.value })); setPwErrors(p => ({ ...p, current: '' })) }}
                className={pwErrors.current ? 'has-error' : ''}
                aria-describedby={pwErrors.current ? 'err-cur' : undefined} />
              {pwErrors.current && <span className="field-error" id="err-cur" role="alert">{pwErrors.current}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="next">New Password</label>
              <input id="next" type="password" value={pwForm.next}
                onChange={e => { setPwForm(p => ({ ...p, next: e.target.value })); setPwErrors(p => ({ ...p, next: '' })) }}
                className={pwErrors.next ? 'has-error' : ''}
                aria-describedby={pwErrors.next ? 'err-nxt' : undefined} />
              {pwErrors.next && <span className="field-error" id="err-nxt" role="alert">{pwErrors.next}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="confirm">Confirm New Password</label>
              <input id="confirm" type="password" value={pwForm.confirm}
                onChange={e => { setPwForm(p => ({ ...p, confirm: e.target.value })); setPwErrors(p => ({ ...p, confirm: '' })) }}
                className={pwErrors.confirm ? 'has-error' : ''}
                aria-describedby={pwErrors.confirm ? 'err-con' : undefined} />
              {pwErrors.confirm && <span className="field-error" id="err-con" role="alert">{pwErrors.confirm}</span>}
            </div>
            <button type="submit" className="btn-secondary btn-sm" disabled={pwSaving}>
              {pwSaving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  )
}

function ProfileField({ term, def }) {
  return (
    <>
      <dt className="profile-dl__term">{term}</dt>
      <dd className="profile-dl__def data-text">{def || <span className="profile-empty">Not set</span>}</dd>
    </>
  )
}
