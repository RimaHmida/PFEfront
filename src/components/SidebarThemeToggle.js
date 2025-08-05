// src/components/SidebarThemeToggle.js
import React, { useState, useEffect } from 'react'
import CIcon from '@coreui/icons-react'
import { cilContrast } from '@coreui/icons'
import { useColorModes } from '@coreui/react'
import './SidebarThemeToggle.css'

const modes = ['light', 'dark', 'auto']

const SidebarThemeToggle = () => {
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const [index, setIndex] = useState(modes.indexOf(colorMode))

  useEffect(() => {
    const saved = localStorage.getItem('coreui-theme')
    if (saved && modes.includes(saved)) {
      setIndex(modes.indexOf(saved))
    }
  }, [])

  const toggleTheme = () => {
    const nextIndex = (index + 1) % modes.length
    const nextMode = modes[nextIndex]
    setIndex(nextIndex)
    setColorMode(nextMode)
    localStorage.setItem('coreui-theme', nextMode)
  }

  return (
    <div className="sidebar-theme-toggle nav-link w-100 d-flex align-items-center" onClick={toggleTheme}>
      <CIcon icon={cilContrast} className="nav-icon" />
      <span className="nav-label ms-2">Thème</span>
    </div>
  )
}

export default SidebarThemeToggle
