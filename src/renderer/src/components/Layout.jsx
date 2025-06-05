import { useContext } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import MouseTracker from './MouseTracker'
import { IoSunny, IoMoon, IoHomeOutline, IoAddOutline } from 'react-icons/io5'
import featherQuill from '../../../../resources/icon.png'

import './nav-menu.css'

function Layout() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  
  return (
    <div className="layout">
      {/* Add mouse tracker for enhanced interactive effects */}
      <MouseTracker />
      
      <header className="app-header">
        <div className="app-title">
          <div className="logo-container">
            <img src={featherQuill} alt="Feather Quill" className="logo-icon" style={{borderRadius: "50px"}} />
          </div>
          <h1>DAILY Journal</h1>
        </div>
        <div className="header-actions">
          <nav
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = ((e.clientX - rect.left) / rect.width) * 100
              const y = ((e.clientY - rect.top) / rect.height) * 100
              document.documentElement.style.setProperty('--mouse-x-nav', `${x}%`)
              document.documentElement.style.setProperty('--mouse-y-nav', `${y}%`)
            }}
          >
            <NavLink to="/" end>
              <IoHomeOutline /> Home
            </NavLink>
            <NavLink to="/new">
              <IoAddOutline /> New Entry
            </NavLink>
          </nav>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'light' ? <IoMoon /> : <IoSunny />}
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
