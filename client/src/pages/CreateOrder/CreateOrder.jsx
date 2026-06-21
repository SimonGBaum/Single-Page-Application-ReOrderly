import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconCheck } from '@tabler/icons-react'
import PageWrapper from '../../components/PageWrapper/PageWrapper'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrdersContext'
import * as orderService from '../../services/orderService'
import { getDraft, saveDraft, clearDraft } from '../../services/draftService'
import './CreateOrder.css'

const BLANK_FORM = {
  orderNickname: '', productType: '', productName: '', productQuantity: 1,
  storeName: '', storeAddress: '', itemDescription: '',
  orderType: 'one-time', deliveryFrequency: 'weekly', customFrequencyDays: 7,
  numberOfDeliveries: 1, untilCancelled: false,
}

const PRODUCT_TYPES = ['Grocery', 'Medication', 'Health & Hygiene', 'Household', 'Other']
const FREQUENCIES   = [
  { value: 'weekly',   label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly',  label: 'Monthly' },
  { value: 'custom',   label: 'Custom (every N days)' },
]

export default function CreateOrder() {
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const { dispatch: ordersDispatch } = useOrders()

  const [form, setForm]       = useState(() => {
    const draft = getDraft(user?.userId)
    return draft ? { ...BLANK_FORM, ...draft } : { ...BLANK_FORM }
  })
  const [errors, setErrors]   = useState({})
  const [saved, setSaved]     = useState(false)
  const [done, setDone]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const savedTimer  = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (user?.userId) {
        saveDraft(user.userId, form)
        setSaved(true)
        clearTimeout(savedTimer.current)
        savedTimer.current = setTimeout(() => setSaved(false), 2000)
      }
    }, 600)
    return () => clearTimeout(debounceRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  useEffect(() => () => {
    clearTimeout(savedTimer.current)
    clearTimeout(debounceRef.current)
  }, [])

  function set(key) {
    return (e) => {
      const val = e.target.type === 'checkbox' ? e.target.checked
                : e.target.type === 'number'   ? Number(e.target.value)
                : e.target.value
      setForm(prev => ({ ...prev, [key]: val }))
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  function validate() {
    const errs = {}
    if (!form.productName.trim())  errs.productName  = 'Product name is required.'
    if (!form.storeName.trim())    errs.storeName    = 'Store name is required.'
    if (!form.storeAddress.trim()) errs.storeAddress = 'Store address is required.'
    if (form.productQuantity < 1)  errs.productQuantity = 'Quantity must be at least 1.'
    if (form.orderType === 'recurring' && form.deliveryFrequency === 'custom' && form.customFrequencyDays < 1) {
      errs.customFrequencyDays = 'Enter a number of days (min 1).'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setError('')
    try {
      const order = await orderService.createOrder({
        ...form,
        userId: user.userId,
        status: 'active',
        numberOfDeliveries: form.untilCancelled ? 'until-cancelled' : form.numberOfDeliveries,
      })
      clearDraft(user.userId)
      ordersDispatch({ type: 'ADD_ORDER', payload: order })
      setDone(true)
    } catch {
      setError('Failed to create order. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleAnother() {
    setForm({ ...BLANK_FORM })
    setErrors({})
    setDone(false)
    setError('')
  }

  if (done) {
    return (
      <PageWrapper page="create">
        <div className="page-content create-done">
          <div className="card create-done__card">
            <IconCheck size={48} stroke={1.5} color="#FF4040" aria-hidden="true" />
            <h2>Order launched!</h2>
            <p>Your order's in the system. What's next, Paladin?</p>
            <div className="create-done__actions">
              <button className="btn-primary" onClick={handleAnother}>Create Another</button>
              <button className="btn-secondary" onClick={() => navigate('/')}>Back to Home</button>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const isRecurring = form.orderType === 'recurring'

  return (
    <PageWrapper page="create">
      <div className="page-content">
        <div className="create-header">
          <h1>New Order</h1>
          <span className={`autosave-dot ${saved ? 'autosave-dot--saved' : ''}`} aria-live="polite" aria-label={saved ? 'Draft saved' : 'Unsaved'} title={saved ? 'Saved' : 'Saving…'}>●</span>
        </div>

        <form className="create-form card" onSubmit={handleSubmit} noValidate>
          {error && <p className="form-error-global" role="alert">{error}</p>}

          <div className="form-group">
            <label htmlFor="orderNickname">Order Nickname <span className="optional">(optional)</span></label>
            <input id="orderNickname" type="text" value={form.orderNickname} onChange={set('orderNickname')}
              placeholder='e.g. "Monthly meds"' />
          </div>

          <div className="create-grid">
            <div className="form-group">
              <label htmlFor="productType">Product Type</label>
              <select id="productType" value={form.productType} onChange={set('productType')}>
                <option value="">Select type…</option>
                {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="productQuantity">Quantity</label>
              <input id="productQuantity" type="number" min="1" value={form.productQuantity} onChange={set('productQuantity')}
                className={errors.productQuantity ? 'has-error' : ''}
                aria-describedby={errors.productQuantity ? 'err-qty' : undefined} />
              {errors.productQuantity && <span className="field-error" id="err-qty" role="alert">{errors.productQuantity}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="productName">Product Name *</label>
            <input id="productName" type="text" value={form.productName} onChange={set('productName')}
              className={errors.productName ? 'has-error' : ''}
              aria-describedby={errors.productName ? 'err-pname' : undefined} />
            {errors.productName && <span className="field-error" id="err-pname" role="alert">{errors.productName}</span>}
          </div>

          <div className="create-grid">
            <div className="form-group">
              <label htmlFor="storeName">Store Name *</label>
              <input id="storeName" type="text" value={form.storeName} onChange={set('storeName')}
                className={errors.storeName ? 'has-error' : ''}
                aria-describedby={errors.storeName ? 'err-sname' : undefined} />
              {errors.storeName && <span className="field-error" id="err-sname" role="alert">{errors.storeName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="storeAddress">Store Address *</label>
              <input id="storeAddress" type="text" value={form.storeAddress} onChange={set('storeAddress')}
                className={errors.storeAddress ? 'has-error' : ''}
                aria-describedby={errors.storeAddress ? 'err-addr' : undefined} />
              {errors.storeAddress && <span className="field-error" id="err-addr" role="alert">{errors.storeAddress}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="itemDescription">Item Description</label>
            <textarea id="itemDescription" rows={3} value={form.itemDescription} onChange={set('itemDescription')} />
          </div>

          {/* Order type toggle */}
          <div className="create-type-toggle">
            <span className="form-group label-only">Order Type *</span>
            <div className="type-toggle-buttons">
              <button type="button"
                className={`type-btn ${form.orderType === 'one-time' ? 'type-btn--active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, orderType: 'one-time' }))}>
                One-Time
              </button>
              <button type="button"
                className={`type-btn ${form.orderType === 'recurring' ? 'type-btn--active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, orderType: 'recurring' }))}>
                Recurring
              </button>
            </div>
          </div>

          {/* Recurring options */}
          {isRecurring && (
            <div className="create-recurring card-inset">
              <div className="form-group">
                <label htmlFor="deliveryFrequency">Delivery Frequency</label>
                <select id="deliveryFrequency" value={form.deliveryFrequency} onChange={set('deliveryFrequency')}>
                  {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              {form.deliveryFrequency === 'custom' && (
                <div className="form-group">
                  <label htmlFor="customFrequencyDays">Every how many days?</label>
                  <input id="customFrequencyDays" type="number" min="1" value={form.customFrequencyDays}
                    onChange={set('customFrequencyDays')}
                    className={errors.customFrequencyDays ? 'has-error' : ''}
                    aria-describedby={errors.customFrequencyDays ? 'err-custom' : undefined} />
                  {errors.customFrequencyDays && <span className="field-error" id="err-custom" role="alert">{errors.customFrequencyDays}</span>}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="numberOfDeliveries">Number of Deliveries</label>
                <input id="numberOfDeliveries" type="number" min="1" value={form.numberOfDeliveries}
                  onChange={set('numberOfDeliveries')} disabled={form.untilCancelled} />
              </div>

              <div className="form-check">
                <input id="untilCancelled" type="checkbox" checked={form.untilCancelled} onChange={set('untilCancelled')} />
                <label htmlFor="untilCancelled">Until I cancel</label>
              </div>
            </div>
          )}

          <div className="create-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Launching…' : 'Launch Order'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </form>
      </div>
    </PageWrapper>
  )
}
