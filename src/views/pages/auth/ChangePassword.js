import React, { useState } from 'react'
import {
  CButton, CCard, CCardBody, CCol, CContainer,
  CForm, CFormInput, CRow, CSpinner
} from '@coreui/react'
import { toast } from 'react-toastify'

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('❌ Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8000/api/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          const messages = Object.values(data.errors).flat().join('\n')
          throw new Error(messages)
        }
        throw new Error(data.message || 'Erreur lors du changement.')
      }

      toast.success('✅ Mot de passe modifié avec succès.')
      localStorage.removeItem('token')
      setTimeout(() => {
        window.location.href = '#/login'
      }, 2000)
    } catch (err) {
      toast.error(`❌ ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard>
              <CCardBody>
                <h4 className="mb-4 text-center">Changer le mot de passe</h4>
                <CForm onSubmit={handleSubmit}>
                  <CFormInput
                    type="password"
                    placeholder="Mot de passe actuel"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mb-3"
                    required
                  />
                  <CFormInput
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mb-3"
                    required
                  />
                  <CFormInput
                    type="password"
                    placeholder="Confirmer le nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mb-3"
                    required
                  />
                  <CButton type="submit" color="primary" className="w-100" disabled={loading}>
                    {loading ? <CSpinner size="sm" /> : 'Changer le mot de passe'}
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ChangePassword
