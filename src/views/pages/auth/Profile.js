import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardHeader, CForm, CFormInput, CButton,
  CRow, CCol, CFormLabel, CSpinner, CAvatar
} from '@coreui/react'
import { toast } from 'react-toastify'
import axios from 'axios'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    photo: null,
  })

  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      setUser(res.data.user)
      setFormData({
        nom: res.data.user.nom,
        prenom: res.data.user.prenom,
        email: res.data.user.email,
        photo: null,
      })
    } catch (err) {
      toast.error('❌ Erreur lors du chargement du profil.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'photo') {
      setFormData({ ...formData, photo: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('nom', formData.nom)
    data.append('prenom', formData.prenom)
    data.append('email', formData.email)
    if (formData.photo) {
      data.append('photo', formData.photo)
    }

    try {
      await axios.post('http://localhost:8000/api/profile/update', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      toast.success('✅ Profil mis à jour.')
      fetchUser()
    } catch (err) {
      toast.error('❌ Erreur lors de la mise à jour du profil.')
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <CSpinner color="primary" size="lg" />
      </div>
    )
  }

  return (
    <CRow className="justify-content-center">
      <CCol md={8}>
        <CCard>
          <CCardHeader>👤 Mon profil</CCardHeader>
          <CCardBody>
            <div className="text-center mb-4">
              <CAvatar
                src={user?.photo_url || 'https://ui-avatars.com/api/?name=' + user?.prenom + '+' + user?.nom}
                size="xxl"
              />
            </div>

            <CForm onSubmit={handleSubmit} encType="multipart/form-data">
              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Nom</CFormLabel>
                  <CFormInput name="nom" value={formData.nom} onChange={handleChange} required />
                </CCol>
                <CCol>
                  <CFormLabel>Prénom</CFormLabel>
                  <CFormInput name="prenom" value={formData.prenom} onChange={handleChange} required />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Email</CFormLabel>
                  <CFormInput type="email" name="email" value={formData.email} onChange={handleChange} required />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Photo de profil</CFormLabel>
                  <CFormInput type="file" name="photo" onChange={handleChange} accept="image/*" />
                </CCol>
              </CRow>

              <CButton type="submit" color="primary">💾 Enregistrer</CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Profile
