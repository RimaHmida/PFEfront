// src/_nav.js
import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilBell,
  cilUser,
  cilAddressBook,
  cilClipboard,
  cilPeople,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

export function getNav(role) {
  if (!role) return []

  const common = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    },
  ]

  let roleBased = []
//
if (role === 'administrateur_it') {
  roleBased = [
    {
      component: CNavItem,
      name: 'Gestion des Employés',
      to: '/admin/employes',
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Gestion des Sites',
      to: '/admin/sites',
      icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Affectations',
      to: '/admin/affectations',
      icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Utilisateurs',
      to: '/admin/users',
      icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Validation des Présences',
      to: '/manager/presences',
      icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    },
  
    {
      component: CNavItem,
      name: 'Présence Journalière',
      to: '/secretaire/presences',
      icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
    },
  ]
} else if (role === 'administrateur') {
  roleBased = [
    {
      component: CNavItem,
      name: 'Gestion des Employés',
      to: '/admin/employes',
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Gestion des Sites',
      to: '/admin/sites',
      icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Affectations',
      to: '/admin/affectations',
      icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    },
   
  ]

  } else if (role === 'manager') {
    roleBased = [
      {
        component: CNavItem,
        name: 'Validation des Présences',
        to: '/manager/presences',
        icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Présence Journalière',
        to: '/secretaire/presences',
        icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
      },
    ]
  } else if (role === 'secretaire') {
    roleBased = [
      {
        component: CNavItem,
        name: 'Présence Journalière',
        to: '/secretaire/presences',
        icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
      },
    ]
  }

  return [
    ...common,
    {
      component: CNavTitle,
      name: 'Fonctionnalités',
    },
    ...roleBased,
  ]
}
