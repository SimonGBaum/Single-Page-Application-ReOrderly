import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconChevronDown, IconChevronUp, IconTrash, IconEdit, IconRadar,
  IconAlertCircle, IconInbox
} from '@tabler/icons-react'
import PageWrapper from '../../components/PageWrapper/PageWrapper'
import { useOrders } from '../../context/OrdersContext'
import { useAuth }   from '../../context/AuthContext'
import * as orderService from '../../services/orderService'
import { getDraft, clearDraft } from '../../services/draftService'
import { formatDate } from '../../utils/formatDate'
import './Orders.css'

const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'active',    label: 'Active' },
  { key: 'draft',     label: 'Drafts' },
  { key: 'completed', label: 'Completed' },
]

const SORT_OPTIONS = [
  { value: 'dateCreated',          label: 'Date Created' },
  { value: 'orderNickname',        label: 'Name' },
  { value: 'expectedDeliveryDate', label: 'Expected Delivery' },
  { value: 'lastDeliveryDate',     label: 'Last Delivery' },
  { value: 'deliveriesCompleted',  label: 'Deliveries Completed' },
]

function sortOrders(orders, field) {
  return [...orders].sort((a, b) => {
    const av = a[field], bv = b[field]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'string') return av.localeCompare(bv)
    return av - bv
  })
}

