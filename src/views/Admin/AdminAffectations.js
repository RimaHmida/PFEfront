"use client"

import { useEffect, useState } from "react"
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormSelect,
  CFormInput,
  CSpinner,
  CModalTitle,
} from "@coreui/react"
import { toast } from "react-toastify"

const API_URL = "http://localhost:8000/api"

const fetchSafeJSON = async (url, options = {}) => {
  const token = localStorage.getItem("token")
  if (!token) return { error: true, message: "⛔ Token manquant, veuillez vous reconnecter." }

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  })

  const text = await res.text()
  try {
    const data = JSON.parse(text)
    if (!res.ok) {
      return { error: true, ...data }
    }
    return data
  } catch {
    if (text.includes("<!DOCTYPE html>")) {
      return { error: true, message: "⛔ Session expirée ou erreur serveur, veuillez vous reconnecter." }
    }
    console.error(`Réponse inattendue brute : ${text}`)
    return { error: true, message: "⚠️ Réponse inattendue" }
  }
}

const AdminAffectations = () => {
  const [loading, setLoading] = useState(true)
  const [listes, setListes] = useState([])
  const [employes, setEmployes] = useState([])
  const [sites, setSites] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [addEmpModal, setAddEmpModal] = useState({ visible: false, affectationId: null })
  const [editEmpModal, setEditEmpModal] = useState({ visible: false, pivotId: null })
  const [formData, setFormData] = useState({ site_id: "", date_debut: "", date_fin: "", employes: [] })
  const [newEmp, setNewEmp] = useState({ employe_id: "", date_debut_reelle: "", date_fin_reelle: "" })
  const [editEmp, setEditEmp] = useState({ date_debut_reelle: "", date_fin_reelle: "" })
  const [expandedAffectationIds, setExpandedAffectationIds] = useState([]) // New state for expanded cards

  // Enhanced color scheme from admin-employees.tsx
  const headerFooterColor = "#1e3a8a"
  const buttonPrimary = "#1e3a8a"
  const backgroundGeneral = "#f8fafc"
  const cardBackground = "#ffffff"
  const borderColor = "#e5e7eb"
  const boxShadow = "0 4px 12px rgba(30, 58, 138, 0.1)"
  const cardBorderRadius = "12px"
  const affectationBarBackground = "#f1f5f9" // Light gray for card headers
  const affectationTextColor = "#334155" // Dark gray text

  const toggleAffectationCard = (id) => {
    setExpandedAffectationIds((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  const fetchAffectations = async (dateDebut = null) => {
    let url = `${API_URL}/admin/affectation_listes`
    if (dateDebut) {
      url += `?date_debut=${dateDebut}`
    }
    const result = await fetchSafeJSON(url)
    if (result.error) {
      toast.error(`⚠️ ${result.message}`)
    } else {
      setListes(result.data.listes)
      setEmployes(result.data.employes)
      setSites(result.data.sites)
      toast.success("✅ Liste des affectations chargée avec succès!")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAffectations()
  }, [])

  const handleAddAffectation = async () => {
    if (!formData.site_id || !formData.date_debut || !formData.date_fin) {
      toast.error("❌ Remplissez tous les champs")
      return
    }

    const result = await fetchSafeJSON(`${API_URL}/admin/affectation_listes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (result.error) {
      toast.error(`⚠️ ${result.message}`)
    } else {
      toast.success("✅ Affectation ajoutée")
      setModalVisible(false)
      setFormData({ site_id: "", date_debut: "", date_fin: "", employes: [] })
      fetchAffectations()
    }
  }

  const handleAddEmployeToForm = (id) => {
    const intId = Number.parseInt(id, 10)
    if (!intId || formData.employes.some((e) => e.id === intId)) {
      toast.warn("⚠️ Employé déjà ajouté")
      return
    }
    setFormData({
      ...formData,
      employes: [
        ...formData.employes,
        {
          id: intId,
          date_debut_reelle: formData.date_debut,
          date_fin_reelle: formData.date_fin,
        },
      ],
    })
  }

  const handleRemoveEmployeFromForm = (index) => {
    const updated = [...formData.employes]
    updated.splice(index, 1)
    setFormData({ ...formData, employes: updated })
    toast.info("Employé retiré de la liste")
  }

  const handleAddEmpToExisting = async () => {
    if (!newEmp.employe_id || !newEmp.date_debut_reelle || !newEmp.date_fin_reelle) {
      toast.error("❌ Remplissez tous les champs")
      return
    }
    const result = await fetchSafeJSON(`${API_URL}/admin/affectation_listes/${addEmpModal.affectationId}/employes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEmp),
    })
    if (result.error) {
      toast.error(`⚠️ ${result.message}`)
    } else {
      toast.success("✅ Employé ajouté")
      setAddEmpModal({ visible: false, affectationId: null })
      setNewEmp({ employe_id: "", date_debut_reelle: "", date_fin_reelle: "" })
      fetchAffectations()
    }
  }

  const handleDeleteAffectation = async (id) => {
    if (!window.confirm("Supprimer cette affectation ?")) return
    const result = await fetchSafeJSON(`${API_URL}/admin/affectation_listes/${id}`, { method: "DELETE" })
    if (result.error) {
      toast.error(`⚠️ ${result.message}`)
    } else {
      toast.success("✅ Affectation supprimée")
      fetchAffectations()
    }
  }

  const handleEditEmpDates = async () => {
    const result = await fetchSafeJSON(`${API_URL}/admin/affectation_liste_employe/${editEmpModal.pivotId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editEmp),
    })
    if (result.error) {
      toast.error(`⚠️ ${result.message}`)
    } else {
      toast.success("✏️ Dates modifiées")
      setEditEmpModal({ visible: false, pivotId: null })
      fetchAffectations()
    }
  }

  const handleDeleteEmp = async (pivotId) => {
    if (!window.confirm("Supprimer cet employé ?")) return
    const result = await fetchSafeJSON(`${API_URL}/admin/affectation_liste_employe/${pivotId}`, { method: "DELETE" })
    if (result.error) {
      toast.error(`⚠️ ${result.message}`)
    } else {
      toast.success("✅ Employé supprimé")
      fetchAffectations()
    }
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
      }}
    >
      {/* Header - Beautiful Design */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: `linear-gradient(135deg, ${headerFooterColor} 0%, #1e40af 100%)`,
          padding: "20px 25px", // Reduced vertical padding
          borderRadius: cardBorderRadius,
          marginBottom: "30px",
          boxShadow: boxShadow,
        }}
      >
        <div>
          <h3
            style={{
              color: "#FFF",
              margin: "0 0 5px 0", // Reduced margin
              fontSize: "1.8rem", // Reduced font size
              fontWeight: "800",
              letterSpacing: "0.5px",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "10px", // Reduced gap
            }}
          >
            <span style={{ fontSize: "2rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>🗓️</span>{" "}
            {/* Reduced icon size */}
            Gestion des Affectations
          </h3>
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              margin: "0",
              fontSize: "0.9rem", // Reduced font size
              fontWeight: "400",
              letterSpacing: "0.3px",
            }}
          >
          </p>
        </div>
        <CButton
          color="primary"
          onClick={() => setModalVisible(true)}
          style={{
            background: "#ffffff",
            color: headerFooterColor,
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px", // Reduced padding
            fontWeight: "600",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "background-color 0.3s ease, transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f0f0f0"
            e.currentTarget.style.transform = "translateY(-1px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#ffffff"
            e.currentTarget.style.transform = "translateY(0)"
          }}
        >
          ➕ Ajouter Affectation
        </CButton>
      </div>

      <CRow>
        {listes.map((l) => (
          <CCol key={l.id} md={6}>
            <CCard
              className="mb-3"
              style={{
                border: `1px solid ${borderColor}`,
                borderRadius: cardBorderRadius,
                boxShadow: boxShadow,
                overflow: "hidden",
                transition: "all 0.3s ease",
              }}
            >
              <CCardHeader
                onClick={() => toggleAffectationCard(l.id)} // Make the header clickable for toggling
                style={{
                  background: affectationBarBackground,
                  color: affectationTextColor,
                  fontWeight: "bold",
                  padding: "20px",
                  borderBottom: `1px solid ${borderColor}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer", // Indicate it's clickable
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "1.1rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>📅</span>
                  {l.date_debut} → {l.date_fin} | {l.site?.nomsite}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {/* Buttons that should NOT trigger toggle, so stop propagation */}
                  <CButton
                    size="sm"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent card toggle
                      setAddEmpModal({ visible: true, affectationId: l.id })
                    }}
                    style={{
                      backgroundColor: buttonPrimary,
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontWeight: "600",
                      transition: "background-color 0.3s ease, transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#152f70"
                      e.currentTarget.style.transform = "translateY(-1px)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = buttonPrimary
                      e.currentTarget.style.transform = "translateY(0)"
                    }}
                  >
                    ➕
                  </CButton>
                  <CButton
                    size="sm"
                    color="danger"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent card toggle
                      handleDeleteAffectation(l.id)
                    }}
                    style={{
                      backgroundColor: "#dc2626", // Red for danger
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontWeight: "600",
                      transition: "background-color 0.3s ease, transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#b91c1c"
                      e.currentTarget.style.transform = "translateY(-1px)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#dc2626"
                      e.currentTarget.style.transform = "translateY(0)"
                    }}
                  >
                    ❌
                  </CButton>
                  {/* Toggle indicator */}
                  <div
                    style={{
                      backgroundColor: headerFooterColor,
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      boxShadow: "0 2px 8px rgba(30, 58, 138, 0.2)",
                      marginLeft: "10px", // Add some spacing
                    }}
                  >
                    {expandedAffectationIds.includes(l.id) ? "▲ Réduire" : "▼ Détails"}
                  </div>
                </div>
              </CCardHeader>
              {expandedAffectationIds.includes(l.id) && ( // Conditionally render body
                <CCardBody style={{ padding: "25px", backgroundColor: "#fafbfc" }}>
                  <h5 style={{ color: headerFooterColor, marginBottom: "15px", fontSize: "1.1rem", fontWeight: "600" }}>
                    Employés affectés:
                  </h5>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {l.employes.map((e) => (
                      <li
                        key={e.pivot.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          padding: "15px 0",
                          borderBottom: `1px dashed ${borderColor}`,
                          color: affectationTextColor,
                          fontSize: "0.95rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            marginBottom: "10px",
                            alignItems: "center", // Align items vertically
                          }}
                        >
                          <span style={{ fontWeight: "600", fontSize: "1rem" }}>
                            👤 {e.nom} {e.prenom}
                          </span>
                          <span
                            style={{
                              fontSize: "0.85rem", // Slightly smaller font
                              color: "#64748b",
                              backgroundColor: "#e2e8f0", // Light gray background
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontWeight: "500",
                            }}
                          >
                            {e.pivot.date_debut_reelle} → {e.pivot.date_fin_reelle}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "8px", width: "100%", justifyContent: "flex-end" }}>
                          <CButton
                            size="sm"
                            onClick={() => {
                              setEditEmpModal({ visible: true, pivotId: e.pivot.id })
                              setEditEmp({
                                date_debut_reelle: e.pivot.date_debut_reelle,
                                date_fin_reelle: e.pivot.date_fin_reelle,
                              })
                            }}
                            style={{
                              backgroundColor: buttonPrimary,
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              fontWeight: "500",
                              transition: "background-color 0.3s ease, transform 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#152f70"
                              e.currentTarget.style.transform = "translateY(-1px)"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = buttonPrimary
                              e.currentTarget.style.transform = "translateY(0)"
                            }}
                          >
                            ✏️
                          </CButton>
                          <CButton
                            size="sm"
                            color="danger"
                            onClick={() => handleDeleteEmp(e.pivot.id)}
                            style={{
                              backgroundColor: "#dc2626",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              fontWeight: "500",
                              transition: "background-color 0.3s ease, transform 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#b91c1c"
                              e.currentTarget.style.transform = "translateY(-1px)"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#dc2626"
                              e.currentTarget.style.transform = "translateY(0)"
                            }}
                          >
                            ❌
                          </CButton>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CCardBody>
              )}
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Modal Nouvelle Affectation - Beautiful Design */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="md" >
      <CModalHeader
  style={{
    background: `linear-gradient(13</CModal>5deg, ${headerFooterColor} 0%, #1e40af 100%)`,
    color: "#FFF",
    padding: "20px",
    minHeight: "60px",
    display: "flex",
    alignItems: "center",
  }}
>
  <CModalTitle
    style={{
      fontSize: "1.3rem",
      fontWeight: "600",
      color: "#1e3a8a",
      zIndex: 10,
    }}
  >
    Nouvelle Affectation
  </CModalTitle>
</CModalHeader>

<CModalBody style={{ padding: "15px 20px" }}>
            <CForm>
            <CFormSelect
              label="Site"
              value={formData.site_id}
              onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            >
              <option value="">-- Choisir --</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomsite}
                </option>
              ))}
            </CFormSelect>
            <CFormInput
              type="date"
              label="Début"
              value={formData.date_debut}
              onChange={(e) => {
                setFormData({ ...formData, date_debut: e.target.value })
                fetchAffectations(e.target.value)
              }}
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            />
            <CFormInput
              type="date"
              label="Fin"
              value={formData.date_fin}
              min={formData.date_debut}
              onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            />
            <CFormSelect
              label="Ajouter un employé"
              onChange={(e) => handleAddEmployeToForm(e.target.value)}
              disabled={employes.length === 0}
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            >
              <option value="">-- Choisir un employé --</option>
              {employes.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nom} {emp.prenom}
                </option>
              ))}
            </CFormSelect>
            {formData.employes.map((emp, index) => (
              <div
                key={emp.id}
                style={{
                  border: `1px solid ${borderColor}`,
                  borderRadius: "8px",
                  padding: "15px",
                  marginTop: "10px",
                  backgroundColor: cardBackground,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <strong style={{ color: headerFooterColor, display: "block", marginBottom: "10px" }}>
                  👤 {employes.find((e) => e.id === emp.id)?.nom} {employes.find((e) => e.id === emp.id)?.prenom}
                </strong>
                <CFormInput
                  type="date"
                  label="Début réel"
                  value={emp.date_debut_reelle}
                  onChange={(e) => {
                    const copy = [...formData.employes]
                    copy[index].date_debut_reelle = e.target.value
                    setFormData({ ...formData, employes: copy })
                  }}
                  style={{
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    padding: "8px",
                    marginBottom: "10px",
                  }}
                />
                <CFormInput
                  type="date"
                  label="Fin réel"
                  value={emp.date_fin_reelle}
                  min={emp.date_debut_reelle}
                  max={formData.date_fin}
                  onChange={(e) => {
                    const copy = [...formData.employes]
                    copy[index].date_fin_reelle = e.target.value
                    setFormData({ ...formData, employes: copy })
                  }}
                  style={{
                    border: `1px solid ${borderColor}`,
                    borderRadius: "6px",
                    padding: "8px",
                    marginBottom: "10px",
                  }}
                />
                <CButton
                  color="danger"
                  size="sm"
                  style={{
                    marginTop: "0.3rem",
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontWeight: "500",
                    transition: "background-color 0.3s ease, transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#b91c1c"
                    e.currentTarget.style.transform = "translateY(-1px)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#dc2626"
                    e.currentTarget.style.transform = "translateY(0)"
                  }}
                  onClick={() => handleRemoveEmployeFromForm(index)}
                >
                  ❌
                </CButton>
              </div>
            ))}
          </CForm>
        </CModalBody>
        <CModalFooter
          style={{
            padding: "20px",
            backgroundColor: "#f8fafc",
            borderTop: `1px solid ${borderColor}`,
          }}
        >
          <CButton
            onClick={() => setModalVisible(false)}
            style={{
              backgroundColor: "#fff",
              color: headerFooterColor,
              border: `2px solid ${headerFooterColor}`,
              borderRadius: "8px",
              padding: "10px 20px",
              marginRight: "10px",
              transition: "background-color 0.3s ease, color 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = headerFooterColor
              e.currentTarget.style.color = "#fff"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff"
              e.currentTarget.style.color = headerFooterColor
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            Annuler
          </CButton>
          <CButton
            color="primary"
            onClick={handleAddAffectation}
            style={{
              backgroundColor: buttonPrimary,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              transition: "background-color 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#152f70"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = buttonPrimary
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            Ajouter
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Ajouter Employé à Affectation Existante - Beautiful Design */}
      <CModal visible={addEmpModal.visible} onClose={() => setAddEmpModal({ visible: false, affectationId: null })}>
        <CModalHeader
          style={{
            background: `linear-gradient(135deg, ${headerFooterColor} 0%, #1e40af 100%)`,
            color: "#FFF",
            padding: "20px",
          }}
        >
          <CModalTitle style={{ fontSize: "1.3rem", fontWeight: "600" }}>Ajouter Employé</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: "30px" }}>
          <CForm>
            <CFormSelect
              label="Employé"
              value={newEmp.employe_id}
              onChange={(e) => setNewEmp({ ...newEmp, employe_id: Number.parseInt(e.target.value, 10) })}
              disabled={employes.length === 0}
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            >
              <option value="">-- Choisir --</option>
              {employes.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nom} {emp.prenom}
                </option>
              ))}
            </CFormSelect>
            <CFormInput
              type="date"
              label="Début réel"
              value={newEmp.date_debut_reelle}
              onChange={(e) => setNewEmp({ ...newEmp, date_debut_reelle: e.target.value })}
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            />
            <CFormInput
              type="date"
              label="Fin réel"
              value={newEmp.date_fin_reelle}
              min={newEmp.date_debut_reelle}
              onChange={(e) => setNewEmp({ ...newEmp, date_fin_reelle: e.target.value })}
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            />
          </CForm>
        </CModalBody>
        <CModalFooter
          style={{
            padding: "20px",
            backgroundColor: "#f8fafc",
            borderTop: `1px solid ${borderColor}`,
          }}
        >
          <CButton
            onClick={() => setAddEmpModal({ visible: false, affectationId: null })}
            style={{
              backgroundColor: "#fff",
              color: headerFooterColor,
              border: `2px solid ${headerFooterColor}`,
              borderRadius: "8px",
              padding: "10px 20px",
              marginRight: "10px",
              transition: "background-color 0.3s ease, color 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = headerFooterColor
              e.currentTarget.style.color = "#fff"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff"
              e.currentTarget.style.color = headerFooterColor
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            Annuler
          </CButton>
          <CButton
            color="primary"
            onClick={handleAddEmpToExisting}
            style={{
              backgroundColor: buttonPrimary,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              transition: "background-color 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#152f70"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = buttonPrimary
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            Ajouter
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Modifier Dates Employé - Beautiful Design */}
      <CModal visible={editEmpModal.visible} onClose={() => setEditEmpModal({ visible: false, pivotId: null })}>
        <CModalHeader
          style={{
            background: `linear-gradient(135deg, ${headerFooterColor} 0%, #1e40af 100%)`,
            color: "#FFF",
            padding: "20px",
          }}
        >
          <CModalTitle style={{ fontSize: "1.3rem", fontWeight: "600" }}>Modifier Dates</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: "30px" }}>
          <CForm>
            <CFormInput
              type="date"
              label="Début réel"
              value={editEmp.date_debut_reelle}
              onChange={(e) => {
                const newStart = e.target.value
                setEditEmp((prev) => ({
                  ...prev,
                  date_debut_reelle: newStart,
                  // Réinitialise la fin si elle est antérieure
                  date_fin_reelle: prev.date_fin_reelle && prev.date_fin_reelle < newStart ? "" : prev.date_fin_reelle,
                }))
              }}
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            />
            <CFormInput
              type="date"
              label="Fin réel"
              value={editEmp.date_fin_reelle}
              min={editEmp.date_debut_reelle}
              onChange={(e) => setEditEmp({ ...editEmp, date_fin_reelle: e.target.value })}
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            />
          </CForm>
        </CModalBody>
        <CModalFooter
          style={{
            padding: "20px",
            backgroundColor: "#f8fafc",
            borderTop: `1px solid ${borderColor}`,
          }}
        >
          <CButton
            onClick={() => setEditEmpModal({ visible: false, pivotId: null })}
            style={{
              backgroundColor: "#fff",
              color: headerFooterColor,
              border: `2px solid ${headerFooterColor}`,
              borderRadius: "8px",
              padding: "10px 20px",
              marginRight: "10px",
              transition: "background-color 0.3s ease, color 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = headerFooterColor
              e.currentTarget.style.color = "#fff"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff"
              e.currentTarget.style.color = headerFooterColor
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            Annuler
          </CButton>
          <CButton
            color="success"
            onClick={handleEditEmpDates}
            style={{
              backgroundColor: "#10b981", // Green for success
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              transition: "background-color 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0c8a62" // Darker green on hover
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#10b981"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            Enregistrer
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default AdminAffectations
