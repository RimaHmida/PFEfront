"use client"
import { useState, useEffect } from "react"
import {
  CAvatar,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CDropdownDivider
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilUser, cilAccountLogout, cilLockLocked } from "@coreui/icons"
import "./SidebarHeader.css"

const SidebarHeader = () => {
  const [user, setUser] = useState(null)
  const [imageError, setImageError] = useState(false)

  const loadUserFromStorage = () => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setImageError(false)
        return parsedUser
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données utilisateur:", error)
    }
    return null
  }

  useEffect(() => {
    loadUserFromStorage()

    const handleUserUpdate = () => {
      loadUserFromStorage()
    }

    const handleStorageChange = (e) => {
      if (e.key === "user") {
        loadUserFromStorage()
      }
    }

    window.addEventListener("user-updated", handleUserUpdate)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("user-updated", handleUserUpdate)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
  }

  const getInitials = (user) => {
    if (!user) return "U"
    const nom = user.nom || user.name || ""
    const prenom = user.prenom || user.firstName || ""

    if (nom && prenom) {
      return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase()
    }
    if (nom) {
      return nom.charAt(0).toUpperCase()
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  const getProfileImageUrl = () => {
    if (imageError || !user) return null

    const imageFields = ["profile_image_url", "profileImage", "profile_image", "avatar", "photo", "image_url"]

    for (const field of imageFields) {
      if (user[field]) {
        let imageUrl = user[field]
        if (!imageUrl.startsWith("http")) {
          imageUrl = `http://localhost:8000${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
        }
        const separator = imageUrl.includes("?") ? "&" : "?"
        return `${imageUrl}${separator}t=${Date.now()}`
      }
    }

    return null
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const profileImageUrl = getProfileImageUrl()

  return (
    <div className="sidebar-header-container">
      <CDropdown variant="nav-item" className="profile-dropdown">
        <CDropdownToggle caret={false} className="profile-toggle">
          <div className="profile-section">
            <div className="profile-avatar-wrapper">
              {profileImageUrl && !imageError ? (
                <CAvatar
                  src={profileImageUrl}
                  size="lg"
                  className="profile-avatar"
                  onError={handleImageError}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="profile-avatar-placeholder">{getInitials(user)}</div>
              )}
              <div className="profile-status-indicator"></div>
            </div>
          </div>
        </CDropdownToggle>

        <CDropdownMenu className="profile-dropdown-menu">
          <div className="dropdown-section">
            <CDropdownItem href="/profile" className="dropdown-item-custom">
              <CIcon className="dropdown-item-icon" icon={cilUser} size="sm" />
              <span>Mon Profil</span>
            </CDropdownItem>
            <CDropdownItem href="/changer-mot-de-passe" className="dropdown-item-custom">
              <CIcon className="dropdown-item-icon" icon={cilLockLocked} size="sm" />
              <span>Changer le mot de passe</span>
            </CDropdownItem>
          </div>

          <CDropdownDivider className="dropdown-divider-custom" />

          <CDropdownItem onClick={handleLogout} className="dropdown-item-custom logout-item">
            <CIcon className="dropdown-item-icon" icon={cilAccountLogout} size="sm" />
            <span>Déconnexion</span>
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </div>
  )
}

export default SidebarHeader
