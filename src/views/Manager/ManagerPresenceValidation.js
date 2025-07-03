import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CContainer,
  CButton, CSpinner
} from '@coreui/react'
import { toast } from 'react-toastify'

const ManagerPresenceValidation = () => {
  const [affectations, setAffectations] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  const fetchAffectations = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/manager/presences', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setAffectations(data.data)
      toast.success('✅ Présences à valider chargées')
    } catch {
      toast.error('❌ Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAffectations()
  }, [token])

  const handleValidate = async (affectationId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/manager/presences/validate/${affectationId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await res.json()
      toast.success('✅ ' + result.message)
      fetchAffectations()
    } catch {
      toast.error('❌ Erreur lors de la validation')
    }
  }

  if (loading) return <CSpinner color="primary" />

  return (
    <CContainer>
      <h2>Validation des Présences</h2>
      {affectations.length === 0 ? (
        <p>Aucune affectation à valider.</p>
      ) : (
        affectations.map((aff) => (
          <CCard key={aff.id} className="mb-3">
            <CCardHeader>
              {aff.site.nomsite} | {aff.date_debut} → {aff.date_fin}
            </CCardHeader>
            <CCardBody>
              <ul>
                {aff.employes.map(emp => (
                  <li key={emp.id}>
                    {emp.nom} {emp.prenom} : 
                    {emp.presences.map(p => ` ${p.date} (${p.present ? 'Présent' : 'Absent'})`).join(', ')}
                  </li>
                ))}
              </ul>
              <CButton
                color="success"
                onClick={() => handleValidate(aff.id)}
              >
                ✅ Valider l’affectation
              </CButton>
            </CCardBody>
          </CCard>
        ))
      )}
    </CContainer>
  )
}

export default ManagerPresenceValidation