export default function Orders() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { orders, activeTab, dispatch } = useOrders()

  const [sortField,  setSortField]  = useState('dateCreated')
  const [expandedId, setExpandedId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  function setTab(tab) { dispatch({ type: 'SET_TAB', payload: tab }) }

  function filtered() {
    if (activeTab === 'all') return orders.filter(o => o.status !== 'draft')
    if (activeTab === 'draft') return orders.filter(o => o.status === 'draft')
    if (activeTab === 'completed') return orders.filter(o => ['completed','cancelled'].includes(o.status))
    return orders.filter(o => ['active','out-for-delivery','delivered','paused'].includes(o.status))
  }

  const visible = sortOrders(filtered(), sortField)
  const draft   = getDraft(user?.userId)

  async function handleDelete(orderId) {
    setDeletingId(orderId)
    try {
      await orderService.deleteOrder(orderId)
      dispatch({ type: 'DELETE_ORDER', payload: orderId })
      setExpandedId(null)
      setConfirmDeleteId(null)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDiscardDraft() {
    clearDraft(user.userId)
    const draftInList = orders.find(o => o.status === 'draft')
    if (draftInList) {
      await orderService.deleteOrder(draftInList.orderId)
      dispatch({ type: 'DELETE_ORDER', payload: draftInList.orderId })
    }
  }

  return (
    <PageWrapper page="orders">
      <div className="page-content">
        <h1 className="orders-title">Your Orders</h1>

        {/* Tabs */}
        <div className="orders-tabs" role="tablist" aria-label="Order filter tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              role="tab"
              aria-selected={activeTab === t.key}
              className={`orders-tab ${activeTab === t.key ? 'orders-tab--active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === 'draft' && draft && <span className="orders-tab__badge">1</span>}
            </button>
          ))}
        </div>

        {/* Sort bar */}
        <div className="orders-sort">
          <label htmlFor="sortField" className="orders-sort__label">Sort by:</label>
          <select id="sortField" className="orders-sort__select" value={sortField}
            onChange={e => setSortField(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Draft banner in Drafts tab */}
        {activeTab === 'draft' && draft && (
          <div className="draft-banner card">
            <div className="draft-banner__info">
              <IconAlertCircle size={20} stroke={1.5} color="#C9A84C" aria-hidden="true" />
              <span>You have an unfinished order in progress.</span>
            </div>
            <div className="draft-banner__actions">
              <button className="btn-primary btn-sm" onClick={() => navigate('/create')}>Resume Draft</button>
              <button className="btn-secondary btn-sm" onClick={handleDiscardDraft}>Discard</button>
            </div>
          </div>
        )}

        {/* Order list */}
        {visible.length === 0 ? (
          <div className="orders-empty">
            <IconInbox size={48} stroke={1.5} color="var(--text-secondary)" aria-hidden="true" />
            <p>Looks like your order queue is emptier than space. Let's fix that.</p>
            <button className="btn-primary" onClick={() => navigate('/create')}>Launch an Order</button>
          </div>
        ) : (
          <ul className="orders-list">
            {visible.map(order => (
              <li key={order.orderId} className={`orders-item card ${expandedId === order.orderId ? 'orders-item--expanded' : ''}`}>
                {/* Row header */}
                <button
                  className="orders-item__row"
                  onClick={() => setExpandedId(expandedId === order.orderId ? null : order.orderId)}
                  aria-expanded={expandedId === order.orderId}
                >
                  <div className="orders-item__info">
                    <span className="orders-item__name">{order.orderNickname}</span>
                    <span className="data-text orders-item__id">{order.orderId.slice(0, 8)}</span>
                  </div>
                  <div className="orders-item__meta">
                    <span className={`status-badge status-badge--${order.status}`}>{order.status.replace('-', ' ')}</span>
                    <span className="data-text orders-item__date">{formatDate(order.dateCreated)}</span>
                  </div>
                  {expandedId === order.orderId
                    ? <IconChevronUp  size={18} stroke={1.5} aria-hidden="true" />
                    : <IconChevronDown size={18} stroke={1.5} aria-hidden="true" />
                  }
                </button>

                {/* Expanded detail */}
                {expandedId === order.orderId && (
                  <div className="orders-detail">
                    <div className="orders-detail__grid">
                      <DetailRow label="Product"      value={order.productName} />
                      <DetailRow label="Quantity"     value={order.productQuantity} />
                      <DetailRow label="Type"         value={order.productType || '—'} />
                      <DetailRow label="Store"        value={order.storeName} />
                      <DetailRow label="Store Address" value={order.storeAddress} />
                      <DetailRow label="Order Type"   value={order.orderType} />
                      {order.orderType === 'recurring' && (
                        <DetailRow label="Frequency" value={order.deliveryFrequency === 'custom'
                          ? `Every ${order.customFrequencyDays} days`
                          : order.deliveryFrequency} />
                      )}
                      <DetailRow label="Expected Delivery" value={formatDate(order.expectedDeliveryDate)} />
                      <DetailRow label="Last Delivery"     value={formatDate(order.lastDeliveryDate)} />
                      <DetailRow label="Deliveries Done"   value={order.deliveriesCompleted} />
                      {order.itemDescription && (
                        <DetailRow label="Notes" value={order.itemDescription} wide />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="orders-detail__actions">
                      <button className="btn-secondary btn-sm"
                        onClick={() => navigate(`/update/${order.orderId}`)}>
                        <IconEdit size={16} stroke={1.5} aria-hidden="true" /> Update
                      </button>
                      <button className="btn-secondary btn-sm"
                        onClick={() => navigate(`/track/${order.orderId}`)}>
                        <IconRadar size={16} stroke={1.5} aria-hidden="true" /> Track
                      </button>
                      {confirmDeleteId === order.orderId ? (
                        <div className="orders-confirm-delete">
                          <span>Sure you want to scrap this order?</span>
                          <button className="btn-danger btn-sm"
                            disabled={deletingId === order.orderId}
                            onClick={() => handleDelete(order.orderId)}>
                            {deletingId === order.orderId ? 'Scrapping…' : 'Yes, scrap it'}
                          </button>
                          <button className="btn-secondary btn-sm" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="btn-danger btn-sm" onClick={() => setConfirmDeleteId(order.orderId)}>
                          <IconTrash size={16} stroke={1.5} aria-hidden="true" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageWrapper>
  )
}

function DetailRow({ label, value, wide }) {
  return (
    <div className={`detail-row ${wide ? 'detail-row--wide' : ''}`}>
      <span className="detail-row__label">{label}</span>
      <span className="detail-row__value data-text">{value ?? '—'}</span>
    </div>
  )
}
