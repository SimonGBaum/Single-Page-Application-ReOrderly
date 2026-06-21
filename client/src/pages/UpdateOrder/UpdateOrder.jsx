import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IconSearch } from '@tabler/icons-react'
import PageWrapper from '../../components/PageWrapper/PageWrapper'
import { useAuth }   from '../../context/AuthContext'
import { useOrders } from '../../context/OrdersContext'
import * as orderService from '../../services/orderService'
import { formatDate }  from '../../utils/formatDate'
import './UpdateOrder.css'

const STATUSES = ['active','out-for-delivery','delivered','paused','completed','cancelled']
const FREQUENCIES = [
  { value: 'weekly',   label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly',  label: 'Monthly' },
  { value: 'custom',   label: 'Custom (every N days)' },
]
const PRODUCT_TYPES = ['Grocery', 'Medication', 'Health & Hygiene', 'Household', 'Other']

export default function UpdateOrder() {
  const { orderId } = useParams()
  const navigate    = useNavigate()
  useAuth()
  const { orders, dispatch } = useOrders()

  const [search,   setSearch]   = useState('')
  const [errors,   setErrors]   = useState({})
  const [flash,    setFlash]    = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  function buildForm(order) {
    return {
      orderNickname:       order.orderNickname       || '',
      productType:         order.productType         || '',
      productName:         order.productName         || '',
      productQuantity:     order.productQuantity     || 1,
      storeName:           order.storeName           || '',
      storeAddress:        order.storeAddress        || '',
      itemDescription:     order.itemDescription     || '',
      orderType:           order.orderType           || 'one-time',
      deliveryFrequency:   order.deliveryFrequency   || 'weekly',
      customFrequencyDays: order.customFrequencyDays || 7,
      numberOfDeliveries:  order.numberOfDeliveries  || 1,
      untilCancelled:      order.untilCancelled      || false,
      status:              order.status              || 'active',
      expectedDeliveryDate: order.expectedDeliveryDate ? order.expectedDeliveryDate.split('T')[0] : '',
    }
  }

  const initialOrder = orderId ? (orders.find(o => o.orderId === orderId) || null) : null
  const [selected, setSelected] = useState(initialOrder)
  const [form,     setForm]     = useState(initialOrder ? buildForm(initialOrder) : null)

  function selectOrder(order) {
    setSelected(order)
    setForm(buildForm(order))
  }

  function set(key) {
    return (e) => {
      const val = e.target.type === 'checkbox' ? e.target.checked
                : e.target.type === 'number'   ? Number(e.target.value)
                : e.target.value
      setForm(prev => ({ ...prev, [key]: val }))
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  async function handleMarkDelivery() {
    if (!selected) return
    const updates = {
      deliveriesCompleted: (selected.deliveriesCompleted || 0) + 1,
      lastDeliveryDate: new Date().toISOString(),
    }
    setLoading(true)
    setError('')
    try {
      await orderService.updateOrder(selected.orderId, updates)
      dispatch({ type: 'UPDATE_ORDER', payload: { orderId: selected.orderId, updates } })
      setSelected(prev => ({ ...prev, ...updates }))
    } catch {
      setError('Failed to record delivery. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function validate() {
    const errs = {}
    if (!form.productName.trim())  errs.productName  = 'Product name is required.'
    if (!form.storeName.trim())    errs.storeName    = 'Store name is required.'
    if (!form.storeAddress.trim()) errs.storeAddress = 'Store address is required.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const updates = {
      ...form,
      numberOfDeliveries: form.untilCancelled ? 'until-cancelled' : form.numberOfDeliveries,
      expectedDeliveryDate: form.expectedDeliveryDate ? new Date(form.expectedDeliveryDate).toISOString() : null,
    }
    delete updates.untilCancelled

    setLoading(true)
    setError('')
    try {
      await orderService.updateOrder(selected.orderId, updates)
      dispatch({ type: 'UPDATE_ORDER', payload: { orderId: selected.orderId, updates } })
      setFlash(true)
      setTimeout(() => { setFlash(false); navigate('/') }, 1200)
    } catch {
      setError('Failed to save changes. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Picker view
  if (!selected) {
    const filteredOrders = orders.filter(o =>
      o.status !== 'draft' &&
      (o.orderNickname.toLowerCase().includes(search.toLowerCase()) ||
       o.productName.toLowerCase().includes(search.toLowerCase()))
    )

    return (
      <PageWrapper page="update">
        <div className="page-content">
          <h1 className="update-title">Update Order</h1>
          <p className="update-subtitle">Which order needs adjusting, Paladin?</p>

          <div className="update-search form-group">
            <label htmlFor="search" className="sr-only">Search orders</label>
            <div className="update-search__wrap">
              <IconSearch size={18} stroke={1.5} className="update-search__icon" aria-hidden="true" />
              <input id="search" type="search" placeholder="Search by name or product…"
                value={search} onChange={e => setSearch(e.target.value)} className="update-search__input" />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <p className="update-empty">No orders match that search.</p>
          ) : (
            <ul className="update-picker">
              {filteredOrders.map(order => (
                <li key={order.orderId}>
                  <button className="update-picker__item card" onClick={() => selectOrder(order)}>
                    <span className="update-picker__name">{order.orderNickname}</span>
                    <span className="update-picker__product data-text">{order.productName}</span>
                    <span className={`status-badge status-badge--${order.status}`}>{order.status.replace('-',' ')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PageWrapper>
    )
  }

  // Edit form
  return (
    <PageWrapper page="update">
      <div className="page-content">
        <button className="update-back btn-secondary btn-sm" onClick={() => { setSelected(null); setForm(null) }}>
          ← Pick a different order
        </button>
        <h1 className="update-title">Update: {selected.orderNickname}</h1>

        {flash && <div className="update-flash" role="status">Changes applied!</div>}
        {error && <p className="form-error-global" role="alert">{error}</p>}

        <form className={`update-form card ${flash ? 'update-form--flash' : ''}`} onSubmit={handleSubmit} noValidate>

          {/* Mark delivery button */}
          <div className="update-delivery-section">
            <div>
              <p className="update-delivery-label">Deliveries completed (this order)</p>
              <p className="update-delivery-count data-text">{selected.deliveriesCompleted || 0} delivered · last on {formatDate(selected.lastDeliveryDate)}</p>
            </div>
            <button type="button" className="btn-primary btn-sm" onClick={handleMarkDelivery} disabled={loading}>
              Mark Delivery Complete
            </button>
          </div>

          <hr className="update-divider" />

          {/* Status */}
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" value={form.status} onChange={set('status')}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="orderNickname">Order Nickname</label>
            <input id="orderNickname" type="text" value={form.orderNickname} onChange={set('orderNickname')} />
          </div>

          <div className="update-grid">
            <div className="form-group">
              <label htmlFor="productType">Product Type</label>
              <select id="productType" value={form.productType} onChange={set('productType')}>
                <option value="">Select type…</option>
                {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="productQuantity">Quantity</label>
              <input id="productQuantity" type="number" min="1" value={form.productQuantity} onChange={set('productQuantity')} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="productName">Product Name *</label>
            <input id="productName" type="text" value={form.productName} onChange={set('productName')}
              className={errors.productName ? 'has-error' : ''}
              aria-describedby={errors.productName ? 'err-pname' : undefined} />
            {errors.productName && <span className="field-error" id="err-pname" role="alert">{errors.productName}</span>}
          </div>

          <div className="update-grid">
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

          {form.orderType === 'recurring' && (
            <div className="update-grid">
              <div className="form-group">
                <label htmlFor="deliveryFrequency">Delivery Frequency</label>
                <select id="deliveryFrequency" value={form.deliveryFrequency} onChange={set('deliveryFrequency')}>
                  {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              {form.deliveryFrequency === 'custom' && (
                <div className="form-group">
                  <label htmlFor="customFrequencyDays">Every (days)</label>
                  <input id="customFrequencyDays" type="number" min="1" value={form.customFrequencyDays} onChange={set('customFrequencyDays')} />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="expectedDeliveryDate">Expected Delivery Date</label>
                <input id="expectedDeliveryDate" type="date" value={form.expectedDeliveryDate} onChange={set('expectedDeliveryDate')} />
              </div>
            </div>
          )}

          <div className="update-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Apply Changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </form>
      </div>
    </PageWrapper>
  )
}
