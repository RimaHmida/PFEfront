import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CContainer,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CSpinner,
} from '@coreui/react'
import { toast } from 'react-toastify'

const AdminUtilisateurs = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'manager',
  })

  const token = localStorage.getItem('token')

  const headerColor = "#1E3A8A"
  const cardBg = "#FFFFFF"
  const borderColor = "#E5E7EB"
  const boxShadow = "0 4px 8px rgba(0, 0, 0, 0.05)"

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erreur API')

      setUsers(data.data)
      toast.success('✅ Liste des utilisateurs chargée avec succès !')
    } catch (err) {
      toast.error('❌ Erreur lors du chargement des utilisateurs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  const openModal = (user = null) => {
    if (user) {
      setEditMode(true)
      setSelectedUser(user)
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
      })
    } else {
      setEditMode(false)
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'manager',
      })
    }
    setModalOpen(true)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    const method = editMode ? 'PUT' : 'POST'
    const url = editMode
      ? `http://localhost:8000/api/admin/users/${selectedUser.id}`
      : 'http://localhost:8000/api/admin/users'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.message || 'Erreur API')

      if (editMode) {
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? result.data : u)))
        toast.success('✅ Utilisateur modifié !')
      } else {
        setUsers((prev) => [...prev, result.data])
        toast.success('✅ Utilisateur ajouté !')
      }

      setModalOpen(false)
    } catch (err) {
      toast.error('❌ ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Supprimer cet utilisateur ?')) return

    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Erreur lors de la suppression')
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success('🗑️ Utilisateur supprimé !')
    } catch (err) {
      toast.error('❌ ' + err.message)
    }
  }

  if (loading) return <CSpinner color="primary" />

  return (
    <CContainer style={{ marginTop: "30px" }}>
      <div style={{ background: headerColor, padding: "16px", borderRadius: "8px", color: "white", marginBottom: "24px" }}>
        <h3 style={{ margin: 0 }}>Gestion des Utilisateurs</h3>
      </div>

      <CRow>
        {users.map((user) => (
          <CCol key={user.id} md={6} xl={4}>
            <CCard className="mb-4" style={{ border: `1px solid ${borderColor}`, backgroundColor: cardBg, borderRadius: "8px", boxShadow }}>
              <CCardHeader style={{ background: headerColor, color: "#fff", fontWeight: "bold" }}>
                {user.nom} {user.prenom}
              </CCardHeader>
              <CCardBody>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Rôle:</strong> {user.role}</p>
                <div className="d-flex gap-2">
                  <CButton color="warning" size="sm" onClick={() => openModal(user)}>Modifier</CButton>
                  <CButton color="danger" size="sm" onClick={() => handleDelete(user.id)}>Supprimer</CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CButton color="primary" onClick={() => openModal()}>Ajouter un utilisateur</CButton>

      <CModal visible={modalOpen} onClose={() => setModalOpen(false)}>
        <CModalHeader style={{ background: headerColor, color: "white" }}>
          {editMode ? 'Modifier Utilisateur' : 'Ajouter un Utilisateur'}
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput name="nom" label="Nom" value={formData.nom} onChange={handleChange} required className="mb-2" />
            <CFormInput name="prenom" label="Prénom" value={formData.prenom} onChange={handleChange} required className="mb-2" />
            <CFormInput name="email" label="Email" value={formData.email} onChange={handleChange} required className="mb-2" />
            {!editMode && (
              <>
                <CFormInput type="password" name="password" label="Mot de passe" value={formData.password} onChange={handleChange} required className="mb-2" />
                <CFormInput type="password" name="password_confirmation" label="Confirmation" value={formData.password_confirmation} onChange={handleChange} required className="mb-2" />
              </>
            )}
            <CFormSelect name="role" label="Rôle" value={formData.role} onChange={handleChange} className="mb-2">
              <option value="administrateur_it">Administrateur IT</option>
              <option value="administrateur">Administrateur</option>
              <option value="manager">Manager</option>
              <option value="secretaire">Secrétaire</option>
              <option value="agent paie">Agent Paie</option>
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalOpen(false)}>Annuler</CButton>
          <CButton color="primary" onClick={handleSubmit}>
            {editMode ? 'Modifier' : 'Ajouter'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default AdminUtilisateurs
