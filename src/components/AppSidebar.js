import React, { useEffect, useState } from 'react'
import { CSidebar, CSidebarNav } from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import { getNav } from '../_nav'

const AppSidebar = () => {
  const [navItems, setNavItems] = useState([])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user?.role) {
      const nav = getNav(user.role)
      setNavItems(nav)
    } else {
      setNavItems([]) // 🔒 rien pour non connecté
    }
  }, [])

  // 🔒 cache le sidebar si vide (non connecté)
  if (navItems.length === 0) return null

  return (
    <CSidebar unfoldable visible>
      <CSidebarNav>
        <AppSidebarNav items={navItems} />
      </CSidebarNav>
    </CSidebar>
  )
}

export default AppSidebar
