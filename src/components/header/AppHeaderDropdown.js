import React, { useState, useEffect } from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilLockLocked, cilUser, cilAccountLogout } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'

import defaultAvatar from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {})
  const [visible, setVisible] = useState(false)

  const photoUrl = user?.photo
    ? `http://localhost:8000/${user.photo.replace(/^\/+/, '')}`
    : defaultAvatar

  useEffect(() => {
    const handleUserUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user')) || {}
      setUser(updatedUser)
    }

    window.addEventListener('user-updated', handleUserUpdate)
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <CDropdown
      className="mx-2"
      placement="bottom-end"
      visible={visible}
      onVisibleChange={(val) => {
        // prevent double render glitch
        if (val !== visible) setVisible(val)
      }}
    >
      <CDropdownToggle caret={false} className="py-0">
        <CAvatar src={photoUrl} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0">
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2 text-center">
          {user?.nom && user?.prenom ? `${user.prenom} ${user.nom}` : 'Utilisateur'}
        </CDropdownHeader>

        <CDropdownItem onClick={() => navigate('/profile')}>
          <CIcon icon={cilUser} className="me-2" />
          Mon Profil
        </CDropdownItem>

        <CDropdownItem onClick={() => navigate('/changer-mot-de-passe')}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Changer le mot de passe
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem onClick={handleLogout}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Se déconnecter
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
