import { api } from './api'
import { frequencyToDays, addDays } from '../utils/formatDate'

function normalizeOrder(row) {
  const ds = Array.isArray(row.delivery_schedules)
    ? row.delivery_schedules[0]
    : row.delivery_schedules
  return {
    orderId:              row.id,
    orderNumber:          row.order_number,
    userId:               row.user_id,
    status:               row.status,
    orderType:            row.order_type,
    orderNickname:        row.order_nickname,
    productName:          row.product_name,
    productType:          row.product_type,
    productQuantity:      row.product_quantity,
    storeName:            row.store_name,
    storeAddress:         row.store_address,
    itemDescription:      row.item_description,
    dateCreated:          row.created_at,
    dateOrdered:          row.ordered_at,
    deliveryFrequency:    ds?.delivery_frequency    ?? null,
    customFrequencyDays:  ds?.custom_frequency_days ?? null,
    untilCancelled:       ds?.until_cancelled       ?? false,
    numberOfDeliveries:   ds?.max_deliveries        ?? null,
    deliveriesCompleted:  ds?.delivery_count        ?? 0,
    lastDeliveryDate:     ds?.last_delivery_date    ?? null,
    expectedDeliveryDate: ds?.expected_delivery_date ?? null,
  }
}

const ORDER_SELECT = '*,delivery_schedules(*)'

export async function getOrders() {
  const { data } = await api.get(`/orders?select=${ORDER_SELECT}&order=created_at.desc`)
  return data.map(normalizeOrder)
}

export async function getOrderById(orderId) {
  const { data } = await api.get(`/orders?id=eq.${orderId}&select=${ORDER_SELECT}`)
  return data.length ? normalizeOrder(data[0]) : null
}

export async function createOrder(orderData) {
  const isDraft = orderData.status === 'draft'
  const now     = new Date().toISOString()

  let expectedDeliveryDate = null
  if (!isDraft && orderData.orderType === 'recurring' && orderData.deliveryFrequency) {
    const days = frequencyToDays(orderData.deliveryFrequency, orderData.customFrequencyDays)
    if (days) expectedDeliveryDate = addDays(now, days)
  }

  const orderRow = {
    user_id:          orderData.userId,
    status:           orderData.status || 'active',
    order_type:       orderData.orderType || 'one-time',
    order_nickname:   orderData.orderNickname ||
                      `${orderData.productName} from ${orderData.storeName}`,
    product_name:     orderData.productName     || '',
    product_type:     orderData.productType     || 'Other',
    product_quantity: orderData.productQuantity || 1,
    store_name:       orderData.storeName       || '',
    store_address:    orderData.storeAddress    || '',
    item_description: orderData.itemDescription || null,
    ordered_at:       isDraft ? null : now,
  }

  const { data: orderRows } = await api.post('/orders', orderRow)
  const order = Array.isArray(orderRows) ? orderRows[0] : orderRows

  if (orderData.orderType === 'recurring' && !isDraft) {
    const isUntilCancelled = orderData.untilCancelled ||
      orderData.numberOfDeliveries === 'until-cancelled'
    const scheduleRow = {
      order_id:               order.id,
      delivery_frequency:     orderData.deliveryFrequency,
      custom_frequency_days:  orderData.customFrequencyDays || null,
      until_cancelled:        isUntilCancelled,
      max_deliveries:         isUntilCancelled ? null : (orderData.numberOfDeliveries || 1),
      delivery_count:         0,
      expected_delivery_date: expectedDeliveryDate,
    }
    await api.post('/delivery_schedules', scheduleRow)
  }

  return getOrderById(order.id)
}

export async function updateOrder(orderId, updates) {
  const orderFields    = {}
  const scheduleFields = {}

  if ('status'          in updates) orderFields.status          = updates.status
  if ('orderNickname'   in updates) orderFields.order_nickname  = updates.orderNickname
  if ('productName'     in updates) orderFields.product_name    = updates.productName
  if ('productType'     in updates) orderFields.product_type    = updates.productType
  if ('productQuantity' in updates) orderFields.product_quantity = updates.productQuantity
  if ('storeName'       in updates) orderFields.store_name      = updates.storeName
  if ('storeAddress'    in updates) orderFields.store_address   = updates.storeAddress
  if ('itemDescription' in updates) orderFields.item_description = updates.itemDescription
  if ('orderType'       in updates) orderFields.order_type      = updates.orderType
  if ('dateOrdered'     in updates) orderFields.ordered_at      = updates.dateOrdered

  if (Object.keys(orderFields).length > 0) {
    await api.patch(`/orders?id=eq.${orderId}`, orderFields)
  }

  if ('deliveriesCompleted'  in updates) scheduleFields.delivery_count        = updates.deliveriesCompleted
  if ('lastDeliveryDate'     in updates) scheduleFields.last_delivery_date    = updates.lastDeliveryDate
  if ('expectedDeliveryDate' in updates) scheduleFields.expected_delivery_date = updates.expectedDeliveryDate
  if ('deliveryFrequency'    in updates) scheduleFields.delivery_frequency    = updates.deliveryFrequency
  if ('customFrequencyDays'  in updates) scheduleFields.custom_frequency_days = updates.customFrequencyDays

  if ('numberOfDeliveries' in updates) {
    if (updates.numberOfDeliveries === 'until-cancelled') {
      scheduleFields.until_cancelled = true
      scheduleFields.max_deliveries  = null
    } else {
      scheduleFields.until_cancelled = false
      scheduleFields.max_deliveries  = updates.numberOfDeliveries
    }
  }

  if (Object.keys(scheduleFields).length > 0) {
    await api.patch(`/delivery_schedules?order_id=eq.${orderId}`, scheduleFields)
  }

  return getOrderById(orderId)
}

export async function deleteOrder(orderId) {
  await api.delete(`/orders?id=eq.${orderId}`)
}
