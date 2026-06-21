import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrdersContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dispatch: ordersDispatch } = useOrders()
  const navigate = useNavigate()

  async function handleLogout() {
    ordersDispatch({ type: 'SET_ORDERS', payload: [] })
    await logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Left: user greeting */}
        <div className="navbar__left">
          {user && (
            <>
              <Link to="/profile" className="navbar__username">
                {user.firstName}
              </Link>
              <button
                className="navbar__logout"
                onClick={handleLogout}
                aria-label="Log out"
              >
                Log Out
              </button>
            </>
          )}
        </div>

        {/* Center: logo */}
        <Link to="/" className="navbar__logo" aria-label="ReOrderly home">
          REORDERLY
        </Link>

        {/* Right: clock */}
        <div className="navbar__right">
          <NavClock />
        </div>
      </div>

      {/* Main nav */}
      {user && (
        <nav className="navbar__nav" aria-label="Main navigation">
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `navbar__nav-link navbar__nav-link--create ${isActive ? 'active' : ''}`
            }
          >
            Create
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `navbar__nav-link navbar__nav-link--orders ${isActive ? 'active' : ''}`
            }
          >
            Orders
          </NavLink>
          <NavLink
            to="/update"
            className={({ isActive }) =>
              `navbar__nav-link navbar__nav-link--update ${isActive ? 'active' : ''}`
            }
          >
            Update
          </NavLink>
          <NavLink
            to="/track"
            className={({ isActive }) =>
              `navbar__nav-link navbar__nav-link--track ${isActive ? 'active' : ''}`
            }
          >
            Track
          </NavLink>
        </nav>
      )}
    </header>
  )
}

function NavClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="navbar__clock" aria-live="off" aria-label={`Current time: ${time}`}>
      <span className="navbar__clock-time">{time}</span>
      <span className="navbar__clock-date">{date}</span>
    </div>
  )
}
