import React, { useState, useEffect } from 'react'
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
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const tokenFromURL = params.get('token')
    const emailFromURL = params.get('email')
    setToken(tokenFromURL || '')
    setEmail(emailFromURL || '')
  }, [params])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password || !passwordConfirmation) {
      toast.error('Tous les champs sont obligatoires.')
      return
    }

    if (password !== passwordConfirmation) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }

    if (!token) {
      toast.error('Lien de réinitialisation invalide.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/reset-password', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation
        })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la réinitialisation.')
      }

      toast.success('✅ Mot de passe réinitialisé ! Redirection...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      toast.error(`❌ ${err.message}`)
      console.error('Erreur reset-password:', err)
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
  placeholder="Votre email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="mb-3"
  required
/>
                  <CFormInput
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-3"
                    required
                  />
                  <CFormInput
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
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
                    {loading ? <CSpinner size="sm" /> : 'Réinitialiser'}
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

export default ResetPassword
