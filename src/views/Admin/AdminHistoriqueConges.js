"use client"

import { useEffect, useState } from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CSpinner,
  CFormSelect,
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CForm,
  CFormTextarea,
  CModalFooter,
  CCol,
  CRow,
  CContainer,
} from "@coreui/react"
import { toast } from "react-toastify"

const AdminHistoriqueConges = () => {
  const [conges, setConges] = useState([])
  const [filteredConges, setFilteredConges] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterEmploye, setFilterEmploye] = useState("")
  const [filterType, setFilterType] = useState("")
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedConge, setSelectedConge] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editFile, setEditFile] = useState(null)
  const token = localStorage.getItem("token")

  // Variables de design
  const primaryColor = "#1E3A8A" // Darker blue for headers, titles
  const secondaryColor = "#3B82F6" // Lighter blue for accents
  const backgroundGeneral = "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)" // General background
  const borderColor = "#D1D5DB" // Subtle border color
  const cardBackground = "#FFFFFF" // White background for cards
  const boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)" // Enhanced card shadow

  const handleDownload = (id) => {
    const token = localStorage.getItem("token")
    const url = `http://localhost:8000/api/admin/conges/download/${id}?token=${token}`
    window.open(url, "_blank")
  }

  useEffect(() => {
    fetchConges()
  }, [])

  const fetchConges = () => {
    fetch("http://localhost:8000/api/admin/conges", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setConges(data.data || [])
        setFilteredConges(data.data || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("❌ Erreur lors du chargement de l'historique des congés")
        setLoading(false)
      })
  }

  const handleDelete = (id) => {
    if (!window.confirm("Supprimer ce congé ?")) return
    fetch(`http://localhost:8000/api/admin/conges/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        toast.success("Congé supprimé")
        fetchConges()
      })
      .catch(() => toast.error("Erreur lors de la suppression"))
  }

  const handleEdit = (conge) => {
    setSelectedConge(conge)
    setEditForm({ ...conge })
    setEditFile(null)
    setEditModalOpen(true)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm({ ...editForm, [name]: value })
  }
  const handleEditSubmit = () => {
    const formDataPayload = new FormData()
  
    Object.keys(editForm).forEach((key) => {
      // ❌ N'ajoute pas "document" depuis editForm, il sera géré plus bas
      if (key !== "document") {
        formDataPayload.append(key, editForm[key])
      }
    })
  
    // ✅ Ajouter le fichier seulement si un nouveau fichier est choisi
    if (editFile) {
      formDataPayload.append("document", editFile)
    }
  
    fetch(`http://localhost:8000/api/admin/conges/${selectedConge.id}?_method=PUT`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formDataPayload,
    })
      .then((res) => res.json())
      .then(() => {
        toast.success("Congé modifié")
        fetchConges()
        setEditModalOpen(false)
      })
      .catch(() => toast.error("Erreur lors de la modification"))
  }
  

  const applyFilters = () => {
    const filtered = conges.filter((c) => {
      return (
        (!filterEmploye ||
          `${c.employe?.nom} ${c.employe?.prenom}`.toLowerCase().includes(filterEmploye.toLowerCase())) &&
        (!filterType || c.type === filterType)
      )
    })
    setFilteredConges(filtered)
  }

  useEffect(() => {
    applyFilters()
  }, [filterEmploye, filterType, conges])

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh", background: backgroundGeneral }}
      >
        <CSpinner color="primary" size="lg" />
      </div>
    )
  }

  // --- NEW Button Styles for Elegance and Professionalism ---
  const baseButtonStyle = {
    borderRadius: "4px", // Slightly sharper corners for a modern look
    fontWeight: "600", // Bolder text for impact
    fontSize: "0.85rem", // Slightly smaller font for compactness in table
    border: "none", // No border for a cleaner look
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", // Very subtle shadow
    transition: "all 0.2s ease-in-out",
    padding: "7px 12px", // Adjusted padding for a tighter fit
    cursor: "pointer",
  }

  const buttonHoverStyle = (e) => {
    e.currentTarget.style.transform = "translateY(-1px)" // Subtle lift
    e.currentTarget.style.boxShadow = "0 3px 8px rgba(0, 0, 0, 0.15)" // More pronounced shadow on hover
  }

  const buttonLeaveStyle = (e) => {
    e.currentTarget.style.transform = "translateY(0)"
    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)"
  }

  const deleteButtonStyle = {
    ...baseButtonStyle,
    background: "#EF4444", // Tailwind's red-500
    color: "#FFFFFF",
  }

  const editButtonStyle = {
    ...baseButtonStyle,
    background: "#2563EB", // A strong, professional blue (Tailwind's blue-600)
    color: "#FFFFFF",
  }

  const modalCancelButtonStyle = {
    ...baseButtonStyle,
    background: "#F3F4F6", // Light grey (Tailwind's gray-100)
    color: "#4B5563", // Dark grey text
    boxShadow: "none", // No shadow for cancel button
    fontSize: "0.95rem", // Slightly larger for modal
    padding: "10px 20px", // Larger padding for modal
  }

  const modalSaveButtonStyle = {
    ...baseButtonStyle,
    background: "#1E3A8A", // Darker blue (primaryColor)
    color: "#FFFFFF",
    fontSize: "0.95rem", // Slightly larger for modal
    padding: "10px 20px", // Larger padding for modal
  }
  // --- End of NEW Button Styles ---

  const inputStyle = {
    borderRadius: "8px",
    borderColor: borderColor,
    padding: "12px 15px",
    boxShadow: "none",
    transition: "all 0.2s ease-in-out",
  }

  const inputFocusStyle = (e) => {
    e.target.style.boxShadow = `0 0 0 0.25rem rgba(59, 130, 246, 0.25)`
  }

  const inputBlurStyle = (e) => {
    e.target.style.boxShadow = "none"
  }

  return (
    <CContainer fluid style={{ background: backgroundGeneral, minHeight: "100vh", padding: "30px 0" }}>
      <CRow className="justify-content-center">
        <CCol xs={12} lg={10}>
          <CCard style={{ boxShadow: boxShadow, borderRadius: "15px", background: cardBackground }}>
            <CCardHeader
              style={{
                background: primaryColor,
                color: "#FFF",
                fontSize: "1.75rem",
                fontWeight: "600",
                padding: "20px 25px",
                borderTopLeftRadius: "15px",
                borderTopRightRadius: "15px",
              }}
            >
              Historique des Congés
            </CCardHeader>
            <CCardBody style={{ padding: "30px" }}>
              <div className="d-flex flex-wrap gap-3 mb-4">
                <CFormInput
                  placeholder="Filtrer par employé"
                  value={filterEmploye}
                  onChange={(e) => setFilterEmploye(e.target.value)}
                  style={inputStyle}
                  onFocus={inputFocusStyle}
                  onBlur={inputBlurStyle}
                />
                <CFormSelect
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={inputStyle}
                  onFocus={inputFocusStyle}
                  onBlur={inputBlurStyle}
                >
                  <option value="">Tous les types</option>
                  <option value="maladie">Maladie</option>
                  <option value="justifié">Justifié</option>
                </CFormSelect>
              </div>
              <CTable
                hover
                responsive
                className="mb-0"
                style={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${borderColor}` }}
              >
                <CTableHead>
                  <CTableRow style={{ background: primaryColor, color: "#FFF" }}>
                    <CTableHeaderCell scope="col" style={{ padding: "15px 20px" }}>
                      Employé
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ padding: "15px 20px" }}>
                      Type
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ padding: "15px 20px" }}>
                      Date Début
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ padding: "15px 20px" }}>
                      Date Fin
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ padding: "15px 20px" }}>
                      Description
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ padding: "15px 20px" }}>
                      Justificatif
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ padding: "15px 20px" }}>
                      Actions
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredConges.length > 0 ? (
                    filteredConges.map((c) => (
                      <CTableRow key={c.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                        <CTableDataCell style={{ padding: "15px 20px" }}>
                          {c.employe?.nom} {c.employe?.prenom}
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: "15px 20px" }}>{c.type}</CTableDataCell>
                        <CTableDataCell style={{ padding: "15px 20px" }}>{c.date_debut}</CTableDataCell>
                        <CTableDataCell style={{ padding: "15px 20px" }}>{c.date_fin}</CTableDataCell>
                        <CTableDataCell style={{ padding: "15px 20px" }}>{c.description}</CTableDataCell>
                        <CTableDataCell style={{ padding: "15px 20px" }}>
                          {c.document ? (
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                handleDownload(c.id)
                              }}
                              style={{ color: secondaryColor, textDecoration: "none", fontWeight: "500" }}
                            >
                              Télécharger
                            </a>
                          ) : (
                            "—"
                          )}
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: "15px 20px" }}>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => handleDelete(c.id)}
                            style={{ ...deleteButtonStyle, marginRight: "8px" }}
                            onMouseEnter={buttonHoverStyle}
                            onMouseLeave={buttonLeaveStyle}
                          >
                            Supprimer
                          </CButton>
                          <CButton
                            color="warning"
                            size="sm"
                            onClick={() => handleEdit(c)}
                            style={editButtonStyle}
                            onMouseEnter={buttonHoverStyle}
                            onMouseLeave={buttonLeaveStyle}
                          >
                            Modifier
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="7" className="text-center py-4" style={{ color: "#6B7280" }}>
                        Aucun congé trouvé.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={editModalOpen} onClose={() => setEditModalOpen(false)} alignment="center">
        <CModalHeader
          style={{ background: primaryColor, color: "#FFF", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}
        >
          <CModalTitle style={{ fontSize: "1.5rem", fontWeight: "600" }}>Modifier Congé</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: "30px", background: cardBackground }}>
          <CForm>
            <CFormSelect
              label="Type"
              name="type"
              value={editForm.type || ""}
              onChange={handleEditChange}
              style={{ ...inputStyle, marginBottom: "20px" }}
              onFocus={inputFocusStyle}
              onBlur={inputBlurStyle}
            >
              <option value="">-- Choisir --</option>
              <option value="maladie">Maladie</option>
              <option value="justifié">Justifié</option>
            </CFormSelect>
            <CFormInput
              label="Date Début"
              type="date"
              name="date_debut"
              value={editForm.date_debut || ""}
              onChange={handleEditChange}
              style={{ ...inputStyle, marginBottom: "20px" }}
              onFocus={inputFocusStyle}
              onBlur={inputBlurStyle}
            />
            <CFormInput
              label="Date Fin"
              type="date"
              name="date_fin"
              value={editForm.date_fin || ""}
              onChange={handleEditChange}
              style={{ ...inputStyle, marginBottom: "20px" }}
              onFocus={inputFocusStyle}
              onBlur={inputBlurStyle}
            />
            <CFormTextarea
              label="Description"
              name="description"
              value={editForm.description || ""}
              onChange={handleEditChange}
              rows={3}
              style={{ ...inputStyle, marginBottom: "20px" }}
              onFocus={inputFocusStyle}
              onBlur={inputBlurStyle}
            />
            {editForm.document && (
              <div className="mb-3" style={{ fontSize: "0.95rem", color: "#4B5563" }}>
                Document actuel :{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handleDownload(selectedConge?.id)
                  }}
                  style={{ color: secondaryColor, textDecoration: "none", fontWeight: "500" }}
                >
                  Télécharger le justificatif
                </a>
              </div>
            )}
            <CFormInput
              type="file"
              label="Nouveau justificatif (optionnel)"
              onChange={(e) => setEditFile(e.target.files[0])}
              style={inputStyle}
              onFocus={inputFocusStyle}
              onBlur={inputBlurStyle}
            />
          </CForm>
        </CModalBody>
        <CModalFooter
          style={{
            background: "#F9FAFB",
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
            padding: "20px 30px",
          }}
        >
          <CButton
            color="secondary"
            onClick={() => setEditModalOpen(false)}
            style={modalCancelButtonStyle}
            onMouseEnter={buttonHoverStyle}
            onMouseLeave={buttonLeaveStyle}
          >
            Annuler
          </CButton>
          <CButton
            color="primary"
            onClick={handleEditSubmit}
            style={modalSaveButtonStyle}
            onMouseEnter={buttonHoverStyle}
            onMouseLeave={buttonLeaveStyle}
          >
            Enregistrer
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default AdminHistoriqueConges
