import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  CCard, CCardBody, CCardHeader,
  CRow, CCol, CListGroup, CListGroupItem, CBadge, CAlert, CSpinner, CContainer
} from '@coreui/react'
import { CChartDoughnut } from '@coreui/react-chartjs'

const AdminDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:8000/api/admin/dashboard-data')
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur chargement dashboard admin :', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <CSpinner color="primary" size="lg" />
      </div>
    )
  }

  const headerColor = "#1E3A8A"
  const cardShadow = "0 4px 8px rgba(0,0,0,0.05)"

  return (
    <CContainer style={{ marginTop: '30px' }}>
      <div
        style={{
          background: headerColor,
          padding: "16px",
          borderRadius: "8px",
          color: "white",
          marginBottom: "24px",
          textAlign: "center"
        }}
      >
        <h3 style={{ margin: 0 }}>📊 Tableau de Bord Administrateur</h3>
      </div>

      <CRow className="mb-4">
        {[
          { label: 'Total Sites', value: data.total_sites, color: 'primary', icon: '📌' },
          { label: 'Total Employés', value: data.total_employes, color: 'success', icon: '👥' },
          { label: 'Total Affectations', value: data.total_affectations, color: 'info', icon: '📂' }
        ].map((item, index) => (
          <CCol md={4} key={index}>
            <CCard style={{ boxShadow: cardShadow, border: 'none', borderRadius: '8px' }}>
              <CCardBody className="text-center">
                <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
                <h1 className={`text-${item.color} mt-2 mb-0`}>{item.value}</h1>
                <small className="text-muted">{item.label}</small>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CRow className="mb-4">
        <CCol md={6}>
          <CCard style={{ boxShadow: cardShadow, border: 'none', borderRadius: '8px' }}>
            <CCardHeader style={{ background: headerColor, color: 'white' }}>🗓️ Affectations en cours</CCardHeader>
            <CCardBody>
              {data.affectations_en_cours.length > 0 ? (
                <CListGroup flush>
                  {data.affectations_en_cours.map(item => (
                    <CListGroupItem key={item.id}>
                      <strong>{item.site.nomsite}</strong> <span className="text-muted">| {item.date_debut} → {item.date_fin}</span>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              ) : <CAlert color="info" className="text-center">Aucune affectation en cours</CAlert>}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard style={{ boxShadow: cardShadow, border: 'none', borderRadius: '8px' }}>
            <CCardHeader style={{ background: headerColor, color: 'white' }}>🗓️ Affectations à venir</CCardHeader>
            <CCardBody>
              {data.affectations_a_venir.length > 0 ? (
                <CListGroup flush>
                  {data.affectations_a_venir.map(item => (
                    <CListGroupItem key={item.id}>
                      <strong>{item.site.nomsite}</strong> <span className="text-muted">| {item.date_debut} → {item.date_fin}</span>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              ) : <CAlert color="info" className="text-center">Aucune affectation à venir</CAlert>}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={6}>
          <CCard style={{ boxShadow: cardShadow, border: 'none', borderRadius: '8px' }}>
            <CCardHeader style={{ background: headerColor, color: 'white' }}>🚧 Employés sans affectation</CCardHeader>
            <CCardBody>
              {data.employes_sans_affectation.length > 0 ? (
                <CListGroup flush>
                  {data.employes_sans_affectation.map(e => (
                    <CListGroupItem key={e.id}>
                      {e.nom} {e.prenom}
                      <CBadge color="warning" className="float-end">{e.statut}</CBadge>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              ) : <CAlert color="success" className="text-center">Tous les employés sont affectés</CAlert>}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard style={{ boxShadow: cardShadow, border: 'none', borderRadius: '8px' }}>
            <CCardHeader style={{ background: headerColor, color: 'white' }}>🚫 Employés en récupération</CCardHeader>
            <CCardBody>
              {data.employes_en_recuperation.length > 0 ? (
                <CListGroup flush>
                  {data.employes_en_recuperation.map(e => (
                    <CListGroupItem key={e.id}>
                      {e.nom} {e.prenom}
                      <CBadge color="secondary" className="float-end">{e.statut}</CBadge>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              ) : <CAlert color="success" className="text-center">Aucun en récupération</CAlert>}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={{ span: 6, offset: 3 }}>
          <CCard style={{ boxShadow: cardShadow, border: 'none', borderRadius: '8px' }}>
            <CCardHeader style={{ background: headerColor, color: 'white' }}>📊 Répartition des Statuts</CCardHeader>
            <CCardBody>
              <CChartDoughnut
                data={{
                  labels: ['En Travail', 'En Récupération', 'Non Affectés'],
                  datasets: [{
                    backgroundColor: ['#2eb85c', '#e55353', '#f9b115'],
                    data: [
                      data.total_employes - data.employes_en_recuperation.length - data.employes_sans_affectation.length,
                      data.employes_en_recuperation.length,
                      data.employes_sans_affectation.length
                    ]
                  }]
                }}
                options={{
                  plugins: { legend: { position: 'bottom' } }
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AdminDashboard
