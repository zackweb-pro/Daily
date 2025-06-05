import React, { useState, useRef } from 'react'

// Helper component that adds subtle 3D and modern effects to cards
export const EnhancedCard = ({ children, className, delay = 0 }) => {
  // State for mouse position tracking (for subtle 3D effect)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)

  // Handle mouse movement for subtle tilt effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    
    // Calculate position relative to card center
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    
    // Normalize values (less intense tilt)
    const normalizedX = x / (rect.width / 2) * 1.5
    const normalizedY = y / (rect.height / 2) * 1.5
    
    setPosition({ x: normalizedX, y: normalizedY })
  }
  
  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div
      ref={cardRef}
      className={`enhanced-card ${className || ""}`}
      style={{
        "--delay": delay,
        "--tilt-x": `${position.y}deg`,
        "--tilt-y": `${position.x}deg`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div className="card-reflection"></div>
      <div className="card-glow"></div>
    </div>
  )
}

// Modern tag component with enhanced visuals
export const ModernTag = ({ children }) => {
  return (
    <span className="modern-tag">
      {children}
      <span className="tag-glow"></span>
    </span>
  )
}

export default EnhancedCard
