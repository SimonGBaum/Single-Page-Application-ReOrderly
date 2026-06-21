import { createContext, useContext, useReducer, useEffect } from 'react'
import * as orderService from '../services/orderService'
import { useAuth } from './AuthContext'

const OrdersContext = createContext(null)

const initialState = { orders: [], activeTab: 'all' }

function ordersReducer(state, action) {
  switch (action.type) {
    case 'SET_ORDERS':
      return { ...state, orders: action.payload }
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] }
    case 'UPDATE_ORDER': {
      const orders = state.orders.map(o =>
        o.orderId === action.payload.orderId
          ? { ...o, ...action.payload.updates }
          : o
      )
      return { ...state, orders }
    }
    case 'DELETE_ORDER':
      return { ...state, orders: state.orders.filter(o => o.orderId !== action.payload) }
    case 'SET_TAB':
      return { ...state, activeTab: action.payload }
    default:
      return state
  }
}

export function OrdersProvider({ children }) {
  const [state, dispatch] = useReducer(ordersReducer, initialState)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      orderService.getOrders().then(orders => dispatch({ type: 'SET_ORDERS', payload: orders }))
    } else {
      dispatch({ type: 'SET_ORDERS', payload: [] })
    }
  }, [user])

  return (
    <OrdersContext.Provider value={{ ...state, dispatch }}>
      {children}
    </OrdersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used inside OrdersProvider')
  return ctx
}
