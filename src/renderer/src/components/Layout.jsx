// filepath: c:\Users\zackweb\Desktop\Dailly\src\renderer\src\components\Layout.jsx
import React, { useContext } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ThemeContext } from '../context/ThemeContext'
import MouseTracker from './MouseTracker'

function Layout() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  
  return (
    <div className="layout">
      {/* Add mouse tracker for enhanced interactive effects */}
      <MouseTracker />
      
      <header className="app-header">
        <h1>DAILY Journal</h1>
        <div className="header-actions">
          <nav>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/new">New Entry</NavLink>
          </nav>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
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
