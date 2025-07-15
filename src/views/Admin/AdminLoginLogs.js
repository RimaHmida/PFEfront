import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CBadge,
} from '@coreui/react'
import axios from 'axios'

const AdminLoginLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:8000/api/admin/login-logs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setLogs(response.data.data)
      } catch (error) {
        console.error('Erreur lors du chargement des logs :', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>📝 Logs de Connexion</strong>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center"><CSpinner color="primary" /></div>
        ) : (
          <CTable hover responsive bordered>
           <CTableHead color="light">
  <CTableRow>
    <CTableHeaderCell>#</CTableHeaderCell>
    <CTableHeaderCell>Nom</CTableHeaderCell>
    <CTableHeaderCell>Email</CTableHeaderCell>
    <CTableHeaderCell>Adresse IP</CTableHeaderCell>
    <CTableHeaderCell>Appareil</CTableHeaderCell>
    <CTableHeaderCell>Date</CTableHeaderCell>
    <CTableHeaderCell>Statut</CTableHeaderCell>
    <CTableHeaderCell>Message</CTableHeaderCell>
  </CTableRow>
</CTableHead>

            <CTableBody>
              {logs.map((log, index) => (
                <CTableRow key={log.id}>
                  <CTableHeaderCell>{index + 1}</CTableHeaderCell>
                  <CTableDataCell>
                    {log.user ? `${log.user.nom} ${log.user.prenom}` : 'Utilisateur inconnu'}
                  </CTableDataCell>

                  <CTableDataCell>
                    <CBadge color="info">
                      {log.user ? log.user.email : log.email}
                    </CBadge>
                  </CTableDataCell>

                  <CTableDataCell>{log.ip_address}</CTableDataCell>

                  <CTableDataCell>
                    <small>{log.user_agent.substring(0, 40)}...</small>
                  </CTableDataCell>

                  <CTableDataCell>{new Date(log.created_at).toLocaleString()}</CTableDataCell>

                   {/* ✅ Nouveau statut */}
                  <CTableDataCell>
                   {log.status === 'success' ? (
                <CBadge color="success">🟢 Succès</CBadge>
                ) : (
               <CBadge color="danger">❌ Échec</CBadge>
                 )}
                 </CTableDataCell>

              {/* ✅ Nouveau message */}
                <CTableDataCell>{log.message || '—'}</CTableDataCell>
                </CTableRow>
                ))}
                </CTableBody>
               </CTable>
               )}
      </CCardBody>
    </CCard>
  )
}

export default AdminLoginLogs
