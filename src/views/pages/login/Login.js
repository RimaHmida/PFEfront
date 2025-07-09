import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Connexion échouée')
      } else {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        const role = data.user.role
        switch (role) {
          case 'administrateur_it':
          case 'administrateur':
            navigate('/admin/dashboard')
            break
          case 'secretaire':
            navigate('/secretaire/presences')
            break
          case 'manager':
            navigate('/manager/presences')
            break
          case 'agent_paie':
            navigate('/paie/dashboard')
            break
          default:
            navigate('/dashboard')
        }
      }
    } catch (err) {
      setError('Erreur lors de la connexion.')
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
                <h2 className="text-center mb-4" style={{ color: '#1E3A8A' }}>Connexion</h2>

                <CForm onSubmit={handleLogin}>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Adresse email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  {error && <div className="text-danger mb-3 text-center">{error}</div>}

                  <CButton
                    color="primary"
                    type="submit"
                    className="w-100"
                    disabled={loading}
                    style={{ borderRadius: '50px', fontWeight: '500' }}
                  >
                    {loading ? <CSpinner size="sm" /> : 'Se connecter'}
                  </CButton>

                  {/* ✅ Lien mot de passe oublié */}
                  <div className="text-center mt-3">
                    <CButton
                      color="link"
                      className="p-0"
                      style={{ fontSize: '0.9rem' }}
                      onClick={() => navigate('/forgot-password')}
                    >
                      Mot de passe oublié ?
                    </CButton>
                  </div>

                  <div className="text-center mt-2">
                    <small className="text-muted">
                      Vous n'avez pas de compte ? Contactez votre administrateur IT.
                    </small>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
