"use client"

import { useState } from "react"
import { CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CRow, CSpinner } from "@coreui/react"
import { toast } from "react-toastify"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error("Veuillez entrer votre adresse email.")
      return
    }
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8000/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue.")
      }
      toast.success("📧 Lien de réinitialisation envoyé ! Vérifiez votre email.")
    } catch (err) {
      toast.error(`❌ ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const primaryColor = "#1E3A8A" // Darker blue
  const secondaryColor = "#3B82F6" // Lighter blue for gradient

  return (
    <div
    className="min-vh-100 d-flex align-items-center justify-content-center"
    style={{
        background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
      }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCard className="p-5 shadow-lg border-0" style={{ borderRadius: "15px", padding: "25px" }}>
              <CCardBody className="d-flex flex-column align-items-center">
                <img src="/images/LogoCtf.png" alt="Company Logo" style={{ width: "200px", marginBottom: "30px" }} />
                <h2 className="text-center mb-5" style={{ color: primaryColor, fontSize: "2rem", fontWeight: "350" }}>
                  Réinitialiser le mot de passe
                </h2>
                <CForm onSubmit={handleSubmit} className="w-100">
                  <CFormInput
                    type="email"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-4"
                    required
                    style={{
                      borderRadius: "8px",
                      borderColor: "#cbd5e1",
                      padding: "12px 15px",
                      boxShadow: "none",
                      transition: "all 0.2s ease-in-out",
                    }}
                    onFocus={(e) => (e.target.style.boxShadow = `0 0 0 0.25rem rgba(59, 130, 246, 0.25)`)}
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                  />
                  <CButton
                    type="submit"
                    className="w-100 py-3"
                    disabled={loading}
                    style={{
                      borderRadius: "50px",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                      background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
                      border: "none",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)"
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.3)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)"
                    }}
                  >
                    {loading ? <CSpinner size="sm" /> : "Envoyer le lien"}
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
