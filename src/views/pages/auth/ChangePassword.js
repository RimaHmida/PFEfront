"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CRow,
  CSpinner,
} from "@coreui/react"
import { toast } from "react-toastify"

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("❌ Les mots de passe ne correspondent pas.")
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:8000/api/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) {
          const messages = Object.values(data.errors).flat().join("\n")
          throw new Error(messages)
        }
        throw new Error(data.message || "Erreur lors du changement.")
      }
      toast.success("✅ Mot de passe modifié avec succès.")
      localStorage.removeItem("token")
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      toast.error(`❌ ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const primaryColor = "#1E3A8A"
  const secondaryColor = "#3B82F6"

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} sm={10} md={7} lg={6}>
            <CCard className="shadow border-0 rounded-3 px-4 py-4">
              <CCardBody>
                <div className="text-center mb-4">
                  <img
                    src="/images/LogoCtf.png"
                    alt="Logo"
                    style={{ width: "160px", marginBottom: "10px" }}
                  />
                  <h4 style={{ color: primaryColor, fontWeight: 600 }}>
                    Changer le mot de passe
                  </h4>
                </div>
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
                    className="mb-4"
                    required
                  />
                  <CButton
                    type="submit"
                    color="primary"
                    className="w-100 py-2"
                    disabled={loading}
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
                      border: "none",
                      borderRadius: "30px",
                    }}
                  >
                    {loading ? <CSpinner size="sm" /> : "Changer le mot de passe"}
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
