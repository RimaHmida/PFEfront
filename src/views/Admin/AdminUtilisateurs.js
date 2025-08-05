"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CContainer,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CSpinner,
  CModalTitle,
} from "@coreui/react"
import { toast } from "react-toastify"

const AdminUtilisateurs = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "manager",
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [search, setSearch] = useState("")
  const [expandedUserId, setExpandedUserId] = useState(null) // State to manage expanded card

  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const isAdminIT = user?.role === "administrateur_it"
  const navigate = useNavigate()

  // Enhanced color scheme from admin-affectations.jsx
  const headerFooterColor = "#1e3a8a"
  const buttonPrimary = "#1e3a8a"
  const backgroundGeneral = "#f8fafc"
  const cardBackground = "#ffffff"
  const borderColor = "#e5e7eb"
  const boxShadow = "0 4px 12px rgba(30, 58, 138, 0.1)"
  const cardBorderRadius = "12px"
  const cardHeaderBackground = "#f1f5f9" // Light gray for card headers
  const cardHeaderTextColor = "#334155" // Dark gray text

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Erreur API")
        setUsers(data.data)
        toast.success("✅ Liste des utilisateurs chargée avec succès !")
      } catch (err) {
        toast.error("❌ Erreur lors du chargement des utilisateurs.")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [token])

  const openModal = (user = null) => {
    setFieldErrors({})
    if (user) {
      setEditMode(true)
      setSelectedUser(user)
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        password: "",
        password_confirmation: "",
        role: user.role,
      })
    } else {
      setEditMode(false)
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "manager",
      })
    }
    setModalOpen(true)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateField = (name, value) => {
    const errors = { ...fieldErrors }
    switch (name) {
      case "nom":
        if (!value.trim()) errors.nom = "Le nom est requis"
        else delete errors.nom
        break
      case "prenom":
        if (!value.trim()) errors.prenom = "Le prénom est requis"
        else delete errors.prenom
        break
      case "email":
        if (!value.includes("@") || !value.includes(".")) errors.email = "Email invalide"
        else delete errors.email
        break
      case "password":
        if (!editMode && value.length < 8) errors.password = "Le mot de passe doit contenir au moins 8 caractères"
        else delete errors.password
        break
      case "password_confirmation":
        if (value !== formData.password) errors.password_confirmation = "Les mots de passe ne correspondent pas"
        else delete errors.password_confirmation
        break
      default:
        break
    }
    setFieldErrors(errors)
  }

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value)
  }

  const handleSubmit = async () => {
    // Final check before submit
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key])
    })
    if (Object.keys(fieldErrors).length > 0) {
      toast.error("❌ Corrigez les erreurs avant de soumettre.")
      return
    }
    const method = editMode ? "PUT" : "POST"
    const url = editMode
      ? `http://localhost:8000/api/admin/users/${selectedUser.id}`
      : "http://localhost:8000/api/admin/users"
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(`❌ ${result.message || "Erreur API"}`)
        return
      }
      if (editMode) {
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? result.data : u)))
        toast.success("✅ Utilisateur modifié !")
      } else {
        setUsers((prev) => [...prev, result.data])
        toast.success("✅ Utilisateur ajouté !")
      }
      setModalOpen(false)
      setFieldErrors({})
    } catch (err) {
      toast.error("❌ Erreur réseau ou serveur.")
    }
  }

  //delete
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(`❌ ${result.message || "Erreur lors de la suppression."}`)
        return
      }
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success("✅ Utilisateur supprimé avec succès !")
    } catch (err) {
      toast.error("❌ Erreur réseau ou serveur lors de la suppression.")
    }
  }

  // Toggle card expansion
  const toggleCardExpansion = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId)
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
            <span style={{ fontSize: "2rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>👥</span> Gestion des
            Utilisateurs
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
          onClick={() => openModal()}
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
          ➕ Ajouter un utilisateur
        </CButton>
      </div>

      <div className="mb-3 d-flex justify-content-between align-items-end flex-wrap gap-3">
        <CFormInput
          type="text"
          placeholder="🔍 Rechercher par nom, email, rôle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "300px", border: `1px solid ${borderColor}`, borderRadius: "8px", padding: "10px" }}
        />
        {isAdminIT && (
          <CButton
            color="info"
            variant="outline"
            onClick={() => navigate("/admin/logs")}
            style={{
              backgroundColor: "#e0f2f7", // Light blue for info
              color: "#0891b2", // Darker blue text
              border: `1px solid #0891b2`,
              borderRadius: "8px",
              padding: "10px 18px",
              fontWeight: "600",
              transition: "background-color 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#bae6fd"
              e.currentTarget.style.transform = "translateY(-1px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#e0f2f7"
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            🔍 Voir les logs de connexion
          </CButton>
        )}
      </div>

      <CRow>
        {users
          .filter((user) => {
            const fullText = `${user.nom} ${user.prenom} ${user.email} ${user.role}`.toLowerCase()
            return fullText.includes(search.toLowerCase())
          })
          .map((user) => (
            <CCol key={user.id} md={6} xl={4}>
              <CCard
                className="mb-4"
                style={{
                  border: `1px solid ${borderColor}`,
                  backgroundColor: cardBackground,
                  borderRadius: cardBorderRadius,
                  boxShadow: boxShadow,
                  overflow: "hidden",
                  cursor: "pointer", // Indicate clickable
                }}
              >
                <CCardHeader
                  onClick={() => toggleCardExpansion(user.id)} // Make header clickable
                  style={{
                    background: cardHeaderBackground,
                    color: cardHeaderTextColor,
                    fontWeight: "bold",
                    padding: "15px 20px",
                    borderBottom: `1px solid ${borderColor}`,
                    fontSize: "1.1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    👤 {user.nom} {user.prenom}
                  </span>
                  <span
                    style={{
                      transition: "transform 0.3s ease",
                      transform: expandedUserId === user.id ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                </CCardHeader>
                {expandedUserId === user.id && ( // Conditionally render CCardBody
                  <CCardBody style={{ padding: "20px" }}>
                    <p
                      style={{
                        marginBottom: "10px",
                        fontSize: "0.95rem",
                        color: cardHeaderTextColor,
                        backgroundColor: "#e2e8f0", // Light gray background
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontWeight: "500",
                        display: "inline-block", // To make padding/background apply correctly
                      }}
                    >
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p
                      style={{
                        marginBottom: "15px",
                        fontSize: "0.95rem",
                        color: cardHeaderTextColor,
                        backgroundColor: "#e2e8f0", // Light gray background
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontWeight: "500",
                        display: "inline-block", // To make padding/background apply correctly
                      }}
                    >
                      <strong>Rôle:</strong> {user.role}
                    </p>
                    <div className="d-flex gap-2">
                      <CButton
                        color="warning"
                        size="sm"
                        onClick={() => openModal(user)}
                        style={{
                          backgroundColor: "#f59e0b", // Amber for warning
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 12px",
                          fontWeight: "500",
                          transition: "background-color 0.3s ease, transform 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#d97706"
                          e.currentTarget.style.transform = "translateY(-1px)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f59e0b"
                          e.currentTarget.style.transform = "translateY(0)"
                        }}
                      >
                        ✏️
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        style={{
                          backgroundColor: "#dc2626", // Red for danger
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
                  </CCardBody>
                )}
              </CCard>
            </CCol>
          ))}
      </CRow>

      {/* Modal Add/Edit User - Beautiful Design */}
      <CModal visible={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <CModalHeader
          style={{
            background: `linear-gradient(135deg, ${headerFooterColor} 0%, #1e40af 100%)`,
            color: "#FFF",
            padding: "20px",
          }}
        >
          <CModalTitle style={{ fontSize: "1.3rem", fontWeight: "600" }}>
            {editMode ? "Modifier Utilisateur" : "Ajouter un Utilisateur"}
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: "30px" }}>
          <CForm>
            <CFormInput
              name="nom"
              label="Nom"
              value={formData.nom}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mb-1"
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            />
            {fieldErrors.nom && <div className="text-danger mb-2">{fieldErrors.nom}</div>}
            <CFormInput
              name="prenom"
              label="Prénom"
              value={formData.prenom}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mb-1"
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            />
            {fieldErrors.prenom && <div className="text-danger mb-2">{fieldErrors.prenom}</div>}
            <CFormInput
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mb-1"
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            />
            {fieldErrors.email && <div className="text-danger mb-2">{fieldErrors.email}</div>}
            {!editMode && (
              <>
                <CFormInput
                  type="password"
                  name="password"
                  label="Mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mb-1"
                  style={{
                    border: `2px solid ${borderColor}`,
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "20px",
                  }}
                />
                {fieldErrors.password && <div className="text-danger mb-2">{fieldErrors.password}</div>}
                <CFormInput
                  type="password"
                  name="password_confirmation"
                  label="Confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mb-1"
                  style={{
                    border: `2px solid ${borderColor}`,
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "20px",
                  }}
                />
                {fieldErrors.password_confirmation && (
                  <div className="text-danger mb-2">{fieldErrors.password_confirmation}</div>
                )}
              </>
            )}
            <CFormSelect
              name="role"
              label="Rôle"
              value={formData.role}
              onChange={handleChange}
              className="mb-2"
              style={{
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
              }}
            >
              <option value="administrateur_it">Administrateur IT</option>
              <option value="administrateur">Administrateur</option>
              <option value="manager">Manager</option>
              <option value="secretaire">Secrétaire</option>
              <option value="agent_paie">Agent Paie</option>
            </CFormSelect>
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
            onClick={handleSubmit}
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
            {editMode ? "Modifier" : "Ajouter"}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default AdminUtilisateurs
