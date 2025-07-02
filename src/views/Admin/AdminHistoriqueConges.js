import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CSpinner,
  CFormSelect,
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CForm,
  CFormTextarea,
  CModalFooter
} from '@coreui/react'
import { toast } from 'react-toastify'

const AdminHistoriqueConges = () => {
  const [conges, setConges] = useState([])
  const [filteredConges, setFilteredConges] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterEmploye, setFilterEmploye] = useState('')
  const [filterType, setFilterType] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedConge, setSelectedConge] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editFile, setEditFile] = useState(null)
  const token = localStorage.getItem('token')

  // Variables de design
  const headerFooterColor = "#1E3A8A"   // En-têtes et modaux
  const buttonPrimary = "#3B82F6"       // Boutons principaux
  const backgroundGeneral = "#F9FAFB"   // Fond général
  const borderColor = "#E5E7EB"         // Bordures discrètes
  const cardBackground = "#FFFFFF"      // Fond blanc pour le contenu
  const boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)"

  useEffect(() => {
    fetchConges()
  }, [])

  const fetchConges = () => {
    fetch('http://localhost:8000/api/admin/conges', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setConges(data.data || [])
        setFilteredConges(data.data || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("❌ Erreur lors du chargement de l'historique des congés")
        setLoading(false)
      })
  }

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer ce congé ?")) return
    fetch(`http://localhost:8000/api/admin/conges/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        toast.success("Congé supprimé")
        fetchConges()
      })
      .catch(() => toast.error("Erreur lors de la suppression"))
  }

  const handleEdit = (conge) => {
    setSelectedConge(conge)
    setEditForm({ ...conge })
    setEditFile(null)
    setEditModalOpen(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm({ ...editForm, [name]: value })
  }

  const handleEditSubmit = () => {
    const formDataPayload = new FormData()
    Object.keys(editForm).forEach(key => formDataPayload.append(key, editForm[key]))
    if (editFile) formDataPayload.append('document', editFile)

    fetch(`http://localhost:8000/api/admin/conges/${selectedConge.id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formDataPayload,
    })
      .then(res => res.json())
      .then(() => {
        toast.success("Congé modifié")
        fetchConges()
        setEditModalOpen(false)
      })
      .catch(() => toast.error("Erreur lors de la modification"))
  }

  const applyFilters = () => {
    const filtered = conges.filter(c => {
      return (
        (!filterEmploye || `${c.employe?.nom} ${c.employe?.prenom}`.toLowerCase().includes(filterEmploye.toLowerCase())) &&
        (!filterType || c.type === filterType)
      )
    })
    setFilteredConges(filtered)
  }

  useEffect(() => {
    applyFilters()
  }, [filterEmploye, filterType, conges])

  if (loading) return <CSpinner color="primary" />

  return (
    <div style={{ backgroundColor: backgroundGeneral, padding: '20px', borderRadius: '10px', border: `1px solid ${borderColor}`, marginTop: '30px' }}>
      <CCard style={{ boxShadow: boxShadow }}>
        <CCardHeader style={{ background: headerFooterColor, color: "#FFF", fontSize: "1.25rem" }}>
          Historique des Congés
        </CCardHeader>
        <CCardBody>
          <div className="d-flex gap-3 mb-3">
            <CFormInput 
              placeholder="Filtrer par employé" 
              value={filterEmploye} 
              onChange={e => setFilterEmploye(e.target.value)}
              style={{ borderColor: borderColor }}
            />
            <CFormSelect 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              style={{ borderColor: borderColor }}
            >
              <option value="">Tous les types</option>
              <option value="maladie">Maladie</option>
              <option value="justifié">Justifié</option>
              <option value="non justifié">Non justifié</option>
            </CFormSelect>
          </div>

          <CTable hover responsive style={{ borderColor: borderColor }}>
            <CTableHead>
              <CTableRow style={{ background: headerFooterColor, color: "#FFF" }}>
                <CTableHeaderCell>Employé</CTableHeaderCell>
                <CTableHeaderCell>Type</CTableHeaderCell>
                <CTableHeaderCell>Date Début</CTableHeaderCell>
                <CTableHeaderCell>Date Fin</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell>Justificatif</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredConges.map(c => (
                <CTableRow key={c.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <CTableDataCell>{c.employe?.nom} {c.employe?.prenom}</CTableDataCell>
                  <CTableDataCell>{c.type}</CTableDataCell>
                  <CTableDataCell>{c.date_debut}</CTableDataCell>
                  <CTableDataCell>{c.date_fin}</CTableDataCell>
                  <CTableDataCell>{c.description}</CTableDataCell>
                  <CTableDataCell>
                    {c.document
                      ? <a href={`http://localhost:8000/api/admin/conges/download/${c.id}`} target="_blank" rel="noopener noreferrer">Télécharger</a>
                      : '—'}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton 
                      color="danger" 
                      size="sm" 
                      onClick={() => handleDelete(c.id)} 
                      style={{ marginRight: '4px' }}
                    >
                      Supprimer
                    </CButton>
                    <CButton 
                      color="warning" 
                      size="sm" 
                      onClick={() => handleEdit(c)}
                    >
                      Modifier
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CModal visible={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <CModalHeader style={{ background: headerFooterColor, color: "#FFF" }}>
          <CModalTitle>Modifier Congé</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect 
              label="Type" 
              name="type" 
              value={editForm.type || ''} 
              onChange={handleEditChange}
              style={{ borderColor: borderColor, marginBottom: '15px' }}
            >
              <option value=''>-- Choisir --</option>
              <option value='maladie'>Maladie</option>
              <option value='justifié'>Justifié</option>
              <option value='non justifié'>Non justifié</option>
            </CFormSelect>
            <CFormInput 
              label="Date Début" 
              type="date" 
              name="date_debut" 
              value={editForm.date_debut || ''} 
              onChange={handleEditChange}
              style={{ borderColor: borderColor, marginBottom: '15px' }}
            />
            <CFormInput 
              label="Date Fin" 
              type="date" 
              name="date_fin" 
              value={editForm.date_fin || ''} 
              onChange={handleEditChange}
              style={{ borderColor: borderColor, marginBottom: '15px' }}
            />
            <CFormTextarea 
              label="Description" 
              name="description" 
              value={editForm.description || ''} 
              onChange={handleEditChange}
              style={{ borderColor: borderColor, marginBottom: '15px' }}
            />
            {editForm.document && (
              <div className="mb-2">
                Document actuel :{' '}
                <a href={`http://localhost:8000/api/admin/conges/download/${selectedConge?.id}`} target="_blank" rel="noopener noreferrer">
                  Télécharger le justificatif
                </a>
              </div>
            )}
            <CFormInput 
              type="file" 
              label="Nouveau justificatif (optionnel)" 
              onChange={e => setEditFile(e.target.files[0])} 
              style={{ borderColor: borderColor }}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setEditModalOpen(false)}
            style={{ background: "#aaa", border: 'none' }}
          >
            Annuler
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleEditSubmit}
            style={{ background: buttonPrimary, border: 'none' }}
          >
            Enregistrer
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default AdminHistoriqueConges
