import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableHead, CTableRow,
  CTableHeaderCell, CTableDataCell, CButton, CFormSelect, CFormTextarea,
  CModal, CModalHeader, CModalBody, CModalFooter, CForm, CModalTitle
} from '@coreui/react'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const AdminConges = () => {
  const [conges, setConges] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedConge, setSelectedConge] = useState(null)
  const [employes, setEmployes] = useState([])
  const [form, setForm] = useState({
    employe_id: '', type: '', date_debut: '', date_fin: '', description: '', document: null
  })
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchConges()
    fetchEmployes()
  }, [])

  const fetchConges = () => {
    fetch('http://localhost:8000/api/admin/conges', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setConges(data.data))
      .catch(() => toast.error("Erreur chargement congés"))
  }

  const fetchEmployes = () => {
    fetch('http://localhost:8000/api/admin/employes', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setEmployes(data.data))
      .catch(() => toast.error("Erreur chargement employés"))
  }

  const openModal = (conge = null) => {
    if (conge) {
      setEditMode(true)
      setSelectedConge(conge)
      setForm({
        employe_id: conge.employe_id,
        type: conge.type,
        date_debut: conge.date_debut,
        date_fin: conge.date_fin,
        description: conge.description || '',
        document: null
      })
    } else {
      setEditMode(false)
      setForm({ employe_id: '', type: '', date_debut: '', date_fin: '', description: '', document: null })
    }
    setModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setForm(prev => ({ ...prev, [name]: files ? files[0] : value }))
  }

  const handleSubmit = async () => {
    if (form.date_debut && form.date_fin && form.date_fin < form.date_debut) {
      toast.error("❌ La date de fin ne peut pas être antérieure à la date de début");
      return;
    }
    if ((form.type === 'maladie' || form.type === 'justifié') && !form.document && !editMode) {
      toast.error("Document obligatoire")
      return
    }
  
    
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => v && formData.append(k, v))

    const url = editMode
      ? `http://localhost:8000/api/admin/conges/${selectedConge.id}`
      : 'http://localhost:8000/api/admin/conges'

    const method = editMode ? 'POST' : 'POST'
    if (editMode) formData.append('_method', 'PUT')

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || result.message)
      toast.success(result.message || 'Succès')
      setModalOpen(false)
      fetchConges()
    } catch (err) {
      toast.error(err.message || "Erreur")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce congé ?")) return
    try {
      const res = await fetch(`http://localhost:8000/api/admin/conges/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
      toast.success("Congé supprimé")
      fetchConges()
    } catch (err) {
      toast.error(err.message || "Erreur suppression")
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          📄 Gestion des Congés
          <CButton className="float-end" onClick={() => openModal()}>+ Ajouter</CButton>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Employé</CTableHeaderCell>
                <CTableHeaderCell>Type</CTableHeaderCell>
                <CTableHeaderCell>Début</CTableHeaderCell>
                <CTableHeaderCell>Fin</CTableHeaderCell>
                <CTableHeaderCell>Justificatif</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {conges.map(c => (
                <CTableRow key={c.id}>
                  <CTableDataCell>{c.employe?.nom} {c.employe?.prenom}</CTableDataCell>
                  <CTableDataCell>{c.type}</CTableDataCell>
                  <CTableDataCell>{c.date_debut}</CTableDataCell>
                  <CTableDataCell>{c.date_fin}</CTableDataCell>
                  <CTableDataCell>
                    {c.document ? <a href={`http://localhost:8000/storage/${c.document}`} target="_blank" rel="noreferrer">📄</a> : '—'}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton size="sm" color="warning" className="me-1" onClick={() => openModal(c)}>✏️</CButton>
                    <CButton size="sm" color="danger" onClick={() => handleDelete(c.id)}>🗑️</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CModal visible={modalOpen} onClose={() => setModalOpen(false)}>
        <CModalHeader><CModalTitle>{editMode ? 'Modifier' : 'Ajouter'} un Congé</CModalTitle></CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect label="Employé" name="employe_id" value={form.employe_id} onChange={handleChange}>
              <option value=''>-- Choisir --</option>
              {employes.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nom} {emp.prenom}</option>
              ))}
            </CFormSelect>

            <CFormSelect label="Type" name="type" value={form.type} onChange={handleChange}>
              <option value=''>-- Choisir --</option>
              <option value='maladie'>Maladie</option>
              <option value='justifié'>Justifié</option>
            </CFormSelect>

            <label className="form-label mt-2">Date début</label>
            <DatePicker
              selected={form.date_debut ? new Date(form.date_debut) : null}
              onChange={(date) => setForm(prev => ({ ...prev, date_debut: date.toISOString().slice(0, 10) }))}
              className="form-control"
              placeholderText="Sélectionner une date"
            />

            <label className="form-label mt-2">Date fin</label>
            <DatePicker
              selected={form.date_fin ? new Date(form.date_fin) : null}
              onChange={(date) => setForm(prev => ({ ...prev, date_fin: date.toISOString().slice(0, 10) }))}
              className="form-control"
              placeholderText="Sélectionner une date"
            />

            <CFormTextarea label='Description' name='description' value={form.description} onChange={handleChange} />
            {(form.type === 'maladie' || form.type === 'justifié') && (
              <CFormInput type='file' name='document' label='Justificatif' onChange={handleChange} />
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalOpen(false)}>Annuler</CButton>
          <CButton color="primary" onClick={handleSubmit}>Enregistrer</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default AdminConges