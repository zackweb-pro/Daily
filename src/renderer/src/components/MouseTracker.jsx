import React, { useState, useEffect } from 'react'

// This component creates a more interactive UI by tracking mouse movement
// for enhanced visual effects
const MouseTracker = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    // Function to handle mouse movement
    const updateMousePosition = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
      
      // Update CSS variables for global access
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`)
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`)
      
      // Calculate normalized positions (0 to 1)
      const normalizedX = e.clientX / window.innerWidth
      const normalizedY = e.clientY / window.innerHeight
      document.documentElement.style.setProperty("--mouse-x-norm", `${normalizedX}`)
      document.documentElement.style.setProperty("--mouse-y-norm", `${normalizedY}`)
    }
    
    // Add event listener
    window.addEventListener("mousemove", updateMousePosition)
    
    // Cleanup
    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
    }
  }, [])
  
  // Render a cursor follower effect (subtle light glow)
  return (
    <div 
      className="cursor-follower"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
        transform: `translate(${mousePosition.x - 50}px, ${mousePosition.y - 50}px)`,
        opacity: 0.6,
        transition: "transform 0.1s ease-out",
        mixBlendMode: "screen"
      }}
    />
  )
}

export default MouseTracker
