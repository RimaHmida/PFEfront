// src/views/Admin/AdminDashboardContent.js
import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CContainer,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilBuilding, cilClipboard, cilUser } from '@coreui/icons'

const AdminDashboardContent = () => {
  return (
    <CContainer>
      <h2 className="mb-4">Tableau de bord Administrateur</h2>
      <CRow>
        <CCol md={6} xl={4}>
          <CCard className="mb-4">
            <CCardHeader>
              <CIcon icon={cilPeople} className="me-2" /> Gestion des Employés
            </CCardHeader>
            <CCardBody>
              Ajouter, modifier ou supprimer des employés.
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6} xl={4}>
          <CCard className="mb-4">
            <CCardHeader>
              <CIcon icon={cilBuilding} className="me-2" /> Gestion des Sites
            </CCardHeader>
            <CCardBody>
              Ajouter, modifier ou supprimer les sites.
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6} xl={4}>
          <CCard className="mb-4">
            <CCardHeader>
              <CIcon icon={cilClipboard} className="me-2" /> Listes d'Affectation
            </CCardHeader>
            <CCardBody>
              Créer et gérer les listes d'affectation des employés.
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6} xl={4}>
          <CCard className="mb-4">
            <CCardHeader>
              <CIcon icon={cilUser} className="me-2" /> Utilisateurs
            </CCardHeader>
            <CCardBody>
              Gérer les comptes utilisateurs (administrateur IT uniquement).
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AdminDashboardContent
