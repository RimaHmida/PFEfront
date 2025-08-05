// AdminITDashboard.jsx
import React, { useEffect, useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CBadge,
  CSpinner,
} from '@coreui/react'
import { CChartPie } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilUser, cilLockLocked, cilChart, cilWarning, cilPlus } from '@coreui/icons'
import axios from 'axios'

const KPIBox = ({ color, icon, title, value }) => (
  <CCard
    className="shadow-sm"
    style={{
      backgroundColor: color,
      borderRadius: '0.75rem',
      color: '#fff',
    }}
  >
    <CCardBody className="d-flex align-items-center justify-content-between p-4">
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{value}</div>
        <div>{title}</div>
      </div>
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          padding: '0.6rem',
        }}
      >
        <CIcon icon={icon} size="xl" />
      </div>
    </CCardBody>
  </CCard>
)

const InfoCard = ({ title, children }) => (
  <CCard className="mb-4 shadow-sm" style={{ borderRadius: '0.75rem' }}>
    <CCardHeader className="fw-semibold text-dark bg-light">{title}</CCardHeader>
    <CCardBody>{children}</CCardBody>
  </CCard>
)

const AdminITDashboard = () => {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('http://localhost:8000/api/admin/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setStats(res.data)
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques :', err)
      }
    }
    fetchStats()
  }, [])

  if (!stats) {
    return (
      <CContainer fluid className="px-4">
        <div className="text-center py-5">
          <CSpinner color="primary" />
          <p className="mt-3">Chargement des statistiques...</p>
        </div>
      </CContainer>
    )
  }

  const roleLabels = stats.users_by_role.map((r) => r.role)
  const roleData = stats.users_by_role.map((r) => r.count)
  const pieColors = ['#4F46E5', '#6B7280', '#9CA3AF', '#374151', '#1F2937']

  return (
    <CContainer fluid className="px-4">
      <h3 className="fw-semibold mb-4" style={{ color: '#374151' }}>
        Tableau de bord Administrateur IT
      </h3>

      <CRow className="g-4 mb-4">
        <CCol md={4}>
          <KPIBox
            title="Nombre total d'utilisateurs"
            value={stats.total_users}
            icon={cilUser}
            color="#4F46E5"
          />
        </CCol>
        <CCol md={4}>
          <KPIBox
            title="Connexions aujourd’hui"
            value={stats.logins_today}
            icon={cilLockLocked}
            color="#6B7280"
          />
        </CCol>
        <CCol md={4}>
          <KPIBox
            title="Utilisateurs actifs aujourd’hui"
            value={stats.active_users_today}
            icon={cilChart}
            color="#374151"
          />
        </CCol>
      </CRow>

      <CRow className="g-4">
        <CCol md={6}>
          <InfoCard title="Répartition des utilisateurs par rôle">
            <CChartPie
              data={{
                labels: roleLabels,
                datasets: [{ data: roleData, backgroundColor: pieColors.slice(0, roleLabels.length) }],
              }}
              options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }}
              style={{ height: '280px' }}
            />
          </InfoCard>
        </CCol>

        <CCol md={6}>
          <InfoCard title="Tentatives échouées aujourd’hui">
            <div className="d-flex align-items-center">
              <CIcon icon={cilWarning} size="xl" className="text-danger me-3" />
              <h2 className="text-danger fw-bold mb-0">{stats.failed_logins_today}</h2>
            </div>
          </InfoCard>

          <InfoCard title="Nouveaux comptes (7 jours)">
            {stats.new_users_last_7_days.length === 0 ? (
              <p className="text-muted">Aucun nouveau compte.</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {stats.new_users_last_7_days.map((u) => (
                  <li key={u.id} className="mb-2">
                    <CIcon icon={cilPlus} className="text-primary me-2" />
                    <strong>{u.nom} {u.prenom}</strong>
                    <CBadge color="secondary" className="ms-2">{u.role}</CBadge>
                  </li>
                ))}
              </ul>
            )}
          </InfoCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AdminITDashboard
