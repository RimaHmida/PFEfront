"use client"

import { useEffect, useState } from "react"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CContainer,
  CButton,
  CSpinner,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CModalTitle,
} from "@coreui/react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const AdminEmployes = () => {
  const [employes, setEmployes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [congeModalOpen, setCongeModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedEmploye, setSelectedEmploye] = useState(null)
  const [expandedIds, setExpandedIds] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    numero: "",
    fonction: "",
    adresse: "",
    statut: "travail",
  })
  const [congeForm, setCongeForm] = useState({
    employe_id: "",
    type: "",
    date_debut: "",
    date_fin: "",
    description: "",
    document: null,
  })

  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  // Enhanced color scheme
  const headerFooterColor = "#1e3a8a"
  const buttonPrimary = "#1e3a8a"
  const backgroundGeneral = "#f8fafc"
  const cardBackground = "#ffffff"
  const borderColor = "#e5e7eb"
  const boxShadow = "0 4px 12px rgba(30, 58, 138, 0.1)"
  const cardBorderRadius = "12px"

  // New colors for employee bars - elegant gray/white theme
  const employeeBarBackground = "#f1f5f9" // Light gray
  const employeeBarHover = "#e2e8f0" // Slightly darker gray on hover
  const employeeTextColor = "#334155" // Dark gray text

  const toggleCard = (id) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  useEffect(() => {
    fetch("http://localhost:8000/api/admin/employes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type")
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Erreur serveur (${res.status}) : ${text}`)
        }
        if (!contentType.includes("application/json")) {
          throw new Error("La réponse du serveur n'est pas du JSON valide.")
        }
        return res.json()
      })
      .then((data) => {
        setEmployes(data.data)
        toast.success("✅ Liste des employés chargée avec succès!")
      })
      .catch((err) => {
        toast.error("❌ Erreur : " + err.message)
      })
      .finally(() => setLoading(false))
  }, [token])

  const openModal = (employe = null) => {
    setEditMode(!!employe)
    setSelectedEmploye(employe)
    setFormData(
      employe || {
        nom: "",
        prenom: "",
        email: "",
        numero: "",
        fonction: "",
        adresse: "",
        statut: "travail",
      },
    )
    setModalOpen(true)
  }

  const validateField = (name, value) => {
    const errors = { ...formErrors }

    switch (name) {
      case "nom":
        if (!value.trim()) errors.nom = "Le nom est requis."
        else delete errors.nom
        break
      case "prenom":
        if (!value.trim()) errors.prenom = "Le prénom est requis."
        else delete errors.prenom
        break
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) errors.email = "Email invalide."
        else delete errors.email
        break
      case "numero":
        const numeroRegex = /^[0-9]{8,15}$/
        if (!numeroRegex.test(value)) {
          errors.numero = "Numéro invalide (chiffres uniquement, min 8 chiffres)."
        } else {
          delete errors.numero
        }
        break
      case "fonction":
        if (!value.trim()) errors.fonction = "La fonction est requise."
        else delete errors.fonction
        break
      case "adresse":
        if (!value.trim()) errors.adresse = "L'adresse est requise."
        else delete errors.adresse
        break
      default:
        break
    }

    setFormErrors(errors)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    validateField(name, value)
  }

  const handleSubmit = async () => {
    const method = editMode ? "PUT" : "POST"
    const url = editMode
      ? `http://localhost:8000/api/admin/employes/${selectedEmploye.id}`
      : "http://localhost:8000/api/admin/employes"

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success(`✅ Employé ${editMode ? "modifié" : "ajouté"}`)
      setEmployes((prev) =>
        editMode ? prev.map((emp) => (emp.id === data.data.id ? data.data : emp)) : [...prev, data.data],
      )
      setModalOpen(false)
    } catch (err) {
      toast.error("❌ " + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet employé ?")) return

    try {
      await fetch(`http://localhost:8000/api/admin/employes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("✅ Employé supprimé")
      setEmployes((prev) => prev.filter((emp) => emp.id !== id))
    } catch {
      toast.error("❌ Erreur lors de la suppression")
    }
  }

  const handleCongeChange = (e) => {
    const { name, value, files } = e.target
    setCongeForm({ ...congeForm, [name]: files ? files[0] : value })
  }

  const handleCongeSubmit = async () => {
    if ((congeForm.type === "justifié" || congeForm.type === "maladie") && !congeForm.document) {
      toast.error("❌ Document obligatoire pour ce type de congé")
      return
    }

    try {
      const formDataSend = new FormData()
      Object.entries(congeForm).forEach(([key, value]) => {
        if (value) formDataSend.append(key, value)
      })

      await fetch("http://localhost:8000/api/admin/conges", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataSend,
      })

      toast.success("✅ Congé enregistré")
      setCongeModalOpen(false)
    } catch {
      toast.error("❌ Erreur lors de l'enregistrement du congé")
    }
  }

  const getStatusBadgeColor = (statut) => {
    switch (statut) {
      case "travail":
        return "#10b981" // Green
      case "récupération":
        return "#f59e0b" // Orange
      case "congé":
        return "#ef4444" // Red
      case "standby":
        return "#6b7280" // Gray
      default:
        return "#6b7280"
    }
  }

  const getStatusIcon = (statut) => {
    switch (statut) {
      case "travail":
        return "✅"
      case "récupération":
        return "🔄"
      case "congé":
        return "🏖️"
      case "standby":
        return "⏸️"
      default:
        return "📋"
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
          padding: "25px",
          borderRadius: cardBorderRadius,
          marginBottom: "30px",
          boxShadow: boxShadow,
        }}
      >
        <div>
          <h3
            style={{
              color: "#FFF",
              margin: "0 0 8px 0",
              fontSize: "2rem",
              fontWeight: "800",
              letterSpacing: "0.5px",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "2.2rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>👥</span>
            Gestion des Employés
          </h3>
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              margin: "0",
              fontSize: "1rem",
              fontWeight: "400",
              letterSpacing: "0.3px",
            }}
          >
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <CButton
            onClick={() => openModal()}
            style={{
              background: "#ffffff",
              color: headerFooterColor,
              border: "none",
              borderRadius: "8px",
              padding: "12px 20px",
              fontWeight: "600",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            ➕ Ajouter Employé
          </CButton>
          <CButton
            onClick={() => setCongeModalOpen(true)}
            style={{
              background: "#ffffff",
              color: headerFooterColor,
              border: "none",
              borderRadius: "8px",
              padding: "12px 20px",
              fontWeight: "600",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            📅 Ajouter Congé
          </CButton>
          <CButton
            onClick={() => navigate("/admin/historique-conges")}
            style={{
              background: "#ffffff",
              color: headerFooterColor,
              border: "none",
              borderRadius: "8px",
              padding: "12px 20px",
              fontWeight: "600",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            📋 Historique
          </CButton>
        </div>
      </div>

      {/* Search - Enhanced */}
      <div style={{ marginBottom: "25px" }}>
        <CFormInput
          placeholder="🔍 Rechercher un employé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: `2px solid ${borderColor}`,
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "1rem",
            backgroundColor: cardBackground,
            boxShadow: boxShadow,
          }}
        />
      </div>

      {/* Compact Statistics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <CCard
          style={{
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(30, 58, 138, 0.08)",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <CCardBody style={{ padding: "20px", textAlign: "center", position: "relative" }}>
            {/* Smaller decorative background element */}
            <div
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                width: "40px",
                height: "40px",
                background: `linear-gradient(135deg, ${headerFooterColor}20, ${headerFooterColor}10)`,
                borderRadius: "50%",
                opacity: "0.6",
              }}
            />
            <div
              style={{
                fontSize: "1.5rem",
                marginBottom: "5px",
                color: "#64748b",
              }}
            >
              👥
            </div>
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: "700",
                color: headerFooterColor,
                margin: "0 0 8px 0",
                textShadow: "0 2px 4px rgba(30, 58, 138, 0.1)",
              }}
            >
              {employes.length}
            </h2>
            <p
              style={{
                color: "#64748b",
                margin: "0",
                fontSize: "0.9rem",
                fontWeight: "500",
                letterSpacing: "0.3px",
              }}
            >
              Total Employés
            </p>
            <div
              style={{
                marginTop: "10px",
                height: "3px",
                background: `linear-gradient(90deg, ${headerFooterColor}, #3b82f6)`,
                borderRadius: "2px",
                width: "40px",
                margin: "10px auto 0",
              }}
            />
          </CCardBody>
        </CCard>

        <CCard
          style={{
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.08)",
            background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <CCardBody style={{ padding: "20px", textAlign: "center", position: "relative" }}>
            {/* Smaller decorative background element */}
            <div
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #10b98120, #10b98110)",
                borderRadius: "50%",
                opacity: "0.6",
              }}
            />
            <div
              style={{
                fontSize: "1.5rem",
                marginBottom: "5px",
                color: "#64748b",
              }}
            >
              ✅
            </div>
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: "700",
                color: "#10b981",
                margin: "0 0 8px 0",
                textShadow: "0 2px 4px rgba(16, 185, 129, 0.1)",
              }}
            >
              {employes.filter((emp) => emp.statut === "travail").length}
            </h2>
            <p
              style={{
                color: "#64748b",
                margin: "0",
                fontSize: "0.9rem",
                fontWeight: "500",
                letterSpacing: "0.3px",
              }}
            >
              En Activité
            </p>
            <div
              style={{
                marginTop: "10px",
                height: "3px",
                background: "linear-gradient(90deg, #10b981, #34d399)",
                borderRadius: "2px",
                width: "40px",
                margin: "10px auto 0",
              }}
            />
          </CCardBody>
        </CCard>
      </div>

      {/* Employee List - Beautiful Cards with Gray Headers */}
      {employes
        .filter((emp) => `${emp.nom} ${emp.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((emp) => (
          <CCard
            key={emp.id}
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
              onClick={() => toggleCard(emp.id)}
              style={{
                background: employeeBarBackground,
                color: employeeTextColor,
                cursor: "pointer",
                padding: "20px",
                borderBottom: `1px solid ${borderColor}`,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = employeeBarHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = employeeBarBackground
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${headerFooterColor}, #3b82f6)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "1.2rem",
                      boxShadow: "0 4px 12px rgba(30, 58, 138, 0.3)",
                    }}
                  >
                    {emp.nom.charAt(0)}
                    {emp.prenom.charAt(0)}
                  </div>
                  <div>
                    <h4
                      style={{ margin: "0 0 5px 0", fontSize: "1.2rem", fontWeight: "600", color: employeeTextColor }}
                    >
                      {emp.nom} {emp.prenom}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.9rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b" }}>
                        <span style={{ fontSize: "1rem" }}>💼</span>
                        <span style={{ fontWeight: "500" }}>{emp.fonction}</span>
                      </span>
                      <span style={{ color: "#cbd5e1", fontSize: "1rem" }}>•</span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: getStatusBadgeColor(emp.statut),
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          textTransform: "capitalize",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        <span style={{ fontSize: "0.7rem" }}>{getStatusIcon(emp.statut)}</span>
                        Statut: {emp.statut}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: headerFooterColor,
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    boxShadow: "0 2px 8px rgba(30, 58, 138, 0.2)",
                  }}
                >
                  {expandedIds.includes(emp.id) ? "▲ Réduire" : "▼ Détails"}
                </div>
              </div>
            </CCardHeader>

            {expandedIds.includes(emp.id) && (
              <CCardBody
                style={{
                  padding: "25px",
                  backgroundColor: "#fafbfc",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      padding: "15px",
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <strong style={{ color: headerFooterColor }}>📧 Email:</strong>
                    <p style={{ margin: "5px 0 0 0", color: "#64748b" }}>{emp.email}</p>
                  </div>
                  <div
                    style={{
                      padding: "15px",
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <strong style={{ color: headerFooterColor }}>📱 Téléphone:</strong>
                    <p style={{ margin: "5px 0 0 0", color: "#64748b" }}>{emp.numero}</p>
                  </div>
                  <div
                    style={{
                      padding: "15px",
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <strong style={{ color: headerFooterColor }}>📍 Adresse:</strong>
                    <p style={{ margin: "5px 0 0 0", color: "#64748b" }}>{emp.adresse}</p>
                  </div>
                  <div
                    style={{
                      padding: "15px",
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <strong style={{ color: headerFooterColor }}>⏰ Récupération:</strong>
                    <p style={{ margin: "5px 0 0 0", color: "#64748b" }}>{emp.jours_recuperation_restants} jours</p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    paddingTop: "15px",
                    borderTop: `1px solid ${borderColor}`,
                  }}
                >
                  <CButton
                    onClick={() => openModal(emp)}
                    style={{
                      backgroundColor: buttonPrimary,
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontWeight: "500",
                    }}
                  >
                    ✏️ Modifier
                  </CButton>
                  <CButton
                    onClick={() => handleDelete(emp.id)}
                    style={{
                      backgroundColor: "#fff",
                      color: buttonPrimary,
                      border: `2px solid ${buttonPrimary}`,
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontWeight: "500",
                    }}
                  >
                    🗑️ Supprimer
                  </CButton>
                </div>
              </CCardBody>
            )}
          </CCard>
        ))}

      {/* Modal Employé - Beautiful Design */}
      <CModal visible={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <CModalHeader
          style={{
            background: `linear-gradient(135deg, ${headerFooterColor} 0%, #1e40af 100%)`,
            color: "#FFF",
            padding: "20px",
          }}
        >
          <CModalTitle style={{ fontSize: "1.3rem", fontWeight: "600" }}>
            {editMode ? "✏️ Modifier" : "➕ Ajouter"} Employé
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: "30px" }}>
          <CForm>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <CFormInput
                  name="nom"
                  label="Nom"
                  value={formData.nom}
                  onChange={handleChange}
                  style={{
                    border: `2px solid ${formErrors.nom ? "#dc2626" : borderColor}`,
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                />
                {formErrors.nom && (
                  <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "5px" }}>{formErrors.nom}</div>
                )}
              </div>
              <div>
                <CFormInput
                  name="prenom"
                  label="Prénom"
                  value={formData.prenom}
                  onChange={handleChange}
                  style={{
                    border: `2px solid ${formErrors.prenom ? "#dc2626" : borderColor}`,
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                />
                {formErrors.prenom && (
                  <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "5px" }}>{formErrors.prenom}</div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
              <div>
                <CFormInput
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    border: `2px solid ${formErrors.email ? "#dc2626" : borderColor}`,
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                />
                {formErrors.email && (
                  <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "5px" }}>{formErrors.email}</div>
                )}
              </div>
              <div>
                <CFormInput
                  type="tel"
                  name="numero"
                  label="Téléphone"
                  value={formData.numero}
                  onChange={handleChange}
                  style={{
                    border: `2px solid ${formErrors.numero ? "#dc2626" : borderColor}`,
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                />
                {formErrors.numero && (
                  <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "5px" }}>{formErrors.numero}</div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
              <div>
                <CFormInput
                  name="fonction"
                  label="Fonction"
                  value={formData.fonction}
                  onChange={handleChange}
                  style={{
                    border: `2px solid ${formErrors.fonction ? "#dc2626" : borderColor}`,
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                />
                {formErrors.fonction && (
                  <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "5px" }}>{formErrors.fonction}</div>
                )}
              </div>
              <div>
                <CFormSelect
                  name="statut"
                  label="Statut"
                  value={formData.statut}
                  onChange={handleChange}
                  style={{
                    border: `2px solid ${borderColor}`,
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                >
                  <option value="travail">Travail</option>
                  <option value="récupération">Récupération</option>
                  <option value="congé">Congé</option>
                  <option value="standby">Standby</option>
                </CFormSelect>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <CFormInput
                name="adresse"
                label="Adresse"
                value={formData.adresse}
                onChange={handleChange}
                style={{
                  border: `2px solid ${formErrors.adresse ? "#dc2626" : borderColor}`,
                  borderRadius: "8px",
                  padding: "10px",
                }}
              />
              {formErrors.adresse && (
                <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "5px" }}>{formErrors.adresse}</div>
              )}
            </div>
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
            onClick={() => setModalOpen(false)}
            style={{
              backgroundColor: "#fff",
              color: headerFooterColor,
              border: `2px solid ${headerFooterColor}`,
              borderRadius: "8px",
              padding: "10px 20px",
              marginRight: "10px",
            }}
          >
            Annuler
          </CButton>
          <CButton
            onClick={handleSubmit}
            style={{
              backgroundColor: buttonPrimary,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            {editMode ? "Modifier" : "Ajouter"}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Congé - Beautiful Design */}
      <CModal visible={congeModalOpen} onClose={() => setCongeModalOpen(false)}>
        <CModalHeader
          style={{
            background: `linear-gradient(135deg, ${headerFooterColor} 0%, #1e40af 100%)`,
            color: "#FFF",
            padding: "20px",
          }}
        >
          <CModalTitle style={{ fontSize: "1.3rem", fontWeight: "600" }}>📅 Ajouter un Congé</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: "30px" }}>
          <CForm>
            <CFormSelect
              name="employe_id"
              value={congeForm.employe_id}
              onChange={handleCongeChange}
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

            <CFormSelect
              name="type"
              value={congeForm.type}
              onChange={handleCongeChange}
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            >
              <option value="">-- Choisir --</option>
              <option value="maladie">Maladie</option>
              <option value="justifié">Justifié</option>
            </CFormSelect>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <CFormInput
                type="date"
                name="date_debut"
                value={congeForm.date_debut}
                onChange={(e) => {
                  const val = e.target.value
                  setCongeForm((prev) => ({
                    ...prev,
                    date_debut: val,
                    date_fin: prev.date_fin && prev.date_fin < val ? "" : prev.date_fin,
                  }))
                }}
                style={{
                  border: `2px solid ${borderColor}`,
                  borderRadius: "8px",
                  padding: "10px",
                }}
              />
              <CFormInput
                type="date"
                name="date_fin"
                value={congeForm.date_fin}
                min={congeForm.date_debut}
                onChange={(e) => setCongeForm({ ...congeForm, date_fin: e.target.value })}
                style={{
                  border: `2px solid ${borderColor}`,
                  borderRadius: "8px",
                  padding: "10px",
                }}
              />
            </div>

            <CFormTextarea
              name="description"
              value={congeForm.description}
              onChange={handleCongeChange}
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
              placeholder="Description du congé..."
            />

            {(congeForm.type === "justifié" || congeForm.type === "maladie") && (
              <CFormInput
                type="file"
                name="document"
                onChange={handleCongeChange}
                style={{
                  border: `2px solid ${borderColor}`,
                  borderRadius: "8px",
                  padding: "10px",
                }}
              />
            )}
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
            onClick={() => setCongeModalOpen(false)}
            style={{
              backgroundColor: "#fff",
              color: headerFooterColor,
              border: `2px solid ${headerFooterColor}`,
              borderRadius: "8px",
              padding: "10px 20px",
              marginRight: "10px",
            }}
          >
            Annuler
          </CButton>
          <CButton
            onClick={handleCongeSubmit}
            style={{
              backgroundColor: buttonPrimary,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Enregistrer
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default AdminEmployes
