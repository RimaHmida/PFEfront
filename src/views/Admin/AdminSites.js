"use client"

import React, { useEffect, useState } from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CRow,
  CCol,
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CModalTitle,
  CFormLabel,
} from "@coreui/react"
import { toast } from "react-toastify"

// Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in AdminSites ErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: "center", color: "red" }}>
          <h2>Une erreur est survenue. Veuillez recharger la page.</h2>
        </div>
      )
    }
    return this.props.children
  }
}

const AdminSitesInner = () => {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [expandedSiteId, setExpandedSiteId] = useState(null)
  const [formData, setFormData] = useState({
    nomsite: "",
    localisation: "",
    client: "",
    image_url: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const token = localStorage.getItem("token")

  const backendUrl = "http://localhost:8000"

  // Blue themed colors
  const headerFooterColor = "#1e3a8a" // deep blue
  const buttonPrimary = "#3b82f6" // bright blue
  const buttonPrimaryHover = "#2563eb" // darker bright blue
  const backgroundGeneral = "#f0f4ff" // very light blue
  const cardBackground = "#ffffff"
  const borderColor = "#d1d9ff" // light blue border
  const boxShadow = "0 4px 12px rgba(59, 130, 246, 0.15)" // subtle blue shadow
  const cardBorderRadius = "10px"
  const cardBg = cardBackground
  const fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"

  useEffect(() => {
    const fetchSites = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${backendUrl}/api/admin/sites`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`)
        const data = await response.json()
        setSites(Array.isArray(data.data) ? data.data : [])
        toast.success("✅ Liste des sites chargée avec succès!")
      } catch (err) {
        setError(err.message)
        toast.error("❌ Erreur lors du chargement des sites.")
      }
      setLoading(false)
    }
    fetchSites()
  }, [token])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
      setFormData({
        ...formData,
        image_url: URL.createObjectURL(e.target.files[0]),
      })
    }
  }

  const uploadImageFile = async () => {
    if (!imageFile) return null
    const form = new FormData()
    form.append("image", imageFile)
    try {
      const res = await fetch(`${backendUrl}/api/admin/sites/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })
      if (!res.ok) throw new Error(`Image upload failed: ${res.status}`)
      const json = await res.json()
      return json.image_url
    } catch (error) {
      toast.error("❌ Échec de l'upload de l'image.")
      throw error
    }
  }

  const openModal = (site = null) => {
    if (site) {
      setEditMode(true)
      setSelectedSite(site)
      setFormData({
        nomsite: site.nomsite || "",
        localisation: site.localisation || "",
        client: site.client || "",
        image_url: site.image_url || "",
      })
      setImageFile(null)
    } else {
      setEditMode(false)
      setSelectedSite(null)
      setFormData({ nomsite: "", localisation: "", client: "", image_url: "" })
      setImageFile(null)
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      let finalImageUrl = formData.image_url
      if (imageFile) {
        finalImageUrl = await uploadImageFile()
      }

      const payload = {
        nomsite: formData.nomsite,
        localisation: formData.localisation,
        client: formData.client,
        image_url: finalImageUrl,
      }

      const method = editMode ? "PUT" : "POST"
      const url = editMode
        ? `${backendUrl}/api/admin/sites/${selectedSite.id}`
        : `${backendUrl}/api/admin/sites`

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`)
      const data = await response.json()
      setSites((prevSites) =>
        editMode ? prevSites.map((s) => (s.id === selectedSite.id ? data.data : s)) : [...prevSites, data.data],
      )
      setModalOpen(false)
      toast.success(editMode ? "✅ Site modifié avec succès!" : "✅ Site ajouté avec succès!")
      setImageFile(null)
    } catch (err) {
      setError(err.message)
      toast.error("❌ Échec de l'opération: " + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer ce site?")) return
    try {
      const response = await fetch(`${backendUrl}/api/admin/sites/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`)
      setSites((prevSites) => prevSites.filter((site) => site.id !== id))
      toast.success("🗑️ Site supprimé avec succès!")
    } catch (err) {
      setError(err.message)
      toast.error("❌ Échec de la suppression: " + err.message)
    }
  }

  const toggleExpand = (id) => {
    setExpandedSiteId(expandedSiteId === id ? null : id)
  }

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: backgroundGeneral,
        }}
      >
        <CSpinner color="primary" style={{ width: "3rem", height: "3rem" }} />
      </div>
    )

  return (
    <CContainer
      style={{
        backgroundColor: backgroundGeneral,
        padding: "30px",
        borderRadius: cardBorderRadius,
        border: `1px solid ${borderColor}`,
        marginTop: "30px",
        minHeight: "100vh",
        fontFamily: fontFamily,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: `linear-gradient(135deg, ${headerFooterColor} 0%, ${buttonPrimary} 100%)`,
          padding: "15px 25px",
          borderRadius: cardBorderRadius,
          marginBottom: "30px",
          boxShadow: boxShadow,
          userSelect: "none",
        }}
      >
        <div>
          <h3
            style={{
              color: "#ecf0f1",
              margin: "0 0 4px 0",
              fontSize: "1.8rem",
              fontWeight: "700",
              letterSpacing: "0.3px",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "2rem" }}>🏢</span>
            Gestion des Sites
          </h3>
          <p
            style={{
              color: "rgba(236, 240, 241, 0.85)",
              margin: "0",
              fontSize: "0.9rem",
              fontWeight: "400",
              letterSpacing: "0.2px",
            }}
          ></p>
        </div>
        <CButton
          onClick={() => openModal()}
          style={{
            background: buttonPrimary,
            color: "#ecf0f1",
            border: "none",
            borderRadius: "6px",
            padding: "10px 22px",
            fontWeight: "600",
            fontSize: "1rem",
            boxShadow: "0 2px 6px rgba(59, 130, 246, 0.5)",
            transition: "background-color 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonPrimaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonPrimary)}
        >
          ➕ Ajouter un site
        </CButton>
      </div>

      {error && (
        <p style={{ color: "#e74c3c", marginBottom: "20px", fontWeight: "600" }}>{error}</p>
      )}

      <CRow>
        {sites && sites.length > 0 ? (
          sites.map((site) => {
            const fullImageUrl =
              site.image_url && !site.image_url.startsWith("http")
                ? backendUrl + site.image_url
                : site.image_url
            const isExpanded = expandedSiteId === site.id
            return (
              <CCol key={site.id} md={6} xl={4}>
                <CCard
                  className="mb-4"
                  style={{
                    border: `1px solid ${borderColor}`,
                    backgroundColor: cardBg,
                    borderRadius: cardBorderRadius,
                    boxShadow: boxShadow,
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {fullImageUrl ? (
                    <img
                      src={fullImageUrl}
                      alt={`Image du site ${site.nomsite}`}
                      style={{
                        width: "100%",
                        height: "300px",
                        objectFit: "contain",
                        backgroundColor: "#f7f9fb",
                        borderTopLeftRadius: cardBorderRadius,
                        borderTopRightRadius: cardBorderRadius,
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "320px",
                        backgroundColor: "#d1d9ff",
                        color: "#34495e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontStyle: "italic",
                        borderTopLeftRadius: cardBorderRadius,
                        borderTopRightRadius: cardBorderRadius,
                      }}
                    >
                      Pas d'image disponible
                    </div>
                  )}

                  <CCardHeader
                    onClick={() => toggleExpand(site.id)}
                    style={{
                      background: `linear-gradient(90deg, ${headerFooterColor}, ${buttonPrimary})`,
                      color: "#ecf0f1",
                      fontWeight: "700",
                      fontSize: "1rem",
                      padding: "6px 20px", // thinner padding
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                      userSelect: "text",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    title={site.nomsite}
                  >
                    <span>{site.nomsite}</span>
                    <span
                      style={{
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                        fontSize: "1.5rem",
                      }}
                    >
                      ▼
                    </span>
                  </CCardHeader>

                  {isExpanded && (
                    <CCardBody style={{ padding: "20px", flexGrow: 1, color: "#34495e" }}>
                      <p style={{ margin: "0 0 10px 0", fontSize: "0.95rem" }}>
                        <strong>📍 Localisation:</strong> {site.localisation}
                      </p>
                      <p style={{ margin: "0 0 20px 0", fontSize: "0.95rem" }}>
                        <strong>👤 Client:</strong> {site.client}
                      </p>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <CButton
                          onClick={() => openModal(site)}
                          style={{
                            backgroundColor: buttonPrimary,
                            color: "#ecf0f1",
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 16px",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            transition: "background-color 0.3s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonPrimaryHover)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonPrimary)}
                        >
                          ✏️ Modifier
                        </CButton>
                        <CButton
                          onClick={() => handleDelete(site.id)}
                          style={{
                            backgroundColor: "#fff",
                            color: buttonPrimary,
                            border: `2px solid ${buttonPrimary}`,
                            borderRadius: "6px",
                            padding: "8px 16px",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            transition: "background-color 0.3s ease, color 0.3s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = buttonPrimary
                            e.currentTarget.style.color = "#ecf0f1"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#fff"
                            e.currentTarget.style.color = buttonPrimary
                          }}
                        >
                          🗑️ Supprimer
                        </CButton>
                      </div>
                    </CCardBody>
                  )}
                </CCard>
              </CCol>
            )
          })
        ) : (
          <p style={{ textAlign: "center", width: "100%", color: "#6b8ed6", fontStyle: "italic" }}>
            Aucun site disponible.
          </p>
        )}
      </CRow>

      {/* Modal Site */}
      <CModal visible={modalOpen} onClose={() => setModalOpen(false)} size="lg" backdrop="static">
        <CModalHeader
          style={{
            background: `linear-gradient(135deg, ${headerFooterColor} 0%, ${buttonPrimary} 100%)`,
            color: "#ecf0f1",
            padding: "20px",
            borderTopLeftRadius: cardBorderRadius,
            borderTopRightRadius: cardBorderRadius,
            userSelect: "none",
          }}
        >
          <CModalTitle style={{ fontSize: "1.3rem", fontWeight: "700" }}>
            {editMode ? "✏️ Modifier Site" : "➕ Ajouter un Site"}
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: "30px", backgroundColor: "#f7faff" }}>
          <CForm>
            <CFormInput
              type="text"
              label="Nom du Site"
              name="nomsite"
              value={formData.nomsite}
              onChange={handleChange}
              required
              className="mb-3"
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                fontSize: "1rem",
                fontFamily: fontFamily,
              }}
            />
            <CFormInput
              type="text"
              label="Localisation"
              name="localisation"
              value={formData.localisation}
              onChange={handleChange}
              required
              className="mb-3"
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                fontSize: "1rem",
                fontFamily: fontFamily,
              }}
            />
            <CFormInput
              type="text"
              label="Client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              required
              className="mb-3"
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                fontSize: "1rem",
                fontFamily: fontFamily,
              }}
            />
            <CFormLabel htmlFor="imageUpload" className="mb-1" style={{ fontWeight: "600" }}>
              Image du site
            </CFormLabel>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginBottom: "1rem" }}
            />
          </CForm>
        </CModalBody>
        <CModalFooter
          style={{
            padding: "20px",
            backgroundColor: backgroundGeneral,
            borderTop: `1px solid ${borderColor}`,
            borderBottomLeftRadius: cardBorderRadius,
            borderBottomRightRadius: cardBorderRadius,
          }}
        >
          <CButton
            onClick={() => setModalOpen(false)}
            style={{
              backgroundColor: "#fff",
              color: headerFooterColor,
              borderRadius: "8px",
              padding: "10px 20px",
              marginRight: "10px",
              fontWeight: "600",
              cursor: "pointer",
              border: `2px solid ${headerFooterColor}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = headerFooterColor
              e.currentTarget.style.color = "#ecf0f1"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff"
              e.currentTarget.style.color = headerFooterColor
            }}
          >
            Annuler
          </CButton>
          <CButton
            onClick={handleSubmit}
            style={{
              backgroundColor: buttonPrimary,
              color: "#ecf0f1",
              borderRadius: "8px",
              padding: "10px 20px",
              fontWeight: "600",
              cursor: "pointer",
              border: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonPrimaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonPrimary)}
          >
            {editMode ? "Modifier" : "Ajouter"}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

// Wrap component with error boundary
const AdminSites = () => (
  <ErrorBoundary>
    <AdminSitesInner />
  </ErrorBoundary>
)

export default AdminSites
