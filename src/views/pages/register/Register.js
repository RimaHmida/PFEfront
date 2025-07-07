import React, { useState } from 'react'
import {
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { toast } from 'react-toastify'

const AdminAddUser = ({ visible, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'manager',
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.message || 'Erreur lors de la création.')
      } else {
        toast.success('✅ Utilisateur créé avec succès')
        onUserAdded()
        onClose()
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          password: '',
          password_confirmation: '',
          role: 'manager',
        })
      }
    } catch (err) {
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Ajouter un utilisateur</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm onSubmit={handleSubmit}>
          <CFormInput
            className="mb-2"
            placeholder="Nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
          />
          <CFormInput
            className="mb-2"
            placeholder="Prénom"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            required
          />
          <CFormInput
            className="mb-2"
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <CFormInput
            className="mb-2"
            type="password"
            placeholder="Mot de passe"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <CFormInput
            className="mb-2"
            type="password"
            placeholder="Confirmer mot de passe"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
          />
          <CFormSelect
            className="mb-2"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="manager">Manager</option>
            <option value="secretaire">Secrétaire</option>
            <option value="agent_paie">Agent Paie</option>
            <option value="administrateur">Administrateur</option>
          </CFormSelect>
          <CModalFooter>
            <CButton color="secondary" onClick={onClose}>
              Annuler
            </CButton>
            <CButton color="primary" type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModalBody>
    </CModal>
  )
}

export default AdminAddUser
