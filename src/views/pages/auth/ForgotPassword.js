import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CRow,
  CSpinner
} from '@coreui/react'
import { toast } from 'react-toastify'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error('Veuillez entrer votre adresse email.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue.')
      }

      toast.success('📧 Lien de réinitialisation envoyé ! Vérifiez votre email.')
    } catch (err) {
      toast.error(`❌ ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: '#F4F6F8' }}>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCard className="p-4 shadow-sm border-0" style={{ borderRadius: '10px' }}>
              <CCardBody>
                <h2 className="text-center mb-4" style={{ color: '#1E3A8A' }}>
                  Réinitialiser le mot de passe
                </h2>
                <CForm onSubmit={handleSubmit}>
                  <CFormInput
                    type="email"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-3"
                    required
                  />
                  <CButton
                    type="submit"
                    color="primary"
                    className="w-100"
                    disabled={loading}
                    style={{ borderRadius: '50px', fontWeight: '500' }}
                  >
                    {loading ? <CSpinner size="sm" /> : 'Envoyer le lien'}
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

export default ForgotPassword
