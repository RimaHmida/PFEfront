import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CContainer,
  CButton,
  CFormCheck,
  CSpinner,
} from '@coreui/react'
import { toast } from 'react-toastify'

const ManagerPresenceValidation = () => {
  const [presences, setPresences] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])

  const token = localStorage.getItem('token')

  const fetchPresences = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/manager/presences', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setPresences(data.data)
      toast.success('✅ Présences à valider chargées')
    } catch (err) {
      toast.error('❌ Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPresences()
  }, [token])

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleValidate = async () => {
    if (selectedIds.length === 0) {
      toast.info('Veuillez sélectionner au moins une présence')
      return
    }
    try {
      const res = await fetch('http://localhost:8000/api/manager/presences/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ validate_ids: selectedIds }),
      })
      const result = await res.json()
      toast.success('✅ ' + result.message)
      setSelectedIds([])
      fetchPresences()
    } catch (err) {
      toast.error('❌ Erreur lors de la validation')
    }
  }

  if (loading) return <CSpinner color="primary" />

  return (
    <CContainer>
      <h2>Validation des Présences</h2>
      {presences.length === 0 ? (
        <p>Aucune présence à valider.</p>
      ) : (
        presences.map((presence) => (
          <CCard key={presence.id} className="mb-3">
            <CCardHeader>
              {presence.employe.nom} {presence.employe.prenom} | {presence.affectation_liste.site.nomsite}
            </CCardHeader>
            <CCardBody>
              <p>Date : {presence.date}</p>
              <CFormCheck
                label="Valider cette présence"
                checked={selectedIds.includes(presence.id)}
                onChange={() => handleToggle(presence.id)}
              />
            </CCardBody>
          </CCard>
        ))
      )}
      {presences.length > 0 && (
        <CButton color="success" onClick={handleValidate} className="mt-3">
          Valider les présences sélectionnées
        </CButton>
      )}
    </CContainer>
  )
}

export default ManagerPresenceValidation
