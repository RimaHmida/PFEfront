// src/components/AppSidebar.js
"use client"

import { useEffect, useState } from "react"
import { CSidebar, CSidebarNav } from "@coreui/react"
import { AppSidebarNav } from "./AppSidebarNav"
import { getNav } from "../_nav"
import SidebarHeader from "./SidebarHeader"
import "./AppSidebar.css"
import '../styles/sidebar.css'

const AppSidebar = () => {
  const [navItems, setNavItems] = useState([])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user?.role) {
      const nav = getNav(user.role)
      setNavItems(nav)
    } else {
      setNavItems([])
    }
  }, [])

  if (navItems.length === 0) return null

  return (
    <CSidebar
      unfoldable
      visible
      className="custom-sidebar d-flex flex-column"
      style={{
        top: "65px",
        height: "calc(100vh - 65px)",
        zIndex: 1040,
        overflow: "hidden",
      }}
    >
      <SidebarHeader />
      <CSidebarNav className="flex-grow-1" style={{ overflow: "hidden", paddingBottom: "0" }}>
        <AppSidebarNav items={navItems} />
      </CSidebarNav>
    </CSidebar>
  )
}

export default AppSidebar
