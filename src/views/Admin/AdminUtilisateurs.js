import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const [fieldErrors, setFieldErrors] = useState({})

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const isAdminIT = user?.role === 'administrateur_it'
  const navigate = useNavigate()
  useEffect(() => {
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

    fetchUsers()
  }, [token])

  const openModal = (user = null) => {
    setFieldErrors({})
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

  const validateField = (name, value) => {
    let errors = { ...fieldErrors }

    switch (name) {
      case 'nom':
        if (!value.trim()) errors.nom = 'Le nom est requis'
        else delete errors.nom
        break
      case 'prenom':
        if (!value.trim()) errors.prenom = 'Le prénom est requis'
        else delete errors.prenom
        break
      case 'email':
        if (!value.includes('@') || !value.includes('.')) errors.email = 'Email invalide'
        else delete errors.email
        break
      case 'password':
        if (!editMode && value.length < 8) errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
        else delete errors.password
        break
      case 'password_confirmation':
        if (value !== formData.password) errors.password_confirmation = 'Les mots de passe ne correspondent pas'
        else delete errors.password_confirmation
        break
      default:
        break
    }

    setFieldErrors(errors)
  }

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value)
  }

  const handleSubmit = async () => {
    // Final check before submit
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key])
    })

    if (Object.keys(fieldErrors).length > 0) {
      toast.error('❌ Corrigez les erreurs avant de soumettre.')
      return
    }

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

      const result = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(`❌ ${result.message || 'Erreur API'}`)
        return
      }

      if (editMode) {
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? result.data : u)))
        toast.success('✅ Utilisateur modifié !')
      } else {
        setUsers((prev) => [...prev, result.data])
        toast.success('✅ Utilisateur ajouté !')
      }

      setModalOpen(false)
      setFieldErrors({})
    } catch (err) {
      toast.error('❌ Erreur réseau ou serveur.')
    }
  }
//delete
const handleDelete = async (id) => {
  if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

  try {
    const res = await fetch(`http://localhost:8000/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(`❌ ${result.message || 'Erreur lors de la suppression.'}`);
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success('✅ Utilisateur supprimé avec succès !');
  } catch (err) {
    toast.error('❌ Erreur réseau ou serveur lors de la suppression.');
  }
};

  if (loading) return <CSpinner color="primary" />

  return (
    <CContainer style={{ marginTop: "30px" }}>
      <div style={{ background: "#1E3A8A", padding: "16px", borderRadius: "8px", color: "white", marginBottom: "24px" }}>
        <h3 style={{ margin: 0 }}>Gestion des Utilisateurs</h3>
      </div>
      {isAdminIT && (
  <div className="mb-3 d-flex justify-content-end">
     <CButton
  color="info"
  variant="outline"
  onClick={() => navigate('/admin/logs')}
>
  🔍 Voir les logs de connexion
</CButton>

  </div>
)}

      <CRow>
        {users.map((user) => (
          <CCol key={user.id} md={6} xl={4}>
            <CCard className="mb-4" style={{ border: `1px solid #E5E7EB`, backgroundColor: "#FFFFFF", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.05)" }}>
              <CCardHeader style={{ background: "#1E3A8A", color: "#fff", fontWeight: "bold" }}>
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
        <CModalHeader style={{ background: "#1E3A8A", color: "white" }}>
          {editMode ? 'Modifier Utilisateur' : 'Ajouter un Utilisateur'}
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput name="nom" label="Nom" value={formData.nom} onChange={handleChange} onBlur={handleBlur} className="mb-1" />
            {fieldErrors.nom && <div className="text-danger mb-2">{fieldErrors.nom}</div>}

            <CFormInput name="prenom" label="Prénom" value={formData.prenom} onChange={handleChange} onBlur={handleBlur} className="mb-1" />
            {fieldErrors.prenom && <div className="text-danger mb-2">{fieldErrors.prenom}</div>}

            <CFormInput name="email" label="Email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className="mb-1" />
            {fieldErrors.email && <div className="text-danger mb-2">{fieldErrors.email}</div>}

            {!editMode && (
              <>
                <CFormInput type="password" name="password" label="Mot de passe" value={formData.password} onChange={handleChange} onBlur={handleBlur} className="mb-1" />
                {fieldErrors.password && <div className="text-danger mb-2">{fieldErrors.password}</div>}

                <CFormInput type="password" name="password_confirmation" label="Confirmation" value={formData.password_confirmation} onChange={handleChange} onBlur={handleBlur} className="mb-1" />
                {fieldErrors.password_confirmation && <div className="text-danger mb-2">{fieldErrors.password_confirmation}</div>}
              </>
            )}

            <CFormSelect name="role" label="Rôle" value={formData.role} onChange={handleChange} className="mb-2">
              <option value="administrateur_it">Administrateur IT</option>
              <option value="administrateur">Administrateur</option>
              <option value="manager">Manager</option>
              <option value="secretaire">Secrétaire</option>
              <option value="agent_paie">Agent Paie</option>
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
