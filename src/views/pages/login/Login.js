"use client"
import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import './Login.css'

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
  CSpinner,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilLockLocked, cilUser } from "@coreui/icons"

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [retryAfter, setRetryAfter] = useState(null)
  const [countdown, setCountdown] = useState(null)

  const primaryColor = "#1e3a8a"
  const secondaryColor = "#3b82f6"
  const cardBackground = "#ffffff"
  const inputBorderColor = "#cbd5e1"
  const inputFocusShadow = "0 0 0 0.25rem rgba(59, 130, 246, 0.25)"
  const boxShadow = "0 10px 25px rgba(30, 58, 138, 0.1)"
  const borderRadius = "12px"

  useEffect(() => {
    let timer
    if (retryAfter !== null) {
      setCountdown(retryAfter)
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer)
            setRetryAfter(null)
            return null
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [retryAfter])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 429 && data.message.includes("Réessayez dans")) {
          const seconds = Number.parseInt(data.message.match(/\d+/)?.[0] || "60")
          setRetryAfter(seconds)
          setCountdown(seconds)
          setError(data.message)
        } else {
          setError(data.message || "Connexion échouée")
        }
      } else {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        const role = data.user.role
        switch (role) {
          case "administrateur_it":
            navigate('/dashboard')
            break
          case "administrateur":
            navigate('/admin/dashboard')
            break
          case "secretaire":
            navigate("/secretaire/presences")
            break
          case "manager":
            navigate("/manager/presences")
            break
          case "agent_paie":
            navigate("/paie/dashboard")
            break
          default:
            navigate("/dashboard")
        }
      }
    } catch (err) {
      setError("Erreur lors de la connexion.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="login-video-wrapper">
        <iframe
          className="login-video-iframe"
          src="https://www.youtube-nocookie.com/embed/36ZvzQBzy_4?autoplay=1&mute=1&controls=0&loop=1&playlist=36ZvzQBzy_4&start=0&end=27&modestbranding=1&rel=0"
          title="CTF Video Background"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>

      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        zIndex: 1,
        position: "relative"
      }}>
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={6} lg={5} xl={4}>
            <CCard
  className="p-4 shadow-lg border-0"
  style={{
    borderRadius: borderRadius,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // transparent
    backdropFilter: 'blur(8px)', // effet de flou pour lisibilité
    boxShadow: boxShadow
  }}
>
                <CCardBody className="d-flex flex-column align-items-center">
                  <img
                    src="/images/LogoCtf.png"
                    alt="Company Logo"
                    style={{ width: "100px", height: "auto", marginBottom: "30px" }}
                  />
                  <h2 className="text-center mb-4" style={{ color: primaryColor, fontWeight: "700", fontSize: "2rem" }}>
                    Connexion
                  </h2>
                  <CForm onSubmit={handleLogin} className="w-100">
                    <CInputGroup className="mb-3">
                      <CInputGroupText style={{ backgroundColor: primaryColor, border: `1px solid ${primaryColor}`, color: "#fff" }}>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Adresse email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ border: `1px solid ${inputBorderColor}`, boxShadow: "none", padding: "10px 15px" }}
                        onFocus={(e) => (e.target.style.boxShadow = inputFocusShadow)}
                        onBlur={(e) => (e.target.style.boxShadow = "none")}
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText style={{ backgroundColor: primaryColor, border: `1px solid ${primaryColor}`, color: "#fff" }}>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ border: `1px solid ${inputBorderColor}`, boxShadow: "none", padding: "10px 15px" }}
                        onFocus={(e) => (e.target.style.boxShadow = inputFocusShadow)}
                        onBlur={(e) => (e.target.style.boxShadow = "none")}
                      />
                    </CInputGroup>

                    {error && (
                      <div className="text-danger mb-3 text-center" style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                        {error}
                      </div>
                    )}

                    <CButton
                      color="primary"
                      type="submit"
                      className="w-100 py-2"
                      disabled={loading || countdown !== null}
                      style={{
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "1.1rem",
                        background: `linear-gradient(45deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        border: "none",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        boxShadow: "0 4px 10px rgba(30, 58, 138, 0.3)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)"
                        e.currentTarget.style.boxShadow = "0 6px 15px rgba(30, 58, 138, 0.4)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "0 4px 10px rgba(30, 58, 138, 0.3)"
                      }}
                    >
                      {loading ? (
                        <CSpinner size="sm" />
                      ) : countdown !== null ? (
                        `Réessayez dans ${countdown}s`
                      ) : (
                        "Se connecter"
                      )}
                    </CButton>
                    <div className="text-center mt-3">
  <CButton
    color="link"
    className="p-0"
    style={{
      fontSize: "0.9rem",
      color: "#ffffff",
      textDecoration: "underline",
      textShadow: "0 0 5px rgba(0,0,0,0.8)"
    }}
    onClick={() => navigate("/forgot-password")}
  >
    Mot de passe oublié ?
  </CButton>
</div>
<div className="text-center mt-2">
  <small
    style={{
      fontSize: "0.9rem",
      color: "#ffffff",
      fontWeight: "bold",
      filter: "none",
      backdropFilter: "none",
      textShadow: "none"
    }}
  >
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
    </div>
  )
}

export default Login
