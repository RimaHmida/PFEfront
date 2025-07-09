import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilLockLocked,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'

// 🔄 Image par défaut
import defaultAvatar from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user'))
  const photoUrl = user?.photo_url || defaultAvatar

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={photoUrl} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
          {user ? `${user.nom} ${user.prenom}` : 'Profil'}
        </CDropdownHeader>

        <CDropdownItem onClick={() => navigate('/profile')}>
          <CIcon icon={cilUser} className="me-2" />
          Profil
        </CDropdownItem>

        <CDropdownItem onClick={() => navigate('/changer-mot-de-passe')}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Changer le mot de passe
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem onClick={handleLogout}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Se déconnecter
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
