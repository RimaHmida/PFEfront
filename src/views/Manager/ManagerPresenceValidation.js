import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CContainer, CButton, CSpinner, CBadge
} from '@coreui/react'
import { toast } from 'react-toastify'

const ManagerPresenceValidation = () => {
  const [affectations, setAffectations] = useState([])
  const [loading, setLoading] = useState(true)
  const [validatingId, setValidatingId] = useState(null)

  const token = localStorage.getItem('token')

  const fetchAffectations = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/manager/presences', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAffectations(data.data)
      toast.success('✅ Présences chargées')
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
    setValidatingId(affectationId)
    try {
      const res = await fetch(`http://localhost:8000/api/manager/presences/validate/${affectationId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await res.json()
      if (!res.ok) throw new Error()
      toast.success('✅ ' + result.message)
      fetchAffectations()
    } catch {
      toast.error('❌ Erreur lors de la validation')
    } finally {
      setValidatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center my-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <CContainer>
      <h2 className="text-center mb-4">📝 Validation des Présences</h2>
      {affectations.length === 0 ? (
        <p className="text-center text-muted">Aucune affectation passée.</p>
      ) : (
        affectations.map((aff) => (
          <CCard key={aff.id} className="mb-3 shadow-sm">
            <CCardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
              <div>{aff.site.nomsite} | {aff.date_debut} → {aff.date_fin}</div>
              {aff.validated_by_manager && (
                <CBadge color="success">Validée</CBadge>
              )}
            </CCardHeader>
            <CCardBody>
              <ul>
                {aff.employes.map(emp => (
                  <li key={emp.id}>
                    <strong>{emp.nom} {emp.prenom} :</strong>{' '}
                    {emp.presences.length > 0 ? (
                      emp.presences.map(p => (
                        <span key={p.id}>
                          {p.date} (
                          <span className={p.present ? 'text-success' : 'text-danger'}>
                            {p.present ? 'Présent' : 'Absent'}
                          </span>)
                        </span>
                      )).reduce((prev, curr) => [prev, ', ', curr])
                    ) : (
                      <span className="text-muted">Aucune présence enregistrée</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="text-end mt-3">
                <CButton
                  color="success"
                  disabled={aff.validated_by_manager || validatingId === aff.id}
                  onClick={() => handleValidate(aff.id)}
                >
                  {validatingId === aff.id ? <CSpinner size="sm" /> :
                    aff.validated_by_manager ? '✅ Déjà validée' : '✅ Valider l’affectation'}
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        ))
      )}
    </CContainer>
  )
}

export default ManagerPresenceValidation
